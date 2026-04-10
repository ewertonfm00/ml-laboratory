-- =============================================================================
-- Migration: 003_ml_comercial_tables.sql
-- Project:   Machine Learning Laboratory
-- Schema:    ml_comercial
-- Author:    @data-engineer (Dara)
-- Date:      2026-04-09
-- Purpose:   Tabelas do Squad Comercial (🟢 ATIVO — prioridade 1)
--            Suporta todos os 6 agentes do ml-comercial-squad
--
-- Depends:   001_ml_schemas_init.sql, 002_ml_captura_tables.sql
-- Rollback:  rollbacks/003_ml_comercial_tables_rollback.sql
-- =============================================================================

BEGIN;

-- ============================================================================
-- ENUMS
-- ============================================================================

DO $$ BEGIN
    CREATE TYPE ml_comercial.tipo_venda AS ENUM ('varejo', 'consultiva', 'despertar_desejo');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE ml_comercial.resultado_conversa AS ENUM ('converteu', 'perdeu', 'pendente', 'cancelada');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE ml_comercial.tom_comunicacao AS ENUM ('tecnico', 'emocional', 'relacional', 'direto', 'misto');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE ml_comercial.tipo_objecao AS ENUM ('preco', 'prazo', 'necessidade', 'confianca', 'concorrencia', 'outra');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================================
