# Execution Plan
_Criado em 2026-04-21 — atualizado pelo agente a cada task_

## Decisões
- **Seed tipo='multi' bloqueado**: não existe clínica com esse perfil ainda — seed só será criado quando houver caso real de negócio
- **entity-registry via populate script**: `node .aiox-core/development/scripts/populate-entity-registry.js` — zero risco, não toca settings.json
- **Q2 (agente_humano_id) = B**: auto-criar em `_plataforma.agentes_humanos` — 2026-04-29
- **Modelo mono/multi no cadastro do parceiro**: mono recebe nome do atendente no form; multi recebe `atendente_id` no payload do webhook — 2026-04-29
- **RESEND_FROM = sandbox `onboarding@resend.dev`** provisório enquanto não há domínio próprio — 2026-04-29

## Decisões finais workflow externo (todas fechadas em 2026-04-29)
- **Q2 = B**: auto-criar em `agentes_humanos` por `(projeto_id, identificador_externo)`
- **Q2.1 = A original**: payload traz `atendente_id` estável + `atendente_nome` mutável (separados)
- **Q2.2 = Caminho A puro**: `numeros_projeto` aproveitado integralmente — migration nullable em `numero_whatsapp` e `instancia_id`. N entradas por parceiro (1 por setor)
- **Q2.3 = A**: setor desconhecido no payload → 400 (força admin cadastrar antes)
- **Q3 = A**: áudio salva URL em `mensagens_raw.audio_url`, transcrição em batch separado
- **Q4 = B**: duplicata responde 200 com `{ "duplicate": true, "message_id": "..." }`

## Pendente
- [ ] Seed SQL tipo='multi': BLOQUEADO — aguarda clínica com serviço multi
- [ ] **Editar webhook node via UI do n8n**: trocar Path `ml/external/app-omega-laser` → `ml/external/:slug` no workflow `paVFxFzH6sjW4Tyv`. API pública não aceita path-param dinâmico, só a UI
- [ ] Após path dinâmico: testar com `estetica-ia` e `machine-learning` (já no banco) + cadastrar setores + ativar webhook_api_key
- [ ] **🔴 AÇÃO MANUAL USUÁRIO** (não pode ser feito por código): rotacionar no Railway dashboard — (1) senha do user `postgres` no Postgres, (2) `EVOLUTION_API_KEY` (vazada também), (3) senha do owner do n8n (`Senha1234` — fraca + exposta). Repo é PÚBLICO em `github.com/ewertonfm00/ml-laboratory` — credenciais antigas continuam no histórico do git mesmo após remoção do head. Considerar `git filter-repo` se for crítico apagar histórico.
- [ ] **🟡 SECURITY MEDIUM (descoberto no caminho)**: `EVOLUTION_API_KEY` (`ml-evo-key-2026`) ainda exposta em `infra/n8n/workflows/*.json` (3 arquivos) e `logs-sessao/2026-04-13_infra-railway.md`. Workflows n8n geralmente embarcam credentials por design — avaliar caso a caso se substitui por placeholder ou aceita rotação.
- [ ] **AÇÃO MANUAL USUÁRIO**: aplicar migration 027 em produção via `psql "$DATABASE_URL" -f database/migrations/027_numeros_projeto_unique_setor.sql` — pré-validar que não há duplicatas ativas (query no commit `1fe1110`)
- [ ] **AÇÃO MANUAL USUÁRIO**: setar no Railway (service `portal-ml`) antes do redeploy: `ADMIN_PASSWORD=<senha forte 16+ chars>` e `ADMIN_API_TOKEN=$(openssl rand -hex 32)`. Sem isso, login retorna 500.
- [ ] Validar email Resend sandbox em produção: **bloqueado pelo sandbox** — Resend aceita apenas o email LITERAL `ewertonfm00@gmail.com`. Tags `+algo` causam `validation_error`. Registrar como limitação até verificar domínio em resend.com/domains
- [ ] Limpar dados de teste do banco — agora via UI `/admin/parceiros` (botão "Excluir definitivamente") ou via SQL manual. Alvos: parceiros de teste (`teste-env-resend` deletado · `app-omega-laser` x2 · `ewerton-locacoes`) + msgs `manual-test-001/002` + agente `atd-007`

