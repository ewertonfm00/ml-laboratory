# Knowledge Base — Negócio

Última atualização: 2026-04-24

---

## Empresa / Cliente Principal

- **Nome:** Omega Laser
- **Setor:** Equipamentos estéticos e serviços de locação de equipamentos
- **Contexto:** Empresa com equipe de vendas que usa WhatsApp como canal principal de atendimento comercial

---

## Projeto

- **Nome:** Machine Learning Laboratory (ML Laboratory)
- **Objetivo:** Laboratório de inteligência aplicada a negócios — captura dados reais de conversas WhatsApp, refina padrões comportamentais e gera skills para agentes de IA
- **Isolamento:** Prefixo `ml-` em todos os squads, `ml_` em todos os schemas Postgres, `ml:` em Redis, `[ML-*]` em workflows n8n, instância `ml-omega-laser` na Evolution API

---

## Infraestrutura em Uso

- **Railway** — hospedagem de todos os serviços
- **Postgres** — banco de dados principal (schemas isolados com prefixo `ml_`)
- **Redis** — cache com prefixo `ml:`
- **Evolution API** — integração WhatsApp (instância isolada: `ml-omega-laser`)
- **n8n** — orquestração de workflows (tags `[ML-*]`)
- **Groq Whisper** — transcrição de áudio (`whisper-large-v3`, idioma: `pt`)
- **Claude Haiku** — classificação automática de conversas
- **Claude Sonnet** — análise profunda, geração de perfis e treinamentos
- **Metabase** — dashboards analíticos (embed no portal)
- **Portal Next.js** (`portal-next/`) — portal interativo de gestão (substituiu Appsmith em 2026-04-16; deployado em produção em 2026-04-17: `https://portal-ml-production.up.railway.app`)

---

## Instância de Testes ML Laboratory

- **Número:** `ml-5516988456918` — instância conectada e ativa (`state: open`)
- **Projeto no banco:** `9c22ad6e-ca38-48d4-8dbb-51bbcadf67a2` (Machine Learning)
- **Finalidade:** captura de conversas reais para alimentar o laboratório
- **Pipeline confirmado:** mensagens chegando em `ml_captura.mensagens_raw` com `projeto_id` preenchido

---

## Números WhatsApp Conectados (Omega Laser)

| Número | Setor | Produto | Multi-agente | Ferramenta |
|--------|-------|---------|-------------|------------|
| 5516-9999-0001 | Comercial | Equipamentos | Sim (João, Maria, Pedro) | Redrive |
| 5516-9999-0002 | Comercial | Locação (Serviço) | Sim (Ana, Carlos) | Redrive |
| 551632363666 | Comercial | Locação | Sim (Tabata, Rodrigo, Larissa, Ewerton) | Redrive |

**Observação:** Redrive é a ferramenta de atendimento multi-agente. Identificação do agente humano no payload — variável a confirmar via tree-builder do chatflow.
- Instância ativa no banco: `omega-laser-locacoes`
- Projeto no banco: id `7bd3cbf2-cb83-42fa-a6bf-f52a57d99ea5`
- Bot UUID 1632363666: `7cdb13fe-44c5-4e8b-b842-44e9c8fddeba`
- Redrive usa Evolution API internamente — instância `7cdb13fe` NÃO está na nossa Evolution API
- Webhook global Redrive NÃO dispara para mensagens recebidas (confirmado)
- Captura funciona via bloco "Requisição" (POST) dentro do chatflow
- API Redrive (`api.redrive.com.br`): endpoints de auth retornam 404 — autenticação não mapeada ainda

---

## Onboarding de Novos Clientes

A plataforma suporta múltiplos clientes (projetos). Para conectar um novo cliente sem usar o terminal:

- **Workflow:** `ML-ONBOARDING-conectar-cliente.json` (n8n)
- **Fluxo:** formulário público → instância Evolution criada automaticamente → banco atualizado → QR Code exibido na tela
- **Público-alvo:** clientes completamente leigos — precisam apenas de um celular com WhatsApp
- **Campos do formulário:** nome da empresa, número WhatsApp (com DDI+DDD), responsável, setor
- **instance_name gerado:** `ml-{slug-da-empresa}` (ex: `ml-clinica-beleza-plena`)
- **Status inicial do número:** `teste` — passa para `ativo` após validação

---

## Hierarquia de Usuários do Portal

| Role | Permissões |
|------|-----------|
| MASTER | Acesso total a todos os projetos — cria/remove projetos e libera acesso |
| PROJECT_ADMIN | Gerencia usuários do projeto, conecta números, faz upload de docs |
| CONTRIBUTOR | Configurável: validar, corrigir, cadastrar usuários, fazer uploads |
| VIEWER | Apenas visualização de relatórios e dashboards |

**Flags de usuário:** `pode_validar`, `pode_corrigir`, `correcao_atualiza_base`, `pode_cadastrar_usuarios`, `pode_gerenciar_numeros`, `pode_upload_documentos`

