-- =============================================================================
-- Rollback: 020_captura_webhooks_config_rollback.sql
-- =============================================================================

BEGIN;

DROP TABLE IF EXISTS ml_captura.webhooks_config CASCADE;

COMMIT;
