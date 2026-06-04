const { requireAuth } = require('./_lib/auth');

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

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
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
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Mistral API error response:', errText);
      return res.status(502).json({ error: 'Erro ao comunicar com a API do Mistral.' });
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content || 'Nenhuma resposta gerada.';

    return res.status(200).json({ analysis });
  } catch (error) {
    console.error('Error in analyze-report:', error);
    return res.status(500).json({ error: 'Erro interno ao processar a análise do laudo.' });
  }
};

module.exports = requireAuth(handler);

