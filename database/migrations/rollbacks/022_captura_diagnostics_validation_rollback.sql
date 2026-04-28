-- =============================================================================
-- Rollback: 022_captura_diagnostics_validation_rollback.sql
-- Desfaz:   022_captura_diagnostics_validation.sql
-- Atenção:  DROP irrevogável — confirme antes de executar em produção
-- =============================================================================

BEGIN;

DROP TABLE IF EXISTS ml_captura.validation_log   CASCADE;
DROP TABLE IF EXISTS ml_captura.diagnostic_runs  CASCADE;

COMMIT;
