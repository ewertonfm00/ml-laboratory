# Session Log — AIOX Machine Learning Laboratory

---
## Sessão 2026-04-29 (parte 9) — Falha silenciosa email/WhatsApp + investigação Opção B

### 1. Implementações

**Bug fix — falha silenciosa email/WhatsApp:**
- `portal-next/app/api/admin/parceiros/route.ts`: `enviarEmail` e `enviarWhatsApp` agora retornam `{ ok, error? }`. Verifica `result.error` do Resend (caso onde SDK não lança exceção). Validação de envs ausentes virou parte do retorno. Texto do email atualizado para o novo fluxo (sem credenciais Evolution).
- `portal-next/app/admin/parceiros/novo/page.tsx`: tipo do `result` estendido com `email_status`, `email_error`, `whatsapp_status`, `whatsapp_error`. Tela de sucesso renderiza ✅/⚠️ por canal e exibe mensagem de erro específica quando algo falha.
- Build local: `npm run build` em `portal-next/` passou limpo.

**Commit:** `55c2eb8 fix(onboarding): reporta status real de email/whatsapp na criação de parceiro` (push → `42504a2..55c2eb8 main`).

**Arquivos não commitados (deliberadamente fora do escopo):** `scripts/clickup_send.py` (untracked, sem decisão), `tmp/` (transitório, adicionado ao `.gitignore`).

### 2. Investigação Opção B — workflow `/webhook/ml/external/:slug`

Decisão do usuário: ir direto para o teste E2E completo, o que exige criar o workflow externo no n8n.

**Coletado para briefing do subagente:**
- Tabela alvo: `ml_captura.mensagens_raw` (não `_plataforma.mensagens_raw`)
- 19 colunas — `message_id` UNIQUE = dedupe nativo, `projeto_id` FK, `direction` e `respondent_type` com CHECK constraints
- Padrão de upsert em `sessoes_conversa`: `ON CONFLICT (projeto_id, area, remote_jid) DO UPDATE`
- Workflow ML-CAPTURA atual exportado em `tmp/ml-captura-current.json` (29KB, 19 nodes)
- Credencial Postgres reusável no n8n: `FO9GgjXtERNuCglX` ("ML Postgres")
- Parceiros existentes (3): Ewerton Locações (teste, slug `ewerton-locacoes`), Estética IA (`estetica-ia`), Machine Learning (`machine-learning`)

### 3. Decisões

- **fonte = 'external_partner'** ✅ APROVADO. Reasoning: empresa já é `projeto_id`, atendente é `agente_humano_id`/`respondent_type`, `fonte` é canal técnico de entrada. Distinguir do `'whatsapp'` direto facilita debug e não quebra queries existentes.
- **Mapeamento completo payload → mensagens_raw definido** (documentado em `knowledge-base/negocio.md`).
- **Validação Bearer**: igualdade exata vs `_plataforma.projetos.webhook_api_key` (sem hash, fase 1).
- **Códigos de resposta**: 200 sucesso, 400 payload, 401 Bearer, 404 slug.
- **Endpoint único por parceiro confirmado** (não compartilhado): permite validação cruzada slug↔key, isolamento, auditoria.

### 4. Pendente para próxima sessão

**3 decisões aguardando o usuário (interrompido por `/fechar-sessao`):**
- Q2: `agente_humano_id` NULL no MVP (recomendado A) vs auto-criar entradas em `_plataforma.agentes_humanos` (B)
- Q3: áudio salvar URL e transcrever em batch depois (recomendado A) vs replicar nodes Groq Whisper inline (B)
- Q4: duplicata como 200 idempotente puro (A) vs 200 com `duplicate: true` flag (recomendado B)

**Após confirmação:**
- Disparar subagente com briefing para construir `ML-CAPTURA-EXTERNAL.json`
- Importar via `POST /api/v1/workflows` na n8n API + ativar
- Teste E2E com curl simulando parceiro (slug + Bearer válido + payload acordado)
- Commit do workflow JSON em `docs/workflows/`

---
## Sessão 2026-04-29 — Onboarding reformulado + WhatsApp pelo número pessoal

### 1. Implementações

**Arquivos criados:**
- `database/migrations/025_projetos_webhook_api_key.sql` — adiciona `webhook_api_key VARCHAR(255)` em `_plataforma.projetos` (aplicada no banco Railway)
- `scripts/clickup_send.py` — script auxiliar para sync de onboarding com ClickUp

**Arquivos modificados:**
- `portal-next/app/api/onboarding/[token]/route.ts` — expõe `slug` no GET para construir endpoint na página
- `portal-next/app/api/onboarding/conectar/route.ts` — reescrita: salva `api_key` em `projetos.webhook_api_key`, marca `onboarding_status = 'conectado'`, removidas chamadas Evolution
- `portal-next/app/onboarding/[token]/page.tsx` — reescrita completa: layout 2 passos (mostra endpoint + campo api_key), botão "Ativar integração"
- `portal-next/app/api/admin/parceiros/route.ts` — WhatsApp de onboarding sai por instância configurável via env (`ONBOARDING_EVOLUTION_URL/API_KEY/INSTANCE_NAME`)

**Configurações Railway (portal-ml service):**
- `ONBOARDING_EVOLUTION_URL` = `https://evolution-api-estetica-production.up.railway.app`
- `ONBOARDING_EVOLUTION_API_KEY` = `estetica-evo-key-2026`
- `ONBOARDING_INSTANCE_NAME` = `ewerton-estetica-oel6` (número pessoal `5516991280362`)

**Commits:**
- `1b4d054` — feat(onboarding): reformula fluxo para integração via webhook de saída do parceiro
- `42504a2` — feat(onboarding): envia WhatsApp de onboarding pela Evolution do EsteticaIA

### 2. Decisões

- **Modelo de integração genérico (plataforma aberta)**: sistema do parceiro deve gerar credenciais (`webhook_url` + `api_key`) por integração — não específico para ML. Qualquer sistema externo se conecta usando essas credenciais. Modelo padrão de mercado (Stripe, HubSpot, RD Station). Motivo: parceiro vai usar o sistema dele com múltiplas empresas, e cada empresa pode integrar com sistemas diferentes.
- **Granularidade dos eventos: por setor**: campo `setor_id` opcional na tabela de integrações do parceiro — `null = todos os setores`, UUID = setor específico. Motivo: ML quer todos, mas CRM de vendas pode querer só Comercial.
- **Slug por setor (Opção A)**: parceiro confirmou multi-tenant — cada setor pode ter integração diferente. Variável global descartada.
- **WhatsApp de onboarding sai pelo número pessoal**: instância `ewerton-estetica-oel6` da Evolution do EsteticaIA. Motivo: separar comunicação institucional (parceiros) do número operacional do ML.
- **Página de onboarding em 2 passos**: passo 1 mostra endpoint para parceiro copiar, passo 2 recebe a API Key gerada pelo sistema deles. Sem credenciais Evolution (descartado).

### 3. Todos ativos

- [ ] Criar endpoint `/webhook/ml/external/{slug}` no n8n — parceiro está construindo o outbound webhook agora
- [ ] Workflow provisório: pull periódico da API REST do parceiro — aguarda documentação/endpoint da API deles
- [ ] Corrigir falha silenciosa no envio de e-mail (`portal-next/app/api/admin/parceiros/route.ts` — função `enviarEmail`, catch só loga, não retorna erro). Resend API Key disponível em credentials.md.
- [ ] Testar nova página onboarding em produção (gerar link novo de cadastro de parceiro de teste)
- [ ] Decisão pendente: Cenário B multi-agente (manual vs round-robin) — Stories 1.1 tasks 2.7-2.8 bloqueadas
- [ ] Conectar número WhatsApp ao ML Laboratory via QR Code (PRIORIDADE 3)

---
## Sessão 2026-04-29 — Integração Parceiros / Discovery

### 1. Implementações
- Nenhum arquivo modificado nesta sessão — sessão de discovery e decisões técnicas.
- Testado formulário `/admin/parceiros/novo` em produção: formulário carrega corretamente, WhatsApp enviado com sucesso, e-mail falhou silenciosamente.

### 2. Decisões

- **Onboarding reformulado**: fluxo de pedir credenciais da Evolution ao parceiro foi descartado. Evolution não expõe API Key na UI (fica no `.env`). Parceiro já tem webhook ativo apontando para `api.omegalaser.com.br` — trocar quebraria integração existente.
- **Integração via Outbound Webhook (Opção 1)**: escolhida como mais efetiva. O sistema do parceiro envia POST para `/webhook/ml/external/{slug}` quando mensagens chegam. Real-time, independe do sistema do parceiro ter CRM específico.
- **Opção 2 (forward) descartada**: colocar ML Laboratory no meio do fluxo do parceiro causa dependência — se nosso n8n cair, quebra a integração deles.
- **Opção 3 (pull periódico) como provisório**: enquanto outbound webhook não está pronto, ML puxa via API REST. Payload normalizado para o mesmo formato final — migração futura é só trocar o gatilho.
- **Payload acordado com parceiro**:
  ```json
  { "event": "nova_mensagem", "mensagem": { "id", "conversa_id", "origem", "tipo", "conteudo", "atendente_id", "enviada_em", "status" }, "conversa_id", "lead_id", "setor_id" }
  ```
  Campos obrigatórios: `origem`, `conteudo`, `conversa_id`, `enviada_em`. `atendente_id` essencial para análise por atendente.
