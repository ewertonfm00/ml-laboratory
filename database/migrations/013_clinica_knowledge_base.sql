-- ============================================================
-- Migration 013: Knowledge Base da Clínica
-- Tabelas: perfil, faq, depoimentos, procedimentos, knowledge_base
-- Schema: ml_clinica
-- ============================================================

CREATE SCHEMA IF NOT EXISTS ml_clinica;

-- ───── Tabela: perfil ────────────────────────────────────────
-- Dados operacionais da clínica (uma por projeto)

CREATE TABLE IF NOT EXISTS ml_clinica.perfil (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id                 UUID NOT NULL REFERENCES _plataforma.projetos(id) ON DELETE CASCADE,

  -- Seção 1: Identidade
  nome_clinica               TEXT,
  nome_responsavel           TEXT,
  cargo_formacao             TEXT,
  mini_curriculum            TEXT,
  registro_profissional      TEXT,
  cnpj                       TEXT,
  instagram                  TEXT,
  site                       TEXT,

  -- Seção 2: Contato e Localização
  whatsapp                   TEXT,
  whatsapp_exclusivo         BOOLEAN DEFAULT true,
  rua                        TEXT,
  numero                     TEXT,
  complemento                TEXT,
  bairro                     TEXT,
  cidade                     TEXT,
  estado                     TEXT,
  cep                        TEXT,
  ponto_referencia           TEXT,

  -- Seção 3: Operação e Agendamento
  dias_atendimento           TEXT,
  horario_seg_sex            TEXT,
  horario_sabado             TEXT,
  pausa_almoco               TEXT,
  capacidade_dia             INTEGER,
  tempo_entre_atendimentos   INTEGER,
  tolerancia_atraso          INTEGER,
  antecedencia_cancelamento  INTEGER,
  politica_agendamento       TEXT,
  avaliacao_gratuita         TEXT,

  -- Seção 4: Pagamento
  formas_pagamento           TEXT,
  aceita_parcelamento        BOOLEAN DEFAULT true,
  regras_parcelamento        TEXT,
  desconto_vista             INTEGER,
  politica_entrada           TEXT,
  politica_reembolso         TEXT,
  beneficios_fidelidade      TEXT,

  -- Seção 5: Configuração do Agente
  apresentacao_agente        TEXT,
  tom_comunicacao            TEXT,
  frases_proibidas           TEXT,
  objecoes_comuns            TEXT,
  argumentos_persuasao       TEXT,
  procedimentos_prioritarios TEXT,
  regras_limitacoes          TEXT,
  regras_internas            TEXT,

  -- Seção 8: Contra-indicações Gerais
  contraindicacoes_gerais    TEXT,
  restricoes_saude           TEXT,
  outras_restricoes          TEXT,

  -- Seção 9: Autorizações
  autoriza_whatsapp          BOOLEAN DEFAULT true,
  autoriza_acesso_conversas  BOOLEAN DEFAULT true,

  -- Controle
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (projeto_id)
);

-- ───── Tabela: faq ───────────────────────────────────────────
-- Perguntas frequentes dinâmicas por projeto

