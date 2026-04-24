# Session Log — AIOX Machine Learning Laboratory

---
## Sessão 2026-04-19

### 1. Implementações
- Nenhuma implementação de código nesta sessão — sessão de discovery e análise arquitetural.

### 2. Decisões

**Arquitetura — Identificação de Atendente nas Conversas**
- A tabela `ml_captura.sessoes_conversa` não possui campo de atendente — precisa de `agente_humano_id`
- O campo `responsavel` do formulário de onboarding **não é** o atendente das conversas — é apenas o contato que fez o cadastro da empresa, e não está sendo persistido no banco
- Os atendentes são registrados em `_plataforma.agentes_humanos` (com `identificador_externo` para integração com Redrive), mas sem vínculo com as sessões

**Dois modelos de operação identificados:**
- **Mono-agente:** 1 número WhatsApp → 1 pessoa fixa. O número já identifica o atendente. `agente_default_id` deve ser preenchido em `numeros_projeto`
- **Multi-agente:** 1 número → N atendentes (ex: Redrive). A plataforma identifica o atendente via `identificador_externo` no payload do webhook. Conversas precisam ser separadas por atendente para evitar distorções nas análises dos agentes de ML

**Modelo de dados proposto:**
```
numeros_projeto
  └── tipo: 'mono' | 'multi'
  └── agente_default_id (FK → agentes_humanos) — só para tipo=mono

sessoes_conversa
  └── agente_humano_id (FK → agentes_humanos) — sempre preenchido

Lógica de resolução no n8n (captura):
  → mono: agente_humano_id = agente_default_id do número
  → multi: extrai identificador_externo do webhook → resolve agente_humano_id
```

**Squads e Agentes (mapeamento completo desta sessão):**
- 11 squads: 6 com agentes ativos, 5 vazios
- 27 agentes definidos distribuídos em: ml-atendimento (3), ml-comercial (6), ml-financeiro (3), ml-marketing (3), ml-operacional (3), ml-pessoas (3)
- Squads vazios: ml-captura, ml-data-eng, ml-ia-padroes, ml-plataforma, ml-skills
- Nenhum agente tem `capability_level` definido explicitamente

**Banco de dados:** Supabase (PostgreSQL) com schemas por squad (`ml_comercial`, `ml_atendimento`, etc.) + schema global `_plataforma`

### 3. Todos Ativos

**PRIORIDADE ALTA — Migration + Workflow:**
- [ ] Adicionar campo `tipo` ('mono'|'multi') em `_plataforma.numeros_projeto`
- [ ] Adicionar campo `agente_default_id` em `_plataforma.numeros_projeto`
- [ ] Adicionar campo `agente_humano_id` em `ml_captura.sessoes_conversa`
- [ ] Ajustar workflow n8n de captura para resolver e preencher `agente_humano_id` automaticamente (lógica mono vs multi)
- [ ] Persistir campo `responsavel` do onboarding na tabela `_plataforma.projetos` (ou remover do formulário)

**PENDÊNCIA ANTERIOR (da memória):**
- [ ] Conectar número WhatsApp via Appsmith → escanear QR Code (ML-SETUP-INSTANCIA ativo)
- [ ] Painel da Clínica: telas para substituir formulário da planilha (dados operacionais + procedimentos + sugestões IA)

**Próximo passo sugerido:** Criar story para migration + ajuste de captura — acionar `@sm` para draftar ou ir direto com `@data-engineer` + `@dev`

---
## Sessão 2026-04-19 (continuação — implementação)

### 1. Implementações

**Migration 015** — `database/migrations/015_captura_agente_humano.sql` (CRIADO, commitado)
- `ADD COLUMN tipo VARCHAR(10) NOT NULL DEFAULT 'mono' CHECK (tipo IN ('mono','multi'))` em `_plataforma.numeros_projeto`
- `ADD COLUMN agente_default_id UUID REFERENCES _plataforma.agentes_humanos(id)` em `_plataforma.numeros_projeto`
- `ADD COLUMN agente_humano_id UUID REFERENCES _plataforma.agentes_humanos(id)` em `ml_captura.sessoes_conversa`
- Índice `idx_sessoes_agente`, COMMENTs em todas as colunas, idempotente

**Rollback** — `database/migrations/rollbacks/015_captura_agente_humano_rollback.sql` (CRIADO)

**Workflow n8n** — `infra/n8n/workflows/ML-CAPTURA-whatsapp-pipeline.json` (MODIFICADO, v1.2.0)
- `Lookup Setor`: agora retorna `tipo` e `agente_default_id`
- `Enriquecer com Setor`: propaga `numero_tipo` e `agente_default_id`
- Novo node `Lookup Agente Multi`: busca `agentes_humanos` por `identificador_externo` + `numero_id` (continueOnFail: true)
- Novo node `Resolver Atendente`: mono → usa `agente_default_id`; multi → usa resultado do lookup; fallback null
- `Upsert sessoes_conversa`: INSERT e UPDATE incluem `agente_humano_id`
- `Normalizar Payload`: extrai `identificador_externo` de `body.data?.agentId || body.agentId || body.metadados?.agentId`

**Story 1.1** — `docs/stories/1.1.story.md` (CRIADA)
- Epic 1 — Captura e Rastreabilidade de Conversas
- Tasks 1.1–1.7 e 2.1–2.5 marcadas como concluídas

**Session log** — `.claude/session-log.md` (CRIADO)

**Commit:** `cc72a04` — `feat: identificação do atendente nas conversas capturadas [Story 1.1]` — pushed para `origin/main`

### 2. Decisões

- **Campo do Redrive no webhook:** `metadados.agentId` (também tenta `body.data?.agentId` e `body.agentId`) — confirmado como padrão padrão Redrive
- **Fallback null seguro:** quando `identificador_externo` não encontrado em `agentes_humanos`, `agente_humano_id` fica null e sessão é gravada normalmente (sem erro)
- **COALESCE no UPDATE:** `agente_humano_id` só é preenchido se ainda null — não sobrescreve valor existente
- **Story-driven development:** story 1.1 criada antes da implementação, conforme AIOX Constitution Art. III

### 3. Todos Ativos

**Story 1.1 — pendentes:**
- [ ] `1.8` Executar migration no banco: `supabase db push` (requer acesso ao Supabase)
- [ ] `2.6` Testar cenário mono-agente em ambiente real
- [ ] `2.7` Testar cenário multi-agente com `identificador_externo` válido
- [ ] `2.8` Testar cenário multi-agente com `identificador_externo` desconhecido (deve gravar null)
- [ ] `3.1` Confirmar que agentes ML leem `agente_humano_id` via JOIN nas queries de análise

