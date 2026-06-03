const { Pool } = require('pg');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const databaseUrl = process.env.DATABASE_URL;
const isProduction = process.env.NODE_ENV === 'production';

let pool = null;
let sqliteDb = null;

if (databaseUrl) {
  pool = new Pool({
    connectionString: databaseUrl,
    ssl: databaseUrl && (databaseUrl.includes('neon.tech') || databaseUrl.includes('vercel-storage.com') || isProduction)
      ? { rejectUnauthorized: false }
      : false
  });
} else {
  const dbPath = path.join(__dirname, '..', '..', 'local.db');
  console.log('No DATABASE_URL found in environment variables. Falling back to local SQLite database at:', dbPath);
  sqliteDb = new DatabaseSync(dbPath);
}

let initialized = false;

// Auto-run schema migrations on database connection
const initDb = async () => {
  if (initialized) return;

  if (sqliteDb) {
    try {
      console.log('Initializing local SQLite database tables...');
      
      // Execute the tables creation in SQLite-compatible syntax
      sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS medicos (
            id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2,3) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2,3) || '-' || hex(randomblob(6)))),
            nome VARCHAR(255) NOT NULL,
            crm VARCHAR(50) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            senha_hash VARCHAR(255) NOT NULL,
            custom_indications TEXT DEFAULT '[]' NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
        );
      `);

      sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS pacientes (
            id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2,3) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2,3) || '-' || hex(randomblob(6)))),
            nome VARCHAR(255) NOT NULL,
            birth_date DATE,
            cpf VARCHAR(20),
            phone VARCHAR(50),
            email VARCHAR(255),
            medical_history TEXT,
            allergies TEXT,
            current_medications TEXT,
            medico_id TEXT REFERENCES medicos(id) ON DELETE CASCADE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
        );
      `);

      sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS templates (
            id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2,3) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2,3) || '-' || hex(randomblob(6)))),
            titulo VARCHAR(255) NOT NULL,
            conteudo TEXT NOT NULL,
            categoria VARCHAR(100) DEFAULT 'Geral' NOT NULL,
            medico_id TEXT REFERENCES medicos(id) ON DELETE CASCADE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
        );
      `);

      sqliteDb.exec(`
        CREATE TABLE IF NOT EXISTS exames (
            id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2,3) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2,3) || '-' || hex(randomblob(6)))),
            nome_paciente VARCHAR(255) NOT NULL,
            convenio VARCHAR(100),
            data_exame DATE DEFAULT (date('now')) NOT NULL,
            conteudo_final TEXT NOT NULL,
            findings TEXT DEFAULT '{}' NOT NULL,
            conclusions TEXT DEFAULT '[]' NOT NULL,
            biopsy_requested BOOLEAN DEFAULT FALSE NOT NULL,
            patient_id TEXT REFERENCES pacientes(id) ON DELETE SET NULL,
            medico_id TEXT REFERENCES medicos(id) ON DELETE CASCADE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
        );
      `);

      console.log('Local SQLite database tables initialized successfully.');
      initialized = true;
    } catch (err) {
      console.error('Local SQLite initialization failed:', err);
    }
    return;
  }

  try {
    const client = await pool.connect();
    try {
      const res = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'medicos'
        );
      `);
      
      const tableExists = res.rows[0].exists;
      if (!tableExists) {
        console.log('Initializing PostgreSQL database tables...');
        await client.query(`
          CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

          CREATE TABLE IF NOT EXISTS public.medicos (
              id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
              nome VARCHAR(255) NOT NULL,
              crm VARCHAR(50) NOT NULL,
              email VARCHAR(255) UNIQUE NOT NULL,
              senha_hash VARCHAR(255) NOT NULL,
              custom_indications JSONB DEFAULT '[]'::JSONB NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
          );

          CREATE TABLE IF NOT EXISTS public.pacientes (
              id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
              nome VARCHAR(255) NOT NULL,
              birth_date DATE,
              cpf VARCHAR(20),
              phone VARCHAR(50),
              email VARCHAR(255),
              medical_history TEXT,
              allergies TEXT,
              current_medications TEXT,
              medico_id UUID REFERENCES public.medicos(id) ON DELETE CASCADE NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
          );

          CREATE TABLE IF NOT EXISTS public.templates (
              id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
              titulo VARCHAR(255) NOT NULL,
              conteudo TEXT NOT NULL,
              categoria VARCHAR(100) DEFAULT 'Geral' NOT NULL,
              medico_id UUID REFERENCES public.medicos(id) ON DELETE CASCADE NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
          );

          CREATE TABLE IF NOT EXISTS public.exames (
              id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
              nome_paciente VARCHAR(255) NOT NULL,
              convenio VARCHAR(100),
              data_exame DATE DEFAULT CURRENT_DATE NOT NULL,
              conteudo_final TEXT NOT NULL,
              findings JSONB DEFAULT '{}'::JSONB NOT NULL,
              conclusions TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
              biopsy_requested BOOLEAN DEFAULT FALSE NOT NULL,
              patient_id UUID REFERENCES public.pacientes(id) ON DELETE SET NULL,
              medico_id UUID REFERENCES public.medicos(id) ON DELETE CASCADE NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
          );
        `);
        console.log('PostgreSQL database tables initialized successfully.');
      }
      initialized = true;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('PostgreSQL database initialization failed:', err);
  }
};