---

## Produtos / Serviços Comercializados

- **Equipamentos estéticos** (venda varejo) — ex: Laser Diodo 808nm
- **Dermocosméticos** (venda emocional/consultiva)
- **Locação de equipamentos** (venda consultiva/relacional)

---

## Regras de Negócio Identificadas

### Validação de Respostas de Produto
- Respostas sobre produto/serviço são detectadas automaticamente pelo n8n
- Validação automática via Claude Haiku consultando FTS nos documentos cadastrados
- Se não encontrar informação: vai para fila humana (`pendente_humano`)
- Quem tem `pode_corrigir = true` pode fazer correção
- Se `correcao_atualiza_base = true`: atualização automática após correção
- Erros rastreados continuamente por produto até correção definitiva
- Threshold de alerta: 5+ ocorrências sem correção

---

## Arquitetura de Agentes IA (EsteticaIA)

- **EsteticaIA é uma estrutura genérica** — sem persona embutida. A persona (nome, identidade) vem da clínica cliente que usa a estrutura.
- **Identificadores funcionais de agentes IA:** `ai:sdr`, `ai:closer`, `ai:agendamento` — sem nome de persona no identificador
- **Padrão respondent_id:** `{tipo}:{slug}` — ex: `ai:sdr`, `human:maria`, `specialist:dr-carlos`
- **Seeds de IA:** inseridos em `_plataforma.agentes_humanos` após onboarding da instância da clínica (requerem `numero_id` válido)
- **Modelo de atribuição:** número `tipo=mono` → `agente_humano_id = agente_default_id` do número; `tipo=multi` → extrai `identificador_externo` do payload webhook → resolve `agente_humano_id`

---

## Sistema de Squads ML — Estado Atual (2026-04-24)

**72 agentes ativos** em 10 squads, todos no formato YAML completo com autoClaude v3.0:
- ml-atendimento (4), ml-captura (10), ml-comercial (10), ml-data-eng (3)
- ml-ia-padroes (9), ml-marketing (3), ml-orquestrador (6), ml-plataforma (5)
- ml-skills (8), software-house-elite (14)

**Gate de segmento (onboarding):** `strict_mode: true` por padrão — segmento inválido bloqueia onboarding inteiro antes de criar instâncias Evolution API. `strict_mode: false` apenas para adição de números isolados em clientes já ativos.

### Documentos de Produto (3 fontes)
- **Upload direto:** PDF, DOCX, TXT, CSV, XLSX, MD, JSON (máx 50MB) — indicado para pequenos clientes
- **URL externa:** Google Docs, Notion, Dropbox (sync automático configurável) — indicado para médios
- **API/ERP:** JSON REST com autenticação via `ML_PRODUTO_API_KEY` — indicado para grandes clientes

### Sessões de Conversa
- Sessão encerrada automaticamente após 30 minutos sem atividade
- Mínimo 3 mensagens para acionar análise automática
- Análise pelo conversation-analyst via Claude Haiku a cada 5 minutos

---

## Squads do Laboratório

### Nível 2 — Construção (infraestrutura do laboratório)
| Squad | Função |
|-------|--------|
| ml-plataforma-squad | Railway, Postgres, Redis, deploy |
| ml-captura-squad | Evolution API, n8n, Groq Whisper |
| ml-data-eng-squad | ETL, schema, classificação IA |
| ml-ia-padroes-squad | Padrões, comportamento, benchmarks |
| ml-skills-squad | Geração e validação de skills |

### Nível 1 — Operacionais (análise por área de negócio)
| Squad | Foco | Agentes |
|-------|------|---------|
| ml-comercial-squad | Vendas e conversas comerciais | conversation-analyst, behavioral-profiler, product-approach, objection-handler, training-generator, performance-reporter, niche-content-extractor, profile-segment-matcher, training-content-publisher |
| ml-operacional-squad | Processos e gargalos | process-analyst, failure-detector, optimization-advisor |
| ml-financeiro-squad | Risco e fluxo de caixa | risk-analyzer, cashflow-predictor, collections-advisor, **forecast-analyst** |
| ml-atendimento-squad | Satisfação e retenção | satisfaction-analyzer, churn-detector, retention-advisor, service-quality-monitor |
| ml-marketing-squad | Campanhas e segmentação | message-analyzer, segmentation-advisor, timing-optimizer, **campaign-executor** |
| ml-pessoas-squad | Talentos e engajamento | talent-profiler, engagement-monitor, onboarding-advisor |

### Nível 0 — Orquestrador (hub de inteligência cross-squad)
| Squad | Foco | Agentes |
|-------|------|---------|
| ml-orquestrador-squad | Síntese e relatórios executivos | cross-area-synthesizer, executive-reporter, anomaly-detector, segment-catalog-manager, insight-scheduler |

