-- ============================================================
-- Rollback 018: Remover coluna responsavel de _plataforma.projetos
-- ============================================================

BEGIN;

ALTER TABLE _plataforma.projetos
  DROP COLUMN IF EXISTS responsavel;

COMMIT;