## Concluído
- [x] **Issue 4 QA — slug duplicado retorna 409 (`851550e`)**: catch detecta `error.code === '23505'` e retorna `{ "error": "Já existe parceiro com nome similar (slug duplicado)" }` com HTTP 409 Conflict. Demais erros mantêm 500 — 2026-04-29
- [x] **Issue 3 QA — migration 027 UNIQUE parcial (`1fe1110`)**: `CREATE UNIQUE INDEX IF NOT EXISTS numeros_projeto_proj_setor_ativo_unique ON _plataforma.numeros_projeto (projeto_id, setor) WHERE ativo = true`. Não aplicada em prod (manual) — 2026-04-29
- [x] **Issue 2 QA — admin auth com cookie HttpOnly (`cfe0dc0`)**: `/admin/login` (page) + `POST /api/admin/login` (timingSafeEqual sobre `ADMIN_PASSWORD`, seta cookie `admin_session`=`ADMIN_API_TOKEN` 7 dias) + `middleware.ts` (redirect `/admin/*` exceto `/login`) + `lib/admin-auth.ts::requireAdminAuth` aplicado nos 4 handlers `/api/admin/parceiros/*` (GET, POST, PATCH, DELETE). `.env.example` atualizado. Build OK (middleware Edge 26.6 kB) — 2026-04-29
- [x] **Issue 1 QA — credenciais hardcoded removidas (`a98ec40`)**: 5 arquivos versionados sanitizados — `CONTEXT.md`, `.claude/session-log.md`, `reset-n8n.bat` (com guard de env), `portal-next/DEPLOY.md`, `docs/onboarding.md`. Removidos: senha Postgres, `EVOLUTION_API_KEY=ml-evo-key-2026`, senha n8n `Senha1234`. AÇÃO MANUAL pendente: rotacionar todas no Railway — 2026-04-29
- [x] **QA gate UI multi-setor (`27d6157`) — CONCERNS** com 4 issues abertas como pendentes (2 SECURITY): testes negativos 5/5 PASS (T1-T5: `{}`, sem setores, [], inválido, não-array) · positivo (3 setores) gerou 1 row em `projetos` com CSV `"comercial,atendimento,pessoas"` + 3 rows em `numeros_projeto` (`nome_identificador`="qa-mult-... - {Label}", `numero_whatsapp/instancia_id NULL`, `multi_agente=false`) · atomicidade (slug dup) PASS — counts intactos pós-rollback · Resend sandbox confirmou rejeição de tags `+` (limitação documentada) · Evolution rejeita números fake (esperado) · cleanup dos 4 rows de teste OK. Issues: postgres URL em CONTEXT.md, sem auth em /api/admin, sem UNIQUE em `numeros_projeto(projeto_id, setor)`, 500 em vez de 409 — 2026-04-29
- [x] **Listagem + exclusão de parceiros (`4bd4b61`)**: `/admin/parceiros` com toggle "Mostrar inativos", botões Desativar/Reativar (PATCH soft delete) e Excluir Definitivamente (DELETE hard delete em transação). Hard delete varre 12 tabelas filhas sem cascade (mensagens_raw, sessoes_conversa, validações, skills_avaliacoes/analises, agentes_humanos, numeros_projeto, instancias_evolution) + audit_log SET projeto_id=NULL. Modal exige digitar nome exato do projeto, validado também no backend. `tsc --noEmit` OK · push origin/main OK — 2026-04-29
- [x] **UI multi-setor `/admin/parceiros/novo`**: form com 6 checkboxes (`comercial`, `atendimento`, `operacional`, `financeiro`, `marketing`, `pessoas`); backend transacional (BEGIN/COMMIT/ROLLBACK) cria 1 entrada em `projetos` + N em `numeros_projeto` com `nome_identificador = "{nome} - {Setor}"`, `numero_whatsapp/instancia_id = NULL`. Validação no front e back. `next build` OK, `tsc --noEmit` OK — 2026-04-29
- [x] **Commits 2026-04-29 (4 commits no remote)**: `878fc22` feat(external-partner) migration 026 + workflow JSON · `d54bf22` chore(scripts) clickup_send.py com env var (token antigo já revogado no ClickUp) · `faf1aa3` chore(session) fechamento parte 11 · `27d6157` feat(parceiros) UI multi-setor. AIOX Doctor 15/15 PASS · push origin/main OK — 2026-04-29
- [x] **Workflow ML-CAPTURA-EXTERNAL**: ativo no n8n (ID `paVFxFzH6sjW4Tyv`). 5/5 cenários E2E validados (CLIENTE, ATENDENTE auto-criar, duplicata, bearer inválido, setor não cadastrado). Migration 026 aplicada (numeros_projeto nullable). Setup `app-omega-laser` (webhook_api_key + numero comercial). Pendente: editar path para `:slug` na UI do n8n — 2026-04-29
- [x] **Railway recuperou**: deployment `2b525cc4` SUCCESS. Portal HTTP 200. Env `RESEND_FROM=onboarding@resend.dev` em uso — 2026-04-29
- [x] Tela `/onboarding/[token]` validada visualmente em 2 passos (endpoint + api_key). POST `/api/onboarding/conectar` testado E2E via curl: grava `webhook_api_key` + status `pendente→conectado`. Bug fix da falha silenciosa email confirmado funcionando em produção (mostra erro real do Resend) — 2026-04-29
- [x] Env Railway `RESEND_FROM` alterada para `ML Laboratory <onboarding@resend.dev>` (sandbox). Deploy travou em QUEUED — issue separado — 2026-04-29
- [x] Falha silenciosa no envio de e-mail/WhatsApp corrigida em portal-next/app/api/admin/parceiros/route.ts: funções retornam status, handler reporta no response, UI mostra ✅/⚠️ com mensagem de erro. Texto do email atualizado para o novo fluxo (sem credenciais Evolution). Build OK. — 2026-04-29
- [x] Story 1.1 task 2.6: mono-agente validado em produção — 1.175 msgs, agente_humano_id = Kátia em 100% das sessões — 2026-04-28
- [x] Onboarding parceiros externos: migration 024 + 8 arquivos Portal (admin, onboarding público, aba perfil, Sidebar, types) — 2026-04-28
- [x] GAP-006: 3 tasks do whatsapp-recovery-agent criadas + squad.yaml atualizado — commit da225cc
- [x] Migration 022: diagnostic_runs + validation_log — commit 7fbd936
- [x] SHE: 14 agentes autoClaude v1.0 → v3.0 — commit ee6c8ec (+ sync Omega Laser e Estetica.IA)
- [x] Redis Dedup Check: pass-through substituído por 3 nós Redis reais (GET + IF + SET, TTL 24h) — workflow eM0qnKGXShlOuCsV ativo
- [x] Redis Dedup Check validado em produção: 2 envios com mesmo message_id → 1 registro no banco. Exec dedup 11ms mais rápido (saída antecipada no nó IF). Nova msg com ID diferente inserida normalmente — 2026-04-28
- [x] entity-registry regenerado via populate script (750 entidades, 100% resolution rate) — sem tocar settings.json — 2026-04-28