-- ml_comercial.vendedores
-- Cadastro de vendedores do time comercial
-- ============================================================================
CREATE TABLE IF NOT EXISTS ml_comercial.vendedores (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome            VARCHAR(255) NOT NULL,
    whatsapp_numero VARCHAR(50)  UNIQUE,
    whatsapp_jid    VARCHAR(255) UNIQUE,                        -- JID para join com ml_captura
    ativo           BOOLEAN     NOT NULL DEFAULT true,
    data_inicio     DATE,
    metadados       JSONB       NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ml_comercial.vendedores IS 'Cadastro de vendedores — referência para análises do Squad Comercial';

-- ============================================================================
-- ml_comercial.conversas
-- Conversas analisadas pelo conversation-analyst
-- Referencia sessão de captura + resultado da análise
-- ============================================================================
CREATE TABLE IF NOT EXISTS ml_comercial.conversas (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    sessao_id       UUID        REFERENCES ml_captura.sessoes_conversa(id),
    vendedor_id     UUID        REFERENCES ml_comercial.vendedores(id),
    produto_nome    VARCHAR(255),
    tipo_venda      ml_comercial.tipo_venda,
    resultado       ml_comercial.resultado_conversa NOT NULL DEFAULT 'pendente',
    tom_predominante ml_comercial.tom_comunicacao,

    -- Análise estruturada da conversa
    score_qualidade  NUMERIC(4,2) CHECK (score_qualidade BETWEEN 0 AND 10),
    fases           JSONB       NOT NULL DEFAULT '[]',          -- [{fase, inicio, fim, qualidade}]
    argumentos      JSONB       NOT NULL DEFAULT '[]',          -- [{texto, efetivo, fase}]
    flags           JSONB       NOT NULL DEFAULT '[]',          -- alertas identificados
    padrao_detectado VARCHAR(255),                              -- padrão comportamental principal

    -- Metadados
    analisado_por   VARCHAR(100) DEFAULT 'conversation-analyst',
    versao_modelo   VARCHAR(50),
    tokens_usados   INTEGER,
    duracao_analise_ms INTEGER,
    raw_analise     JSONB,                                      -- output completo do agente

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  ml_comercial.conversas                  IS 'Conversas analisadas pelo conversation-analyst';
COMMENT ON COLUMN ml_comercial.conversas.fases            IS 'Array de fases: [{fase, duracao_msg, score}]';
COMMENT ON COLUMN ml_comercial.conversas.argumentos       IS 'Argumentos extraídos com efetividade';
COMMENT ON COLUMN ml_comercial.conversas.flags            IS 'Alertas: objeção ignorada, tom inadequado, etc.';

CREATE INDEX IF NOT EXISTS idx_conversas_vendedor    ON ml_comercial.conversas (vendedor_id);
CREATE INDEX IF NOT EXISTS idx_conversas_produto     ON ml_comercial.conversas (produto_nome);
CREATE INDEX IF NOT EXISTS idx_conversas_tipo_venda  ON ml_comercial.conversas (tipo_venda);
CREATE INDEX IF NOT EXISTS idx_conversas_resultado   ON ml_comercial.conversas (resultado);
CREATE INDEX IF NOT EXISTS idx_conversas_score       ON ml_comercial.conversas (score_qualidade DESC);
CREATE INDEX IF NOT EXISTS idx_conversas_created_at  ON ml_comercial.conversas (created_at DESC);

-- ============================================================================
-- ml_comercial.perfis_vendedor
-- Perfil comportamental de cada vendedor — gerado pelo behavioral-profiler
-- ============================================================================
CREATE TABLE IF NOT EXISTS ml_comercial.perfis_vendedor (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendedor_id         UUID        NOT NULL UNIQUE REFERENCES ml_comercial.vendedores(id),
    tom_predominante    ml_comercial.tom_comunicacao,
    tipo_venda_afinidade ml_comercial.tipo_venda,              -- onde performa melhor
    pontos_fortes       JSONB       NOT NULL DEFAULT '[]',     -- top comportamentos positivos
    gaps                JSONB       NOT NULL DEFAULT '[]',     -- comportamentos que reduzem conversão
    estilo_persuasao    VARCHAR(255),
    taxa_conversao_media NUMERIC(5,2),                         -- % médio de conversão
    score_medio         NUMERIC(4,2),                          -- score médio das conversas
    total_conversas     INTEGER     NOT NULL DEFAULT 0,
    recomendacoes       JSONB       NOT NULL DEFAULT '[]',     -- ações de melhoria priorizadas
    valido_ate          TIMESTAMPTZ,                           -- perfil expira, precisa atualizar
    versao             INTEGER     NOT NULL DEFAULT 1,

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  ml_comercial.perfis_vendedor              IS 'Perfil comportamental gerado pelo behavioral-profiler';
COMMENT ON COLUMN ml_comercial.perfis_vendedor.pontos_fortes IS 'Top 3 comportamentos positivos identificados';
COMMENT ON COLUMN ml_comercial.perfis_vendedor.gaps          IS 'Comportamentos que reduzem taxa de conversão';
COMMENT ON COLUMN ml_comercial.perfis_vendedor.valido_ate    IS 'Após esta data, perfil deve ser regenerado';

CREATE INDEX IF NOT EXISTS idx_perfis_vendedor_id ON ml_comercial.perfis_vendedor (vendedor_id);

-- ============================================================================
-- ml_comercial.abordagens_produto
-- Guias de abordagem por produto + tipo de venda — gerado pelo product-approach
-- ============================================================================
CREATE TABLE IF NOT EXISTS ml_comercial.abordagens_produto (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    produto_nome        VARCHAR(255) NOT NULL,
    tipo_venda          ml_comercial.tipo_venda NOT NULL,
    angulos_persuasao   JSONB       NOT NULL DEFAULT '[]',     -- ângulos eficazes por perfil cliente
    dados_tecnicos_traduzidos JSONB NOT NULL DEFAULT '{}',     -- specs em linguagem comercial
    script_recomendado  JSONB       NOT NULL DEFAULT '[]',     -- sequência de abordagem validada
    baseado_em_conversas INTEGER    NOT NULL DEFAULT 0,        -- quantas conversas geraram este guia
    taxa_conversao      NUMERIC(5,2),                          -- % conversão usando esta abordagem
    versao             INTEGER     NOT NULL DEFAULT 1,
    ativo              BOOLEAN     NOT NULL DEFAULT true,

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (produto_nome, tipo_venda)
);

COMMENT ON TABLE ml_comercial.abordagens_produto IS 'Guias de abordagem por produto gerados pelo product-approach';

CREATE INDEX IF NOT EXISTS idx_abordagens_produto_nome ON ml_comercial.abordagens_produto (produto_nome);
CREATE INDEX IF NOT EXISTS idx_abordagens_tipo_venda   ON ml_comercial.abordagens_produto (tipo_venda);

-- ============================================================================
-- ml_comercial.objecoes
-- Catálogo de objeções com respostas validadas — gerado pelo objection-handler
-- ============================================================================
CREATE TABLE IF NOT EXISTS ml_comercial.objecoes (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    produto_nome        VARCHAR(255),                          -- null = universal
    tipo_objecao        ml_comercial.tipo_objecao NOT NULL,
    texto_objecao       TEXT        NOT NULL,                  -- texto aproximado da objeção
    frequencia          INTEGER     NOT NULL DEFAULT 1,        -- quantas vezes apareceu
    respostas_validadas JSONB       NOT NULL DEFAULT '[]',     -- [{texto, taxa_conversao, exemplos}]
    taxa_sucesso_media  NUMERIC(5,2),                          -- % de conversão após responder
    conversas_origem    UUID[]      NOT NULL DEFAULT '{}',     -- IDs das conversas onde apareceu
    sem_resposta_boa    BOOLEAN     NOT NULL DEFAULT false,    -- gap: objeção sem boa resposta

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  ml_comercial.objecoes                    IS 'Catálogo de objeções reais com respostas validadas em campo';
COMMENT ON COLUMN ml_comercial.objecoes.frequencia         IS 'Contador de ocorrências — atualizado a cada nova conversa';
COMMENT ON COLUMN ml_comercial.objecoes.respostas_validadas IS '[{texto, taxa_conversao, n_usos, exemplos}]';
COMMENT ON COLUMN ml_comercial.objecoes.sem_resposta_boa   IS 'true = gap identificado, nenhuma resposta com >50% conversão';

CREATE INDEX IF NOT EXISTS idx_objecoes_produto       ON ml_comercial.objecoes (produto_nome);
CREATE INDEX IF NOT EXISTS idx_objecoes_tipo          ON ml_comercial.objecoes (tipo_objecao);
CREATE INDEX IF NOT EXISTS idx_objecoes_frequencia    ON ml_comercial.objecoes (frequencia DESC);
CREATE INDEX IF NOT EXISTS idx_objecoes_sem_resposta  ON ml_comercial.objecoes (sem_resposta_boa) WHERE sem_resposta_boa = true;

-- ============================================================================
-- ml_comercial.treinamentos
-- Conteúdo de treinamento gerado pelo training-generator
-- ============================================================================
CREATE TABLE IF NOT EXISTS ml_comercial.treinamentos (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendedor_id         UUID        REFERENCES ml_comercial.vendedores(id),   -- null = genérico
    produto_nome        VARCHAR(255),
    tipo_venda          ml_comercial.tipo_venda,
    tipo_conteudo       VARCHAR(50) NOT NULL,                  -- guia | simulacao | checklist | avaliacao
    titulo              VARCHAR(500) NOT NULL,
    conteudo            JSONB       NOT NULL DEFAULT '{}',     -- estrutura do conteúdo
    baseado_em_gaps     JSONB       NOT NULL DEFAULT '[]',     -- gaps que motivaram este treinamento
    conversas_referencia UUID[]     NOT NULL DEFAULT '{}',     -- conversas usadas como base
    versao             INTEGER     NOT NULL DEFAULT 1,
    ativo              BOOLEAN     NOT NULL DEFAULT true,

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ml_comercial.treinamentos IS 'Conteúdo de treinamento baseado em padrões reais de conversas';

CREATE INDEX IF NOT EXISTS idx_treinamentos_vendedor  ON ml_comercial.treinamentos (vendedor_id);
CREATE INDEX IF NOT EXISTS idx_treinamentos_produto   ON ml_comercial.treinamentos (produto_nome);
CREATE INDEX IF NOT EXISTS idx_treinamentos_tipo      ON ml_comercial.treinamentos (tipo_conteudo);

-- ============================================================================
-- ml_comercial.relatorios_performance
-- Cache de relatórios gerados pelo performance-reporter
-- ============================================================================
CREATE TABLE IF NOT EXISTS ml_comercial.relatorios_performance (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendedor_id         UUID        REFERENCES ml_comercial.vendedores(id),   -- null = time completo
    produto_nome        VARCHAR(255),
    periodo_inicio      DATE        NOT NULL,
    periodo_fim         DATE        NOT NULL,
    tipo_relatorio      VARCHAR(50) NOT NULL,                  -- daily | weekly | monthly | spotlight
    score_geral         NUMERIC(4,2),
    taxa_conversao      NUMERIC(5,2),
    tendencia           VARCHAR(30),                           -- crescendo | estavel | caindo
    top_insights        JSONB       NOT NULL DEFAULT '[]',     -- top 3 insights acionáveis
    recomendacoes       JSONB       NOT NULL DEFAULT '[]',     -- ações priorizadas por impacto
    alertas             JSONB       NOT NULL DEFAULT '[]',     -- quedas ou padrões de risco
    metricas_detalhe    JSONB       NOT NULL DEFAULT '{}',     -- breakdown completo de métricas
    gerado_em           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ml_comercial.relatorios_performance IS 'Cache de relatórios de performance gerados pelo performance-reporter';

CREATE INDEX IF NOT EXISTS idx_reports_vendedor    ON ml_comercial.relatorios_performance (vendedor_id);
CREATE INDEX IF NOT EXISTS idx_reports_periodo     ON ml_comercial.relatorios_performance (periodo_inicio DESC, periodo_fim DESC);
CREATE INDEX IF NOT EXISTS idx_reports_tipo        ON ml_comercial.relatorios_performance (tipo_relatorio);

-- ============================================================================
-- Triggers: updated_at automático
-- ============================================================================
CREATE OR REPLACE FUNCTION ml_comercial.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_vendedores_updated_at ON ml_comercial.vendedores;
CREATE TRIGGER trg_vendedores_updated_at
    BEFORE UPDATE ON ml_comercial.vendedores
    FOR EACH ROW EXECUTE FUNCTION ml_comercial.set_updated_at();

DROP TRIGGER IF EXISTS trg_conversas_updated_at ON ml_comercial.conversas;
CREATE TRIGGER trg_conversas_updated_at
    BEFORE UPDATE ON ml_comercial.conversas
    FOR EACH ROW EXECUTE FUNCTION ml_comercial.set_updated_at();

DROP TRIGGER IF EXISTS trg_perfis_updated_at ON ml_comercial.perfis_vendedor;
CREATE TRIGGER trg_perfis_updated_at
    BEFORE UPDATE ON ml_comercial.perfis_vendedor
    FOR EACH ROW EXECUTE FUNCTION ml_comercial.set_updated_at();

DROP TRIGGER IF EXISTS trg_abordagens_updated_at ON ml_comercial.abordagens_produto;
CREATE TRIGGER trg_abordagens_updated_at
    BEFORE UPDATE ON ml_comercial.abordagens_produto
    FOR EACH ROW EXECUTE FUNCTION ml_comercial.set_updated_at();

DROP TRIGGER IF EXISTS trg_objecoes_updated_at ON ml_comercial.objecoes;
CREATE TRIGGER trg_objecoes_updated_at
    BEFORE UPDATE ON ml_comercial.objecoes
    FOR EACH ROW EXECUTE FUNCTION ml_comercial.set_updated_at();

DROP TRIGGER IF EXISTS trg_treinamentos_updated_at ON ml_comercial.treinamentos;
CREATE TRIGGER trg_treinamentos_updated_at
    BEFORE UPDATE ON ml_comercial.treinamentos
    FOR EACH ROW EXECUTE FUNCTION ml_comercial.set_updated_at();

-- ============================================================================
-- Grants para ml_app
-- ============================================================================
GRANT SELECT, INSERT, UPDATE ON ml_comercial.vendedores              TO ml_app;
GRANT SELECT, INSERT, UPDATE ON ml_comercial.conversas               TO ml_app;
GRANT SELECT, INSERT, UPDATE ON ml_comercial.perfis_vendedor         TO ml_app;
GRANT SELECT, INSERT, UPDATE ON ml_comercial.abordagens_produto      TO ml_app;
GRANT SELECT, INSERT, UPDATE ON ml_comercial.objecoes                TO ml_app;
GRANT SELECT, INSERT, UPDATE ON ml_comercial.treinamentos            TO ml_app;
GRANT SELECT, INSERT         ON ml_comercial.relatorios_performance  TO ml_app;

COMMIT;