CREATE TABLE IF NOT EXISTS ml_clinica.faq (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id UUID NOT NULL REFERENCES _plataforma.projetos(id) ON DELETE CASCADE,
  pergunta   TEXT NOT NULL,
  resposta   TEXT NOT NULL,
  ordem      INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ───── Tabela: depoimentos ───────────────────────────────────
-- Depoimentos de pacientes por projeto

CREATE TABLE IF NOT EXISTS ml_clinica.depoimentos (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id     UUID NOT NULL REFERENCES _plataforma.projetos(id) ON DELETE CASCADE,
  nome_paciente  TEXT NOT NULL,
  depoimento     TEXT NOT NULL,
  ordem          INTEGER DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ───── Tabela: procedimentos ─────────────────────────────────
-- Procedimentos da clínica (18 campos + sugestões de resposta)

CREATE TABLE IF NOT EXISTS ml_clinica.procedimentos (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id            UUID NOT NULL REFERENCES _plataforma.projetos(id) ON DELETE CASCADE,
  nome                  TEXT NOT NULL,
  finalidade            TEXT,
  regiao                TEXT,
  qtd_sessoes           INTEGER,
  duracao_sessao        INTEGER,
  intervalo_sessoes     INTEGER,
  valor_avulso          NUMERIC(10,2),
  valor_sessao_pacote   NUMERIC(10,2),
  valor_pacote          NUMERIC(10,2),
  descricao             TEXT,
  beneficios            TEXT,
  contraindicacoes      TEXT,
  resultados_esperados  TEXT,
  cuidados_pre          TEXT,
  cuidados_pos          TEXT,
  status                TEXT NOT NULL DEFAULT 'ativo',
  observacoes           TEXT,
  sugestoes_respostas   TEXT,
  ordem                 INTEGER DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ───── Tabela: knowledge_base ────────────────────────────────
-- Texto compilado otimizado para o agente de IA

CREATE TABLE IF NOT EXISTS ml_clinica.knowledge_base (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id UUID NOT NULL REFERENCES _plataforma.projetos(id) ON DELETE CASCADE,
  conteudo   TEXT NOT NULL,
  versao     INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (projeto_id)
);

-- ───── Índices ───────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_clinica_perfil_projeto
  ON ml_clinica.perfil(projeto_id);

CREATE INDEX IF NOT EXISTS idx_clinica_faq_projeto_ordem
  ON ml_clinica.faq(projeto_id, ordem);

CREATE INDEX IF NOT EXISTS idx_clinica_depoimentos_projeto_ordem
  ON ml_clinica.depoimentos(projeto_id, ordem);

CREATE INDEX IF NOT EXISTS idx_clinica_procedimentos_projeto_ordem
  ON ml_clinica.procedimentos(projeto_id, ordem);

CREATE INDEX IF NOT EXISTS idx_clinica_procedimentos_status
  ON ml_clinica.procedimentos(projeto_id, status);

CREATE INDEX IF NOT EXISTS idx_clinica_knowledge_base_projeto
  ON ml_clinica.knowledge_base(projeto_id);

-- ───── Trigger updated_at ────────────────────────────────────

CREATE OR REPLACE FUNCTION ml_clinica.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_perfil_updated_at ON ml_clinica.perfil;
CREATE TRIGGER trg_perfil_updated_at
  BEFORE UPDATE ON ml_clinica.perfil
  FOR EACH ROW EXECUTE FUNCTION ml_clinica.set_updated_at();

DROP TRIGGER IF EXISTS trg_procedimentos_updated_at ON ml_clinica.procedimentos;
CREATE TRIGGER trg_procedimentos_updated_at
  BEFORE UPDATE ON ml_clinica.procedimentos
  FOR EACH ROW EXECUTE FUNCTION ml_clinica.set_updated_at();

DROP TRIGGER IF EXISTS trg_knowledge_base_updated_at ON ml_clinica.knowledge_base;
CREATE TRIGGER trg_knowledge_base_updated_at
  BEFORE UPDATE ON ml_clinica.knowledge_base
  FOR EACH ROW EXECUTE FUNCTION ml_clinica.set_updated_at();

-- ───── Função: compilar_knowledge_base ───────────────────────
-- Monta texto markdown estruturado com todos os dados da clínica

CREATE OR REPLACE FUNCTION ml_clinica.compilar_knowledge_base(p_projeto_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_perfil     ml_clinica.perfil%ROWTYPE;
  v_resultado  TEXT := '';
  v_linha      RECORD;
BEGIN
  -- Busca perfil
  SELECT * INTO v_perfil FROM ml_clinica.perfil WHERE projeto_id = p_projeto_id;

  -- ── IDENTIDADE ──────────────────────────────────────────────
  v_resultado := v_resultado || '# Dados da Clínica' || E'\n\n';

  IF v_perfil.nome_clinica IS NOT NULL THEN
    v_resultado := v_resultado || '**Clínica:** ' || v_perfil.nome_clinica || E'\n';
  END IF;
  IF v_perfil.nome_responsavel IS NOT NULL THEN
    v_resultado := v_resultado || '**Responsável:** ' || v_perfil.nome_responsavel;
    IF v_perfil.cargo_formacao IS NOT NULL THEN
      v_resultado := v_resultado || ' — ' || v_perfil.cargo_formacao;
    END IF;
    v_resultado := v_resultado || E'\n';
  END IF;
  IF v_perfil.registro_profissional IS NOT NULL THEN
    v_resultado := v_resultado || '**Registro:** ' || v_perfil.registro_profissional || E'\n';
  END IF;
  IF v_perfil.mini_curriculum IS NOT NULL THEN
    v_resultado := v_resultado || E'\n' || v_perfil.mini_curriculum || E'\n';
  END IF;

  -- ── CONTATO ─────────────────────────────────────────────────
  v_resultado := v_resultado || E'\n## Contato e Localização\n\n';

  IF v_perfil.whatsapp IS NOT NULL THEN
    v_resultado := v_resultado || '**WhatsApp:** ' || v_perfil.whatsapp || E'\n';
  END IF;
  IF v_perfil.instagram IS NOT NULL THEN
    v_resultado := v_resultado || '**Instagram:** ' || v_perfil.instagram || E'\n';
  END IF;
  IF v_perfil.site IS NOT NULL THEN
    v_resultado := v_resultado || '**Site:** ' || v_perfil.site || E'\n';
  END IF;

  -- Endereço
  IF v_perfil.rua IS NOT NULL OR v_perfil.cidade IS NOT NULL THEN
    v_resultado := v_resultado || '**Endereço:** ';
    IF v_perfil.rua IS NOT NULL THEN
      v_resultado := v_resultado || v_perfil.rua;
      IF v_perfil.numero IS NOT NULL THEN v_resultado := v_resultado || ', ' || v_perfil.numero; END IF;
      IF v_perfil.complemento IS NOT NULL THEN v_resultado := v_resultado || ' — ' || v_perfil.complemento; END IF;
    END IF;
    IF v_perfil.bairro IS NOT NULL THEN v_resultado := v_resultado || ', ' || v_perfil.bairro; END IF;
    IF v_perfil.cidade IS NOT NULL THEN
      v_resultado := v_resultado || ', ' || v_perfil.cidade;
      IF v_perfil.estado IS NOT NULL THEN v_resultado := v_resultado || '/' || v_perfil.estado; END IF;
    END IF;
    IF v_perfil.cep IS NOT NULL THEN v_resultado := v_resultado || ' — CEP: ' || v_perfil.cep; END IF;
    v_resultado := v_resultado || E'\n';
    IF v_perfil.ponto_referencia IS NOT NULL THEN
      v_resultado := v_resultado || '**Referência:** ' || v_perfil.ponto_referencia || E'\n';
    END IF;
  END IF;

  -- ── HORÁRIOS ─────────────────────────────────────────────────
  v_resultado := v_resultado || E'\n## Horários e Agendamento\n\n';

  IF v_perfil.dias_atendimento IS NOT NULL THEN
    v_resultado := v_resultado || '**Dias:** ' || v_perfil.dias_atendimento || E'\n';
  END IF;
  IF v_perfil.horario_seg_sex IS NOT NULL THEN
    v_resultado := v_resultado || '**Seg–Sex:** ' || v_perfil.horario_seg_sex || E'\n';
  END IF;
  IF v_perfil.horario_sabado IS NOT NULL THEN
    v_resultado := v_resultado || '**Sábado:** ' || v_perfil.horario_sabado || E'\n';
  END IF;
  IF v_perfil.pausa_almoco IS NOT NULL THEN
    v_resultado := v_resultado || '**Pausa almoço:** ' || v_perfil.pausa_almoco || E'\n';
  END IF;
  IF v_perfil.capacidade_dia IS NOT NULL THEN
    v_resultado := v_resultado || '**Capacidade/dia:** ' || v_perfil.capacidade_dia || ' atendimentos' || E'\n';
  END IF;
  IF v_perfil.tolerancia_atraso IS NOT NULL THEN
    v_resultado := v_resultado || '**Tolerância atraso:** ' || v_perfil.tolerancia_atraso || ' minutos' || E'\n';
  END IF;
  IF v_perfil.antecedencia_cancelamento IS NOT NULL THEN
    v_resultado := v_resultado || '**Cancelamento:** avisar com ' || v_perfil.antecedencia_cancelamento || 'h de antecedência' || E'\n';
  END IF;
  IF v_perfil.politica_agendamento IS NOT NULL THEN
    v_resultado := v_resultado || E'\n**Política de agendamento:** ' || v_perfil.politica_agendamento || E'\n';
  END IF;
  IF v_perfil.avaliacao_gratuita IS NOT NULL THEN
    v_resultado := v_resultado || E'\n**Avaliação gratuita:** ' || v_perfil.avaliacao_gratuita || E'\n';
  END IF;

  -- ── PAGAMENTO ────────────────────────────────────────────────
  v_resultado := v_resultado || E'\n## Pagamento\n\n';

  IF v_perfil.formas_pagamento IS NOT NULL THEN
    v_resultado := v_resultado || '**Formas de pagamento:** ' || v_perfil.formas_pagamento || E'\n';
  END IF;
  IF v_perfil.aceita_parcelamento IS NOT NULL THEN
    v_resultado := v_resultado || '**Parcelamento:** ' || CASE WHEN v_perfil.aceita_parcelamento THEN 'Sim' ELSE 'Não' END || E'\n';
  END IF;
  IF v_perfil.regras_parcelamento IS NOT NULL THEN
    v_resultado := v_resultado || '**Regras parcelamento:** ' || v_perfil.regras_parcelamento || E'\n';
  END IF;
  IF v_perfil.desconto_vista IS NOT NULL THEN
    v_resultado := v_resultado || '**Desconto à vista:** ' || v_perfil.desconto_vista || '%' || E'\n';
  END IF;
  IF v_perfil.politica_entrada IS NOT NULL THEN
    v_resultado := v_resultado || '**Política de entrada:** ' || v_perfil.politica_entrada || E'\n';
  END IF;
  IF v_perfil.politica_reembolso IS NOT NULL THEN
    v_resultado := v_resultado || '**Reembolso:** ' || v_perfil.politica_reembolso || E'\n';
  END IF;
  IF v_perfil.beneficios_fidelidade IS NOT NULL THEN
    v_resultado := v_resultado || '**Fidelidade:** ' || v_perfil.beneficios_fidelidade || E'\n';
  END IF;

  -- ── CONFIGURAÇÃO DO AGENTE ───────────────────────────────────
  v_resultado := v_resultado || E'\n## Configuração do Agente\n\n';

  IF v_perfil.apresentacao_agente IS NOT NULL THEN
    v_resultado := v_resultado || '**Apresentação:** ' || v_perfil.apresentacao_agente || E'\n';
  END IF;
  IF v_perfil.tom_comunicacao IS NOT NULL THEN
    v_resultado := v_resultado || '**Tom:** ' || v_perfil.tom_comunicacao || E'\n';
  END IF;
  IF v_perfil.frases_proibidas IS NOT NULL THEN
    v_resultado := v_resultado || E'\n**Frases proibidas:**\n' || v_perfil.frases_proibidas || E'\n';
  END IF;
  IF v_perfil.objecoes_comuns IS NOT NULL THEN
    v_resultado := v_resultado || E'\n**Objeções comuns:**\n' || v_perfil.objecoes_comuns || E'\n';
  END IF;
  IF v_perfil.argumentos_persuasao IS NOT NULL THEN
    v_resultado := v_resultado || E'\n**Argumentos de persuasão:**\n' || v_perfil.argumentos_persuasao || E'\n';
  END IF;
  IF v_perfil.procedimentos_prioritarios IS NOT NULL THEN
    v_resultado := v_resultado || E'\n**Procedimentos prioritários:** ' || v_perfil.procedimentos_prioritarios || E'\n';
  END IF;
  IF v_perfil.regras_limitacoes IS NOT NULL THEN
    v_resultado := v_resultado || E'\n**Regras e limitações:**\n' || v_perfil.regras_limitacoes || E'\n';
  END IF;
  IF v_perfil.regras_internas IS NOT NULL THEN
    v_resultado := v_resultado || E'\n**Regras internas:**\n' || v_perfil.regras_internas || E'\n';
  END IF;

  -- ── CONTRA-INDICAÇÕES ────────────────────────────────────────
  IF v_perfil.contraindicacoes_gerais IS NOT NULL OR v_perfil.restricoes_saude IS NOT NULL OR v_perfil.outras_restricoes IS NOT NULL THEN
    v_resultado := v_resultado || E'\n## Contra-indicações Gerais\n\n';
    IF v_perfil.contraindicacoes_gerais IS NOT NULL THEN
      v_resultado := v_resultado || v_perfil.contraindicacoes_gerais || E'\n';
    END IF;
    IF v_perfil.restricoes_saude IS NOT NULL THEN
      v_resultado := v_resultado || E'\n**Restrições de saúde:** ' || v_perfil.restricoes_saude || E'\n';
    END IF;
    IF v_perfil.outras_restricoes IS NOT NULL THEN
      v_resultado := v_resultado || '**Outras restrições:** ' || v_perfil.outras_restricoes || E'\n';
    END IF;
  END IF;

  -- ── PROCEDIMENTOS ATIVOS ─────────────────────────────────────
  v_resultado := v_resultado || E'\n## Procedimentos\n\n';

  FOR v_linha IN
    SELECT * FROM ml_clinica.procedimentos
    WHERE projeto_id = p_projeto_id AND status = 'ativo'
    ORDER BY ordem, nome
  LOOP
    v_resultado := v_resultado || '### ' || v_linha.nome || E'\n';
    IF v_linha.finalidade IS NOT NULL THEN
      v_resultado := v_resultado || '**Finalidade:** ' || v_linha.finalidade || E'\n';
    END IF;
    IF v_linha.regiao IS NOT NULL THEN
      v_resultado := v_resultado || '**Região:** ' || v_linha.regiao || E'\n';
    END IF;
    IF v_linha.qtd_sessoes IS NOT NULL THEN
      v_resultado := v_resultado || '**Sessões:** ' || v_linha.qtd_sessoes;
      IF v_linha.duracao_sessao IS NOT NULL THEN
        v_resultado := v_resultado || ' x ' || v_linha.duracao_sessao || 'min';
      END IF;
      v_resultado := v_resultado || E'\n';
    END IF;
    IF v_linha.intervalo_sessoes IS NOT NULL THEN
      v_resultado := v_resultado || '**Intervalo:** ' || v_linha.intervalo_sessoes || ' dias' || E'\n';
    END IF;
    IF v_linha.valor_avulso IS NOT NULL OR v_linha.valor_pacote IS NOT NULL THEN
      v_resultado := v_resultado || '**Valores:** ';
      IF v_linha.valor_avulso IS NOT NULL THEN
        v_resultado := v_resultado || 'Avulso R$' || TO_CHAR(v_linha.valor_avulso, 'FM999999990.00');
      END IF;
      IF v_linha.valor_pacote IS NOT NULL THEN
        IF v_linha.valor_avulso IS NOT NULL THEN v_resultado := v_resultado || ' | '; END IF;
        v_resultado := v_resultado || 'Pacote R$' || TO_CHAR(v_linha.valor_pacote, 'FM999999990.00');
        IF v_linha.valor_sessao_pacote IS NOT NULL THEN
          v_resultado := v_resultado || ' (R$' || TO_CHAR(v_linha.valor_sessao_pacote, 'FM999999990.00') || '/sessão)';
        END IF;
      END IF;
      v_resultado := v_resultado || E'\n';
    END IF;
    IF v_linha.descricao IS NOT NULL THEN
      v_resultado := v_resultado || E'\n' || v_linha.descricao || E'\n';
    END IF;
    IF v_linha.beneficios IS NOT NULL THEN
      v_resultado := v_resultado || E'\n**Benefícios:** ' || v_linha.beneficios || E'\n';
    END IF;
    IF v_linha.contraindicacoes IS NOT NULL THEN
      v_resultado := v_resultado || '**Contra-indicações:** ' || v_linha.contraindicacoes || E'\n';
    END IF;
    IF v_linha.cuidados_pre IS NOT NULL THEN
      v_resultado := v_resultado || '**Cuidados pré:** ' || v_linha.cuidados_pre || E'\n';
    END IF;
    IF v_linha.cuidados_pos IS NOT NULL THEN
      v_resultado := v_resultado || '**Cuidados pós:** ' || v_linha.cuidados_pos || E'\n';
    END IF;
    IF v_linha.resultados_esperados IS NOT NULL THEN
      v_resultado := v_resultado || '**Resultados esperados:** ' || v_linha.resultados_esperados || E'\n';
    END IF;
    IF v_linha.sugestoes_respostas IS NOT NULL THEN
      v_resultado := v_resultado || E'\n**Perguntas frequentes sobre este procedimento:**\n' || v_linha.sugestoes_respostas || E'\n';
    END IF;
    v_resultado := v_resultado || E'\n';
  END LOOP;

  -- ── FAQ ──────────────────────────────────────────────────────
  IF EXISTS (SELECT 1 FROM ml_clinica.faq WHERE projeto_id = p_projeto_id) THEN
    v_resultado := v_resultado || E'\n## Perguntas Frequentes\n\n';
    FOR v_linha IN
      SELECT * FROM ml_clinica.faq
      WHERE projeto_id = p_projeto_id
      ORDER BY ordem, created_at
    LOOP
      v_resultado := v_resultado || '**P: ' || v_linha.pergunta || '**' || E'\n';
      v_resultado := v_resultado || 'R: ' || v_linha.resposta || E'\n\n';
    END LOOP;
  END IF;

  -- ── DEPOIMENTOS ──────────────────────────────────────────────
  IF EXISTS (SELECT 1 FROM ml_clinica.depoimentos WHERE projeto_id = p_projeto_id) THEN
    v_resultado := v_resultado || E'\n## Depoimentos de Pacientes\n\n';
    FOR v_linha IN
      SELECT * FROM ml_clinica.depoimentos
      WHERE projeto_id = p_projeto_id
      ORDER BY ordem, created_at
    LOOP
      v_resultado := v_resultado || '"' || v_linha.depoimento || '"' || E'\n';
      v_resultado := v_resultado || '— ' || v_linha.nome_paciente || E'\n\n';
    END LOOP;
  END IF;

  RETURN v_resultado;
END;
$$;

-- ───── Permissões ────────────────────────────────────────────

GRANT USAGE ON SCHEMA ml_clinica TO portal_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ml_clinica.perfil TO portal_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ml_clinica.faq TO portal_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ml_clinica.depoimentos TO portal_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ml_clinica.procedimentos TO portal_app;
GRANT SELECT, INSERT, UPDATE ON ml_clinica.knowledge_base TO portal_app;
GRANT EXECUTE ON FUNCTION ml_clinica.compilar_knowledge_base(UUID) TO portal_app;
