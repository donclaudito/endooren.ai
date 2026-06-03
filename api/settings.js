const { query } = require('./_lib/db');
const { requireAuth } = require('./_lib/auth');

const handler = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const result = await query(
        'SELECT nome, crm, custom_indications FROM medicos WHERE id = $1',
        [req.userId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Médico não encontrado.' });
      }

      const doctor = result.rows[0];
      return res.status(200).json({
        doctor_name: doctor.nome,
        doctor_crm: doctor.crm,
        custom_indications: doctor.custom_indications || []
      });
    }

    if (req.method === 'PUT') {
      const { doctor_name, doctor_crm, custom_indications } = req.body || {};

      if (!doctor_name || !doctor_crm) {
        return res.status(400).json({ error: 'Nome e CRM do médico são obrigatórios.' });
      }

      const result = await query(
        `UPDATE medicos 
         SET nome = $1, crm = $2, custom_indications = $3
         WHERE id = $4 
         RETURNING nome, crm, custom_indications`,
        [
          doctor_name,
          doctor_crm,
          JSON.stringify(custom_indications || []),
          req.userId
        ]
      );

      const updated = result.rows[0];
      return res.status(200).json({
        doctor_name: updated.nome,
        doctor_crm: updated.crm,
        custom_indications: updated.custom_indications
      });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
  } catch (error) {
    console.error('Error in settings endpoint:', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = requireAuth(handler);