- **Slug: Opção A** — campo `slug_ml` na tabela Setor do sistema do parceiro. Sistema já vai ser multi-tenant (várias empresas), então variável de ambiente global (Opção B) não serve.
- **Identificação de atendente**: `atendente_id` existe no banco do parceiro mas não estava no payload. Parceiro vai incluir no webhook. Sem ele, único indicador é `origem: "ATENDENTE"` + nome embutido no texto.
- **E-mail onboarding**: falha silenciosa no `catch` de `enviarEmail()` em `portal-next/app/api/admin/parceiros/route.ts` — não corrigido ainda.

### 3. Todos ativos

- [ ] Criar endpoint `/webhook/ml/external/{slug}` no n8n — aguarda parceiro confirmar construção do webhook
- [ ] Workflow provisório: pull periódico da API REST do parceiro — aguarda documentação/endpoint da API deles
- [ ] Corrigir falha silenciosa no envio de e-mail (`portal-next/app/api/admin/parceiros/route.ts` — função `enviarEmail`)
- [ ] Reformular página `/onboarding/[token]/page.tsx` — atualmente pede credenciais Evolution, fluxo correto agora é webhook de saída
- [ ] Decisão pendente: Cenário B multi-agente (manual vs round-robin) — Stories 1.1 tasks 2.7-2.8 bloqueadas
- [ ] Conectar número WhatsApp ao ML Laboratory via QR Code

---
## Sessão 2026-04-28 (parte 6 — Railway build fix)

### 1. Implementações

**Arquivos criados:**
- `portal-next/Dockerfile` — multi-stage build (deps → builder → runner, node:20-alpine)

**Arquivos modificados:**
- `portal-next/railway.json` — `builder: NIXPACKS` → `builder: DOCKERFILE, dockerfilePath: ./Dockerfile`
- `portal-next/app/api/admin/parceiros/route.ts` — removeu `const resend = new Resend(...)` do nível do módulo; instanciação movida para dentro de `enviarEmail()`

**Bugs corrigidos:**
1. `Module not found: Can't resolve '@/lib/db'` — nixpacks em monorepo com dois `package.json` criava WORKDIR ambíguo; Dockerfile explícito resolve
2. `Missing API key` (Resend) — `new Resend()` no nível do módulo falha durante "Collecting page data" do Next.js build; movido para dentro do handler

**Commits pushados para GitHub:**
- `11da7c4 fix(deploy): substitui nixpacks por Dockerfile explícito no portal-next`
- `8a5d94f fix(portal): move Resend init para dentro do handler — corrige build Railway`

### 2. Decisões

- **Dockerfile multi-stage em vez de nixpacks:** nixpacks confundia-se com dois `package.json` (raiz `aiox-machine-learning` + `portal-next`); Dockerfile garante WORKDIR correto e COPY explícito
- **Resend lazy init:** Serviços com env vars de runtime não devem ser instanciados no nível do módulo em Next.js — o build executa os módulos durante "Collecting page data" sem as env vars disponíveis

### 3. Todos ativos

- [ ] **Verificar Railway build** — confirmar que deploy com `11da7c4` + `8a5d94f` passou (acesse Railway dashboard)
- [ ] **Testar em produção** — `https://portal-ml-production.up.railway.app/admin/parceiros/novo` — criar parceiro e validar fluxo (cadastro + e-mail + WhatsApp)
- [ ] **Número WhatsApp** — pendente da sessão anterior: conectar número ao ML Laboratory via QR Code no Appsmith/portal

---
## Sessão 2026-04-28 (parte 5 — compact final)

### 1. Implementações

**Pipeline ML-ANALISE (`UthiBdEQma4DiVhL`) — FUNCIONANDO** — primeira execução `status=success` às 15:35 UTC

**Nós reescritos no workflow:**
- `extrair-analise` (Code): SQL builder com escaping manual, defaults para todos os campos enum, `objecoes` e `sessao_id` no output
- `salvar-analise` (Postgres): `query: {{ $json.query }}` — remove dependência de queryParams
- `atualizar-objecoes` (Postgres): `SELECT 1 AS objecoes_skip` (no-op temporário — débito técnico)
- `encerrar-sessao` (Postgres): query expression usando `$('Preparar Prompt Claude').first().json.sessao_id`

**8 bugs corrigidos em cadeia:**
1. JOIN errado: `session_id = s.id::text` → `m.remote_jid = s.remote_jid`
2. method GET → POST na API Anthropic
3. API key Anthropic ausente no header (hardcoded)
4. `additionalFields.queryParams` ignorado pelo driver → SQL builder no Code node
5. `varchar(255)` overflow em `padrao_detectado` → `slice(0, 250)`
6. `ON CONFLICT (sessao_id)` sem unique constraint → `DO NOTHING`
7. Double-encoding nos nomes dos nós → usar nome garbled ou nó ASCII
8. IIFE não suportada em query expressions → simplificado para no-op

**Resultado confirmado:**
- `ml_comercial.conversas` inseriu id `6add87e8-b7e8-4bc8-a4c8-0999b9480f18`
- `encerrar-sessao` retornou `success: true`
- Pipeline processa 49 sessões elegíveis a cada 5 min automaticamente

**Arquivo temporário:** `extrair_fix.js` na raiz do projeto (pode deletar)

### 2. Decisões

- **SQL builder no Code node**: `additionalFields.queryParams` ignorado no n8n desta versão — construir SQL completo com escaping manual é a única abordagem confiável
- **ON CONFLICT DO NOTHING**: sem unique constraint em `sessao_id` na tabela `ml_comercial.conversas`
- **padrao_detectado truncado a 250**: coluna `varchar(255)` — Claude pode retornar texto longo
- **encerrar-sessao usa Preparar Prompt Claude**: nó ASCII puro, evita problema de double-encoding nos nomes
- **atualizar-objecoes como no-op**: IIFE JavaScript não suportada em query expressions do n8n — débito técnico para implementar como Code node separado
- **objecoes + sessao_id no output de extrair-analise**: necessário para nós downstream acessarem via referência de nó

### 3. Todos ativos

- [ ] **atualizar-objecoes — DÉBITO TÉCNICO**: reimplementar catalogação de objeções como Code node + Postgres (IIFE não funciona em query expression do n8n)
- [ ] Exportar JSON atualizado dos workflows `eM0qnKGXShlOuCsV` e `UthiBdEQma4DiVhL`
- [ ] entity-registry: backup settings.json → install --force → restore
- [ ] Seed ai:sdr, ai:closer, ai:agendamento → após onboarding EsteticaIA
- [ ] Story 1.1 tasks 2.7 e 2.8 — BLOQUEADAS (aguarda clínica multi-agente)
- [ ] Deletar `extrair_fix.js` da raiz do projeto

---
## Sessão 2026-04-28 (parte 4 — compact)

### 1. Implementações

**Workflow `UthiBdEQma4DiVhL` (ML-ANALISE) — 4 nós reescritos:**

- `extrair-analise` (Code node): novo SQL builder com escaping manual, defaults para todos os campos, `objecoes` e `sessao_id` passados no output para nós downstream
- `salvar-analise` (Postgres): simplificado para `query: {{ $json.query }}` — remove dependência de `additionalFields.queryParams`
- `atualizar-objecoes` (Postgres): query expression que constrói INSERT SQL inline via objecoes de `$('Extrair Análise do Claude')`
- `encerrar-sessao` (Postgres): query expression com `sessao_id` via `$('Extrair Análise do Claude').first().json.sessao_id`

**Bugs corrigidos nesta sessão:**
- Bug #4: `additionalFields.queryParams` ignorado pelo driver → SQL builder no Code node
- Bug #5: `varchar(255)` overflow em `padrao_detectado` → `slice(0, 250)`
- Bug #6: `ON CONFLICT (sessao_id)` sem unique constraint → revertido para `DO NOTHING`
- Bug #7: `atualizar-objecoes` e `encerrar-sessao` mesma falha queryParams → expressions inline

**Arquivo temporário criado:** `extrair_fix.js` (pode deletar após confirmação)

### 2. Decisões

- **SQL builder no Code node**: `additionalFields.queryParams` é ignorado pelo driver n8n Postgres nesta versão — construir SQL completo com escaping manual é a única abordagem confiável
- **ON CONFLICT DO NOTHING**: `ml_comercial.conversas` não tem unique constraint em `sessao_id` — DO NOTHING genérico é o correto
- **padrao_detectado truncado a 250**: coluna `varchar(255)` — Claude pode retornar texto longo
- **objecoes + sessao_id no output de extrair-analise**: necessário para que nós downstream (`atualizar-objecoes`, `encerrar-sessao`) acessem via `$('Extrair Análise do Claude')`

### 3. Todos ativos

- [ ] **CONFIRMAR pipeline completo** (PRIORIDADE): verificar se execução após 15:21 UTC passou sem erros em todos os nós — monitor boqx3l31w aguardando id > 27844
- [ ] Story 1.1 tasks 2.7 e 2.8 — BLOQUEADAS (aguarda clínica multi-agente)
- [ ] Exportar JSON atualizado: `eM0qnKGXShlOuCsV` e `UthiBdEQma4DiVhL`
- [ ] entity-registry: backup settings.json → install --force → restore
- [ ] Seed ai:sdr, ai:closer, ai:agendamento → após onboarding EsteticaIA
- [ ] Deletar `extrair_fix.js` temporário após confirmação

---
## Sessão 2026-04-28 (parte 3)

### 1. Implementações

**Bug #4 — API key Anthropic ausente no workflow `UthiBdEQma4DiVhL`:**
- Header `x-api-key` usava `{{ $env.ML_ANTHROPIC_API_KEY }}` — variável não definida no n8n
- Railway token inválido impossibilitou configurar via Railway API
- Fix: chave configurada diretamente no header do nó `Claude Haiku — Analisar Conversa`
- `updatedAt: 2026-04-28T14:41:32Z`
- Chave salva em `memory/credentials.md` (seção Anthropic)

