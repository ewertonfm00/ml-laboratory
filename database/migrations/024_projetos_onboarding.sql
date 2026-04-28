-- Migration 024: campos de onboarding em _plataforma.projetos
-- Idempotente: usa IF NOT EXISTS / DEFAULT seguro

ALTER TABLE _plataforma.projetos
  ADD COLUMN IF NOT EXISTS email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS telefone VARCHAR(30),
  ADD COLUMN IF NOT EXISTS setor VARCHAR(100),
  ADD COLUMN IF NOT EXISTS responsavel VARCHAR(255),
  ADD COLUMN IF NOT EXISTS onboarding_token UUID DEFAULT uuid_generate_v4(),
  ADD COLUMN IF NOT EXISTS onboarding_status VARCHAR(30) DEFAULT 'pendente'
    CHECK (onboarding_status IN ('pendente', 'conectado'));
