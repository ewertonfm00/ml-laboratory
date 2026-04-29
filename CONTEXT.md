# ML Laboratory — Contexto do Projeto
**Projeto:** Laboratório de Inteligência Aplicada a Negócios
**Última sessão:** 2026-04-29 (parte 11) — Workflow ML-CAPTURA-EXTERNAL ativo no n8n (5/5 E2E OK) + Railway voltou + 6 decisões workflow externo fechadas

---

## Próximo passo imediato

**PRIORIDADE 1:** Editar webhook node do workflow `paVFxFzH6sjW4Tyv` na UI do n8n — trocar Path `ml/external/app-omega-laser` → `ml/external/:slug`. API pública não aceita path-param dinâmico via POST/PATCH, só a UI registra rota dinâmica. Sem isso, cada parceiro precisaria de 1 workflow próprio (não escala).
**PRIORIDADE 2:** Após path dinâmico, ativar webhook_api_key e cadastrar setores via SQL pros parceiros `estetica-ia` e `machine-learning` (já no banco). Avisar EsteticaIA: endpoint pronto.
**PRIORIDADE 3:** Atualizar UI `/admin/parceiros/novo` p/ multi-setor (form com lista de setores).
**PRIORIDADE 4:** Validar email Resend sandbox em produção (env nova ativa após Railway voltar).
**PRIORIDADE 5:** Conectar número WhatsApp ao ML Laboratory via QR Code.
**PRIORIDADE 6:** Decidir Cenário B multi-agente — atribuição manual vs round-robin.

---

## Pendências

### WORKFLOW WEBHOOK EXTERNO ✅ ATIVO (parte 11)
- [x] 6 decisões técnicas fechadas (Q2/Q2.1/Q2.2/Q2.3/Q3/Q4) — ver `.claude/session-plan.md`
- [x] Workflow `ML-CAPTURA-EXTERNAL` construído + ativo (n8n ID `paVFxFzH6sjW4Tyv`) — JSON em `docs/workflows/ml-captura-external.json`
- [x] 5/5 cenários E2E validados (CLIENTE, ATENDENTE auto-criar, duplicata, bearer inválido, setor não cadastrado)
- [x] Migration 026 aplicada (`numeros_projeto.numero_whatsapp/instancia_id` nullable)
- [ ] **Editar Path do webhook na UI do n8n** → `ml/external/:slug` (atual: literal `ml/external/app-omega-laser`)
- [ ] Cadastrar webhook_api_key + numeros_projeto pros outros parceiros após path dinâmico
- [ ] Commit dos artefatos: `database/migrations/026_*.sql` + `docs/workflows/ml-captura-external.json`

### PORTAL NEXT.JS — VALIDAR CORREÇÃO EM PRODUÇÃO
- [ ] Após deploy do commit `55c2eb8` no Railway: criar parceiro de teste em `/admin/parceiros/novo`, verificar que tela de sucesso mostra ✅/⚠️ por canal com mensagem de erro real quando algo falha

### PIPELINE ML-ANALISE (`UthiBdEQma4DiVhL`)
- [ ] Nós com double-encoding nos nomes (mojibake) — renomear para ASCII em próxima manutenção

### SEED / CADASTROS
- [ ] Seed ai:sdr, ai:closer, ai:agendamento → após onboarding EsteticaIA
- [ ] Avisar EsteticaIA: endpoint pronto em `/webhook/ml/external/estetica-ia` (após workflow ativo)

### TESTES BLOQUEADOS
- [ ] Story 1.1 tasks 2.7–2.8: aguarda decisão Cenário B multi-agente
- [ ] Story 1.2 tasks 3.1–3.2: testes E2E payload EsteticaIA (aguarda homologação)

### DECISÃO PENDENTE
- [ ] Cenário B multi-agente: atribuição manual (supervisor distribui) vs automática (round-robin)

### INFRA
- [ ] Conectar número WhatsApp ao ML Laboratory (escanear QR Code)

---

## Infraestrutura Railway — Estado Atual

| Serviço | Status | Detalhe |
|---------|--------|---------|
| Postgres | ✅ Ativo | Migrations 001–025 aplicadas |
| n8n | ✅ Ativo | ML-CAPTURA + ML-ANALISE ativos. ML-CAPTURA-EXTERNAL: a construir |
| Evolution API | ✅ Ativo | `ml-5516988456918` conectado, `state: open` |
| Portal Next.js | ✅ Railway | `https://portal-ml-production.up.railway.app` (Dockerfile multi-stage) |
| Metabase | ✅ Ativo | `https://metabase-production-11a7.up.railway.app` |

## Contexto técnico

- Webhook ML-CAPTURA atual (Evolution): `https://n8n-production-47d0.up.railway.app/webhook/ml/webhook/whatsapp`
- Webhook ML-CAPTURA-EXTERNAL (a criar): `https://n8n-production-47d0.up.railway.app/webhook/ml/external/{slug}`
- Workflow ML-CAPTURA: ID `eM0qnKGXShlOuCsV` (template para o externo, exportado em `tmp/ml-captura-current.json` durante investigação)
- Workflow ML-ANALISE: ID `UthiBdEQma4DiVhL`
- Postgres público: `${DATABASE_URL}` (ver Railway env vars)
- Schema mensagens: `ml_captura.mensagens_raw` — `message_id` UNIQUE → dedupe nativo
- Credencial Postgres no n8n: `FO9GgjXtERNuCglX` ("ML Postgres")
- n8n API key + demais credenciais em `memory/credentials.md`
- Parceiros cadastrados (3): Ewerton Locações (teste, slug `ewerton-locacoes`), Estética IA (`estetica-ia`), Machine Learning (`machine-learning`)