**Estado do workflow `UthiBdEQma4DiVhL` após todos os fixes:**
- JOIN corrigido: `m.remote_jid = s.remote_jid` (era `m.session_id = s.id::text`)
- method=POST configurado no nó httpRequest Claude Haiku
- x-api-key: chave Anthropic direta no header
- Aguardando execução às 14:45 UTC para confirmar

### 2. Decisões

- **API key hardcoded no header**: Railway token expirado + n8n sem credential type Anthropic nativo → solução direta no workflow
- **Chave salva em credentials.md**: disponível em sessões futuras sem precisar re-informar

### 3. Todos ativos

- [ ] **CONFIRMAR análises (PRIORIDADE)**: próxima execução 14:45 UTC — verificar se `ml_comercial.conversas` começa a ser populada (49 sessões elegíveis)
- [ ] Story 1.1 tasks 2.7 e 2.8 — BLOQUEADAS (aguarda clínica multi-agente)
- [ ] n8n JSON local desatualizado — exportar versão atual dos 2 workflows editados (`eM0qnKGXShlOuCsV` e `UthiBdEQma4DiVhL`)
- [ ] entity-registry: backup settings.json → install --force → restore
- [ ] Seed ai:sdr, ai:closer, ai:agendamento → após onboarding EsteticaIA

---
## Sessão 2026-04-28 (parte 2)

### 1. Implementações

**Bug #1 — Lookup Setor perdendo session_id (workflow ML-CAPTURA `eM0qnKGXShlOuCsV`):**
- Redis SET sobrescreve `$json` com `{propertyName: null}`, zerando contexto downstream
- Fix: `$json.session_id` → `$("Normalizar Payload").item.json.session_id` no nó Lookup Setor
- `updatedAt: 2026-04-28T13:42:48Z` — confirmado com mensagem "Teste 123—- 123" entrando no banco

**Redis Dedup Check validado:**
- Payload duplicado enviado com message_id real (`A552E38E55774874BF30D064410E618F`)
- Banco ficou com `count=1` — ✅ dedup funcionou com mensagem real do usuário

**Migration 022 aplicada em produção:**
- `ml_captura.diagnostic_runs` + `ml_captura.validation_log` criadas com triggers e grants

**Story 1.1 task 2.6 concluída:**
- `sessoes_conversa.agente_humano_id` = Kátia Cosmobeauty (`55c1950e-...`) confirmado nas sessões recentes
- Checkbox `[x] 2.6` marcado na story

**Bug #2 — Análise de Conversa não populava `ml_comercial.conversas` (workflow `UthiBdEQma4DiVhL`):**
- JOIN `m.session_id = s.id::text` nunca batia — `mensagens_raw.session_id` é nome da instância, não UUID
- Fix: `m.remote_jid = s.remote_jid` — 49 sessões elegíveis para análise
- `updatedAt: 2026-04-28T14:13:11Z`

**Bug #3 — Claude Haiku com method GET (mesmo workflow):**
- Nó httpRequest sem `method` definido usava GET → `Method Not Allowed` na API Anthropic
- Fix: `method=POST` adicionado — `updatedAt: 2026-04-28T14:17:04Z`

### 2. Decisões

- **JOIN por remote_jid**: `mensagens_raw.session_id` armazena nome da instância Evolution API, não UUID — linkagem deve ser por `remote_jid`
- **Dois fixes no mesmo workflow `UthiBdEQma4DiVhL`**: JOIN + method=POST aplicados juntos
- **49 sessões elegíveis** aguardando análise após fix (todas com 3+ mensagens, inativas 30+ min)

### 3. Todos ativos

- [ ] **CONFIRMAR análises**: verificar próxima execução às 14:20 UTC — espera-se que `ml_comercial.conversas` comece a ser populada
- [ ] Story 1.1 tasks 2.7 e 2.8 — BLOQUEADAS (aguarda clínica multi-agente)
- [ ] n8n JSON local desatualizado — exportar versão atual dos workflows editados
- [ ] entity-registry: backup settings.json → install --force → restore
- [ ] Seed ai:sdr, ai:closer, ai:agendamento → após onboarding EsteticaIA

---
## Sessão 2026-04-28

### 1. Implementações

**Fix crítico — workflow n8n `eM0qnKGXShlOuCsV` [ML-CAPTURA]:**
- Nó `Lookup Setor` corrigido: expressão `$json.session_id` → `$("Normalizar Payload").item.json.session_id`
- Aplicado via `PUT /api/v1/workflows/eM0qnKGXShlOuCsV` — `updatedAt: 2026-04-28T13:42:48Z`

**Teste Redis Dedup Check:**
- Validado com message_id `A552E38E55774874BF30D064410E618F` ("Serve para estrias?")
- Enviamos payload duplicado via curl → banco ficou com `count=1` → ✅ dedup funcionou
- Descoberta colateral: a mensagem enviada pelo usuário não era a usada no teste (era de outro número)

**Bug identificado (raiz):**
- `Redis SET - Mark Processed` (adicionado na sessão anterior) sobrescreve `$json` com `{"propertyName": null}`
- Todos os nós downstream perdiam `session_id`, `remote_jid`, etc.
- Resultado: `Lookup Setor` retornava vazio → pipeline parava → nenhuma mensagem era inserida no banco
- Efeito: pipeline estava quebrado desde a implementação do Redis Dedup (sessão 2026-04-27)

### 2. Decisões

- **Fix via referência explícita ao nó**: usar `$("Normalizar Payload").item.json.session_id` em vez de `$json.session_id` para não depender do contexto sobrescrito pelo Redis SET
- **Dedup confirmado funcionando**: a lógica Redis GET → IF → Redis SET está correta; o problema era só a perda de contexto downstream

### 3. Todos ativos

- [ ] **CONFIRMAR FIX**: usuário deve enviar mensagem e verificar se entra em `ml_captura.mensagens_raw`
- [ ] Aplicar migration 022 em produção (`diagnostic_runs` + `validation_log`)
- [ ] Story 1.1 task 2.6: teste mono-agente — confirmar `agente_humano_id` = Kátia
- [ ] n8n JSON local desatualizado — workflow foi editado via API, exportar versão atual
- [ ] entity-registry: backup settings.json → install --force → restore
- [ ] Seed ai:sdr, ai:closer, ai:agendamento → após onboarding EsteticaIA

---
## Sessão 2026-04-27 (parte 3)

### 1. Implementações

**Commit `e8055e6` — push origin/main ✅ — 16 arquivos:**

squad.yaml corrigidos (tasks não declaradas adicionadas):
- `squads/ml-captura-squad/squad.yaml`: + debug-pipeline.md
- `squads/ml-data-eng-squad/squad.yaml`: + build-etl-pipeline.md, design-schema.md
- `squads/ml-marketing-squad/squad.yaml`: + execute-campaign.md
- `squads/ml-plataforma-squad/squad.yaml`: + deploy-update.md, monitor-health.md, run-e2e-tests.md, validate-pipeline.md, seed-master.md, seed-catalog.md, seed-ai-agents.md

Tasks criadas (GAP-001 fechado):
- `squads/ml-plataforma-squad/tasks/run-e2e-tests.md`
- `squads/ml-plataforma-squad/tasks/validate-pipeline.md`
- `squads/ml-plataforma-squad/tasks/seed-master.md`
- `squads/ml-plataforma-squad/tasks/seed-catalog.md`
- `squads/ml-plataforma-squad/tasks/seed-ai-agents.md`

autoClaude v1.0 → v3.0 (ml-captura + ml-plataforma):
- `squads/ml-captura-squad/agents/n8n-encoding-sanitizer.md`
- `squads/ml-captura-squad/agents/whatsapp-recovery-agent.md`
- `squads/ml-captura-squad/agents/whatsapp-webhook-validator.md`
- `squads/ml-plataforma-squad/agents/crm-sync-agent.md`
- `squads/ml-plataforma-squad/agents/e2e-test-orchestrator.md`
- `squads/ml-plataforma-squad/agents/monitor-agent.md`
- `squads/ml-plataforma-squad/agents/seed-manager.md`

### 2. Decisões

- **Squad.yaml ML squads estavam maioritariamente corretos** — o erro era tasks reais não declaradas, não agentes listados como tasks (inferência errada da primeira análise)
- **GAP-001 fechado via subagente** — 5 task files criados seguindo template de setup-infrastructure.md
- **autoClaude v3.0 apenas para ML squads** — SHE fica em v1.0 (baixa prioridade, não bloqueia nada)
- **Varredura global confirmou 72/72 agentes conformes** nos campos críticos do template após correções da sessão anterior

### 3. Todos Ativos

- [ ] GAP-006: auditar `whatsapp-recovery-agent` (ml-captura) — não coberto ainda
- [ ] migrations: criar `ml_captura.diagnostic_runs` e `ml_captura.validation_log` → `@data-engineer`
- [ ] seed SQL: número `tipo='multi'` para testes 2.7 e 2.8 → decisão de `@pm` ou `@po`
- [ ] SHE (baixa prioridade): autoClaude v1.0 → v3.0 nos 14 agentes locais
- [ ] entity-registry: desatualizado 132h (threshold 48h) — rodar `npx aiox-core install --force`

---
## Sessão 2026-04-27 (parte 2)

### 1. Implementações

**Commit `9e78f53` — push origin/main ✅ — 13 arquivos:**

