-- =============================================================================
-- Rollback: 019_captura_projeto_id_rollback.sql
-- =============================================================================

BEGIN;

ALTER TABLE ml_captura.sessoes_conversa
  DROP CONSTRAINT IF EXISTS uq_sessoes_projeto_area_jid;

DROP INDEX IF EXISTS ml_captura.idx_sessoes_projeto;

ALTER TABLE ml_captura.sessoes_conversa
  DROP COLUMN IF EXISTS projeto_id;

DROP INDEX IF EXISTS ml_captura.idx_mensagens_agente;
DROP INDEX IF EXISTS ml_captura.idx_mensagens_projeto;

ALTER TABLE ml_captura.mensagens_raw
  DROP COLUMN IF EXISTS agente_humano_id,
  DROP COLUMN IF EXISTS projeto_id;

COMMIT;
