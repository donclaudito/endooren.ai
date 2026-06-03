-- Criar extensão para UUID se necessário
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Médicos
CREATE TABLE IF NOT EXISTS public.medicos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    crm VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    custom_indications JSONB DEFAULT '[]'::JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. Tabela de Pacientes (Para manter a fidelidade funcional)
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

-- 3. Tabela de Templates de Laudos
CREATE TABLE IF NOT EXISTS public.templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    conteudo TEXT NOT NULL,
    medico_id UUID REFERENCES public.medicos(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 4. Tabela de Exames (Laudos Emitidos)
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