- `squads/software-house-elite/agents/icarus.md`: IDE-FILE-RESOLUTION corrigido (`.aiox-core/development/tasks/` → `squads/software-house-elite/tasks/`), campo `squad: software-house-elite` adicionado, footer `*Squad: software-house-elite | AIOX Agent v1.0*` adicionado
- `squads/software-house-elite/agents/ai-engineer.md`: comando `*session-info` adicionado
- `squads/software-house-elite/agents/enterprise-architect.md`: comando `*session-info` adicionado
- `squads/software-house-elite/agents/frontend-specialist.md`: comando `*session-info` adicionado
- `squads/software-house-elite/agents/lgpd-compliance.md`: comando `*session-info` adicionado
- `squads/software-house-elite/agents/n8n-dev.md`: comando `*session-info` adicionado
- `squads/software-house-elite/agents/sdet.md`: comando `*session-info` adicionado
- `squads/software-house-elite/agents/security-architect.md`: comando `*session-info` adicionado
- `squads/software-house-elite/agents/sre.md`: comando `*session-info` adicionado
- `squads/software-house-elite/agents/ux-research-lead.md`: comando `*session-info` adicionado
- `squads/software-house-elite/squad.yaml`: `tasks_available: 10 → 21`, `last_audit: "2026-04-22" → "2026-04-27"`
- `.claude/session-log.md`: entrada da sessão adicionada
- `CONTEXT.md`: atualizado

### 2. Decisões

- **Icarus é o agente responsável por auditorias de agentes** — Claude Code genérico não deve executar esse papel
- **Ciclo de auditoria deve ser fechado na mesma sessão**: auditar → prescrever → corrigir → commitar — prescrição sem execução é falha
- **@icarus pode editar arquivos com autorização explícita do usuário** — regra de escopo flexibilizada por permissão direta
- **@devops executa commit + push após correções de @icarus** — fluxo padrão mantido

### 3. Todos Ativos

**ml-plataforma-squad — GAPs ainda pendentes:**
- [ ] GAP-001: criar `run-e2e-tests.md`, `validate-pipeline.md`, `seed-master.md`, `seed-catalog.md`, `seed-ai-agents.md`
- [ ] GAP-004: migrations para `ml_captura.diagnostic_runs` e `ml_captura.validation_log`
- [ ] GAP-003/007: seed SQL de número `tipo='multi'` para tasks 2.7 e 2.8 (via debug endpoint, sem segundo chip)
- [ ] GAP-005: `e2e-test-orchestrator` autoClaude v1.0 → v3.0
- [ ] GAP-006: auditar `whatsapp-recovery-agent` (não coberto ainda)

**software-house-elite — pendência restante (baixa prioridade):**
- [ ] autoClaude v1.0 → v3.0 nos 14 agentes locais (não bloqueia nenhum teste)

---
## Sessão 2026-04-27

### 1. Implementações
- Nenhum arquivo criado ou modificado nesta sessão — sessão de auditoria e verificação de agentes.

### 2. Decisões
- **Icarus é o agente responsável por auditorias de agentes** — não Claude Code genérico. Qualquer auditoria de squad deve ser feita com @icarus ativo.
- **Correções do software-house-elite ainda não executadas** — auditoria anterior prescreveu mas @dev nunca foi acionado para aplicar. Ciclo precisa ser fechado.
- **GAP-003 (número multi) pode ser resolvido via seed SQL + debug endpoint** — sem precisar de segundo chip ou nova instância WhatsApp. Endpoint: `POST .../webhook/ml/captura/debug`.
- **tasks_available no squad.yaml desatualizado** — squad.yaml diz 10, existem 21 tasks reais. Precisa de atualização manual.

### 3. Todos Ativos

**software-house-elite — correções pendentes (prescrito, não executado):**
- [ ] `squad.yaml`: atualizar `tasks_available: 10` → 21 e `last_audit`
- [ ] `icarus.md`: corrigir `IDE-FILE-RESOLUTION` (aponta `.aiox-core/development/tasks/` → deve ser `squads/software-house-elite/tasks/`)
- [ ] `icarus.md`: adicionar campo `squad:` no bloco `agent:`
- [ ] `icarus.md`: adicionar footer `*Squad: software-house-elite | AIOX Agent v{version}*`
- [ ] 9 agentes sem `*session-info`: `ai-engineer`, `enterprise-architect`, `frontend-specialist`, `lgpd-compliance`, `n8n-dev`, `sdet`, `security-architect`, `sre`, `ux-research-lead`
- [ ] autoClaude v1.0 → v3.0 nos 14 agentes locais (baixa prioridade)

**ml-plataforma-squad — GAPs pendentes:**
- [ ] GAP-001: criar tasks ausentes — `run-e2e-tests.md`, `validate-pipeline.md`, `seed-master.md`, `seed-catalog.md`, `seed-ai-agents.md`
- [ ] GAP-004: criar migrations para `ml_captura.diagnostic_runs` e `ml_captura.validation_log`
- [ ] GAP-003/007: seed SQL de número tipo='multi' para testes das tasks 2.7 e 2.8
- [ ] GAP-005: atualizar `e2e-test-orchestrator` de `autoClaude v1.0` → `v3.0`
- [ ] GAP-006: auditar `whatsapp-recovery-agent` (não coberto na auditoria anterior)

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

---
## Sessão 2026-04-24 — Auditoria Icarus: novos agentes e correção de nomenclatura

### 1. Implementações

**`squads/ml-plataforma-squad/agents/crm-sync-agent.md`** — CRIADO (commit `83d2181`)
- Persona: Cleo — Sincronizadora de Insights para CRM
- Sincroniza outputs de performance-reporter, churn-detector, retention-advisor, executive-reporter para HubSpot/RD Station/Salesforce/webhook genérico
- Idempotente via external_id; dry-run obrigatório antes da primeira sync
- `squads/ml-plataforma-squad/squad.yaml` atualizado

**`squads/ml-plataforma-squad/agents/monitor-agent.md`** — CRIADO (commit `d865602`)
- Persona: Vigil — Inspetor de Saúde da Plataforma (arquétipo Sentinel)
- Monitora conectividade Postgres/Redis/n8n/Evolution API por projeto ativo
- Registra em `ml_platform.health_log`; cache Redis `ml:platform:health:{projeto_id}`
- Modelo: Claude Haiku
- `squads/ml-plataforma-squad/squad.yaml` atualizado (5 agentes total)

**`squads/ml-captura-squad/agents/whatsapp-webhook-validator.md`** — CRIADO (commit `d865602`)
- Persona: Lex — Validador de Payloads WhatsApp (arquétipo Gatekeeper)
- Segunda linha de defesa após webhook-manager: valida estrutura + HMAC + dedup de payloads Evolution API
- Registra rejeições em `ml_captura.validation_log`; dedup via Redis `ml:captura:validated:{event_id}`
- Modelo: Claude Haiku
- `squads/ml-captura-squad/squad.yaml` atualizado (10 agentes total)

**Nomenclatura `ai:sofia-*` corrigida** (commit `848e209`)
- `ai:sofia-sdr` → `ai:sdr` | `ai:sofia-closer` → `ai:closer` | `ai:sofia-agendador` → `ai:agendamento`
- Arquivos atualizados: `.claude/session-log.md`, `CONTEXT.md`, `database/migrations/017_mensagens_respondent_direction.sql`, `docs/onboarding.md`, `docs/stories/1.2.story.md`, `infra/n8n/workflows/ML-EXTERNAL-esteticaia.json`, `squads/ml-plataforma-squad/agents/seed-manager.md`
- Comando `*seed-sofia` → `*seed-ai-agents` no seed-manager

**Revertido** (commit `b9af8cf`): sofia-sdr.md, sofia-closer.md, sofia-scheduler.md criados incorretamente — são seeds de banco, não agentes YAML

### 2. Decisões

- **Sofia-* NÃO são agentes de squad YAML**: são registros em `_plataforma.agentes_humanos` — identidades IA para atribuição de conversas. O seed é executado via `seed-manager *seed-ai-agents {numero_id}` após onboarding EsteticaIA
- **EsteticaIA é estrutura genérica**: sem persona embutida. A persona (nome, identidade) vem da clínica cliente que usa a estrutura. Identificadores de função devem ser agnósticos: `ai:sdr`, `ai:closer`, `ai:agendamento`
- **monitor-agent e whatsapp-webhook-validator**: usam Claude Haiku (operações de alto volume, custo mínimo)
- **Separação de responsabilidades captura**: webhook-manager configura endpoints; whatsapp-webhook-validator inspeciona cada payload individualmente (segunda linha de defesa)

### 3. Todos Ativos

**Pendentes desta sessão:**
- [ ] **Gate de segmento onboarding-orchestrator** (item 9 da auditoria): definir `strict_mode: true` como default explícito — atualmente ambíguo
- [ ] **autoClaude em todos os agentes** (item 4): migrar 70+ agentes do formato Markdown simples para formato YAML completo com autoClaude + customization
- [ ] **customization por cliente** (item 5): adicionar seção customization contextualizada em cada agente

**Bloqueados:**
- [ ] **Seed `ai:sdr`, `ai:closer`, `ai:agendamento`** → aguardam onboarding instância EsteticaIA no portal (escaneamento QR Code)

---
## Sessão 2026-04-25

### 1. Implementações

**Seeds executados no banco Railway via psql (PowerShell):**
- `_plataforma.agentes_humanos`: Kátia - Cosmobeauty (id: `55c1950e-cc7e-405f-a27d-bff44647c485`) vinculada como `agente_default_id` ao número `5516988456918`
- `_plataforma.usuarios`: Ewerton / ewertonfm00@gmail.com / is_master=true (id: `31536ed4-41ca-455d-91e2-67072a39e936`)