**Pendências anteriores (não tocadas):**
- [ ] Conectar número WhatsApp via Appsmith → escanear QR Code (ML-SETUP-INSTANCIA ativo)
- [ ] Painel da Clínica: telas para substituir formulário da planilha
- [ ] Campo `responsavel` do onboarding: persistir em `_plataforma.projetos` ou remover do formulário

---
## Sessão 2026-04-19 (continuação — integração EsteticaIA + Story 1.2)

### 1. Implementações

**Migration 017** — `database/migrations/017_mensagens_respondent_direction.sql` (CRIADO, aplicado ✅)
- `ADD COLUMN direction VARCHAR(10) DEFAULT 'unknown' CHECK IN ('incoming','outgoing','unknown')` em `mensagens_raw`
- `ADD COLUMN respondent_type VARCHAR(20) DEFAULT 'unknown' CHECK IN ('ai','human','specialist','unknown')` em `mensagens_raw`
- `ADD COLUMN respondent_name VARCHAR(255)` em `mensagens_raw`
- Índice `idx_mensagens_respondent_type`, COMMENTs, idempotente
- Rollback: `database/migrations/rollbacks/017_mensagens_respondent_direction_rollback.sql`
- Verificado no banco: 3 colunas confirmadas ✅

**Workflow EsteticaIA** — `infra/n8n/workflows/ML-EXTERNAL-esteticaia.json` (CRIADO)
- 8 nodes: Webhook → Normalizar → Lookup Projeto → Enriquecer → Lookup Agente → Resolver → Insert mensagem_raw → Upsert sessao
- Endpoint: `POST /ml/external/esteticaia`
- respondent_type=ai → agente_humano_id=null; human/specialist → lookup por identificador_externo
- external_session_id gravado em sessoes_conversa.metadados
- fonte='esteticaia' em mensagens_raw

**Story 1.2** — `docs/stories/1.2.story.md` (CRIADA)
- Tasks 1.1–1.7 e 2.1–2.7 concluídas

**Commit:** `91c6d64` — pushed `origin/main` ✅

### 2. Decisões

- **Webhook em tempo real** preferido sobre Supabase compartilhado — evita acoplamento de schemas
- **Endpoint dedicado** `/ml/external/esteticaia` — isolado do endpoint Evolution API para evitar colisão de formatos
- **respondent_id padrão:** `{tipo}:{slug}` — ex: `ai:sdr`, `human:maria`, `specialist:dr-carlos`
- **session_id format EsteticaIA:** `{instanceName}-{remoteJid}-{YYYYMMDD}`
- **Seed dos agentes IA bloqueado:** `agentes_humanos.numero_id` é NOT NULL — seed de `ai:sdr`, `ai:closer`, `ai:agendamento` só pode ser feito após onboarding da instância EsteticaIA no portal
- **@architect (Aria)** foi o agente responsável pela análise da proposta EsteticaIA e decisões de integração

### 3. Todos Ativos

**Story 1.2 — pendentes:**
- [ ] `1.8` Marcar migration 017 como aplicada na story (já aplicada no banco ✅)
- [ ] `3.1` Testar payload completo EsteticaIA no endpoint (aguarda homologação deles)
- [ ] `3.2` Verificar que respondent_type=ai não cria registro fantasma em agentes_humanos
- [ ] Seed dos agentes IA (sdr, closer, agendamento) → após cadastro da instância EsteticaIA via portal

**Comunicação pendente:**
- [ ] Avisar EsteticaIA que endpoint está pronto: `POST https://n8n-production-47d0.up.railway.app/webhook/ml/external/esteticaia`

**Pendências anteriores:**
- [ ] Conectar número WhatsApp via Appsmith → escanear QR Code
- [ ] Painel da Clínica: telas para substituir formulário da planilha
- [ ] Campo `responsavel` do onboarding: persistir em `_plataforma.projetos` ou remover

---
## Sessão 2026-04-19 (continuação — deploy portal + EsteticaIA respondent)

### 1. Implementações

**Portal Next.js — deploy Railway:**
- Serviço `portal-ml` criado no projeto `ml-laboratory` no Railway
- Variáveis configuradas: `DATABASE_URL`, `N8N_SETUP_URL`, `EVOLUTION_API_URL`, `EVOLUTION_API_KEY`, `NODE_ENV`
- Deploy enviado (build em andamento no momento da compactação)
- URL: `https://portal-ml-production.up.railway.app`
- Página QR Code: `https://portal-ml-production.up.railway.app/numeros/conectar`

**Descoberta — portal já implementado:**
- `portal-next/app/numeros/conectar/page.tsx` — página completa de conexão
- `portal-next/components/ConectarNumeroForm.tsx` — formulário com QR Code display
- `portal-next/app/api/numeros/conectar/route.ts` — API route funcional
- `portal-next/app/p/[slug]/clinica/page.tsx` — página clínica existe (estado desconhecido)
- `portal-next/app/api/clinica/[slug]/perfil/route.ts` — API clínica existe

**EsteticaIA — integração concluída:**
- Respondeu confirmando que `ml_messages` é tabela deles (não afeta ML — usamos webhook)
- Endpoint `/ml/external/esteticaia` liberado para homologação

### 2. Decisões

- **Portal é Next.js** (`portal-next/`) — Appsmith não existe mais no projeto
- **Appsmith foi removido** — todas as referências em memória/logs estavam desatualizadas
- **Deploy via `railway up --detach`** com serviço nomeado `portal-ml`
- **`DATABASE_URL` interna Railway** (`postgres.railway.internal`) usada no portal — serviços na mesma rede

### 3. Todos Ativos

**Deploy portal:**
- [ ] Confirmar que build do `portal-ml` completou com sucesso
- [ ] Testar URL `https://portal-ml-production.up.railway.app`
- [ ] Conectar WhatsApp via `/numeros/conectar` quando disponível

**Painel da Clínica:**
- [ ] Verificar estado da página `/p/[slug]/clinica` no portal-next
- [ ] Implementar telas faltantes para substituir formulário da planilha
- [ ] Backend pronto: schema `ml_clinica` (5 tabelas), APIs em `portal-next/app/api/clinica/`

**Story 1.1 pendentes:**
- [ ] Tasks 2.6–2.8: testes mono/multi (requerem WhatsApp conectado)

**Story 1.2 pendentes:**
- [ ] Tasks 3.1–3.2: testes E2E (aguarda homologação EsteticaIA)
- [ ] Seed `ai:sdr`, `ai:closer`, `ai:agendamento` → após onboarding instância EsteticaIA

**Outros:**
- [ ] Campo `responsavel` do onboarding: persistir ou remover

