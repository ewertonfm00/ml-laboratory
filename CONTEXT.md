# ML Laboratory — Contexto do Projeto
**Projeto:** Laboratório de Inteligência Aplicada a Negócios
**Última sessão:** 2026-04-28 — cenário multi-agente confirmado (tipo B: 1 número / N atendentes); .gitignore, CONTEXT e session-log atualizados

---

## Próximo passo imediato

**PRIORIDADE 1:** Decidir atribuição multi-agente — Cenário B (1 número, vários atendentes): atribuição manual pelo supervisor ou automática (round-robin)?
**PRIORIDADE 2:** Story 1.1 tasks 2.7–2.8 — testes multi-agente (BLOQUEADO: aguarda decisão Cenário B)
**PRIORIDADE 3:** Seed ai:sdr, ai:closer, ai:agendamento — após onboarding EsteticaIA

---

## Pendências

### PIPELINE ML-ANALISE (`UthiBdEQma4DiVhL`)
- [ ] Nós com double-encoding nos nomes (mojibake) — renomear para ASCII em próxima manutenção

### SEED / CADASTROS
- [ ] Seed ai:sdr, ai:closer, ai:agendamento → após onboarding EsteticaIA
- [ ] Avisar EsteticaIA: endpoint pronto em `/webhook/ml/external/esteticaia`

### TESTES
- [x] Story 1.1 task 2.6: CONCLUÍDO — pipeline confirmado: 1.175 msgs capturadas, todas as sessões com `agente_humano_id = Kátia (55c1950e)` ✅ (2026-04-28)
- [ ] Story 1.1 tasks 2.7–2.8: BLOQUEADAS (aguarda clínica multi-agente)
- [ ] Story 1.2 tasks 3.1–3.2: testes E2E payload EsteticaIA (aguarda homologação)

### DECISÃO PENDENTE
- [ ] Cenário B multi-agente: atribuição manual (supervisor distribui) vs automática (round-robin) — usuário ainda decidindo

---

## Infraestrutura Railway — Estado Atual

| Serviço | Status | Detalhe |
|---------|--------|---------|
| Postgres | ✅ Ativo | Migrations 001–023 aplicadas |
| n8n | ✅ Ativo | ML-CAPTURA + ML-ANALISE ativos, pipeline completo |
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