**Workflow n8n ML-CAPTURA atualizado via API (ID: eM0qnKGXShlOuCsV, 16 nós):**
- `Lookup Setor`: query atualizada para retornar `tipo` e `agente_default_id`
- `Enriquecer com Setor`: propaga `numero_tipo`, `agente_default_id`, `numero_id`
- NOVO `Lookup Agente Multi`: subquery escalar — sempre retorna 1 linha (NULL se não encontrar)
- NOVO `Resolver Atendente`: mono → usa `agente_default_id`; multi → usa `agente_multi_id` do lookup
- `Upsert sessoes_conversa`: corrigido para usar `$('Resolver Atendente').first().json` em vez de `mr.agente_humano_id` (coluna inexistente em mensagens_raw)
- Nós com encoding corrompido renomeados: `Filtro Audio`, `Download Audio`, `Preparar Dados Audio`
- Conexões corrigidas: `Enriquecer com Setor` → `Lookup Agente Multi` → `Resolver Atendente` → `Filtro Audio` + `Filtro Texto`

**Fix `.claude/settings.json`:** caminho absoluto para `squad-clickup-sync.py` (era relativo, quebrava em subdiretórios)

**Commit:** `a1fff34` — `feat(pipeline): lógica mono/multi de atendente ativa em produção [Story 1.1]`

### 2. Decisões

- **psql no Windows**: usar PowerShell com flags separadas (`-h -p -U -d`) — Bash não interpreta flags após connection string
- **Encoding banco com acentos**: usar arquivo `.sql` + `PGCLIENTENCODING=UTF8` via `--file=`
- **Hash de senha**: pgcrypto `crypt('senha', gen_salt('bf', 12))` direto no PostgreSQL — sem bcrypt disponível globalmente em Node
- **Lookup Agente Multi como subquery escalar**: retorna sempre 1 linha (NULL se não encontrar) — impede o flow parar com 0 linhas em nó Postgres
- **Renomear nós com encoding corrompido**: surrogates `\udc81` impediam serialização JSON — renomeados para ASCII limpo
- **Kátia sem identificador_externo**: número mono-agente direto WhatsApp, sem Redrive — resolução via `agente_default_id` apenas
- **Task 2.8 adiada**: requer número `tipo='multi'` configurado — número atual é mono

### 3. Todos Ativos

- [ ] Story 1.1 task 2.8: teste multi-agente com `identificador_externo` desconhecido — requer número `tipo='multi'`
- [x] Sincronizar JSON local `infra/n8n/workflows/ML-CAPTURA-whatsapp-pipeline.json` com versão em produção ✅
- [ ] Story 1.2 tasks 3.1–3.2: testes E2E EsteticaIA (aguarda homologação deles)
- [ ] Seed `ai:sdr`, `ai:closer`, `ai:agendamento` → após onboarding instância EsteticaIA
- [ ] Implementar workflows n8n das tasks dos squads ML (começar por ml-captura)
- [ ] Seed inicial do segment-catalog-manager (Saída 2 inoperante sem catálogo)

---
## Sessão 2026-04-25 (continuação — configure-webhook + fixes ML-CAPTURA)

### 1. Implementações

**`infra/n8n/workflows/ML-CONFIGURE-WEBHOOK.json`** — CRIADO (commit `fe9e8c6`)
- Endpoint: `POST /ml/configure/webhook` body: `{"instancia_nome": "ml-{numero}"}`
- 8 nós: Webhook Trigger → Validar Input → Configurar Webhook Evolution → Lookup Instancia DB → Upsert webhooks_config → Montar Resposta → Resposta HTTP + Resposta Erro
- Importado no n8n (id: `kDtiUtT7tS9572mQ`), ativado via API
- Testado: `ml-5516988456918` → `{"success":true, "status":"ativo", "webhooks_config_id":"ef8cb2c4-cb93-4475-b7c0-053ac7c85c80"}`
- Upsert idempotente via `ON CONFLICT (instancia_id)` — pode ser chamado múltiplas vezes

**ML-CAPTURA sincronizado** com produção (commit `651dd06`)
- `infra/n8n/workflows/ML-CAPTURA-whatsapp-pipeline.json` atualizado após sync inicial
- CONTEXT.md: configure-webhook marcado concluído, prioridades revisadas

**Bug `transcricoes_audio` corrigido** (commit `6cce64b`)
- Causa: query usava `$json.transcricao` (output do INSERT = `{id}`) → salvava `texto='undefined'`
- Fix: query agora referencia `$('Preparar Dados Audio').item.json.transcricao.{texto,idioma,confianca}`
- `continueOnFail: true` adicionado — skip gracioso quando path é texto (nó de áudio não executado)
- Aplicado em produção via PUT API + JSON local re-sincronizado

**Groq API key configurada** (commit `ea98c1e`)
- `$vars.ML_GROQ_API_KEY` não funciona (plano n8n sem `feat:variables`)
- Key aplicada diretamente no header `Authorization` do nó `Groq Whisper — Transcrição`
- Salva em `.env` como `GROQ_API_KEY`
- Transcrição de áudio agora operacional em produção

### 2. Decisões

- **`$vars` indisponível no plano n8n atual** → hardcode de credentials diretamente nos nós (padrão já existente: Evolution API key também hardcoded)
- **`continueOnFail: true` no nó `transcricoes_audio`** → paths audio e texto compartilham o mesmo nó downstream; continueOnFail é o mecanismo correto para skip condicional
- **ML-CONFIGURE-WEBHOOK como workflow separado** → endpoint próprio para re-registrar webhook sem precisar recriar a instância; idempotente via ON CONFLICT
- **PUT API body mínimo** → n8n API v1 rejeita propriedades extras (`active`, `id`, `versionId`, `shared`, `tags`, etc.) — usar `{name, nodes, connections, settings}` apenas

### 3. Todos Ativos

- [ ] **Seed inicial do `segment-catalog-manager`** — Saída 2 inoperante sem catálogo (pronto para iniciar)
- [ ] **`collect-messages` com Redis dedup** — Redis não está no Railway (bloqueado; dedup atual via `ON CONFLICT (message_id) DO NOTHING` no n8n)
- [ ] **Story 1.1 task 2.8** — teste multi-agente com `identificador_externo` desconhecido (requer número `tipo='multi'`)
- [ ] **Story 1.2 tasks 3.1–3.2** — testes E2E EsteticaIA (aguarda homologação)
- [ ] **Seed `ai:sdr`, `ai:closer`, `ai:agendamento`** — aguarda onboarding instância EsteticaIA
- [ ] **Push pendente** — 11 commits locais não enviados para `origin/main` (requer @devops)

---
## Sessão 2026-04-25 (continuação — segment-catalog-manager seed)

### 1. Implementações

**`database/migrations/021_orquestrador_segment_catalog.sql`** — CRIADO (commit `1c4fee4`)
- Schema `ml_orquestrador` criado (orquestração cross-area)
- Tabela `segment_catalog`: id(slug PK), nome, descricao, ciclo_venda, nivel_tecnico, decisao, relacionamento, disc_preferido[], metodologia[], ticket_medio, cases_validados(jsonb), dados_suficientes(bool), version, ativo
- Trigger `set_updated_at`, índices em `ativo` e `dados_suficientes`, grants SELECT/INSERT/UPDATE para `ml_app`
- Função `ml_orquestrador.set_updated_at()` criada

**`database/migrations/rollbacks/021_orquestrador_segment_catalog_rollback.sql`** — CRIADO

**`database/seeds/001_segment_catalog_inicial.sql`** — CRIADO (commit `1c4fee4`)
- 4 segmentos inseridos e confirmados no banco Railway (INSERT 0 4):
  - `estetica-equipamentos`: piloto Omega Laser, ciclo médio, decisão mista, ticket alto, D+I, SPIN+produto-abordagem
  - `saude-clinicas-b2b`: comparação, ciclo médio, decisão racional, ticket alto, C+D, SPIN+Challenger
  - `beleza-varejo-b2c`: comparação B2C, ciclo curto, decisão emocional, ticket médio, I+S
  - `b2b-equipamentos-industria`: comparação industrial, ciclo longo, decisão racional, ticket alto, C+D

### 2. Decisões

- **`dados_suficientes=false` em todos os segmentos iniciais**: nenhum case de deploy real ainda — segment-match-scorer avisa baixa confiabilidade até `*enrich-segment` ser executado com deploys reais validados
- **4 segmentos cobrindo dimensões opostas**: ciclo curto↔longo, decisão emocional↔racional↔mista, B2B↔B2C — base mínima para o scorer ter referências de comparação
- **Schema isolado `ml_orquestrador`**: separado dos schemas operacionais (ml_captura, ml_comercial, etc.) — orquestração cross-area com acesso somente leitura por outros squads

### 3. Todos Ativos

- [ ] **Story 1.1 task 2.8** — teste multi-agente com `identificador_externo` desconhecido (bloqueado: requer número `tipo='multi'`)
- [ ] **Story 1.2 tasks 3.1–3.2** — testes E2E EsteticaIA (aguarda homologação deles)
- [ ] **Seed `ai:sdr`, `ai:closer`, `ai:agendamento`** — aguarda onboarding instância EsteticaIA
- [ ] **Redis dedup `collect-messages`** — Redis não deployado no Railway (bloqueado)
- [ ] **12 commits pendentes de push** para `origin/main` — requer `@devops`
- [ ] **`*enrich-segment estetica-equipamentos`** — só executável após primeiro deploy real de agente validado

---
## Compactação 2026-04-25

### 1. Implementações

