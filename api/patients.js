const { query } = require('./_lib/db');
const { requireAuth } = require('./_lib/auth');

const formatPatient = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    name: row.nome,
    birth_date: row.birth_date,
    cpf: row.cpf,
    phone: row.phone,
    email: row.email,
    medical_history: row.medical_history,
    allergies: row.allergies,
    current_medications: row.current_medications,
    created_at: row.created_at
  };
};

const handler = async (req, res) => {
  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      if (id) {
        // Fetch single patient
        const result = await query(
          'SELECT * FROM pacientes WHERE id = $1 AND medico_id = $2',
          [id, req.userId]
        );
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Paciente não encontrado.' });
        }
        return res.status(200).json(formatPatient(result.rows[0]));
      } else {
        // List patients
        const result = await query(
          'SELECT * FROM pacientes WHERE medico_id = $1 ORDER BY created_at DESC',
          [req.userId]
        );
        return res.status(200).json(result.rows.map(formatPatient));
      }
    }

    if (req.method === 'POST') {
      const {
        name,
        birth_date,
        cpf,
        phone,
        email,
        medical_history,
        allergies,
        current_medications
      } = req.body || {};

      if (!name) {
        return res.status(400).json({ error: 'O nome do paciente é obrigatório.' });
      }

      const result = await query(
        `INSERT INTO pacientes (nome, birth_date, cpf, phone, email, medical_history, allergies, current_medications, medico_id) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         RETURNING *`,
        [
          name,
          birth_date || null,
          cpf || null,
          phone || null,
          email || null,
          medical_history || null,
          allergies || null,
          current_medications || null,
          req.userId
        ]
      );

      return res.status(201).json(formatPatient(result.rows[0]));
    }

    if (req.method === 'PUT') {
      const patientId = id || req.body.id;
      if (!patientId) {
        return res.status(400).json({ error: 'ID do paciente é obrigatório para atualização.' });
      }

      const {
        name,
        birth_date,
        cpf,
        phone,
        email,
        medical_history,
        allergies,
        current_medications
      } = req.body || {};

      if (!name) {
        return res.status(400).json({ error: 'O nome do paciente é obrigatório.' });
      }

      const check = await query(
        'SELECT id FROM pacientes WHERE id = $1 AND medico_id = $2',
        [patientId, req.userId]
      );
      if (check.rows.length === 0) {
        return res.status(404).json({ error: 'Paciente não encontrado ou acesso não autorizado.' });
      }

      const result = await query(
        `UPDATE pacientes 
         SET nome = $1, birth_date = $2, cpf = $3, phone = $4, email = $5, medical_history = $6, allergies = $7, current_medications = $8
         WHERE id = $9 AND medico_id = $10 
         RETURNING *`,
        [
          name,
          birth_date || null,
          cpf || null,
          phone || null,
          email || null,
          medical_history || null,
          allergies || null,
          current_medications || null,
          patientId,
          req.userId
        ]
      );

      return res.status(200).json(formatPatient(result.rows[0]));
    }

    if (req.method === 'DELETE') {
      if (!id) {
        return res.status(400).json({ error: 'ID do paciente é obrigatório para exclusão.' });
      }

      const result = await query(
        'DELETE FROM pacientes WHERE id = $1 AND medico_id = $2 RETURNING *',
        [id, req.userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Paciente não encontrado ou acesso não autorizado.' });
      }

      return res.status(200).json({ message: 'Paciente excluído com sucesso.', patient: result.rows[0] });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
  } catch (error) {
    console.error('Error in patients endpoint:', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = requireAuth(handler);
