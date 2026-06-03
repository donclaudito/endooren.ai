const { query } = require('../_lib/db');
const { requireAuth } = require('../_lib/auth');

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  try {
    const userRes = await query('SELECT id, nome, crm, email, custom_indications FROM medicos WHERE id = $1', [req.userId]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'Médico não encontrado.' });
    }

    const doctor = userRes.rows[0];

    return res.status(200).json({
      user: {
        id: doctor.id,
        name: doctor.nome,
        crm: doctor.crm,
        email: doctor.email,
        custom_indications: doctor.custom_indications
      }
    });
  } catch (error) {
    console.error('Error in me endpoint:', error);
    return res.status(500).json({ error: 'Erro interno ao carregar perfil.' });
  }
};

module.exports = requireAuth(handler);
