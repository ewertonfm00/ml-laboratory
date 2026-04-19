-- =============================================================================
-- Migration: 017_mensagens_respondent_direction.sql
-- Projeto:   ML Laboratory — Machine Learning
-- Author:    @data-engineer (Dara)
-- Date:      2026-04-19
-- Purpose:   Suporte a direção e tipo de respondente por mensagem
--
--            Adiciona 3 campos em ml_captura.mensagens_raw para rastrear:
--            - direction: se a mensagem é incoming (do cliente) ou outgoing (do sistema/agente)
--            - respondent_type: quem respondeu — IA, humano ou especialista
--            - respondent_name: nome textual do respondente (ex: "Sofia (IA)")
--
--            Necessário para integração com plataformas externas como EsteticaIA,
--            que enviam dados de atendimento com granularidade por mensagem.
--
-- Depends:   002_ml_captura_tables.sql
-- Rollback:  rollbacks/017_mensagens_respondent_direction_rollback.sql
-- Story:     1.2 — Suporte a Respondent Type e Endpoint de Integração Externa
--
-- PENDÊNCIA — Seed dos agentes IA EsteticaIA:
--   Os 3 agentes IA do EsteticaIA (ex: "Sofia (IA)", "Luna (IA)", "Max (IA)")
--   NÃO podem ser inseridos aqui porque _plataforma.agentes_humanos exige
--   numero_id NOT NULL e projeto_id NOT NULL.
--   O seed deve ser feito APÓS o onboarding da instância EsteticaIA via portal,
--   quando numero_id e projeto_id forem conhecidos.
--   Referência: Story 1.2, Task 2 — Workflow n8n EsteticaIA.
-- =============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- ml_captura.mensagens_raw — novos campos de direção e respondente
-- ----------------------------------------------------------------------------

-- direction: direção da mensagem no fluxo de conversa.
-- incoming = mensagem enviada pelo cliente/contato externo
-- outgoing = mensagem enviada pelo sistema, IA ou agente humano
-- unknown  = direção não determinada (padrão para mensagens históricas)
ALTER TABLE ml_captura.mensagens_raw
  ADD COLUMN IF NOT EXISTS direction VARCHAR(10) NOT NULL DEFAULT 'unknown'
    CHECK (direction IN ('incoming', 'outgoing', 'unknown'));

COMMENT ON COLUMN ml_captura.mensagens_raw.direction
  IS 'Direção da mensagem: incoming = enviada pelo cliente, outgoing = enviada pelo sistema/agente, unknown = não determinado';

-- respondent_type: classificação de quem gerou a resposta outgoing.
-- ai         = agente de IA (bot, LLM, automação)
-- human      = atendente humano identificado
-- specialist = especialista externo (médico, consultor, etc.)
-- unknown    = tipo não determinado (padrão para mensagens sem classificação)
ALTER TABLE ml_captura.mensagens_raw
  ADD COLUMN IF NOT EXISTS respondent_type VARCHAR(20) NOT NULL DEFAULT 'unknown'
    CHECK (respondent_type IN ('ai', 'human', 'specialist', 'unknown'));

COMMENT ON COLUMN ml_captura.mensagens_raw.respondent_type
  IS 'Tipo de respondente: ai = agente de IA, human = atendente humano, specialist = especialista externo, unknown = não classificado';

-- respondent_name: nome textual do respondente para exibição e rastreabilidade.
-- Nullable: preenchido apenas quando o respondente é identificado.
-- Para mensagens incoming, geralmente null.
-- Para respondent_type = ai, contém o nome do agente IA (ex: "Sofia (IA)").
-- Para respondent_type = human/specialist, contém o nome do atendente.
ALTER TABLE ml_captura.mensagens_raw
  ADD COLUMN IF NOT EXISTS respondent_name VARCHAR(255);

COMMENT ON COLUMN ml_captura.mensagens_raw.respondent_name
  IS 'Nome textual do respondente — preenchido quando identificado (ex: "Sofia (IA)", "Maria Consultora"). Null para mensagens incoming ou respondente desconhecido.';

-- ----------------------------------------------------------------------------
-- Índice para consultas por tipo de respondente
-- (dashboards de volume de atendimento IA vs humano)
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_mensagens_respondent_type
  ON ml_captura.mensagens_raw (respondent_type);

-- ----------------------------------------------------------------------------
-- PENDÊNCIA DOCUMENTADA — Seed dos agentes IA EsteticaIA
-- ----------------------------------------------------------------------------
-- Não é possível inserir os agentes IA da EsteticaIA agora porque
-- _plataforma.agentes_humanos requer:
--   - numero_id NOT NULL REFERENCES _plataforma.numeros_projeto(id)
--   - projeto_id NOT NULL REFERENCES _plataforma.projetos(id)
--
-- Ação necessária: após cadastro da instância EsteticaIA via portal de onboarding,
-- executar INSERT manual ou via seed dedicado com os UUIDs corretos de
-- numero_id e projeto_id.
--
-- Agentes a serem cadastrados (identificadores_externos esperados):
--   - ai:sofia-sdr  | nome: "Sofia (IA)"   | SDR comercial
--   - ai:luna-sdr   | nome: "Luna (IA)"    | Qualificação de leads
--   - ai:max-sdr    | nome: "Max (IA)"     | Agendamento e follow-up
-- ----------------------------------------------------------------------------

COMMIT;