**`database/migrations/021_orquestrador_segment_catalog.sql`** — CRIADO (commit `1c4fee4`)
- Schema `ml_orquestrador` + tabela `segment_catalog` com trigger `set_updated_at`, índices em `ativo`/`dados_suficientes`, grants para `ml_app`
- Campos: id(slug PK), nome, descricao, ciclo_venda, nivel_tecnico, decisao, relacionamento, disc_preferido[], metodologia[], ticket_medio, cases_validados(jsonb), dados_suficientes(bool), version, ativo

**`database/migrations/rollbacks/021_orquestrador_segment_catalog_rollback.sql`** — CRIADO

**`database/seeds/001_segment_catalog_inicial.sql`** — CRIADO (commit `1c4fee4`)
- 4 segmentos aplicados e confirmados no Railway (INSERT 0 4):
  - `estetica-equipamentos` — piloto Omega Laser, ciclo médio, decisão mista, ticket alto, D+I, SPIN+produto-abordagem
  - `saude-clinicas-b2b` — comparação, ciclo médio, decisão racional, ticket alto, C+D, SPIN+Challenger
  - `beleza-varejo-b2c` — comparação B2C, ciclo curto, decisão emocional, ticket médio, I+S
  - `b2b-equipamentos-industria` — comparação industrial, ciclo longo, decisão racional, ticket alto, C+D

**Sessões anteriores (commits `ea98c1e`, `6cce64b`, `651dd06`, `fe9e8c6`):**
- n8n Whisper com Groq API key operacional
- ML-CONFIGURE-WEBHOOK workflow ativo (registra webhook Evolution + persiste em `webhooks_config`)
- `transcricoes_audio` com `continueOnFail: true` (skip condicional paths áudio/texto)
- Sincronização ML-CAPTURA local com produção

### 2. Decisões

- **`dados_suficientes=false` em todos os segmentos**: nenhum case real ainda — scorer avisa baixa confiabilidade até `*enrich-segment` executado
- **4 segmentos cobrindo dimensões opostas**: base mínima para scorer ter referências (ciclo curto↔longo, emocional↔racional↔misto, B2B↔B2C)
- **Schema isolado `ml_orquestrador`**: orquestração cross-area; outros squads têm acesso somente leitura
- **`$vars` indisponível no plano n8n** → credenciais hardcoded nos nós (padrão existente no projeto)
- **PUT API body mínimo no n8n**: apenas `{name, nodes, connections, settings}` — API v1 rejeita propriedades extras
- **ML-CONFIGURE-WEBHOOK como workflow separado**: idempotente via ON CONFLICT; re-registra sem recriar instância

### 3. Todos Ativos

- [ ] **Story 1.1 task 2.8** — teste multi-agente com `identificador_externo` desconhecido (requer número `tipo='multi'`)
- [ ] **Story 1.2 tasks 3.1–3.2** — testes E2E EsteticaIA (aguarda homologação)
- [ ] **Seed `ai:sdr`, `ai:closer`, `ai:agendamento`** — aguarda onboarding instância EsteticaIA
- [ ] **Redis dedup `collect-messages`** — Redis não deployado no Railway (bloqueado)
- [ ] **12 commits pendentes de push** para `origin/main` — requer `@devops`
- [ ] **`*enrich-segment estetica-equipamentos`** — executável só após primeiro deploy real de agente validado

---
## Sessão 2026-04-25 (encerramento — push + validação pipeline Kátia)

### 1. Implementações

**Push para `origin/main` via @devops:**
- 2 commits pendentes enviados: `b16e199` (compact-preserve trigger 15→10) + `9f159c1` (fecha sessão config-compact)
- Repositório sincronizado: `1952d63` → `9f159c1` em `ewertonfm00/ml-laboratory`

**Validação do pipeline ML-CAPTURA (consultas diretas ao banco Railway):**
- Confirmado: mensagens sendo capturadas em `ml_captura.mensagens_raw` ✅
- Confirmado: `agente_humano_id = Kátia - Cosmobeauty` nas 3 sessões das últimas 48h ✅
- URL Metabase descoberta e confirmada: `https://metabase-production-11a7.up.railway.app`

### 2. Decisões

- **`session_id` em `mensagens_raw` é VARCHAR** (`ml-5516988456918`), não UUID — não vincula via FK com `sessoes_conversa.id` diretamente; join precisa de lógica diferente
- **`contato_nome` vazio em todas as sessões** — `push_name` capturado em `mensagens_raw` mas não propagado para `sessoes_conversa.contato_nome` (bug menor no n8n, não crítico)
- **Sessões anteriores ao fix têm `agente_humano_id = NULL`** — comportamento esperado (fix aplicado hoje)
- **Para ver mensagens no Metabase**: acessar tabela `ml_captura → mensagens_raw` diretamente (filtrar por `remote_jid`)
- **Portal `/conversas` tem bugs** — fonte primária `sessoes_conversa` implementada mas não validada em produção; @dev precisa corrigir

### 3. Todos Ativos

- [ ] **`contato_nome` vazio** — push_name não está sendo propagado para `sessoes_conversa.contato_nome` no n8n (fix simples em `Upsert sessoes_conversa`)
- [ ] **Portal `/conversas` com bugs** — @dev precisa corrigir UI de drill-down (lista de conversas → ver mensagens)
- [ ] **Story 1.1 task 2.8** — teste multi-agente com `identificador_externo` desconhecido (requer número `tipo='multi'`)
- [ ] **Story 1.2 tasks 3.1–3.2** — testes E2E EsteticaIA (aguarda homologação)
- [ ] **Seed `ai:sdr`, `ai:closer`, `ai:agendamento`** — aguarda onboarding instância EsteticaIA
- [ ] **Redis dedup `collect-messages`** — Redis não deployado no Railway (bloqueado)
- [ ] **`*enrich-segment estetica-equipamentos`** — só após primeiro deploy real de agente validado

---
## Sessão 2026-04-27

### 1. Implementações

**Fix Redis Dedup Check — workflow ML-CAPTURA (ID: `eM0qnKGXShlOuCsV`):**
- Bug: código corrompido por encoding (mojibake) — `$input.first().json` apagado → `return [{ json: }]` → produzia `{}` vazio
- Impacto: 100% dos `messages.upsert` falhavam silenciosamente. Lookup Setor recebia dados nulos → 0 rows → cadeia inteira parava. Nada era inserido em `mensagens_raw` nem `sessoes_conversa`
- Fix aplicado: código ASCII-only mínimo: `const input = $input.first().json; return [{ json: input }];`
- Método: PUT /api/v1/workflows/eM0qnKGXShlOuCsV + reativação via API

**Validações confirmadas pós-fix (mensagem "Teste 123"):**
- `ml_captura.sessoes_conversa.contato_nome = "Ewerton Margonar"` ✅
- `ml_captura.mensagens_raw` inserindo com `conteudo_raw = "Teste 123"` ✅
- `agente_humano_id → Kátia - Cosmobeauty` (Story 1.1 task 2.6 validada ✅)

### 2. Decisões

- **Redis Dedup Check simplificado como pass-through**: deduplicação Redis removida temporariamente — `ON CONFLICT (message_id) DO NOTHING` no SQL garante idempotência suficiente. Reintroduzir Redis dedup futuramente com código ASCII-only
- **Encoding corrompido persiste no n8n**: toda edição via API deve usar exclusivamente código ASCII (sem acentos, sem chars especiais em strings JS)
- **Squad ml-atendimento-squad não implementado**: status=planned, workflows=[]. Critérios de disparo de análise (mínimo de conversas/dias) devem ser definidos por @analyst ou @pm antes de implementar
- **@icarus ativado**: aguardando escopo de auditoria definido pelo usuário

### 3. Todos Ativos

- [ ] Sincronizar JSON local `ML-CAPTURA` com versão em produção após fix Redis Dedup Check
- [ ] Reimplementar lógica Redis no Dedup Check (pass-through atual, sem deduplicação real)
- [ ] Story 1.1 task 2.8: teste multi-agente com `identificador_externo` desconhecido (requer número `tipo='multi'`)
- [ ] Story 1.2 tasks 3.1–3.2: testes E2E EsteticaIA (aguarda homologação deles)
- [ ] Seed `ai:sdr`, `ai:closer`, `ai:agendamento` → após onboarding instância EsteticaIA
- [ ] Avisar EsteticaIA: endpoint pronto em `/webhook/ml/external/esteticaia`
- [ ] Squad ml-atendimento-squad: @analyst/@pm definir critérios de disparo das análises
- [ ] `*enrich-segment estetica-equipamentos` → após primeiro deploy real de agente validado
- [ ] @icarus ativo — aguardando comando do usuário para auditoria

---
## Sessão 2026-04-27 (parte 4)

### 1. Implementações

**Commit `da225cc` — push origin/main ✅ — 4 arquivos:**
- `squads/ml-captura-squad/tasks/check-connection-status.md` — criado (whatsapp-recovery-agent)
- `squads/ml-captura-squad/tasks/reconnect-whatsapp.md` — criado (whatsapp-recovery-agent)
- `squads/ml-captura-squad/tasks/monitor-connection.md` — criado (whatsapp-recovery-agent)
- `squads/ml-captura-squad/squad.yaml` — tasks check-connection-status, reconnect-whatsapp, monitor-connection adicionadas

**Commit `7fbd936` — push origin/main ✅ — 2 arquivos:**
- `database/migrations/022_captura_diagnostics_validation.sql` — tabelas diagnostic_runs (pipeline-debugger) + validation_log (webhook-validator)
- `database/migrations/rollbacks/022_captura_diagnostics_validation_rollback.sql` — rollback correspondente

### 2. Decisões

