# ML Laboratory — Contexto do Projeto
**Projeto:** Laboratório de Inteligência Aplicada a Negócios
**Última sessão:** 2026-04-28 — pipeline ML-ANALISE funcionando (8 bugs corrigidos, status=success)

---

## Próximo passo imediato

**PRIORIDADE 1:** Decidir atribuição multi-agente — Cenário B confirmado (1 número, vários atendentes): atribuição manual (supervisor) ou automática (round-robin)?
**PRIORIDADE 2:** Story 1.1 task 2.6 — teste mono-agente: enviar msg e confirmar `agente_humano_id` = Kátia

---

## Pendências

### PIPELINE ML-ANALISE (`UthiBdEQma4DiVhL`)
- [x] **Objeções:** migration 023 aplicada — `uq_objecoes_tipo_texto` UNIQUE (tipo_objecao, texto_objecao) — commit 49a52d8
- [ ] Nós com double-encoding nos nomes (mojibake) — considerar renomear para ASCII puro em próxima manutenção

### PIPELINE DE CAPTURA (`eM0qnKGXShlOuCsV`)
- [x] JSON exportados em `docs/workflows/` (ml-analise.json + ml-captura.json) — 2026-04-28

### INFRA / MANUTENÇÃO
- [x] entity-registry: regenerado via `populate-entity-registry.js` (750 entidades, zero risco) — 2026-04-28
- [x] Migration 022 (`diagnostic_runs` + `validation_log`) — aplicada em produção ✅

### SEED / CADASTROS
- [ ] Seed ai:sdr, ai:closer, ai:agendamento → após onboarding EsteticaIA
- [ ] Avisar EsteticaIA: endpoint pronto em `/webhook/ml/external/esteticaia`

### TESTES
- [ ] Story 1.1 task 2.6: teste mono-agente — enviar msg e confirmar `agente_humano_id` = Kátia
- [ ] Story 1.1 tasks 2.7–2.8: BLOQUEADAS (aguarda clínica multi-agente)
- [ ] Story 1.2 tasks 3.1–3.2: testes E2E payload EsteticaIA (aguarda homologação)

---

## Infraestrutura Railway — Estado Atual

| Serviço | Status | Detalhe |
|---------|--------|---------|
| Postgres | ✅ Ativo | Migrations 001–022 aplicadas |
| n8n | ✅ Ativo | ML-CAPTURA + ML-ANALISE ativos, pipeline completo exceto objeções |
| Evolution API | ✅ Ativo | `ml-5516988456918` conectado, `state: open` |
| Portal Next.js | ✅ Railway | `https://portal-ml-production.up.railway.app` |
| Metabase | ✅ Ativo | `https://metabase-production-11a7.up.railway.app` |

## Contexto técnico

- Webhook ML-CAPTURA: `https://n8n-production-47d0.up.railway.app/webhook/ml/webhook/whatsapp`
- Workflow ML-CAPTURA: ID `eM0qnKGXShlOuCsV`
- Workflow ML-ANALISE: ID `UthiBdEQma4DiVhL` (roda a cada 5 min, analisa sessões prontas)
- Postgres público: `postgresql://postgres:LdMDvxoqOaYxlEgRnfqSpykBNpvZvNQa@mainline.proxy.rlwy.net:13932/railway`
- Número WhatsApp ativo: `5516988456918` (tipo: mono, agente_default: Katia — 55c1950e-cc7e-405f-a27d-bff44647c485)
- n8n API key e demais credenciais em `memory/credentials.md`
- DB Railway: usar banco `railway` (dados reais) — `postgres` está vazio
