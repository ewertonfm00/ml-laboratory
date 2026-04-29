# ML Laboratory — Contexto do Projeto
**Projeto:** Laboratório de Inteligência Aplicada a Negócios
**Última sessão:** 2026-04-29 — Falha silenciosa email/WhatsApp corrigida (commit 55c2eb8) + investigação Opção B (workflow webhook externo)

---

## Próximo passo imediato

**PRIORIDADE 1:** Concluir 3 decisões pendentes da Opção B (agente_humano_id NULL vs auto-criar, áudio salvar URL vs transcrever, duplicate flag) → disparar subagente para construir workflow ML-CAPTURA-EXTERNAL no n8n
**PRIORIDADE 2:** Conectar número WhatsApp ao ML Laboratory via QR Code
**PRIORIDADE 3:** Decidir Cenário B multi-agente — atribuição manual vs round-robin

---

## Pendências

### WORKFLOW WEBHOOK EXTERNO (NOVA FRENTE — em progresso)
- [ ] Confirmar 3 decisões técnicas restantes (Q2 agente_humano_id, Q3 áudio, Q4 duplicate flag) — `fonte='external_partner'` já aprovado
- [ ] Construir workflow ML-CAPTURA-EXTERNAL.json via subagente: webhook em `/ml/external/:slug`, valida Bearer contra `_plataforma.projetos.webhook_api_key`, INSERT em `ml_captura.mensagens_raw`
- [ ] Importar e ativar workflow no n8n via API
- [ ] Teste E2E com curl simulando parceiro (cadastrar → ativar key → POST → verificar inserção)
- [ ] Commit do workflow JSON exportado

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
- Postgres público: `postgresql://postgres:LdMDvxoqOaYxlEgRnfqSpykBNpvZvNQa@mainline.proxy.rlwy.net:13932/railway`
- Schema mensagens: `ml_captura.mensagens_raw` — `message_id` UNIQUE → dedupe nativo
- Credencial Postgres no n8n: `FO9GgjXtERNuCglX` ("ML Postgres")
- n8n API key + demais credenciais em `memory/credentials.md`
- Parceiros cadastrados (3): Ewerton Locações (teste, slug `ewerton-locacoes`), Estética IA (`estetica-ia`), Machine Learning (`machine-learning`)
