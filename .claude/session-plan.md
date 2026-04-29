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
- [ ] Atualizar UI `/admin/parceiros/novo` p/ multi-setor (form com lista de setores + backend cria N entradas em numeros_projeto)
- [ ] Validar email Resend sandbox em produção (Railway recuperou — env nova ativa)
- [ ] **Push (devops)**: commit `878fc22` no main local — aguarda @devops para push remoto
- [ ] Limpar dados de teste do banco (manual-test-001/002, agente atd-007, sessão)

## Concluído
- [x] **Commit `878fc22`**: feat(external-partner) — migration 026 (`numeros_projeto` nullable + UNIQUE em `agentes_humanos`) + workflow JSON `ml-captura-external.json`. AIOX Doctor 15/15 PASS. Aguarda @devops para push — 2026-04-29
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
