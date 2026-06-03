const { query } = require('./_lib/db');
const { requireAuth } = require('./_lib/auth');

const formatExam = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    patient_id: row.patient_id,
    patient_name: row.nome_paciente,
    convenio: row.convenio,
    exam_date: row.data_exame,
    report_content: row.conteudo_final,
    findings: typeof row.findings === 'string' ? JSON.parse(row.findings) : row.findings,
    conclusions: row.conclusions,
    biopsy_requested: row.biopsy_requested,
    created_at: row.created_at
  };
};

const handler = async (req, res) => {
  const { id, patient_id } = req.query;

  try {
    if (req.method === 'GET') {
      if (id) {
        // Fetch single exam
        const result = await query(
          'SELECT * FROM exames WHERE id = $1 AND medico_id = $2',
          [id, req.userId]
        );
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Exame não encontrado.' });
        }
        return res.status(200).json(formatExam(result.rows[0]));
      } else if (patient_id) {
        // List exams for a specific patient
        const result = await query(
          'SELECT * FROM exames WHERE patient_id = $1 AND medico_id = $2 ORDER BY created_at DESC',
          [patient_id, req.userId]
        );
        return res.status(200).json(result.rows.map(formatExam));
      } else {
        // List all exams of the doctor
        const result = await query(
          'SELECT * FROM exames WHERE medico_id = $1 ORDER BY created_at DESC',
          [req.userId]
        );
        return res.status(200).json(result.rows.map(formatExam));
      }
    }

    if (req.method === 'POST') {
      const {
        patient_id: reqPatientId,
        patient_name,
        convenio,
        exam_date,
        report_content,
        findings,
        conclusions,
        biopsy_requested
      } = req.body || {};

      if (!patient_name || !report_content) {
        return res.status(400).json({ error: 'Nome do paciente e conteúdo do laudo são obrigatórios.' });
      }

      const result = await query(
        `INSERT INTO exames (
          nome_paciente, 
          convenio, 
          data_exame, 
          conteudo_final, 
          findings, 
          conclusions, 
          biopsy_requested, 
          patient_id, 
          medico_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         RETURNING *`,
        [
          patient_name,
          convenio || 'Particular',
          exam_date || new Date().toISOString().split('T')[0],
          report_content,
          JSON.stringify(findings || {}),
          conclusions || [],
          biopsy_requested || false,
          reqPatientId || null,
          req.userId
        ]
      );

      return res.status(201).json(formatExam(result.rows[0]));
    }

    if (req.method === 'DELETE') {
      if (!id) {
        return res.status(400).json({ error: 'ID do exame é obrigatório para exclusão.' });
      }

      const result = await query(
        'DELETE FROM exames WHERE id = $1 AND medico_id = $2 RETURNING *',
        [id, req.userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Exame não encontrado ou acesso não autorizado.' });
      }

      return res.status(200).json({ message: 'Exame excluído com sucesso.', exam: result.rows[0] });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
  } catch (error) {
    console.error('Error in exames endpoint:', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = requireAuth(handler);
