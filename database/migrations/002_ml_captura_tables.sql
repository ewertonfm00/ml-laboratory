-- =============================================================================
-- Migration: 002_ml_captura_tables.sql
-- Project:   Machine Learning Laboratory
-- Schema:    ml_captura
-- Author:    @data-engineer (Dara)
-- Date:      2026-04-09
-- Purpose:   Tabelas da Camada 1 — Coleta de dados brutos
--            Captura mensagens WhatsApp, transcrições e eventos
--
-- Depends:   001_ml_schemas_init.sql
-- Rollback:  rollbacks/002_ml_captura_tables_rollback.sql
-- =============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- EXTENSÕES necessárias (idempotente)
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- busca fuzzy em textos

-- ----------------------------------------------------------------------------
-- ml_captura.mensagens_raw
-- Armazena cada mensagem WhatsApp capturada via Evolution API + n8n
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ml_captura.mensagens_raw (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    area            VARCHAR(50) NOT NULL DEFAULT 'comercial',  -- area de origem
    fonte           VARCHAR(50) NOT NULL DEFAULT 'whatsapp',   -- whatsapp | redrive | manual
    session_id      VARCHAR(255),                               -- ID da sessão Evolution API
    remote_jid      VARCHAR(255),                               -- JID do contato WhatsApp
    message_id      VARCHAR(255) UNIQUE,                        -- ID da mensagem no WhatsApp
    tipo            VARCHAR(30) NOT NULL,                        -- text | audio | image | document
    conteudo_raw    TEXT,                                        -- texto bruto ou null se áudio
    audio_url       TEXT,                                        -- URL do áudio (se tipo=audio)
    duracao_audio   INTEGER,                                     -- duração em segundos
    status          VARCHAR(30) NOT NULL DEFAULT 'recebida',    -- recebida | processando | processada | erro
    metadados       JSONB       NOT NULL DEFAULT '{}',          -- metadados extras do webhook
    n8n_execution_id VARCHAR(255),                              -- ID da execução n8n
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  ml_captura.mensagens_raw                IS 'Mensagens brutas capturadas via Evolution API/WhatsApp';
COMMENT ON COLUMN ml_captura.mensagens_raw.area           IS 'Área do laboratório: comercial, atendimento, etc.';
COMMENT ON COLUMN ml_captura.mensagens_raw.remote_jid     IS 'JID do contato: número@s.whatsapp.net ou grupo@g.us';
COMMENT ON COLUMN ml_captura.mensagens_raw.metadados      IS 'Payload completo do webhook para rastreabilidade';

CREATE INDEX IF NOT EXISTS idx_mensagens_raw_area         ON ml_captura.mensagens_raw (area);
CREATE INDEX IF NOT EXISTS idx_mensagens_raw_session      ON ml_captura.mensagens_raw (session_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_raw_remote_jid   ON ml_captura.mensagens_raw (remote_jid);
CREATE INDEX IF NOT EXISTS idx_mensagens_raw_status       ON ml_captura.mensagens_raw (status);
CREATE INDEX IF NOT EXISTS idx_mensagens_raw_created_at   ON ml_captura.mensagens_raw (created_at DESC);

-- ----------------------------------------------------------------------------
-- ml_captura.transcricoes_audio
-- Resultado da transcrição via Groq Whisper
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ml_captura.transcricoes_audio (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    mensagem_id     UUID        NOT NULL REFERENCES ml_captura.mensagens_raw(id) ON DELETE CASCADE,
    texto           TEXT        NOT NULL,
    idioma          VARCHAR(10) NOT NULL DEFAULT 'pt',
    confianca       NUMERIC(4,3),                               -- score de confiança 0.000-1.000
    provider        VARCHAR(50) NOT NULL DEFAULT 'groq-whisper',
    duracao_ms      INTEGER,                                    -- tempo de processamento
    tokens_usados   INTEGER,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  ml_captura.transcricoes_audio            IS 'Transcrições de áudio via Groq Whisper';
COMMENT ON COLUMN ml_captura.transcricoes_audio.confianca  IS 'Score de confiança da transcrição: 0=baixa, 1=alta';

CREATE INDEX IF NOT EXISTS idx_transcricoes_mensagem_id ON ml_captura.transcricoes_audio (mensagem_id);

-- ----------------------------------------------------------------------------
-- ml_captura.sessoes_conversa
-- Agrupa mensagens em sessões/conversas completas
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ml_captura.sessoes_conversa (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    area            VARCHAR(50) NOT NULL DEFAULT 'comercial',
    remote_jid      VARCHAR(255) NOT NULL,
    contato_nome    VARCHAR(255),
    contato_numero  VARCHAR(50),
    iniciada_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    encerrada_em    TIMESTAMPTZ,
    total_mensagens INTEGER     NOT NULL DEFAULT 0,
    status          VARCHAR(30) NOT NULL DEFAULT 'ativa',       -- ativa | encerrada | expirada
    metadados       JSONB       NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ml_captura.sessoes_conversa IS 'Sessões de conversa agrupando mensagens de um mesmo contato';

CREATE INDEX IF NOT EXISTS idx_sessoes_area         ON ml_captura.sessoes_conversa (area);
CREATE INDEX IF NOT EXISTS idx_sessoes_remote_jid   ON ml_captura.sessoes_conversa (remote_jid);
CREATE INDEX IF NOT EXISTS idx_sessoes_status       ON ml_captura.sessoes_conversa (status);
CREATE INDEX IF NOT EXISTS idx_sessoes_iniciada_em  ON ml_captura.sessoes_conversa (iniciada_em DESC);

-- ----------------------------------------------------------------------------
-- Trigger: updated_at automático
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ml_captura.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_mensagens_raw_updated_at ON ml_captura.mensagens_raw;
CREATE TRIGGER trg_mensagens_raw_updated_at
    BEFORE UPDATE ON ml_captura.mensagens_raw
    FOR EACH ROW EXECUTE FUNCTION ml_captura.set_updated_at();

DROP TRIGGER IF EXISTS trg_sessoes_updated_at ON ml_captura.sessoes_conversa;
CREATE TRIGGER trg_sessoes_updated_at
    BEFORE UPDATE ON ml_captura.sessoes_conversa
    FOR EACH ROW EXECUTE FUNCTION ml_captura.set_updated_at();

-- ----------------------------------------------------------------------------
-- Grants para ml_app
-- ----------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE ON ml_captura.mensagens_raw    TO ml_app;
GRANT SELECT, INSERT         ON ml_captura.transcricoes_audio TO ml_app;
GRANT SELECT, INSERT, UPDATE ON ml_captura.sessoes_conversa  TO ml_app;

COMMIT;