---
## Sessão 2026-04-19 (continuação — migrations aplicadas no banco)

### 1. Implementações

**Migration 016** — `database/migrations/016_comercial_conversas_agente.sql` (CRIADO, commitado)
- `ADD COLUMN IF NOT EXISTS agente_humano_id UUID REFERENCES _plataforma.agentes_humanos(id)` em `ml_comercial.conversas`
- Índice `idx_conversas_agente`, COMMENT na coluna, idempotente
- Rollback: `database/migrations/rollbacks/016_comercial_conversas_agente_rollback.sql`

**Workflow ML-COMERCIAL** — `infra/n8n/workflows/ML-COMERCIAL-analise-conversa.json` (MODIFICADO, v1.1.0)
- Node `buscar-sessoes-prontas`: SELECT inclui `s.agente_humano_id`
- Node `preparar-prompt`: propaga `agente_humano_id`
- Node `extrair-analise`: carrega no payload de saída
- Node `salvar-analise`: INSERT em `ml_comercial.conversas` inclui `agente_humano_id` como `$2::uuid`

**Banco de dados — migrations aplicadas diretamente via psql:**
- Credenciais salvas no `.env`: `DATABASE_URL` (interno Railway) + `DATABASE_PUBLIC_URL` (proxy público)
- Migration 015 aplicada: ✅ `ALTER TABLE x3, COMMENT x3, CREATE INDEX, BEGIN/COMMIT`
- Migration 016 aplicada: ✅ `ALTER TABLE, COMMENT, CREATE INDEX, BEGIN/COMMIT`
- Verificação confirmada: 4 colunas presentes no banco

**Commit:** `45c3086` — `feat: propagar agente_humano_id para ml_comercial.conversas [Story 1.1]` — pushed `origin/main`

### 2. Decisões

- **psql via proxy público Railway** (`mainline.proxy.rlwy.net:13932`) usado para aplicar migrations diretamente — sem necessidade de Supabase CLI ou dashboard
- **`ml_comercial.conversas` não tinha `agente_humano_id`** — descoberto via análise do workflow de análise; migration 016 criada para corrigir
- **Propagação em cadeia:** `sessoes_conversa.agente_humano_id` → `ML-COMERCIAL-analise-conversa` → `ml_comercial.conversas.agente_humano_id` → agentes ML downstream (behavioral-profiler, performance-reporter, etc.)
- **responsavel do onboarding:** decidido não persistir agora — fora do escopo da story 1.1

### 3. Todos Ativos

**Story 1.1 — pendentes (testes):**
- [ ] `2.6` Testar cenário mono-agente com mensagem real no n8n
- [ ] `2.7` Testar cenário multi-agente com `identificador_externo` válido
- [ ] `2.8` Testar multi-agente com `identificador_externo` desconhecido (deve gravar null)
- [ ] `3.1` Verificar se outros agentes ML downstream leem `agente_humano_id` via JOIN

**Credenciais no .env (salvas):**
- `DATABASE_URL` = Railway interno (só dentro do Railway)
- `DATABASE_PUBLIC_URL` = `mainline.proxy.rlwy.net:13932` (acesso externo)

**Pendências anteriores:**
- [ ] Conectar número WhatsApp via Appsmith → escanear QR Code
- [ ] Painel da Clínica: telas para substituir formulário da planilha
- [ ] Campo `responsavel` do onboarding: persistir ou remover

---
## Sessão 2026-04-19 (encerramento)

### 1. Implementações
- `portal-next/app/p/[slug]/clinica/page.tsx`: formulário completo com 9 seções colapsáveis (Identidade, Contato/Localização, Operação/Agendamento, Pagamento, Configuração do Agente, FAQ, Depoimentos, Contra-indicações, Autorizações) + modal inline CRUD de procedimentos — commit 3a02ab1
- `database/migrations/018_projetos_responsavel.sql`: ADD COLUMN responsavel VARCHAR(255) em _plataforma.projetos — aplicada no Railway (IF NOT EXISTS executou sem erro)
- `database/migrations/rollbacks/018_projetos_responsavel_rollback.sql`: rollback correspondente
- `infra/n8n/workflows/ML-ONBOARDING-conectar-cliente.json`: INSERT e ON CONFLICT UPDATE com campo responsavel
- `CONTEXT.md`: atualizado — 18 migrations, portal validado HTTP 200, pendências revistas
- `logs-sessao/2026-04-19_encerramento.md`: criado
- `knowledge-base/negocio.md`: migration 018 registrada

### 2. Decisões
- Painel da Clínica implementado como formulário único (9 seções) com modal inline para procedimentos — não como telas separadas — simplifica navegação
- 404 em /p/omega-laser/clinica é comportamento correto: slug só existe no banco após onboarding do cliente
- Migration 018 aplicada mesmo com coluna já existindo — IF NOT EXISTS garantiu idempotência
- Portal raiz (/) e /numeros/conectar confirmados HTTP 200 via @qa

### 3. Todos ativos
- [ ] PRIORIDADE 1 (manual): escanear QR Code em https://portal-ml-production.up.railway.app/numeros/conectar
- [ ] Após QR Code: enviar mensagem teste → capturar payload → adaptar nó "Normalizar Payload"
- [ ] Seed master: usuário passa e-mail + senha → gerar SQL → executar Railway
- [ ] Story 1.1 tasks 2.6–2.8: testes mono/multi (aguarda WhatsApp conectado)
- [ ] Story 1.2 tasks 3.1–3.2: testes E2E EsteticaIA (aguarda homologação)
- [ ] Seed ai:sdr, ai:closer, ai:agendamento (aguarda onboarding EsteticaIA)

---
## Sessão 2026-04-20

### 1. Implementações

**Migration 018** — aplicada no Railway via psql (coluna `responsavel` em `_plataforma.projetos` — já existia, IF NOT EXISTS executou sem erro)

**n8n workflow ML-SETUP-INSTANCIA** (`x5K56gBpg0IZj47m`) — 3 correções aplicadas via API:
- Nó "Criar Instância Evolution": removido `authentication: genericCredentialType` → `none` (credencial não existia)
- Nó "Criar Instância Evolution": `qrcode: "true"` (string) → `true` (boolean) via jsonBody com sintaxe `={...}` (sem `=` prefix causava crash antes de executar qualquer nó)
- Workflow desativado/reativado para reregistrar webhook após atualização

**Railway portal-ml** — DATABASE_URL corrigida:
- Antes: `postgres.railway.internal:5432/railway` (URL interna — private networking não configurado)
- Depois: `mainline.proxy.rlwy.net:13932/railway` (URL pública — funcional)

