-- =============================================================================
-- Rollback: 016_comercial_conversas_agente_rollback.sql
-- Project:  Machine Learning Laboratory
-- Reverts:  016_comercial_conversas_agente.sql
-- Author:   @data-engineer (Dara) + @dev (Dex)
-- Date:     2026-04-19
-- WARNING:  Remove coluna agente_humano_id de ml_comercial.conversas.
--           Dados de vínculo atendente→conversa serão perdidos permanentemente.
-- =============================================================================

BEGIN;

DROP INDEX IF EXISTS ml_comercial.idx_conversas_agente;

ALTER TABLE ml_comercial.conversas
    DROP COLUMN IF EXISTS agente_humano_id;

COMMIT;
