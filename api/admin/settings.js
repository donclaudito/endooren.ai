const { query } = require('../_lib/db');
const { requireAuth } = require('../_lib/auth');

const handler = async (req, res) => {
  try {
    // 1. Ensure user is admin (clauorenstein@gmail.com)
    const userRes = await query('SELECT email FROM medicos WHERE id = $1', [req.userId]);
    if (userRes.rows.length === 0 || userRes.rows[0].email !== 'clauorenstein@gmail.com') {
      return res.status(403).json({ error: 'Acesso negado. Apenas o administrador tem permissão.' });
    }

    if (req.method === 'GET') {
      const result = await query('SELECT * FROM global_ai_config WHERE id = $1', ['global']);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Configuração global de IA não encontrada.' });
      }
      const config = result.rows[0];
      return res.status(200).json({
        api_key: config.api_key,
        model_name: config.model_name,
        active_skill_id: config.active_skill_id,
        skills: typeof config.skills === 'string' ? JSON.parse(config.skills) : (config.skills || [])
      });
    }

    if (req.method === 'POST') {
      const { api_key, model_name, active_skill_id, skills } = req.body || {};
      
      const skillsStr = typeof skills === 'string' ? skills : JSON.stringify(skills || []);

      await query(
        `UPDATE global_ai_config 
         SET api_key = $1, model_name = $2, active_skill_id = $3, skills = $4, updated_at = CURRENT_TIMESTAMP
         WHERE id = 'global'`,
        [api_key, model_name, active_skill_id, skillsStr]
      );

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
  } catch (error) {
    console.error('Error in admin settings endpoint:', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = requireAuth(handler);