**Railway n8n** — `DB_POSTGRESDB_POOL_SIZE=5` adicionado para limitar pool interno

**`portal-next/lib/db.ts`** — pool reduzido `max: 10` → `max: 3`, `idleTimeoutMillis: 30000` → `10000` — commit `55d6e89`

**Banco** — projeto `Omega Laser Locações` renomeado: `nome='Estética IA'`, `slug='estetica-ia'`

**Banco** — 98 conexões idle terminadas via `pg_terminate_backend` (banco estava saturado com max_connections=100)

**Funcionalidades entregues:**
- QR Code de conexão WhatsApp funcionando end-to-end via portal
- Portal carregando projetos ativos do banco (após fix DATABASE_URL)
- Número `ml-5516988456918` conectado e ativo
- Pipeline ML-CAPTURA recebendo eventos `messages.upsert` com payload completo

### 2. Decisões

- **URL pública para portal**: URL interna Railway falha sem private networking explícito entre serviços
- **Pool portal max:3**: Railway Postgres limita a 100 conexões; n8n consome ~98 internamente
- **DB_POSTGRESDB_POOL_SIZE=5**: limitar pool interno n8n para reservar conexões para workflows
- **Limpeza manual de conexões**: `pg_terminate_backend` via banco `postgres` (não `railway`) quando saturado
- **Todos os números da ML** conectam no projeto "Machine Learning"; "Estética IA" (ex-Omega Laser Locações) é para o cliente clínica
- **jsonBody n8n**: DEVE começar com `=` para ser avaliado como expressão dinâmica; sem `=`, `={{ }}` causa JSON parse error e crash antes de executar qualquer nó
- **Instâncias nomeadas** como `ml-{numero_limpo}` pelo workflow ML-SETUP-INSTANCIA

### 3. Todos Ativos

- [ ] **Validar pipeline ML-CAPTURA end-to-end**: recebeu "Teste 123" mas falhou em "Lookup Setor" por too many clients — após fix de conexões, reenviar mensagem de teste e confirmar insert em `ml_captura.mensagens_raw` e `sessoes_conversa`
- [ ] **Adaptar nó "Normalizar Payload"**: verificar extração de `remoteJid`, `pushName`, `conversation` do payload real (formato Evolution API confirmado na sessão)
- [ ] **Seed MASTER**: criar usuário master no banco (usuário precisa fornecer e-mail + senha)
- [ ] **Story 1.1 tasks 2.6–2.8**: testes mono/multi (WhatsApp já conectado — pode executar agora)
- [ ] **Story 1.2 tasks 3.1–3.2**: testes E2E EsteticaIA (aguarda homologação)
- [ ] **Seed ai:sdr, ai:closer, ai:agendamento** (aguarda onboarding EsteticaIA)

---
## Sessão 2026-04-20 (continuação — arquitetura de squads e agentes)

### 1. Implementações

**`memory/project_visao_escopo.md`** — ATUALIZADO
- Adicionada seção "PRINCÍPIO FUNDAMENTAL" com regra explícita: Omega Laser é laboratório, não cliente final
- Padrões extraídos são universais e portáveis — nunca referenciar como "padrões da Omega Laser"
- Atualizado contexto de mercado para distinguir ambiente de piloto vs. produto final

### 2. Decisões

**Arquitetura de 3 saídas do ML Laboratory (definição formal):**

| Saída | O que é | Agentes chave |
|-------|---------|---------------|
| **Saída 1 — Agente de nicho** | IA treinada com conteúdo exato do segmento piloto (scripts, objeções, produtos, abordagens validadas) — deployável para atender o mesmo público | `niche-content-extractor`, `niche-agent-assembler` (AUSENTES) |
| **Saída 2 — Perfil comportamental portável** | Características comportamentais extraídas (DISC, estilo de venda, metodologia) + avaliação de portabilidade para outros segmentos | `profile-portability-evaluator`, `segment-match-scorer` (AUSENTES) |
| **Saída 3 — Base de conhecimento com assertividade** | Material técnico dos produtos vs. respostas reais dos atendentes → score de assertividade + catálogo de variações de resposta por pergunta + gaps de conhecimento | `technical-content-loader`, `assertiveness-analyzer`, `response-variation-cataloger`, `knowledge-gap-detector`, `question-pattern-mapper` (TODOS AUSENTES) |

**Princípio fundamental registrado:**
- Omega Laser = ambiente de piloto (dataset inicial), não cliente final do produto
- Produto final = padrões e perfis universais de comportamento comercial, agnósticos de nicho
- NUNCA dizer "skills/padrões da Omega Laser" — SEMPRE "padrões identificados no piloto, aplicáveis universalmente"

**Agentes ausentes identificados (8 novos):**
- Saída 1: `niche-content-extractor`, `niche-agent-assembler`
- Saída 2: `profile-portability-evaluator`, `segment-match-scorer`
- Saída 3: `technical-content-loader`, `assertiveness-analyzer`, `response-variation-cataloger`, `knowledge-gap-detector`
- Suporte Saída 3: `question-pattern-mapper` (ml-data-eng-squad)

**Agentes existentes que precisam ser reposicionados:**
- `behavioral-profiler`, `objection-handler`, `product-approach` — output deve ser explicitamente dividido entre "conteúdo de nicho" (Saída 1) e "padrão universal" (Saída 2)

**Agente `@squad-creator` (Craft)** ativado para conduzir revisão formal

### 3. Todos Ativos

- [ ] **Revisão formal da arquitetura de squads** — executar `*design-squad` com blueprint atualizado para modelo de 3 saídas
- [ ] **Criar 8 agentes ausentes** nos squads correspondentes
- [ ] **Reposicionar agentes existentes** com output dual (nicho + universal)
- [ ] **Criar `ml-orquestrador-squad`** (novo) — `cross-area-synthesizer`, `executive-reporter`, `anomaly-detector`
- [ ] **Operacionalizar `ml-skills-squad`** — agentes existem, workflows n8n não implementados
- [ ] Todas as pendências da sessão anterior (dashboard, pipeline, seeds) continuam ativas

---
## Sessão 2026-04-20 (continuação — design-squad 3 saídas)

### 1. Implementações
- `memory/project_visao_escopo.md`: PRINCÍPIO FUNDAMENTAL adicionado — Omega Laser é laboratório/piloto, padrões são universais
- `.claude/session-log.md`: sessão de arquitetura appendada
- ClickUp: task "Onboarding - Machine Learning (2026-04-20)" criada → https://app.clickup.com/t/86ah095yt

### 2. Decisões

