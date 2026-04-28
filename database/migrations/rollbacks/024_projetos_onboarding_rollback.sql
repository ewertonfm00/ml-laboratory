-- Rollback migration 024

ALTER TABLE _plataforma.projetos
  DROP COLUMN IF EXISTS email,
  DROP COLUMN IF EXISTS telefone,
  DROP COLUMN IF EXISTS setor,
  DROP COLUMN IF EXISTS responsavel,
  DROP COLUMN IF EXISTS onboarding_token,
  DROP COLUMN IF EXISTS onboarding_status;
