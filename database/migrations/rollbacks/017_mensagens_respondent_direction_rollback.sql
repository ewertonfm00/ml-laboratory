-- =============================================================================
-- Rollback: 017_mensagens_respondent_direction_rollback.sql
-- Migration: 017_mensagens_respondent_direction.sql
-- Author:    @data-engineer (Dara)
-- Date:      2026-04-19
-- Purpose:   Reverter adição de direction, respondent_type e respondent_name
--            em ml_captura.mensagens_raw
--
-- ATENÇÃO: Este rollback remove dados. Executar somente se a migration 017
--          precisar ser revertida e os dados das colunas puderem ser descartados.
-- =============================================================================

BEGIN;

-- Remover índice antes das colunas
DROP INDEX IF EXISTS ml_captura.idx_mensagens_respondent_type;

-- Remover colunas adicionadas pela migration 017
ALTER TABLE ml_captura.mensagens_raw
  DROP COLUMN IF EXISTS direction,
  DROP COLUMN IF EXISTS respondent_type,
  DROP COLUMN IF EXISTS respondent_name;

COMMIT;
