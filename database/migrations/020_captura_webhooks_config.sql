-- =============================================================================
-- Migration: 020_captura_webhooks_config.sql
-- Projeto:   ML Laboratory — Machine Learning
-- Schema:    ml_captura
-- Author:    @data-engineer (Dara)
-- Date:      2026-04-25
-- Purpose:   Cria ml_captura.webhooks_config para registrar a configuração
--            ativa de cada webhook Evolution API → n8n.
--
--            Necessário para a task configure-webhook do ml-captura-squad,
--            que persiste URL do endpoint, status e instância após configurar
--            o webhook em produção.
--
-- Depends:   002_ml_captura_tables.sql, 004_plataforma_schema.sql
-- Rollback:  rollbacks/020_captura_webhooks_config_rollback.sql
-- =============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- ml_captura.webhooks_config
-- Configuração ativa do webhook por instância Evolution API
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ml_captura.webhooks_config (
    id              UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    instancia_id    UUID          NOT NULL
                      REFERENCES _plataforma.instancias_evolution(id)
                      ON DELETE CASCADE,
    numero_whatsapp VARCHAR(50)   NOT NULL,
    webhook_url     TEXT          NOT NULL,
    status          VARCHAR(30)   NOT NULL DEFAULT 'ativo',
    ultimo_evento_em TIMESTAMPTZ,
    erro_descricao  TEXT,
    metadados       JSONB         NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_webhooks_status
        CHECK (status IN ('ativo', 'inativo', 'erro'))
);

COMMENT ON TABLE  ml_captura.webhooks_config                     IS 'Configuração ativa de webhook por instância Evolution API → n8n';
COMMENT ON COLUMN ml_captura.webhooks_config.instancia_id        IS 'Instância Evolution API que origina os eventos';
COMMENT ON COLUMN ml_captura.webhooks_config.numero_whatsapp     IS 'Número WhatsApp associado à instância (ex: 5516993...)';
COMMENT ON COLUMN ml_captura.webhooks_config.webhook_url         IS 'URL completa do endpoint n8n que recebe os eventos';
COMMENT ON COLUMN ml_captura.webhooks_config.status              IS 'ativo | inativo | erro';
COMMENT ON COLUMN ml_captura.webhooks_config.ultimo_evento_em    IS 'Timestamp do último evento recebido — usado para health check';
COMMENT ON COLUMN ml_captura.webhooks_config.erro_descricao      IS 'Descrição do erro quando status=erro';
COMMENT ON COLUMN ml_captura.webhooks_config.metadados           IS 'Config extra: eventos habilitados, versão, flags';

-- Cada instância pode ter apenas uma configuração ativa de webhook
CREATE UNIQUE INDEX IF NOT EXISTS uq_webhooks_instancia
    ON ml_captura.webhooks_config (instancia_id);

CREATE INDEX IF NOT EXISTS idx_webhooks_status
    ON ml_captura.webhooks_config (status);

CREATE INDEX IF NOT EXISTS idx_webhooks_numero
    ON ml_captura.webhooks_config (numero_whatsapp);

-- ----------------------------------------------------------------------------
-- Trigger: updated_at automático (reusa função existente no schema)
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_webhooks_config_updated_at ON ml_captura.webhooks_config;
CREATE TRIGGER trg_webhooks_config_updated_at
    BEFORE UPDATE ON ml_captura.webhooks_config
    FOR EACH ROW EXECUTE FUNCTION ml_captura.set_updated_at();

-- ----------------------------------------------------------------------------
-- Grants
-- ----------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE ON ml_captura.webhooks_config TO ml_app;

COMMIT;
