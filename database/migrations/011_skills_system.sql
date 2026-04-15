-- ============================================================
-- Migration 011: Sistema de Skills por Projeto
-- Criado: 2026-04-14
-- Tabelas: skill_categorias, skills, skill_avaliacoes, skill_analises
-- ============================================================

-- ── Enums ────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE _plataforma.skill_tipo AS ENUM ('atendimento', 'produto');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE _plataforma.skill_fonte AS ENUM ('manual', 'ml_gerada', 'documento');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE _plataforma.skill_nivel AS ENUM ('iniciante', 'intermediario', 'avancado', 'expert');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE _plataforma.skill_tendencia AS ENUM ('melhorando', 'estavel', 'piorando');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE _plataforma.avaliador_tipo AS ENUM ('humano', 'ia');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Tabela 1: skill_categorias ────────────────────────────────

CREATE TABLE IF NOT EXISTS _plataforma.skill_categorias (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome            VARCHAR(120) NOT NULL,
    tipo            _plataforma.skill_tipo NOT NULL,
    subcategoria    VARCHAR(80),
    icone           VARCHAR(20) DEFAULT '⚡',
    descricao       TEXT,
    ativo           BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (nome, tipo)
);

COMMENT ON TABLE _plataforma.skill_categorias IS 'Catálogo global de tipos de skill disponíveis na plataforma';

