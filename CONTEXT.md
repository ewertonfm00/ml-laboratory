# ML Laboratory — Contexto do Projeto
**Projeto:** Laboratório de Inteligência Aplicada a Negócios
**Última sessão:** 2026-04-29 — Railway build corrigido (Dockerfile + Resend lazy init + schema_prefix); formulário de parceiros em teste

---

## Próximo passo imediato

**PRIORIDADE 1:** Testar `/admin/parceiros/novo` em produção após deploy `d0e0533` (Railway ~2 min)
**PRIORIDADE 2:** Decidir atribuição multi-agente — Cenário B: atribuição manual vs round-robin?
**PRIORIDADE 3:** Conectar número WhatsApp ao ML Laboratory via QR Code

---

## Pendências

### PORTAL NEXT.JS — TESTE PENDENTE
- [ ] Testar formulário `/admin/parceiros/novo` em produção após deploy `d0e0533`
- [ ] Confirmar fluxo completo: cadastro → e-mail enviado → WhatsApp enviado → link de onboarding gerado

### PIPELINE ML-ANALISE (`UthiBdEQma4DiVhL`)
- [ ] Nós com double-encoding nos nomes (mojibake) — renomear para ASCII em próxima manutenção

### SEED / CADASTROS
- [ ] Seed ai:sdr, ai:closer, ai:agendamento → após onboarding EsteticaIA
- [ ] Avisar EsteticaIA: endpoint pronto em `/webhook/ml/external/esteticaia`

### TESTES
- [ ] Story 1.1 tasks 2.7–2.8: BLOQUEADAS (aguarda decisão Cenário B multi-agente)
- [ ] Story 1.2 tasks 3.1–3.2: testes E2E payload EsteticaIA (aguarda homologação)

### DECISÃO PENDENTE
- [ ] Cenário B multi-agente: atribuição manual (supervisor distribui) vs automática (round-robin)

### INFRA
- [ ] Conectar número WhatsApp ao ML Laboratory (escanear QR Code)

---

## Infraestrutura Railway — Estado Atual

| Serviço | Status | Detalhe |
|---------|--------|---------|
| Postgres | ✅ Ativo | Migrations 001–024 aplicadas |
| n8n | ✅ Ativo | ML-CAPTURA + ML-ANALISE ativos, pipeline completo |
| Evolution API | ✅ Ativo | `ml-5516988456918` conectado, `state: open` |
| Portal Next.js | ✅ Railway | `https://portal-ml-production.up.railway.app` (Dockerfile multi-stage) |
| Metabase | ✅ Ativo | `https://metabase-production-11a7.up.railway.app` |

## Contexto técnico

- Webhook ML-CAPTURA: `https://n8n-production-47d0.up.railway.app/webhook/ml/webhook/whatsapp`
- Workflow ML-CAPTURA: ID `eM0qnKGXShlOuCsV`
- Workflow ML-ANALISE: ID `UthiBdEQma4DiVhL` (roda a cada 5 min, analisa sessões prontas)
- Postgres público: `postgresql://postgres:LdMDvxoqOaYxlEgRnfqSpykBNpvZvNQa@mainline.proxy.rlwy.net:13932/railway`
- Número WhatsApp ativo: `5516988456918` (tipo: mono, agente_default: Katia — 55c1950e-cc7e-405f-a27d-bff44647c485)
- n8n API key e demais credenciais em `memory/credentials.md`
- DB Railway: usar banco `railway` (dados reais) — `postgres` está vazio
- Portal builder: DOCKERFILE (multi-stage, node:20-alpine) — nixpacks substituído
