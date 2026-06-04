const { requireAuth } = require('./_lib/auth');
const https = require('https');

const postRequest = (urlStr, headers, bodyObj) => {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(urlStr);
      const postData = JSON.stringify(bodyObj);
      const options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          ...headers,
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let rawData = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            text: () => Promise.resolve(rawData),
            json: () => {
              try {
                return Promise.resolve(JSON.parse(rawData));
              } catch (e) {
                return Promise.reject(new Error('Resposta do servidor inválida.'));
              }
            }
          });
        });
      });

      req.on('error', (e) => {
        reject(e);
      });

      req.write(postData);
      req.end();
    } catch (err) {
      reject(err);
    }
  });
};

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const { report } = req.body || {};
  if (!report) {
    return res.status(400).json({ error: 'O conteúdo do laudo é obrigatório.' });
  }

  const apiKey = process.env.MISTRAL_API_KEY || 'apihOeeiSO9oq8pNv67EI8j1gRYPG0Ej4CP';
  if (!apiKey) {
    return res.status(500).json({ error: 'Chave de API do Mistral não configurada no servidor.' });
  }

  try {
    const systemInstruction = 
      "Você é o Dr. Chamsa, um médico endoscopista sênior com livre-docência e PhD em gastroenterologia, " +
      "autoridade internacional nas diretrizes da SOBED, ASGE e ESGE. " +
      "Sua tarefa é analisar criticamente rascunhos de laudos de Endoscopia Digestiva Alta.\n\n" +
      "Regras rígidas:\n" +
      "1. Identifique inconsistências, contradições ou termos inadequados entre a descrição e a conclusão " +
      "(por exemplo, descrever esofagite erosiva mas esquecer de colocar na conclusão, ou descrever varizes sem detalhar o calibre ou sem listar na conclusão, ou incoerências entre as seções).\n" +
      "2. Sugira correções com base nas classificações corretas (ex: Los Angeles para esofagite de refluxo, Forrest para úlceras sangrentas, Sakura/Baveno para varizes, Sakita para evolução de úlceras, etc.).\n" +
      "3. Seja extremamente formal, conciso e profissional, usando termos médicos adequados em português brasileiro.\n" +
      "4. Não reescreva o laudo inteiro. Forneça apenas uma lista estruturada de pontos críticos a serem revisados, se houver, ou parabenize a consistência do laudo se ele estiver clinicamente impecável e coerente.";

    const response = await postRequest(
      'https://api.mistral.ai/v1/chat/completions',
      {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      {
        model: 'mistral-small-2506',
        messages: [
          {
            role: 'system',
            content: systemInstruction
          },
          {
            role: 'user',
            content: `Analise o seguinte laudo de endoscopia e forneça seu parecer clínico:\n\n${report}`
          }
        ],
        temperature: 0.2
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Mistral API error response:', errText);
      let parsedError = errText;
      try {
        const jsonErr = JSON.parse(errText);
        parsedError = jsonErr.message || jsonErr.error?.message || errText;
      } catch (e) {}
      return res.status(502).json({ 
        error: `Erro ao comunicar com a API do Mistral (Status ${response.status}): ${parsedError}`
      });
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content || 'Nenhuma resposta gerada.';

    return res.status(200).json({ analysis });
  } catch (error) {
    console.error('Error in analyze-report:', error);
    return res.status(500).json({ error: `Erro interno ao processar a análise do laudo: ${error.message || error}` });
  }
};

module.exports = requireAuth(handler);

