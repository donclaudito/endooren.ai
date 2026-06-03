const { query } = require('../_lib/db');
const { hashPassword, generateToken } = require('../_lib/auth');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const { email, password, doctorData } = req.body || {};
  const name = doctorData?.doctor_name;
  const crm = doctorData?.doctor_crm;

  if (!email || !password || !name || !crm) {
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
  }

  try {
    const existing = await query('SELECT id FROM medicos WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
    }

    const hash = await hashPassword(password);

    const insertRes = await query(
      `INSERT INTO medicos (nome, crm, email, senha_hash, custom_indications) 
       VALUES ($1, $2, $3, $4, '[]'::jsonb) 
       RETURNING id, nome, crm, email`,
      [name, crm, email, hash]
    );

    const newDoctor = insertRes.rows[0];
    const token = generateToken(newDoctor.id);

    return res.status(201).json({
      token,
      user: {
        id: newDoctor.id,
        name: newDoctor.nome,
        crm: newDoctor.crm,
        email: newDoctor.email
      }
    });
  } catch (error) {
    console.error('Error in register endpoint:', error);
    return res.status(500).json({ error: 'Erro interno ao processar o cadastro.' });
  }
};
