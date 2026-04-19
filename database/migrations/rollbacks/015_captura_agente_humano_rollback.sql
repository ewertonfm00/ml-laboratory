-- =============================================================================
-- Rollback: 015_captura_agente_humano_rollback.sql
-- Reverte:  015_captura_agente_humano.sql
-- Author:   @data-engineer (Dara)
-- Date:     2026-04-19
-- Story:    1.1 — Identificação do Atendente nas Conversas Capturadas
--
-- ATENÇÃO: Este rollback remove colunas e o índice adicionados pela migration 015.
-- Qualquer dado gravado em agente_humano_id, tipo ou agente_default_id
-- será PERDIDO permanentemente. Execute somente após confirmar que não há
-- dados críticos nessas colunas no ambiente alvo.
-- =============================================================================

BEGIN;

-- =============================================================================
-- ml_captura.sessoes_conversa — remover campo e índice
-- =============================================================================

DROP INDEX IF EXISTS ml_captura.idx_sessoes_agente;

ALTER TABLE ml_captura.sessoes_conversa
  DROP COLUMN IF EXISTS agente_humano_id;

-- =============================================================================
-- _plataforma.numeros_projeto — remover campos
-- =============================================================================

ALTER TABLE _plataforma.numeros_projeto
  DROP COLUMN IF EXISTS agente_default_id;

ALTER TABLE _plataforma.numeros_projeto
  DROP COLUMN IF EXISTS tipo;

COMMIT;