### Validação dos squads
- Validador: `.aiox-core/development/scripts/squad/squad-validator.js`
- Campos obrigatórios no frontmatter das tasks: `task`, `responsavel`, `responsavel_type`, `atomic_layer`, `elicit`, `Entrada`, `Saida`, `Checklist`
- Estado atual (2026-04-21): **12/12 squads ✅ — 0 erros, 0 avisos**

---

## Visão Estratégica do Projeto

- **Propósito maior:** Criar um exército de agentes de IA vendedores — os melhores do mundo
- **Piloto B2C:** Clientes da Omega Laser = clínicas de estética (vendedora → consumidor final)
- **Piloto B2B:** Vendedoras da Omega Laser → clínicas de estética (empresa → empresa)
- **Multi-segmento:** Além da Omega Laser, outros negócios de outros segmentos poderão conectar números. O segmento é dado obrigatório no cadastro do número.

### Propriedade dos Dados e Padrões

| Tipo de padrão | Pertence a |
|----------------|-----------|
| Padrões específicos do negócio | Cliente (ex: Omega Laser) |
| Perfil intrínseco de venda (comportamental puro) | Cliente **e** plataforma ML Laboratory |

- Os padrões extraídos das conversas de um cliente pertencem a esse cliente
- O perfil intrínseco de venda (DISC, estilo, técnica — agnóstico de produto) tem **propriedade compartilhada** entre o cliente e a plataforma
- A plataforma usa os perfis intrínsecos para enriquecer agentes de outros segmentos

### Dois Outputs Obrigatórios por Segmento

**Output 1 — Agente Específico (propriedade do cliente)**
- Agente de IA treinado para vender exatamente os produtos/serviços do negócio monitorado
- Usa linguagem, contexto e abordagem do segmento do cliente
- Exemplo Omega Laser: agente que vende laser diodo, dermocosméticos e locação para clínicas de estética

**Output 2 — Perfil Intrínseco de Venda (propriedade compartilhada)**
- Padrões comportamentais profundos extraídos dos vendedores — agnóstico de produto
- Captura estilo, técnica, DISC, abordagem relacional
- Alimenta o banco de inteligência da plataforma para enriquecer agentes de outros segmentos

### Segmento Obrigatório no Cadastro do Número
- Ao cadastrar um número WhatsApp, o **segmento do negócio é campo obrigatório**
- Exemplos: clínica de estética, imobiliária, escola de idiomas, e-commerce, SaaS B2B, etc.
- Usado para: contextualizar análises, separar perfis específicos dos intrínsecos, benchmarks entre negócios do mesmo segmento

### Dois tipos de análise por conversa
1. **Análise do Vendedor:** perfil de comunicação, comportamental, DISC, estilo de venda, pontos fortes/fracos, nota comercial
2. **Análise do Produto/Serviço:** assertividade das respostas vs. materiais técnicos, formas de abordar o assunto

### Materiais Técnicos por Número
- Cada número conectado pode ter materiais técnicos atrelados
- Análises comparam o que o atendente respondeu vs. o que está nos materiais
- Mede assertividade e captura variações de abordagem

### Metodologias de Vendas
- Espaço para alimentar TODAS as metodologias (SPIN, Challenger, MEDDIC, Sandler, SNAP, etc.)
- Base analítica para mapear comportamentos e criar os melhores agentes

### Painel Individual do Atendente
- Nota comercial + nota técnica (por conversa e média geral)
- Perfil do vendedor + análise DISC
- Evolução ao longo do tempo
- Perspectiva: potencial em vendas
- Sinalizações de respostas inadequadas (comercial e/ou técnica)

### Sinalização de Respostas Inadequadas
- Tipo `comercial`: abordagem errada, técnica inadequada de venda
- Tipo `tecnica`: informação incorreta sobre produto/serviço vs. material técnico
- Severidade: `alerta` ou `critico`
- Alimenta fila de validação e painel do atendente

---

## Schemas Postgres

| Schema | Área | Migrations |
|--------|------|-----------|
| ml_captura | Dados brutos (WhatsApp, transcrições) | 002 |
| ml_comercial | Vendas (conversas, perfis, objeções, treinamentos) | 003 |
| ml_operacional | Processos e falhas | 007 |
| ml_financeiro | Risco e cobrança | 008 |
| ml_atendimento | Satisfação e qualidade | 009 |
| ml_marketing | Campanhas e segmentos | 010 |
| ml_pessoas | Perfis e engajamento | 010 |
| _plataforma | Global: usuários, projetos, permissões | 004 |
| _validacao | Sistema de validação híbrida | 005 |
| ml_clinica | Cadastro do negócio, produtos/serviços, materiais, metodologias, knowledge base | 013, 014 |
| ml_analise | Análise por conversa, sinalizações de respostas inadequadas | 014 |
| _plataforma | Campo `responsavel` adicionado em `projetos` (migration 018) | 018 |