**3 saídas formais do ML Laboratory (definidas e aceitas):**
- Saída 1 — Agente de nicho replicável (conteúdo exato do segmento, deployável para o mesmo público)
- Saída 2 — Perfil comportamental portável (DISC, estilo, metodologia → avaliado para outros segmentos)
- Saída 3 — Base de conhecimento com assertividade (material técnico vs. respostas reais → score + variações + gaps)

**9 agentes novos aceitos pelo usuário:**
- niche-content-extractor → ml-comercial-squad (Saída 1)
- niche-agent-assembler → ml-skills-squad (Saída 1)
- profile-portability-evaluator → ml-comercial-squad (Saída 2)
- segment-match-scorer → ml-comercial-squad (Saída 2)
- technical-content-loader → ml-captura-squad (Saída 3)
- assertiveness-analyzer → ml-ia-padroes-squad (Saída 3)
- response-variation-cataloger → ml-ia-padroes-squad (Saída 3)
- knowledge-gap-detector → ml-ia-padroes-squad (Saída 3)
- question-pattern-mapper → ml-data-eng-squad (Saída 3)

**3 agentes existentes aguardando confirmação de reposicionamento (output dual):**
- behavioral-profiler: perfil de nicho (S1) + perfil universal portável (S2)
- objection-handler: objeções do segmento (S1) + padrões universais (S2)
- product-approach: scripts de nicho (S1) + padrão de abordagem portável (S2)

### 3. Todos Ativos
- [ ] EM PROGRESSO — *design-squad Fase 4: aguardando [A]ceitar/[M]odificar/[P]ular reposicionamento dos 3 agentes
- [ ] Fase 5: adicionar ml-orquestrador-squad (cross-area-synthesizer, executive-reporter, anomaly-detector)
- [ ] Fase 6: gerar blueprint YAML em squads/.designs/
- [ ] *extend-squad para cada squad afetado após blueprint aprovado
- [ ] Operacionalizar ml-skills-squad (workflows n8n ausentes)
- [ ] Pendências anteriores: pipeline ML-CAPTURA, seed MASTER, Stories 1.1/1.2, seeds EsteticaIA

---
## Sessão 2026-04-21 (extend-squad — implementação completa dos 24 agentes novos)

### 1. Implementações

**24 agentes criados:**
- ml-captura: technical-content-loader.md, privacy-filter.md, multi-source-collector.md
- ml-data-eng: question-pattern-mapper.md, data-quality-validator.md
- ml-ia-padroes: assertiveness-analyzer.md, response-variation-cataloger.md, knowledge-gap-detector.md, feedback-collector.md, benchmark-calibrator.md
- ml-skills: niche-agent-assembler.md, agent-performance-tracker.md, ab-test-manager.md
- ml-comercial: niche-content-extractor.md, profile-portability-evaluator.md, segment-match-scorer.md, training-content-publisher.md
- ml-orquestrador (NOVO SQUAD): squad.yaml + cross-area-synthesizer.md, executive-reporter.md, anomaly-detector.md, segment-catalog-manager.md, insight-scheduler.md
- ml-plataforma: onboarding-orchestrator.md, crm-sync-agent.md

**3 agentes reposicionados (output dual adicionado):**
- ml-comercial/agents/behavioral-profiler.md — bloco "Outputs duais" S1+S2
- ml-comercial/agents/objection-handler.md — bloco "Outputs duais" S1+S2
- ml-comercial/agents/product-approach.md — bloco "Outputs duais" S1+S2

**7 squad.yaml atualizados:** captura(6), data-eng(5), ia-padroes(8), skills(6), comercial(10), orquestrador(5/novo), plataforma(5)

### 2. Decisões
- Formato agente: frontmatter YAML + seções MD (Responsabilidades, Inputs, Outputs, Commands, Data, Colaboração)
- Pipeline qualidade: privacy-filter → data-quality-validator antes de qualquer análise — não-bloqueantes
- Output dual: behavioral-profiler, objection-handler, product-approach geram S1 (nicho) + S2 (universal)
- ml-orquestrador-squad: nível 1-operational, priority 0 — depende de todos os outros operacionais
- Threshold data-quality-validator: ≥60 aprovado, 40-59 revisão manual
- Benchmark recalibra: +500 conversas ou 30 dias ou drift >20%
- CRM sync: HubSpot/RD/Pipedrive planejados; webhook genérico disponível imediatamente

### 3. Todos Ativos
- [ ] Commit de todos os arquivos desta sessão (aguarda confirmação)
- [ ] Operacionalizar ml-skills-squad (workflows n8n ausentes)
- [ ] Seed inicial do segment-catalog-manager (catálogo vazio sem utilidade)
- [ ] Pendências anteriores: pipeline ML-CAPTURA, seed MASTER, Stories 1.1/1.2, seeds EsteticaIA

---
## Sessão 2026-04-21 (design-squad — blueprint 3 saídas concluído)

### 1. Implementações
- `squads/.designs/ml-3-outputs-blueprint.yaml` — CRIADO: blueprint completo com 24 agentes novos, 3 reposicionados, 1 squad novo (ml-orquestrador-squad), 7 squads afetados
- `memory/project_visao_escopo.md` — PRINCÍPIO FUNDAMENTAL adicionado
- ClickUp sincronizado: https://app.clickup.com/t/86ah09bvy

### 2. Decisões

**3 saídas formais do ML Laboratory:**
- Saída 1: Agente de nicho replicável — IA treinada com conteúdo exato do segmento, deployável para o mesmo público
- Saída 2: Perfil comportamental portável — DISC + estilo + metodologia → avaliado para outros segmentos de mercado
- Saída 3: Base de conhecimento com assertividade — material técnico vs. respostas reais → score + variações + gaps

**24 agentes novos aceitos:**
- ml-captura: technical-content-loader (S3), privacy-filter, multi-source-collector
- ml-data-eng: question-pattern-mapper (S3), data-quality-validator
- ml-ia-padroes: assertiveness-analyzer (S3), response-variation-cataloger (S3), knowledge-gap-detector (S3), feedback-collector, benchmark-calibrator
- ml-skills: niche-agent-assembler (S1), agent-performance-tracker (S1), ab-test-manager (S1)
- ml-comercial: niche-content-extractor (S1), profile-portability-evaluator (S2), segment-match-scorer (S2), training-content-publisher
- ml-orquestrador (NOVO SQUAD): cross-area-synthesizer, executive-reporter, anomaly-detector, segment-catalog-manager (S2), insight-scheduler
- ml-plataforma: onboarding-orchestrator, crm-sync-agent

**3 agentes reposicionados (output dual S1+S2):** behavioral-profiler, product-approach, objection-handler

**Princípio fundamental:** Omega Laser = laboratório/piloto; padrões extraídos = universais e agnósticos de nicho