-- ── Tabela 2: skills ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS _plataforma.skills (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id          UUID NOT NULL REFERENCES _plataforma.projetos(id) ON DELETE CASCADE,
    categoria_id        UUID NOT NULL REFERENCES _plataforma.skill_categorias(id),
    titulo              VARCHAR(200) NOT NULL,
    descricao           TEXT,
    conteudo            TEXT NOT NULL,
    fonte               _plataforma.skill_fonte NOT NULL DEFAULT 'manual',
    fonte_id            UUID,
    nivel               _plataforma.skill_nivel NOT NULL DEFAULT 'iniciante',
    nota_performance    NUMERIC(5,2) CHECK (nota_performance BETWEEN 0 AND 100),
    tendencia           _plataforma.skill_tendencia DEFAULT 'estavel',
    total_aplicacoes    INTEGER NOT NULL DEFAULT 0,
    taxa_sucesso        NUMERIC(5,2) CHECK (taxa_sucesso BETWEEN 0 AND 100),
    taxa_conversao      NUMERIC(5,2) CHECK (taxa_conversao BETWEEN 0 AND 100),
    ativo               BOOLEAN NOT NULL DEFAULT true,
    versao              INTEGER NOT NULL DEFAULT 1,
    criado_por          UUID REFERENCES _plataforma.usuarios(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE _plataforma.skills IS 'Skills de IA por projeto — atendimento e produto';
COMMENT ON COLUMN _plataforma.skills.nota_performance IS 'Nota 0-100 calculada automaticamente com base nas avaliações e análises';
COMMENT ON COLUMN _plataforma.skills.fonte_id IS 'FK para documentos_produto (produto) ou ID de análise ML (atendimento)';

CREATE INDEX IF NOT EXISTS idx_skills_projeto ON _plataforma.skills(projeto_id);
CREATE INDEX IF NOT EXISTS idx_skills_categoria ON _plataforma.skills(categoria_id);
CREATE INDEX IF NOT EXISTS idx_skills_projeto_tipo ON _plataforma.skills(projeto_id, ativo);

-- ── Tabela 3: skill_avaliacoes ────────────────────────────────

CREATE TABLE IF NOT EXISTS _plataforma.skill_avaliacoes (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id                UUID NOT NULL REFERENCES _plataforma.skills(id) ON DELETE CASCADE,
    projeto_id              UUID NOT NULL REFERENCES _plataforma.projetos(id),
    avaliador_tipo          _plataforma.avaliador_tipo NOT NULL,
    avaliador_id            UUID REFERENCES _plataforma.usuarios(id),
    modelo_ia               VARCHAR(80),
    -- Notas por dimensão (0-10)
    nota_geral              NUMERIC(4,1) NOT NULL CHECK (nota_geral BETWEEN 0 AND 10),
    nota_clareza            NUMERIC(4,1) CHECK (nota_clareza BETWEEN 0 AND 10),
    nota_aplicabilidade     NUMERIC(4,1) CHECK (nota_aplicabilidade BETWEEN 0 AND 10),
    nota_cobertura          NUMERIC(4,1) CHECK (nota_cobertura BETWEEN 0 AND 10),
    nota_efetividade        NUMERIC(4,1) CHECK (nota_efetividade BETWEEN 0 AND 10),
    -- Feedback qualitativo
    observacao              TEXT,
    sugestao_melhoria       TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE _plataforma.skill_avaliacoes IS 'Histórico de avaliações de skills — por humano ou IA';

CREATE INDEX IF NOT EXISTS idx_skill_avaliacoes_skill ON _plataforma.skill_avaliacoes(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_avaliacoes_projeto ON _plataforma.skill_avaliacoes(projeto_id);

-- ── Tabela 4: skill_analises ──────────────────────────────────

CREATE TABLE IF NOT EXISTS _plataforma.skill_analises (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id            UUID NOT NULL REFERENCES _plataforma.skills(id) ON DELETE CASCADE,
    projeto_id          UUID NOT NULL REFERENCES _plataforma.projetos(id),
    -- Período analisado
    periodo_inicio      TIMESTAMPTZ NOT NULL,
    periodo_fim         TIMESTAMPTZ NOT NULL,
    -- Métricas quantitativas
    total_aplicacoes    INTEGER NOT NULL DEFAULT 0,
    taxa_conversao      NUMERIC(5,2),
    taxa_sucesso        NUMERIC(5,2),
    nps_correlacao      NUMERIC(5,2),
    tempo_medio_resposta_s INTEGER,
    -- Tendência e nível calculados
    tendencia           _plataforma.skill_tendencia DEFAULT 'estavel',
    nivel_calculado     _plataforma.skill_nivel,
    nota_periodo        NUMERIC(5,2),
    -- Insights qualitativos (gerados por IA)
    pontos_fortes       TEXT[],
    pontos_fracos       TEXT[],
    sugestoes           TEXT[],
    conversas_exemplo   UUID[],
    -- Dados extras
    metricas_detalhe    JSONB,
    gerado_por_modelo   VARCHAR(80),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE _plataforma.skill_analises IS 'Análises periódicas de performance de skills — geradas pelo pipeline ML';

CREATE INDEX IF NOT EXISTS idx_skill_analises_skill ON _plataforma.skill_analises(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_analises_periodo ON _plataforma.skill_analises(periodo_inicio, periodo_fim);

-- ── Trigger: atualiza updated_at automaticamente ──────────────

CREATE OR REPLACE FUNCTION _plataforma.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DO $$ BEGIN
  CREATE TRIGGER trg_skill_categorias_updated_at
    BEFORE UPDATE ON _plataforma.skill_categorias
    FOR EACH ROW EXECUTE FUNCTION _plataforma.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_skills_updated_at
    BEFORE UPDATE ON _plataforma.skills
    FOR EACH ROW EXECUTE FUNCTION _plataforma.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Dados iniciais: catálogo de categorias ────────────────────

INSERT INTO _plataforma.skill_categorias (nome, tipo, subcategoria, icone, descricao) VALUES
  -- Atendimento → Vendas
  ('Vendas Consultiva',        'atendimento', 'Vendas',    '🤝', 'Técnica de venda focada em entender profundamente as necessidades do cliente antes de apresentar soluções'),
  ('Vendas Técnicas',          'atendimento', 'Vendas',    '🔧', 'Venda de produtos/serviços que exigem conhecimento técnico especializado para argumentação'),
  ('Vendas por Urgência',      'atendimento', 'Vendas',    '⚡', 'Técnica de criação de senso de urgência e escassez para acelerar decisão de compra'),
  ('Fechamento de Vendas',     'atendimento', 'Vendas',    '🎯', 'Técnicas de fechamento — experimentos de compromisso, resumo de benefícios, oferta condicional'),
  -- Atendimento → Objeções
  ('Tratamento de Objeções',   'atendimento', 'Objeções',  '🛡️', 'Como identificar, acolher e reverter objeções comuns de preço, concorrência e urgência'),
  ('Negociação e Desconto',    'atendimento', 'Objeções',  '💰', 'Gestão de expectativas de preço e condições sem comprometer margens'),
  -- Atendimento → Relacionamento
  ('Empatia e Rapport',        'atendimento', 'Relacionamento', '💬', 'Construção de conexão genuína com o cliente para gerar confiança e abertura'),
  ('Gestão de Conflitos',      'atendimento', 'Relacionamento', '⚖️', 'Como lidar com clientes insatisfeitos, reclamações e situações de tensão'),
  ('Atendimento Receptivo',    'atendimento', 'Relacionamento', '📞', 'Boas práticas de recepção, saudação, qualificação e direcionamento de leads'),
  -- Atendimento → Pós-venda
  ('Suporte Pós-venda',        'atendimento', 'Pós-venda', '🔄', 'Acompanhamento e fidelização após a venda — retenção e upsell'),
  ('Retenção de Clientes',     'atendimento', 'Pós-venda', '🔒', 'Estratégias para reduzir churn e reativar clientes inativos'),
  -- Produto
  ('Conhecimento de Produto',  'produto', 'Produto', '📦', 'Informações técnicas, benefícios, diferenciais e casos de uso dos produtos/serviços'),
  ('Catálogo e Precificação',  'produto', 'Produto', '💲', 'Tabela de preços, condições comerciais, promoções e políticas de desconto'),
  ('FAQ de Produto',           'produto', 'Produto', '❓', 'Perguntas frequentes sobre o produto — funcionalidades, compatibilidade, limitações'),
  ('Processos Operacionais',   'produto', 'Operacional', '⚙️', 'Fluxos de entrega, instalação, manutenção e suporte técnico')
ON CONFLICT (nome, tipo) DO NOTHING;

-- ── Permissões para portal_app ────────────────────────────────

GRANT SELECT, INSERT, UPDATE ON _plataforma.skill_categorias TO portal_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON _plataforma.skills TO portal_app;
GRANT SELECT, INSERT ON _plataforma.skill_avaliacoes TO portal_app;
GRANT SELECT, INSERT ON _plataforma.skill_analises TO portal_app;
