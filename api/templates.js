const { query } = require('./_lib/db');
const { requireAuth } = require('./_lib/auth');

const formatTemplate = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    name: row.titulo,
    content: row.conteudo,
    category: row.categoria,
    created_at: row.created_at
  };
};

const handler = async (req, res) => {
  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      if (id) {
        const result = await query(
          'SELECT * FROM templates WHERE id = $1 AND medico_id = $2',
          [id, req.userId]
        );
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Template não encontrado.' });
        }
        return res.status(200).json(formatTemplate(result.rows[0]));
      } else {
        const result = await query(
          'SELECT * FROM templates WHERE medico_id = $1 ORDER BY created_at DESC',
          [req.userId]
        );
        return res.status(200).json(result.rows.map(formatTemplate));
      }
    }

    if (req.method === 'POST') {
      const { name, category, content } = req.body || {};

      if (!name || !content) {
        return res.status(400).json({ error: 'Nome e conteúdo são obrigatórios.' });
      }

      const result = await query(
        `INSERT INTO templates (titulo, conteudo, categoria, medico_id) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [name, content, category || 'Geral', req.userId]
      );

      return res.status(201).json(formatTemplate(result.rows[0]));
    }

    if (req.method === 'PUT') {
      if (Array.isArray(req.body)) {
        // Batch replace all templates for this doctor
        await query('DELETE FROM templates WHERE medico_id = $1', [req.userId]);
        const inserted = [];
        for (const t of req.body) {
          const resInsert = await query(
            `INSERT INTO templates (titulo, conteudo, categoria, medico_id) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [t.name, t.content, t.category || 'Geral', req.userId]
          );
          inserted.push(formatTemplate(resInsert.rows[0]));
        }
        return res.status(200).json(inserted);
      } else {
        // Update single template by ID
        const templateId = id || req.body.id;
        if (!templateId) {
          return res.status(400).json({ error: 'ID do template é obrigatório.' });
        }

        const { name, category, content } = req.body || {};
        if (!name || !content) {
          return res.status(400).json({ error: 'Nome e conteúdo são obrigatórios.' });
        }

        const result = await query(
          `UPDATE templates 
           SET titulo = $1, conteudo = $2, categoria = $3
           WHERE id = $4 AND medico_id = $5 
           RETURNING *`,
          [name, content, category || 'Geral', templateId, req.userId]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Template não encontrado ou acesso não autorizado.' });
        }
        return res.status(200).json(formatTemplate(result.rows[0]));
      }
    }

    if (req.method === 'DELETE') {
      if (!id) {
        return res.status(400).json({ error: 'ID do template é obrigatório para exclusão.' });
      }

      const result = await query(
        'DELETE FROM templates WHERE id = $1 AND medico_id = $2 RETURNING *',
        [id, req.userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Template não encontrado ou acesso não autorizado.' });
      }

      return res.status(200).json({ message: 'Template excluído com sucesso.', template: formatTemplate(result.rows[0]) });
    }

    return res.status(405).json({ error: 'Método não permitido.' });
  } catch (error) {
    console.error('Error in templates endpoint:', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

module.exports = requireAuth(handler);