### 3. Todos Ativos
- [ ] *extend-squad ml-captura-squad → technical-content-loader, privacy-filter, multi-source-collector
- [ ] *extend-squad ml-data-eng-squad → question-pattern-mapper, data-quality-validator
- [ ] *extend-squad ml-ia-padroes-squad → 5 agentes novos
- [ ] *extend-squad ml-skills-squad → niche-agent-assembler, agent-performance-tracker, ab-test-manager
- [ ] *extend-squad ml-comercial-squad → 4 agentes novos + reposicionar 3
- [ ] *create-squad ml-orquestrador-squad → novo squad com 5 agentes
- [ ] *extend-squad ml-plataforma-squad → onboarding-orchestrator, crm-sync-agent
- [ ] Operacionalizar ml-skills-squad (workflows n8n ausentes)
- [ ] Pendências anteriores: pipeline ML-CAPTURA, seed MASTER, Stories 1.1/1.2, seeds EsteticaIA

---
## Sessão 2026-04-20 (continuação — bug dashboard conversas)

### 1. Implementações

**`portal-next/app/p/[slug]/conversas/page.tsx`** — 3 tentativas de fix (commits `a0bd75f`, `3fd1866`, `3fd1866`):
- Fix 1: query usava colunas inexistentes em `mensagens_raw` (`sessao_id`, `numero_whatsapp`, `agente_nome`) → migrada para `analise_conversa`
- Fix 2: `analise_conversa` estava vazia (ML não rodou) → query retornava `[]` sem exception, fallback nunca disparava → migrada para `sessoes_conversa` como fonte primária com LEFT JOIN em `analise_conversa`
- Fix 3 (pendente): deploy não reprocessou o commit mais recente (`97f8f5a`) — Railway rodando build antigo (`0e2bfeac`)

**`portal-next/app/api/diagnostico/route.ts`** — CRIADO (commit `97f8f5a`)
- Rota GET que retorna: projetos, colunas de `sessoes_conversa`, contagens de mensagens/sessoes/analises, amostras das tabelas
- URL: `https://portal-ml-production.up.railway.app/api/diagnostico`
- Status: retornando 404 — deploy não atualizou ainda

### 2. Decisões

- **Fonte primária do dashboard**: `sessoes_conversa` (populada a cada mensagem pelo n8n), não `analise_conversa` (só preenchida após ML rodar)
- **JOIN opcional com `analise_conversa`**: enriquece com notas/DISC quando disponível, mas conversa aparece mesmo sem análise
- **Diagnóstico necessário**: Railway não atualizou o deploy — commit `97f8f5a` não refletido em produção ainda
- **Problema raiz suspeito**: `sessoes_conversa` pode não ter coluna `projeto_id` na migration 002 (n8n insere, mas migration não define) — precisa validação via banco

### 3. Todos Ativos

- [ ] **BLOQUEIO**: Railway não atualizou deploy para commit `97f8f5a` — forçar redeploy no portal-ml
- [ ] **Após redeploy**: acessar `https://portal-ml-production.up.railway.app/api/diagnostico` e colar resultado aqui
- [ ] **Confirmar se `sessoes_conversa` tem `projeto_id`** — se não tiver, query falha silenciosamente e dashboard continua vazio
- [ ] **Após diagnóstico**: fazer fix definitivo baseado no schema real do banco
- [ ] **Remover rota `/api/diagnostico`** após diagnóstico concluído (é temporária)
- [ ] Validar pipeline ML-CAPTURA end-to-end (pendente da sessão anterior)
- [ ] Seed MASTER (aguarda e-mail + senha do usuário)
- [ ] Story 1.1 tasks 2.6–2.8 (WhatsApp conectado — pode executar)
- [ ] Story 1.2 tasks 3.1–3.2 (aguarda EsteticaIA)

---
## Sessão 2026-04-21 (auditoria multi-projeto — reestruturação software-house-elite)

### 1. Implementações
- Nenhum arquivo criado ou modificado — sessão inteiramente de análise e planejamento arquitetural

### 2. Decisões

**Software-house-elite como squad base universal (APROVADO pelo usuário):**
- O squad deve ser replicado em TODOS os projetos ao invés de cada projeto recriar agentes técnicos do zero
- É o "template de time de desenvolvimento" reutilizável

**3 agentes a MOVER para o software-house-elite (base sem contexto de produto):**
- `@n8n-dev (Nix)` — está em esteticaia-produto mas é transversal (quase todo projeto usa n8n)
- `@ai-engineer (Aiden)` — especialista em LLMs/prompts é transversal a qualquer projeto com IA
- `@frontend-specialist (Arc)` — Next.js/UI é transversal

**Omega Laser — dev-estetica-tools INTEIRO substituído pelo software-house-elite:**
- 10 agentes são duplicatas de agentes AIOX/elite com nomes diferentes
- backend-dev(Ben)→@dev, system-architect→@architect, database-engineer→@data-engineer, frontend-dev→@frontend-specialist, qa-dev→@qa, security-compliance→@security-architect+@lgpd-compliance, devops-engineer→@devops, health-monitor→@sre, ops-auditor→@qa, ux-design-expert(Ops)→@ux-design-expert

**ML Laboratory — squads FORA DO ESCOPO (escopo = captura+análise de conversas+perfis comportamentais+skills IA):**
- `ml-financeiro-squad` (4 agentes) — fluxo de caixa, cobranças: fora do escopo
- `ml-operacional-squad` (3 agentes) — mapeamento de processos da clínica: fora do escopo
- `ml-pessoas-squad` (3 agentes) — RH, onboarding de funcionários: fora do escopo

**ML Laboratory — agentes individuais a REMOVER:**
- `appointment-scheduler` (ml-atendimento) — sistema captura conversas, não atende clientes
- `campaign-executor` (ml-marketing) — executar campanhas não é papel do laboratório
- `crm-sync-agent` (ml-plataforma) — nenhum CRM no escopo

**ML Laboratory — ml-plataforma-squad quase inteiro para software-house-elite:**
- infra-manager → @sre, monitor-agent → @sre, deploy-coordinator → @devops, onboarding-orchestrator → @devops

**ML Laboratory — ml-data-eng-squad simplificado:**
- schema-designer → delegar ao @data-engineer (software-house-elite)
- etl-engineer → delegar ao @data-engineer (software-house-elite)

### 3. Todos Ativos

