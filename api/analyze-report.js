const { query } = require('./_lib/db');
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

  try {
    // 1. Fetch Global AI configuration
    const configRes = await query("SELECT * FROM global_ai_config WHERE id = 'global'");
    if (configRes.rows.length === 0) {
      return res.status(500).json({ error: 'Configuração global de IA não localizada no banco de dados.' });
    }

    const config = configRes.rows[0];
    const apiKey = config.api_key || process.env.MISTRAL_API_KEY || 'apihOeeiSO9oq8pNv67EI8j1gRYPG0Ej4CP';
    const modelName = config.model_name || 'mistral-small-2506';
    const activeSkillId = config.active_skill_id || 'default';
    
    // Parse skills list
    let skillsList = [];
    if (config.skills) {
      skillsList = typeof config.skills === 'string' ? JSON.parse(config.skills) : config.skills;
    }

    // Find the active skill prompt
    let activeSkill = skillsList.find(s => s.id === activeSkillId || s.is_active);
    if (!activeSkill && skillsList.length > 0) {
      activeSkill = skillsList[0];
    }

    const systemInstruction = activeSkill ? activeSkill.system_prompt : 
      "Você é o Dr. Chamsa, um médico endoscopista sênior com livre-docência e PhD em gastroenterologia, " +
      "autoridade internacional nas diretrizes da SOBED, ASGE e ESGE. " +
      "Sua tarefa é analisar criticamente rascunhos de laudos de Endoscopia Digestiva Alta.\n\n" +
      "Regras rígidas:\n" +
      "1. Identifique inconsistências, contradições ou termos inadequados entre a descrição e a conclusão (por exemplo, descrever esofagite erosiva mas esquecer de colocar na conclusão).\n" +
      "2. Sugira correções com base nas classificações corretas (ex: Los Angeles, Forrest, Sakura, Sakita, etc.).\n" +
      "3. Seja extremamente formal, conciso e profissional, usando termos médicos adequados em português brasileiro.\n" +
      "4. Não reescreva o laudo inteiro. Forneça apenas uma lista estruturada de pontos críticos a serem revisados.";

    let response;
    const lowerModel = modelName.toLowerCase();

    // 2. Dispatch request to appropriate LLM provider
    if (lowerModel.includes('gemini')) {
      // Gemini API
      response = await postRequest(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
        { 'Content-Type': 'application/json' },
        {
          contents: [
            {
              role: 'user',
              parts: [{ text: `Analise o seguinte laudo de endoscopia e forneça seu parecer clínico:\n\n${report}` }]
            }
          ],
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2048
          }
        }
      );
    } else if (lowerModel.includes('claude')) {
      // Anthropic Claude API
      response = await postRequest(
        'https://api.anthropic.com/v1/messages',
        {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        {
          model: modelName,
          system: systemInstruction,
          messages: [
            { role: 'user', content: `Analise o seguinte laudo de endoscopia e forneça seu parecer clínico:\n\n${report}` }
          ],
          max_tokens: 2048,
          temperature: 0.2
        }
      );
    } else {
      // OpenAI, Mistral or other OpenAI-compatible endpoints (defaults to OpenAI endpoint if model is gpt, else Mistral)
      const isGpt = lowerModel.includes('gpt');
      const endpoint = isGpt 
        ? 'https://api.openai.com/v1/chat/completions' 
        : 'https://api.mistral.ai/v1/chat/completions';

      response = await postRequest(
        endpoint,
        {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        {
          model: modelName,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: `Analise o seguinte laudo de endoscopia e forneça seu parecer clínico:\n\n${report}` }
          ],
          temperature: 0.2
        }
      );
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error('LLM API error response:', errText);
      let parsedError = errText;
      try {
        const jsonErr = JSON.parse(errText);
        parsedError = jsonErr.message || jsonErr.error?.message || errText;
      } catch (e) {}
      return res.status(502).json({ 
        error: `Erro ao comunicar com a API do modelo ${modelName} (Status ${response.status}): ${parsedError}`
      });
    }

    const data = await response.json();
    let analysis = 'Nenhuma resposta gerada.';

    if (lowerModel.includes('gemini')) {
      analysis = data.candidates?.[0]?.content?.parts?.[0]?.text || analysis;
    } else if (lowerModel.includes('claude')) {
      analysis = data.content?.[0]?.text || analysis;
    } else {
      analysis = data.choices?.[0]?.message?.content || analysis;
    }

    return res.status(200).json({ analysis });
  } catch (error) {
    console.error('Error in analyze-report:', error);
    return res.status(500).json({ error: `Erro interno ao processar a análise do laudo: ${error.message || error}` });
  }
};

module.exports = requireAuth(handler);