const query = async (text, params = []) => {
  await initDb();

  if (sqliteDb) {
    // SQLite execution path
    let sql = text;
    
    // Replace "public." prefix
    sql = sql.replace(/\bpublic\./gi, '');
    
    // Strip Postgres castings like ::jsonb, ::json, ::text[], etc.
    sql = sql.replace(/::[a-zA-Z_0-9\[\]]+/g, '');
    
    // Ignore CREATE EXTENSION
    if (sql.toLowerCase().includes('create extension')) {
      return { rows: [] };
    }
    
    // Replace Postgres uuid_generate_v4 with SQLite compatible uuid generator
    sql = sql.replace(/uuid_generate_v4\(\)/gi, "(lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2,3) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2,3) || '-' || hex(randomblob(6))))");
    
    // Convert default Postgres arrays to standard JSON format
    sql = sql.replace(/default\s+'{}'/gi, "DEFAULT '[]'");

    // Determine query type (returning/selecting rows)
    const isSelect = sql.trim().toUpperCase().startsWith('SELECT');
    const hasReturning = sql.toLowerCase().includes('returning');

    // Positional parameters mapping: [a, b] -> {'$1': a, '$2': b}
    const bindParams = {};
    for (let i = 0; i < params.length; i++) {
      let val = params[i];
      if (Array.isArray(val)) {
        val = JSON.stringify(val);
      }
      if (typeof val === 'boolean') {
        val = val ? 1 : 0;
      }
      bindParams[`$${i + 1}`] = val;
    }

    try {
      const stmt = sqliteDb.prepare(sql);
      let results;
      
      if (isSelect || hasReturning) {
        results = stmt.all(bindParams);
      } else {
        stmt.run(bindParams);
        results = [];
      }

      // Format SQLite row structures to match expected JSON attributes
      const rows = results.map(row => {
        const plainRow = { ...row };
        const jsonCols = ['custom_indications', 'findings', 'conclusions'];
        for (const col of jsonCols) {
          if (typeof plainRow[col] === 'string') {
            try {
              plainRow[col] = JSON.parse(plainRow[col]);
            } catch (e) {
              // Ignore parse errors, return as is
            }
          }
        }
        return plainRow;
      });

      return { rows };
    } catch (err) {
      console.error('SQLite execution error on query:', sql, 'Parameters:', bindParams, err);
      throw err;
    }
  }

  return pool.query(text, params);
};

module.exports = {
  pool,
  query,
  initDb
};