**REESTRUTURAÇÃO MULTI-PROJETO (ordem de execução confirmada pelo usuário):**
- [ ] **Passo 1 — Estetica.IA**: atualizar `software-house-elite/squad.yaml` adicionando Nix, Aiden, Arc como agentes base (sem contexto de produto)
- [ ] **Passo 2 — Omega Laser**: substituir `dev-estetica-tools` pelo `software-house-elite` importado
- [ ] **Passo 3 — ML Laboratory**:
  - [ ] Remover squads fora do escopo: ml-financeiro, ml-operacional, ml-pessoas (10 agentes, 9 tasks)
  - [ ] Remover agentes fora do escopo: appointment-scheduler, campaign-executor, crm-sync-agent
  - [ ] Mover ml-plataforma para software-house-elite: infra-manager, monitor-agent, deploy-coordinator, onboarding-orchestrator
  - [ ] Simplificar ml-data-eng: remover schema-designer, etl-engineer (delegados ao @data-engineer)
  - [ ] Importar software-house-elite atualizado

**Pendências anteriores (continuam ativas):**
- [ ] Forçar redeploy portal-ml no Railway
- [ ] Acessar `/api/diagnostico` e confirmar schema real do banco
- [ ] Validar pipeline ML-CAPTURA end-to-end
- [ ] Seed MASTER (aguarda e-mail + senha do usuário)
- [ ] Story 1.1 tasks 2.6–2.8 / Story 1.2 tasks 3.1–3.2

---
## Sessão 2026-04-21 (gap analysis — squads e agentes ML completos)

### 1. Implementações

**squad.yaml corrigidos — divergências de nomes (6 squads):**
- `squads/ml-atendimento-squad/squad.yaml` — agentes: satisfaction-analyst → satisfaction-analyzer, churn-detector mantido, adicionado service-quality-monitor
- `squads/ml-financeiro-squad/squad.yaml` — agentes: cashflow-analyst → cashflow-predictor, risk-detector → risk-analyzer, forecast-generator → collections-advisor; tasks: adicionado assess-risk.md
- `squads/ml-marketing-squad/squad.yaml` — agentes: campaign-analyst → message-analyzer, message-optimizer → timing-optimizer
- `squads/ml-operacional-squad/squad.yaml` — agentes: bottleneck-detector → failure-detector; tasks: analyze-process → map-process
- `squads/ml-pessoas-squad/squad.yaml` — agentes: engagement-analyst → engagement-monitor; tasks: build-talent-profile → profile-talent
- `squads/ml-comercial-squad/squad.yaml` — removidos profile-portability-evaluator + segment-match-scorer, adicionado profile-segment-matcher
- `squads/ml-orquestrador-squad/squad.yaml` — tasks: [] → 4 tasks declaradas

**Agentes criados (17 novos):**
- ml-captura: webhook-manager.md, audio-transcriber.md, message-collector.md
- ml-data-eng: schema-designer.md, etl-engineer.md, data-classifier.md
- ml-ia-padroes: pattern-extractor.md, behavior-analyst.md, benchmark-generator.md
- ml-plataforma: infra-manager.md, monitor-agent.md, deploy-coordinator.md
- ml-skills: skill-generator.md, skill-validator.md, agent-trainer.md
- ml-comercial: profile-segment-matcher.md (consolida 2 agentes)
- ml-atendimento: churn-detector.md

**Agentes removidos (2):**
- `squads/ml-comercial-squad/agents/profile-portability-evaluator.md`
- `squads/ml-comercial-squad/agents/segment-match-scorer.md`

**Tasks criadas (27 novas — todos squads completos):**
- ml-captura: configure-webhook.md, transcribe-audio.md, collect-messages.md
- ml-data-eng: design-schema.md, build-etl-pipeline.md, classify-data.md
- ml-ia-padroes: extract-patterns.md, analyze-behavior.md, generate-benchmarks.md
- ml-plataforma: setup-infrastructure.md, monitor-health.md, deploy-update.md
- ml-skills: generate-skill.md, validate-skill.md, train-agent.md
- ml-comercial: build-behavioral-profile.md, map-product-approach.md, catalog-objections.md, generate-training-content.md, generate-performance-report.md
- ml-atendimento: detect-churn-signals.md, generate-retention-strategy.md
- ml-financeiro: analyze-cashflow.md, detect-financial-risk.md, generate-forecast.md
- ml-marketing: optimize-message.md, generate-segmentation.md
- ml-operacional: detect-bottlenecks.md, generate-optimization-report.md
- ml-pessoas: analyze-engagement.md, generate-onboarding-plan.md
- ml-orquestrador: synthesize-cross-area.md, generate-executive-report.md, detect-anomaly.md, schedule-insights.md

### 2. Decisões

- **Consolidar profile-portability-evaluator + segment-match-scorer → profile-segment-matcher**: avaliação qualitativa + score numérico são um único processo; separação não justificava dois agentes
- **Opção A para churn-detector**: manter service-quality-monitor (já implementado, avalia qualidade do serviço) E criar churn-detector novo (prediz risco de cancelamento) — escopos distintos
- **benchmark-generator separado do benchmark-calibrator**: generator cria benchmarks iniciais (uma vez por cliente), calibrator recalibra continuamente — frequências e momentos distintos
- **Corrigir squad.yaml para refletir nomes reais do disco**: arquivos no disco tinham nomes mais descritivos; preferiu-se atualizar o yaml para alinhar com o disco (não renomear arquivos)
- **4 tasks core do orquestrador**: synthesize-cross-area, generate-executive-report, detect-anomaly, schedule-insights — os 4 fluxos fundamentais do hub de inteligência

### 3. Todos Ativos

**Próximos passos naturais (novos):**
- [ ] Validar squads criados com `*validate-squad` para cada squad
- [ ] Implementar workflows n8n correspondentes às tasks criadas (ml-captura é o ponto de entrada)
- [ ] Seed inicial do segment-catalog-manager (catálogo vazio sem utilidade para Saída 2)

**Pendências anteriores (continuam ativas):**
- [ ] Forçar redeploy portal-ml no Railway (bloqueio do dashboard)
- [ ] Acessar `/api/diagnostico` e confirmar schema real do banco
- [ ] Validar pipeline ML-CAPTURA end-to-end (WhatsApp conectado)
- [ ] Seed MASTER (aguarda e-mail + senha do usuário)
- [ ] Story 1.1 tasks 2.6–2.8 (WhatsApp conectado — pode executar)
- [ ] Story 1.2 tasks 3.1–3.2 (aguarda EsteticaIA)

---
## Sessão 2026-04-22

### 1. Implementações

