-- =============================================================================
-- Migration: 019_captura_projeto_id.sql
-- Projeto:   ML Laboratory — Machine Learning
-- Author:    @data-engineer (Dara)
-- Date:      2026-04-21
-- Purpose:   Adiciona projeto_id e agente_humano_id em ml_captura.mensagens_raw
--            e projeto_id em ml_captura.sessoes_conversa.
--
--            O workflow ML-CAPTURA referencia essas colunas desde o início, mas
--            a migration 002 não as definiu. Isso causava falha silenciosa no
--            INSERT de mensagens e no upsert de sessões.
--
--            Também adiciona a constraint UNIQUE (projeto_id, area, remote_jid)
--            em sessoes_conversa — necessária para o ON CONFLICT do n8n funcionar.
--
-- Depends:   002_ml_captura_tables.sql, 004_plataforma_schema.sql
-- Rollback:  rollbacks/019_captura_projeto_id_rollback.sql
-- =============================================================================

BEGIN;

-- =============================================================================
-- ml_captura.mensagens_raw — projeto_id e agente_humano_id
-- =============================================================================

ALTER TABLE ml_captura.mensagens_raw
  ADD COLUMN IF NOT EXISTS projeto_id UUID
    REFERENCES _plataforma.projetos(id);

COMMENT ON COLUMN ml_captura.mensagens_raw.projeto_id
  IS 'Projeto ao qual esta mensagem pertence. Resolvido via numeros_projeto no n8n.';

ALTER TABLE ml_captura.mensagens_raw
  ADD COLUMN IF NOT EXISTS agente_humano_id UUID
    REFERENCES _plataforma.agentes_humanos(id);

COMMENT ON COLUMN ml_captura.mensagens_raw.agente_humano_id
  IS 'Atendente humano que enviou/recebeu esta mensagem. Null quando não identificado.';

CREATE INDEX IF NOT EXISTS idx_mensagens_projeto
  ON ml_captura.mensagens_raw (projeto_id);

CREATE INDEX IF NOT EXISTS idx_mensagens_agente
  ON ml_captura.mensagens_raw (agente_humano_id);

-- =============================================================================
-- ml_captura.sessoes_conversa — projeto_id e unique constraint
-- =============================================================================

ALTER TABLE ml_captura.sessoes_conversa
  ADD COLUMN IF NOT EXISTS projeto_id UUID
    REFERENCES _plataforma.projetos(id);

COMMENT ON COLUMN ml_captura.sessoes_conversa.projeto_id
  IS 'Projeto ao qual esta sessão pertence. Usado para filtros no dashboard e análises ML.';

CREATE INDEX IF NOT EXISTS idx_sessoes_projeto
  ON ml_captura.sessoes_conversa (projeto_id);

-- Constraint necessária para ON CONFLICT (projeto_id, area, remote_jid) DO NOTHING no n8n
-- IF NOT EXISTS não existe para constraints — usar DO $$ para checar antes de criar
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'uq_sessoes_projeto_area_jid'
  ) THEN
    ALTER TABLE ml_captura.sessoes_conversa
      ADD CONSTRAINT uq_sessoes_projeto_area_jid
        UNIQUE (projeto_id, area, remote_jid);
  END IF;
END $$;

COMMIT;
