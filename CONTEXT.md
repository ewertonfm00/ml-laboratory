# ML Laboratory — Contexto do Projeto
**Projeto:** Laboratório de Inteligência Aplicada a Negócios
**Última sessão:** 2026-04-29 (parte 12) — Hardening: auth admin, scrub de credenciais, migration 027, fix 409, UI listagem/exclusão. 4 commits push em `851550e`. Senhas Postgres/Evolution/n8n + ADMIN_* rotacionadas.

---

## Próximo passo imediato

**P1:** Completar smoke test pós-deploy — bloqueado: usuário precisa fornecer `ADMIN_PASSWORD` ou rodar via UI `/admin/login`. Bloco 1.A (não-autenticado) já PASS 6/6.
**P2:** Aplicar migration 027 (`UNIQUE` parcial em `numeros_projeto(projeto_id, setor)`) via `psql "$DATABASE_URL" -f database/migrations/027_*.sql` após pré-validar duplicatas.
**P3:** Editar webhook `paVFxFzH6sjW4Tyv` na UI do n8n: Path `ml/external/app-omega-laser` → `ml/external/:slug`.
**P4:** Após path dinâmico, ativar `webhook_api_key` + cadastrar setores via UI `/admin/parceiros/novo` para `estetica-ia` e `machine-learning`. Avisar EsteticaIA.
**P5:** Limpar parceiros de teste via UI `/admin/parceiros` (Omega Laser Locações, App Omega Laser, Ewerton Locações).
**P6:** Conectar número WhatsApp ao ML Laboratory via QR Code.

---

## Pendências

### SMOKE TEST PÓS-DEPLOY (parte 12 ativa)
- [ ] Bloco 1.B: login com `ADMIN_PASSWORD` correta → cookie + GET autenticado em `/admin/parceiros` → 200
- [ ] Bloco 2: criar parceiro 2-setores autenticado → 1 row em `projetos` + 2 em `numeros_projeto`
- [ ] Bloco 3: validar índice da migration 027 em prod (após aplicação)
- [ ] Bloco 4: 2 parceiros mesmo nome → 2º retorna 409 PT-BR

### SEGURANÇA (manual)
- [ ] `EVOLUTION_API_KEY=ml-evo-key-2026` ainda em `infra/n8n/workflows/*.json` (3) e `logs-sessao/2026-04-13_*` — substituir por placeholders
- [ ] (Opcional) `git filter-repo` para apagar credenciais antigas do histórico público

### WORKFLOW WEBHOOK EXTERNO
- [ ] Editar Path do webhook na UI do n8n → `ml/external/:slug`
- [ ] Cadastrar `webhook_api_key` + `numeros_projeto` pros parceiros após path dinâmico
- [ ] Avisar EsteticaIA: endpoint pronto em `/webhook/ml/external/estetica-ia`

### LIMPEZA / OPS
- [ ] Excluir parceiros de teste via UI: `Omega Laser Locações`, `App Omega Laser`, `Ewerton Locações` + msgs `manual-test-001/002` + agente `atd-007` + sessão teste
- [ ] Pipeline ML-ANALISE (`UthiBdEQma4DiVhL`): renomear nós com double-encoding (mojibake) para ASCII

### TESTES BLOQUEADOS
- [ ] Story 1.1 tasks 2.7–2.8: aguarda decisão Cenário B multi-agente
- [ ] Story 1.2 tasks 3.1–3.2: testes E2E payload EsteticaIA (aguarda homologação)

### DECISÕES PENDENTES
- [ ] Cenário B multi-agente: atribuição manual (supervisor) vs automática (round-robin)
- [ ] Resend sandbox: aceita apenas `ewertonfm00@gmail.com` literal — verificar domínio em `resend.com/domains` se for liberar para outros

### INFRA
- [ ] Conectar número WhatsApp ao ML Laboratory (QR Code)
- [ ] Seed `ai:sdr`/`ai:closer`/`ai:agendamento` após onboarding EsteticaIA

---

## Infraestrutura Railway

| Serviço | Status | Detalhe |
|---------|--------|---------|
| Postgres | ✅ | Migrations 001–026 aplicadas · **027 pendente** · senha rotacionada 2026-04-29 |
| n8n | ✅ | ML-CAPTURA + ML-ANALISE + ML-CAPTURA-EXTERNAL (`paVFxFzH6sjW4Tyv`) ativos · senha owner rotacionada 2026-04-29 |
| Evolution API | ✅ | `ml-5516988456918` conectado · API key rotacionada 2026-04-29 |
| Portal Next.js | ✅ | `https://portal-ml-production.up.railway.app` · auth cookie HttpOnly em `/admin/login` (deploy `851550e` OK) |
| Metabase | ✅ | `https://metabase-production-11a7.up.railway.app` |

## Contexto técnico

- Webhook ML-CAPTURA (Evolution): `https://n8n-production-47d0.up.railway.app/webhook/ml/webhook/whatsapp`
- Webhook ML-CAPTURA-EXTERNAL: `https://n8n-production-47d0.up.railway.app/webhook/ml/external/{slug}` (path estático até editar UI)
- Postgres: `${DATABASE_URL}` (Railway env · host público `mainline.proxy.rlwy.net:13932`, db `railway`)
- Schema mensagens: `ml_captura.mensagens_raw` · `message_id` UNIQUE → dedupe nativo
- Auth portal: cookie `admin_session` HttpOnly · vars `ADMIN_PASSWORD` + `ADMIN_API_TOKEN` no service `portal-ml`
- Repo: `https://github.com/ewertonfm00/ml-laboratory.git` (PÚBLICO)
- Parceiros (5): 3 teste (Omega Laser Locações, App Omega Laser, Ewerton Locações) + 2 reais (Estética IA, Machine Learning)