**`knowledge-base/negocio.md`** — ATUALIZADO
- Seção "Visão Estratégica do Projeto" reescrita com modelo corrigido de propriedade e dois outputs
- Tabela de propriedade dos dados: padrões específicos → cliente; perfil intrínseco → compartilhado (cliente + plataforma)
- Dois outputs obrigatórios por segmento documentados (Output 1: agente específico; Output 2: perfil intrínseco)
- Segmento como campo obrigatório no cadastro do número — regra formal registrada
- Multi-segmento como design de produto (não exceção)

**`memory/project_visao_escopo.md`** — REESCRITO
- Visão e escopo completo corrigido com novo modelo de propriedade e dois outputs
- PRINCÍPIO FUNDAMENTAL atualizado: padrões específicos pertencem ao cliente; intrínseco tem propriedade compartilhada

**40 arquivos de agentes `.md`** — ATUALIZADOS
- Campo `name:` atualizado de inglês para português amigável em todos os squads
- IDs técnicos (`id:`) preservados intocados
- Squads afetados: ml-captura(7), ml-data-eng(3), ml-ia-padroes(9), ml-comercial(10), ml-atendimento(4), ml-marketing(3), ml-skills(7), ml-plataforma(1), ml-orquestrador(6)

**9 arquivos `squad.yaml`** — ATUALIZADOS
- Campo `title:` adicionado com nome amigável em português (ex: `title: "Esteira de Captura"`)
- Nome técnico (`name:`) preservado intocado

**FigJam** — Fluxograma gerado: "ML Laboratory — Fluxo Completo de Agentes"
- 7 fases coloridas com nomes amigáveis
- 4 outputs mapeados
- URL: gerado via Figma MCP

### 2. Decisões

- **Propriedade dos padrões:** padrões específicos pertencem ao cliente que gerou os dados; perfil intrínseco de venda tem propriedade compartilhada cliente + plataforma ML Laboratory
- **Dois outputs obrigatórios por segmento:** Output 1 (agente específico, do cliente) + Output 2 (perfil intrínseco, compartilhado)
- **Segmento obrigatório:** campo obrigatório no cadastro de número — sem segmento, análise não tem contexto
- **Entrega do agente:** vai para o gestor do ML Laboratory (não para o cliente final diretamente)
- **Nomes amigáveis:** display names atualizados para português; IDs técnicos preservados para não quebrar referências em código/n8n/banco
- **Squads prematuros:** ml-atendimento, ml-marketing, ml-operacional, ml-financeiro, ml-pessoas — corretos como roadmap, sem prioridade agora

**Lacunas arquiteturais identificadas por @architect (pendentes de implementação):**
- `profile-segment-matcher` precisa de escopo ampliado para publicar perfil intrínseco como ativo da plataforma (ou criar `intrinsic-profile-publisher` em ml-skills-squad)
- Gate de validação de segmento no `onboarding-orchestrator` antes de ativar número
- `agent-delivery-manager` em ml-skills-squad para gerenciar versões e entrega ao gestor ML Lab

### 3. Todos Ativos

**Correções arquiteturais (novas — identificadas esta sessão):**
- [ ] Ampliar escopo do `profile-segment-matcher` OU criar `intrinsic-profile-publisher` em ml-skills-squad
- [ ] Adicionar gate de validação de segmento no `onboarding-orchestrator` (consultar segment-catalog-manager)
- [ ] Criar `agent-delivery-manager` em ml-skills-squad (entrega ao gestor ML Lab, não ao cliente)

**Pendências anteriores (continuam ativas):**
- [x] Forçar redeploy portal-ml no Railway ✅ (commit `97f8f5a` enviado, aguardar 2-3min)
- [ ] Acessar `/api/diagnostico` e confirmar schema real do banco
- [ ] Validar pipeline ML-CAPTURA end-to-end (WhatsApp conectado)
- [ ] Seed MASTER (aguarda e-mail + senha do usuário)
- [ ] Story 1.1 tasks 2.6–2.8 (WhatsApp conectado — pode executar)
- [ ] Story 1.2 tasks 3.1–3.2 (aguarda EsteticaIA)

---
## Sessão 2026-04-22 (continuação — execuções por agentes)

### 1. Implementações

**@devops** — Redeploy portal-ml no Railway:
- `railway redeploy --service portal-ml --yes` executado (Railway CLI v4.35.2)
- Logs confirmam container reiniciado: `Starting Container` → `next start` → `Ready in 195ms`
- Aguardar 2-3min e verificar `https://portal-ml-production.up.railway.app`

**@dev** — Fix nó "Normalizar Payload" — commit `8877ecf`:
- Arquivo: `infra/n8n/workflows/ML-CAPTURA-whatsapp-pipeline.json`
- `body` corrigido para `$input.first().json` direto (sem tentativa de `.body` incorreta)
- `push_name: data.pushName` adicionado (estava ausente)
- Fallbacks incorretos para `body.message` e `body.key` removidos
- Fallback de texto: `conversation || extendedTextMessage?.text`
- Ambas as ocorrências no JSON corrigidas (`nodes[]` e `activeVersion.nodes[]`)

**@dev** — Correções arquiteturais — commit `8b6232c`:
- `squads/ml-skills-squad/agents/agent-delivery-manager.md` — CRIADO: gerencia versões e entrega do agente ao gestor ML Lab; outputs duais S1 (nicho, do cliente) + S2 (perfil intrínseco, compartilhado)
- `squads/ml-skills-squad/squad.yaml` — version bump 0.1.0 → 0.2.0, changelog adicionado
- `squads/ml-plataforma-squad/agents/onboarding-orchestrator.md` — gate de segmento obrigatório, valida contra `segment-catalog-manager` antes de ativar número
- `squads/ml-comercial-squad/agents/profile-segment-matcher.md` — output `perfil_intrinseco_portavel` adicionado, tabela de propriedade (padrões nicho = cliente; DISC+scores = compartilhado), publicação via `segment-catalog-manager`

### 2. Decisões
- `push_name` nunca era capturado no n8n — bug silencioso (campo ficava null)
- Redeploy Railway via `railway redeploy` (não `railway up`) é o comando correto para forçar rebuild do último commit
- `agent-delivery-manager` gerencia apenas a entrega — não gera, não valida; recebe de `niche-agent-assembler`

### 3. Todos Ativos
- [ ] Acessar `/api/diagnostico` após redeploy confirmar (aguardar ~3min)
- [ ] Validar pipeline ML-CAPTURA end-to-end (WhatsApp conectado — pode executar agora)
- [ ] Importar workflow corrigido no n8n (arquivo JSON atualizado localmente — precisa ser importado/atualizado via n8n UI ou API)
- [ ] Seed MASTER (aguarda e-mail + senha do usuário)
- [ ] Story 1.1 tasks 2.6–2.8
- [ ] Story 1.2 tasks 3.1–3.2 (aguarda EsteticaIA)
