const { query } = require('../_lib/db');
const { comparePassword, generateToken } = require('../_lib/auth');

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

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Preencha o e-mail e a senha.' });
  }

  try {
    const existing = await query('SELECT id, nome, crm, email, senha_hash FROM medicos WHERE email = $1', [email]);
    if (existing.rows.length === 0) {
      return res.status(400).json({ error: 'E-mail ou senha incorretos.' });
    }

    const doctor = existing.rows[0];
    const isPasswordMatch = await comparePassword(password, doctor.senha_hash);
    if (!isPasswordMatch) {
      return res.status(400).json({ error: 'E-mail ou senha incorretos.' });
    }

    const token = generateToken(doctor.id);

    return res.status(200).json({
      token,
      user: {
        id: doctor.id,
        name: doctor.nome,
        crm: doctor.crm,
        email: doctor.email
      }
    });
  } catch (error) {
    console.error('Error in login endpoint:', error);
    return res.status(500).json({ error: 'Erro interno ao processar o login.' });
  }
};