- **GAP-006 encerrado**: whatsapp-recovery-agent declarava 3 tasks inexistentes — criadas e registradas no squad.yaml
- **diagnostic_runs**: registra execuções do Trace (pipeline-debugger) — campos tipo (quick|full), root_cause, evidencias, steps_executados, correcao_aplicada
- **validation_log**: append-only (sem updated_at), armazena só rejeições do Lex (webhook-validator) — payload_hash SHA-256, motivo_rejeicao codificado
- **entity-registry WARN ignorado**: install --force sobrescreve settings.json (80 deny rules) — resolver com backup+restore quando necessário
- **Seed tipo='multi' bloqueado**: não existe clínica com esse perfil ainda — aguarda caso real de negócio

### 3. Todos ativos

- [ ] SHE: autoClaude v1.0 → v3.0 nos 14 agentes do software-house-elite (baixa prioridade)
- [ ] entity-registry 132h+ desatualizado: backup settings.json → install --force → restore (quando necessário)
- [ ] Seed SQL tipo='multi': BLOQUEADO — aguarda clínica com serviço multi

---
## Sessão 2026-04-27 (parte 5)

### 1. Implementações

**Commit `ee6c8ec` — push origin/main ✅ — 14 arquivos:**
- squads/software-house-elite/agents/*.md (todos 14): autoClaude v1.0 → v3.0
  - version: '3.0', migratedAt: '2026-04-27T00:00:00.000Z'
  - selfCritique removido (não consta no template v3.0)
  - enterprise-architect.md: canExecute: false preservado (intencional)

**Meta-auditoria (@icarus) — sem alterações, apenas verificação:**
- 9 squads ML: tasks vs squad.yaml — 100% alinhado
- 9 squads ML: agentes vs squad.yaml — 100% alinhado
- 3 tasks criadas (check-connection, reconnect, monitor) — campos obrigatórios OK
- 14 agentes SHE: version, migratedAt, exec_fields, mem_fields — todos corretos
- 58/58 agentes ML em autoClaude v3.0

### 2. Decisões

- **SHE autoClaude v3.0**: selfCritique removido de todos os 14 agentes — não faz parte do template v3.0 padrão
- **enterprise-architect canExecute: false**: preservado intencionalmente — agente de design, não executa código
- **entity-registry WARN ignorado**: install --force sobrescreve settings.json (80 deny rules) — fix requer backup+restore manual
- **Seed tipo='multi' bloqueado**: aguarda clínica real com serviço multi — não é gap técnico, é dependência de negócio
- **Meta-auditoria limpa**: nenhum gap remanescente após verificação cruzada de todos os squads ML

### 3. Todos ativos

- [ ] entity-registry 132h+: backup settings.json → npx aiox-core install --force → restore (quando necessário)
- [ ] Seed SQL tipo='multi': BLOQUEADO — aguarda clínica com serviço multi

---
## Sessão 2026-04-27 (parte 6)

### 1. Implementações

**Sincronização SHE → Omega Laser e Estetica.IA:**
- Omega Laser: squads/software-house-elite/agents/*.md (14 arquivos) — v1.0 → v3.0 — commit 4fb4424 → push main ✅
- Estetica.IA: squads/software-house-elite/agents/*.md (14 arquivos) — v1.0 → v3.0 — commit 1f8d74c → push master ✅

**Migração vendas-consultivas-estetica (Omega Laser):**
- squads/vendas-consultivas-estetica/agents/*.md (17 arquivos) — v1.0 → v3.0 — commit 51b9bcf → push main ✅
- lead-registry.md: ignorado intencionalmente (type: service, não é agente de IA)
- selfCritique removido de 7 agentes que tinham o campo

**Meta-auditoria @icarus — verificação final:**
- 3 projetos auditados: ML Laboratory, Omega Laser, Estetica.IA
- Todos os squads e agentes verificados — nenhum gap remanescente

### 2. Decisões

- **lead-registry.md não migrado**: type: service, não possui frontmatter agent:, não é agente de IA — aplicar autoClaude seria incorreto
- **Fluxo de sync entre projetos**: ML Laboratory é a fonte de verdade do SHE — atualizações devem ser aplicadas lá primeiro, depois copiadas via cp para Omega Laser e Estetica.IA
- **selfCritique removido**: não faz parte do schema v3.0 — campo descontinuado

### 3. Todos ativos

- [ ] entity-registry 132h+: backup settings.json → npx aiox-core install --force → restore (quando necessário)
- [ ] Seed SQL tipo='multi': BLOQUEADO — aguarda clínica com serviço multi

**Estado final dos agentes (todos os projetos):**
- ML Laboratory: 58 agentes ML + 14 SHE = 72 agentes — 100% em v3.0
- Omega Laser: 14 SHE + 17 vendas-consultivas = 31 agentes — 100% em v3.0
- Estetica.IA: 6 esteticaia-produto + 14 SHE = 20 agentes — 100% em v3.0

---
## Sessão 2026-04-28 (parte 6 — compact-preserve)

### 1. Implementações

**Redis Dedup Check — validado em produção**
- Teste: 2 envios com mesmo `message_id` → 1 registro em `ml_captura.mensagens_raw`
- Exec dedup 11ms mais rápida que a normal (saída antecipada no nó Redis IF)
- Nova mensagem com ID diferente inserida normalmente — pipeline íntegro

**Entity Registry regenerado**
- Arquivo: `.aiox-core/data/entity-registry.yaml`
- Comando: `node .aiox-core/development/scripts/populate-entity-registry.js`
- 750 entidades, 100% resolution rate, `settings.json` intocado

**Migration 023 criada e aplicada em produção**
- Arquivo: `database/migrations/023_comercial_objecoes_unique.sql`
- Arquivo: `database/migrations/rollbacks/023_comercial_objecoes_unique_rollback.sql`
- Constraint: `uq_objecoes_tipo_texto UNIQUE (tipo_objecao, texto_objecao)` em `ml_comercial.objecoes`
- Corrige falha `Executar objecoes SQL` no pipeline ML-ANALISE — commit `adc7e20`

**Fix de Segurança — Anthropic API Key**
- Arquivo: `docs/workflows/ml-analise.json` (2 ocorrências → `REDACTED`)
- Histórico reescrito via `git filter-branch` (5 commits, nunca publicados)
- Force push `--force-with-lease` para `origin/main` — commit HEAD `8c48a2f`

**CONTEXT.md e session-plan atualizados**
- Pendências concluídas marcadas `[x]`: Redis Dedup, entity-registry, migration 022 (já aplicada), migration 023

### 2. Decisões

- **entity-registry via populate script** (não `install --force`): script é standalone, escreve só em `.aiox-core/data/entity-registry.yaml`, zero risco ao `settings.json`
- **Migration 023 (constraint + upsert)**: código n8n já usava `ON CONFLICT (tipo_objecao, texto_objecao)` corretamente — faltava só o constraint no banco
- **filter-branch + force push**: API key estava em commit local não publicado (`c7df83c`) — reescrever histórico foi seguro; `--force-with-lease` garante sem sobrescrever trabalho remoto desconhecido

### 3. Todos ativos

- [ ] **Story 1.1 task 2.6**: teste mono-agente — enviar msg e confirmar `agente_humano_id` = Kátia
- [ ] **Story 1.1 tasks 2.7–2.8**: BLOQUEADAS — aguarda clínica multi-agente
- [ ] **Rotacionar Anthropic API Key** — URGENTE: a key ficou em histórico local antes da correção
- [ ] `docs/workflows/ml-analise.json` e `ml-captura.json` — exportar versão atualizada do n8n (atual tem `REDACTED` onde estava a key)
- [ ] Nós com mojibake (double-encoding) no ML-ANALISE — renomear para ASCII puro (baixa prioridade)
- [ ] Seed SQL `tipo='multi'`: BLOQUEADO — aguarda clínica com serviço multi
- [ ] `fix_objecoes.py` e `.claude/settings.json.bak` — arquivos soltos, decidir se adicionar ao `.gitignore`

---
## Sessão 2026-04-28 (parte 7 — compact-preserve)

### 1. Implementações

**Anthropic API Key atualizada no n8n**
- Workflow ML-ANALISE (`UthiBdEQma4DiVhL`): 2 nós HTTP Request atualizados via API PUT
- Nova key: `sk-ant-api03-I4UH3CX11nze2...lnY09gAA` (específica para ML)
- Arquivo: `memory/credentials.md` atualizado

**Story 1.1 task 2.6 — teste mono-agente PASS**
- Webhook simulado → sessão criada com `agente_humano_id = 55c1950e-cc7e-405f-a27d-bff44647c485` (Kátia - Cosmobeauty)
- Pipeline `Lookup Setor → Enriquecer → Resolver Atendente → Upsert sessao` funcionando

### 2. Decisões

- **API key Anthropic**: era 1 key compartilhada entre todos os projetos, nomeada "estetica-ia" no console. Usuário criou key específica pro ML; Estetica-IA ainda usa a antiga (usuário atualizará depois)
- **Multi-agente incompleto**: `identificador_externo` é referenciado no `Lookup Agente Multi` mas nunca definido no workflow atual — feature incompleta
- **Dois cenários multi-agente levantados** (usuário ainda não decidiu):
  - Cenário A: múltiplos números, 1 agente por número → usar `tipo='mono'` com `agente_default` diferente (sem mudança no pipeline)
  - Cenário B: 1 número, múltiplos atendentes com roteamento dinâmico → implementar extração de `identificador_externo` no pipeline

### 3. Todos ativos

- [ ] **Definir cenário multi-agente** (A ou B) — aguarda resposta do usuário
- [ ] **Story 1.1 tasks 2.7–2.8**: BLOQUEADAS — aguarda definição/implementação multi-agente
- [ ] **Atualizar API key Estetica-IA** — usuário fará depois
- [ ] **Exportar workflows n8n atualizados** — ml-analise.json e ml-captura.json no repo têm REDACTED onde estava a key
- [ ] **`fix_objecoes.py` e `.claude/settings.json.bak`** — adicionar ao .gitignore ou remover
- [ ] Nós com mojibake no ML-ANALISE — baixa prioridade

---
## Sessão 2026-04-28 (parte 6)

### 1. Implementações

**Story 1.1 — Validação mono-agente (task 2.6)**
- Confirmado via banco: 1.175 msgs individuais capturadas, todas as sessões com `agente_humano_id = Kátia (55c1950e-cc7e-405f-a27d-bff44647c485)`
- Task 3.2 (story 1.1) marcada como concluída
- CONTEXT.md e session-plan.md atualizados

**Migration 024 — Onboarding de parceiros externos**
- `database/migrations/024_projetos_onboarding.sql` — ADD COLUMN email, telefone, setor, onboarding_token (UUID), onboarding_status em `_plataforma.projetos`
- `database/migrations/rollbacks/024_projetos_onboarding_rollback.sql`
- Aplicada com sucesso no Railway

**Portal Next.js — Feature completa de onboarding externo (commit 8b55d63)**
- `portal-next/app/admin/parceiros/novo/page.tsx` — tela admin criar parceiro
- `portal-next/app/api/admin/parceiros/route.ts` — POST: cria projeto no banco, envia e-mail (Resend) + WhatsApp (Evolution)
- `portal-next/app/onboarding/[token]/page.tsx` — página pública para técnico do parceiro configurar Evolution deles
- `portal-next/app/api/onboarding/[token]/route.ts` — GET: retorna dados do projeto pelo token
- `portal-next/app/api/onboarding/conectar/route.ts` — POST: chama Evolution do parceiro via API, insere instancia_evolution + numeros_projeto, atualiza status=conectado
- `portal-next/app/p/[slug]/perfil/page.tsx` — aba Perfil no espaço do parceiro (dados + status conexão)
- `portal-next/components/Sidebar.tsx` — item "Perfil" adicionado como 2º item do menu
- `portal-next/lib/types.ts` — ProjetoCompleto extends Projeto
- `portal-next/app/page.tsx` — botão "Novo Parceiro" na home
- `portal-next/package.json` — resend instalado

**Credencial salva:** Resend API Key `re_MhciXG3c_Mgeh2nZpgd8YxLVNXVMvdycK`

---

### 2. Decisões

- **Onboarding caso B (Evolution própria do parceiro):** admin cria parceiro no Portal → link enviado por WhatsApp + e-mail → técnico do parceiro preenche URL/APIKey/instância → sistema configura webhook via REST na Evolution deles automaticamente. Sem interação técnica do parceiro.
- **Sem n8n para este fluxo:** lógica de criação e configuração feita direto nas API routes Next.js (padrão mais simples dado que Portal já tem acesso ao banco).
- **telefone como numero_whatsapp fallback:** campo `numero_whatsapp` em `numeros_projeto` usa o telefone do projeto quando não há campo separado no formulário de onboarding.
- **Agente_humano multi:** identificador_externo vem da plataforma do parceiro (Redrive-like) — não da Evolution. Precisamos inspecionar payload real após primeira mensagem do parceiro para mapear o campo correto.
- **Mono-agente não precisa de decisão de atribuição:** o ML Lab apenas lê o `identificador_externo` que a plataforma envia — a atribuição é responsabilidade do sistema do parceiro.

---

### 3. Todos Ativos

**Story 1.1 — Pendentes bloqueados:**
- Task 2.7: teste multi-agente com `identificador_externo` válido — BLOQUEADO: aguarda primeiro parceiro multi-agente fazer onboarding e enviar mensagem real
- Task 2.8: teste multi-agente com `identificador_externo` desconhecido — mesmo bloqueio

**Pós-onboarding do primeiro parceiro multi-agente:**
- Inspecionar `metadados` em `mensagens_raw` para identificar campo do agente na plataforma deles
- Cadastrar agentes com `identificador_externo` correto
- Ajustar nó ML-CAPTURA para ler esse campo

**Pendências gerais (CONTEXT.md):**
- Seed ai:sdr, ai:closer, ai:agendamento → após onboarding EsteticaIA
- Avisar EsteticaIA: endpoint `/webhook/ml/external/esteticaia` pronto
- Nós com nomes mojibake no ML-ANALISE (`UthiBdEQma4DiVhL`) — renomear para ASCII
- Seed SQL tipo='multi': BLOQUEADO — aguarda clínica com serviço multi real
- Stories 3.1–3.2 (EsteticaIA): aguarda homologação

**Env vars a configurar no Railway (portal-next):**
- `RESEND_API_KEY=re_MhciXG3c_Mgeh2nZpgd8YxLVNXVMvdycK`
- `RESEND_FROM=onboarding@mlaboratory.com.br`
- `PORTAL_URL=https://portal-ml-production.up.railway.app`

---
## Sessão 2026-04-28 (parte 7 — Gage @devops)

### 1. Implementações

**Variáveis de ambiente adicionadas no Railway (serviço portal-ml):**
- `RESEND_API_KEY=re_MhciXG3c_Mgeh2nZpgd8YxLVNXVMvdycK`
- `RESEND_FROM=onboarding@mlaboratory.com.br`
- `PORTAL_URL=https://portal-ml-production.up.railway.app`
- Redeploy automático disparado pelo Railway

### 2. Decisões

- **Nome real do serviço Railway:** `portal-ml` (não `portal-next`) — descoberto via `railway variables` no diretório `portal-next/`
- **Vars adicionadas via Railway CLI** (não pelo dashboard) — mais rápido e rastreável

### 3. Todos Ativos

**Próximo passo imediato:**
- Testar fluxo completo: acessar `https://portal-ml-production.up.railway.app/admin/parceiros/novo`, criar parceiro, verificar envio de e-mail (Resend) + WhatsApp (Evolution), validar link de onboarding público

**Pendências da Story 1.1:**
- Task 2.7: multi-agente com `identificador_externo` válido — BLOQUEADO: aguarda primeiro parceiro multi-agente
- Task 2.8: multi-agente com `identificador_externo` desconhecido — mesmo bloqueio

**Pendências gerais:**
- Seed ai:sdr, ai:closer, ai:agendamento → após onboarding EsteticaIA
- Avisar EsteticaIA: endpoint `/webhook/ml/external/esteticaia` pronto
- Nós com mojibake no ML-ANALISE (`UthiBdEQma4DiVhL`) — renomear para ASCII
- Stories 3.1–3.2 (EsteticaIA): aguarda homologação

---
## Sessão 2026-04-29 (parte 8 — debug build Railway)

### 1. Implementações

**Diagnóstico e fix do build Railway:**
- Identificado: Railway servindo commit `41a94544` (antigo) em vez do `b444b139` (novo com admin route)
- Causa raiz: Nixpacks tem 2 camadas `COPY . /app/.` — primeira (cached) usa arquivos antigos → `npm ci` instala pacotes do `package-lock.json` antigo (sem `resend`) → build falha com `Module not found: @/lib/db` em cascata
- Fix aplicado: `NIXPACKS_NO_CACHE=1` adicionado como env var no Railway → força build sem cache
- Novo deploy triggerado via Railway GraphQL API com commit `b444b139` + cache limpo
- Status no momento do compact: 2 deployments em BUILDING (`7ffe81ce`, `50f46692`)

### 2. Decisões

- **Root cause do 404:** Railway estava no commit `41a94544` ("adiciona __pycache__ ao .gitignore") — muito mais antigo que nosso código. O `railway redeploy` executado anteriormente fez redeploy de um commit antigo.
- **Solução de cache:** `NIXPACKS_NO_CACHE=1` — evita que Nixpacks reutilize layers Docker antigas que continham `package-lock.json` sem `resend`
- **Deploy via API GraphQL:** `serviceInstanceDeploy` com `commitSha` completo é a forma correta de garantir que o Railway builde um commit específico do GitHub

### 3. Todos Ativos

**IMEDIATO — aguardando build terminar:**
- Verificar se deployment `7ffe81ce` ou `50f46692` virou SUCCESS
- Testar `https://portal-ml-production.up.railway.app/admin/parceiros/novo`
- Se passar: criar parceiro de teste, validar e-mail (Resend) + WhatsApp + link de onboarding

**Após build confirmar:**
- Remover `NIXPACKS_NO_CACHE=1` (pode ficar, mas aumenta build time desnecessariamente após primeiro build limpo)
- Ou manter — não prejudica funcionalidade

**Pendências da Story 1.1 (bloqueadas):**
- Task 2.7: multi-agente com `identificador_externo` válido — aguarda primeiro parceiro multi
- Task 2.8: multi-agente com `identificador_externo` desconhecido — mesmo bloqueio

**Pendências gerais:**
- Avisar EsteticaIA: endpoint `/webhook/ml/external/esteticaia` pronto
- Nós mojibake no ML-ANALISE (`UthiBdEQma4DiVhL`)
- Seed ai:sdr, ai:closer, ai:agendamento → após onboarding EsteticaIA

**Credenciais Railway:**
- Service `portal-ml` ID: `616c8604-6a56-441f-a5e4-90d8033adf1d`
- Environment `production` ID: `8d833424-d179-44c0-9eb5-d73004c3d1a6`
- Project ID: `8fe26ff4-e569-4738-8b77-2489bfde67b8`
