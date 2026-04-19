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
- **respondent_id padrão:** `{tipo}:{slug}` — ex: `ai:sofia-sdr`, `human:maria`, `specialist:dr-carlos`
- **session_id format EsteticaIA:** `{instanceName}-{remoteJid}-{YYYYMMDD}`
- **Seed dos agentes IA bloqueado:** `agentes_humanos.numero_id` é NOT NULL — seed de `ai:sofia-sdr`, `ai:sofia-closer`, `ai:sofia-agendador` só pode ser feito após onboarding da instância EsteticaIA no portal
- **@architect (Aria)** foi o agente responsável pela análise da proposta EsteticaIA e decisões de integração

### 3. Todos Ativos

**Story 1.2 — pendentes:**
- [ ] `1.8` Marcar migration 017 como aplicada na story (já aplicada no banco ✅)
- [ ] `3.1` Testar payload completo EsteticaIA no endpoint (aguarda homologação deles)
- [ ] `3.2` Verificar que respondent_type=ai não cria registro fantasma em agentes_humanos
- [ ] Seed dos agentes IA (sofia-sdr, sofia-closer, sofia-agendador) → após cadastro da instância EsteticaIA via portal

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
- [ ] Seed `ai:sofia-sdr`, `ai:sofia-closer`, `ai:sofia-agendador` → após onboarding instância EsteticaIA

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
