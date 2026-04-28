-- =============================================================================
-- Migration: 022_captura_diagnostics_validation.sql
-- Project:   Machine Learning Laboratory
-- Schema:    ml_captura
-- Author:    @data-engineer (Dara)
-- Date:      2026-04-27
-- Purpose:   Tabelas de diagnóstico e validação do pipeline de captura
--            diagnostic_runs: registros do pipeline-debugger (Trace)
--            validation_log:  rejeições do whatsapp-webhook-validator (Lex)
--
-- Depends:   001_ml_schemas_init.sql, 002_ml_captura_tables.sql
-- Rollback:  rollbacks/022_captura_diagnostics_validation_rollback.sql
-- =============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- ml_captura.diagnostic_runs
-- Registra cada execução de diagnóstico do pipeline-debugger (Trace)
-- Dois modos: quick (verifica tabelas + Redis) e full (trace E2E completo)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ml_captura.diagnostic_runs (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    run_id          VARCHAR(100) UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
    tipo            VARCHAR(20)  NOT NULL DEFAULT 'quick',         -- quick | full
    status          VARCHAR(30)  NOT NULL DEFAULT 'running',       -- running | completed | failed
    area            VARCHAR(50)  NOT NULL DEFAULT 'comercial',     -- área diagnosticada
    session_id      VARCHAR(255),                                   -- instância Evolution API
    root_cause      TEXT,                                           -- causa raiz identificada
    evidencias      JSONB        NOT NULL DEFAULT '[]',             -- array de evidências coletadas
    steps_executados JSONB       NOT NULL DEFAULT '[]',             -- steps percorridos e resultados
    resumo          TEXT,                                           -- resumo legível do diagnóstico
    correcao_aplicada BOOLEAN    NOT NULL DEFAULT FALSE,            -- se correção foi executada
    correcao_detalhes TEXT,                                         -- o que foi corrigido
    iniciado_em     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    concluido_em    TIMESTAMPTZ,
    duracao_ms      INTEGER,                                        -- duração total do diagnóstico
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_diagnostic_tipo   CHECK (tipo   IN ('quick', 'full')),
    CONSTRAINT chk_diagnostic_status CHECK (status IN ('running', 'completed', 'failed'))
);

COMMENT ON TABLE  ml_captura.diagnostic_runs                   IS 'Execuções de diagnóstico do pipeline pelo pipeline-debugger (Trace)';
COMMENT ON COLUMN ml_captura.diagnostic_runs.tipo              IS 'quick: verifica tabelas+Redis; full: trace E2E completo';
COMMENT ON COLUMN ml_captura.diagnostic_runs.root_cause        IS 'Causa raiz identificada — NULL se diagnóstico inconclusivo';
COMMENT ON COLUMN ml_captura.diagnostic_runs.evidencias        IS 'Array JSON de evidências: [{step, resultado, valor, ts}]';
COMMENT ON COLUMN ml_captura.diagnostic_runs.steps_executados  IS 'Array JSON dos steps percorridos: [{nome, status, duracao_ms}]';
COMMENT ON COLUMN ml_captura.diagnostic_runs.correcao_aplicada IS 'TRUE se o agente aplicou correção automática durante o diagnóstico';

CREATE INDEX IF NOT EXISTS idx_diagnostic_runs_status     ON ml_captura.diagnostic_runs (status);
CREATE INDEX IF NOT EXISTS idx_diagnostic_runs_session    ON ml_captura.diagnostic_runs (session_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_runs_area       ON ml_captura.diagnostic_runs (area);
CREATE INDEX IF NOT EXISTS idx_diagnostic_runs_iniciado   ON ml_captura.diagnostic_runs (iniciado_em DESC);
CREATE INDEX IF NOT EXISTS idx_diagnostic_runs_tipo       ON ml_captura.diagnostic_runs (tipo);

-- ----------------------------------------------------------------------------
-- ml_captura.validation_log
-- Registra rejeições do whatsapp-webhook-validator (Lex)
-- Apenas eventos rejeitados — aceitos não geram log (alto volume)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ml_captura.validation_log (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id        VARCHAR(255),                                   -- ID do evento WhatsApp
    instancia       VARCHAR(255) NOT NULL,                          -- instância Evolution API
    evento_tipo     VARCHAR(100),                                   -- messages.upsert | connection.update | etc.
    remote_jid      VARCHAR(255),                                   -- JID de origem
    resultado       VARCHAR(20)  NOT NULL DEFAULT 'rejeitado',      -- aceito | rejeitado
    motivo_rejeicao VARCHAR(100),                                   -- hmac_invalido | duplicado | formato_invalido | campo_ausente | tipo_desconhecido
    detalhes        JSONB        NOT NULL DEFAULT '{}',             -- contexto adicional da rejeição
    payload_hash    VARCHAR(64),                                    -- SHA-256 do payload para auditoria
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_validation_resultado CHECK (resultado IN ('aceito', 'rejeitado'))
);

COMMENT ON TABLE  ml_captura.validation_log                    IS 'Log de rejeições do whatsapp-webhook-validator (Lex) — apenas falhas';
COMMENT ON COLUMN ml_captura.validation_log.instancia          IS 'Nome da instância Evolution API que originou o evento';
COMMENT ON COLUMN ml_captura.validation_log.motivo_rejeicao    IS 'Código do motivo: hmac_invalido | duplicado | formato_invalido | campo_ausente | tipo_desconhecido';
COMMENT ON COLUMN ml_captura.validation_log.detalhes           IS 'Contexto da rejeição: campo faltante, valor recebido, etc.';
COMMENT ON COLUMN ml_captura.validation_log.payload_hash       IS 'SHA-256 do payload para auditoria forense — não armazena payload completo';

CREATE INDEX IF NOT EXISTS idx_validation_log_instancia      ON ml_captura.validation_log (instancia);
CREATE INDEX IF NOT EXISTS idx_validation_log_motivo         ON ml_captura.validation_log (motivo_rejeicao);
CREATE INDEX IF NOT EXISTS idx_validation_log_resultado      ON ml_captura.validation_log (resultado);
CREATE INDEX IF NOT EXISTS idx_validation_log_created_at     ON ml_captura.validation_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_validation_log_event_id       ON ml_captura.validation_log (event_id) WHERE event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_validation_log_remote_jid     ON ml_captura.validation_log (remote_jid) WHERE remote_jid IS NOT NULL;

-- ----------------------------------------------------------------------------
-- Trigger: updated_at automático para diagnostic_runs
-- (validation_log é append-only — sem updated_at)
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_diagnostic_runs_updated_at ON ml_captura.diagnostic_runs;
CREATE TRIGGER trg_diagnostic_runs_updated_at
    BEFORE UPDATE ON ml_captura.diagnostic_runs
    FOR EACH ROW EXECUTE FUNCTION ml_captura.set_updated_at();

-- ----------------------------------------------------------------------------
-- Grants para ml_app
-- ----------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE ON ml_captura.diagnostic_runs TO ml_app;
GRANT SELECT, INSERT         ON ml_captura.validation_log  TO ml_app;

COMMIT;
