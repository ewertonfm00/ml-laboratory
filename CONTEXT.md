# ML Laboratory — Contexto do Projeto
**Projeto:** Laboratório de Inteligência Aplicada a Negócios
**Última sessão:** 2026-04-25 (compact-preserve trigger: 15 → 10 trocas, commit b16e199)

---

## Próximo passo imediato

**PRIORIDADE 1:** Story 1.1 task 2.8 — teste multi-agente com `identificador_externo` desconhecido (requer número `tipo=multi` configurado).

**PRIORIDADE 2:** Seed `ai:sdr`, `ai:closer`, `ai:agendamento` — aguarda onboarding instância EsteticaIA via portal QR Code.

---

## Pendências

### PIPELINE DE CAPTURA
- [ ] n8n workflow JSON com encoding corrompido (curly quotes + mojibake) — sanitização manual a cada atualização via API

### SEED / CADASTROS
- [ ] Seed ai:sdr, ai:closer, ai:agendamento → após onboarding EsteticaIA
- [ ] Avisar EsteticaIA: endpoint pronto em `/webhook/ml/external/esteticaia`

### TESTES
- [ ] Story 1.1 task 2.8: teste multi-agente com identificador_externo desconhecido (deve gravar null) — requer número tipo=multi
- [ ] Story 1.2 tasks 3.1–3.2: testes E2E payload EsteticaIA (aguarda homologação)

### SQUADS ML — OPERACIONALIZAÇÃO
- [ ] `*enrich-segment estetica-equipamentos` — só após primeiro deploy real de agente validado

---

## Infraestrutura Railway — Estado Atual

| Serviço | Status | Detalhe |
|---------|--------|---------|
| Postgres | ✅ Ativo | 21 migrations executadas |
| n8n | ✅ Ativo | ML-CAPTURA ativo (16 nós), debug pipeline ativo, configure-webhook ativo |
| Evolution API | ✅ Ativo | `ml-5516988456918` conectado, `state: open` |
| Portal Next.js | ✅ HTTP 200 | `https://portal-ml-production.up.railway.app` |
| Metabase | ✅ Ativo | — |

## Contexto técnico

- Webhook ML-CAPTURA: `https://n8n-production-47d0.up.railway.app/webhook/ml/webhook/whatsapp`
- Debug pipeline: `POST https://n8n-production-47d0.up.railway.app/webhook/ml/captura/debug` (id: ndNJ8wXr1xoN8ZAs)
- Configure-webhook: `POST https://n8n-production-47d0.up.railway.app/webhook/ml/configure/webhook` body: `{"instancia_nome":"ml-{numero}"}` (id: kDtiUtT7tS9572mQ)
- EsteticaIA: `POST https://n8n-production-47d0.up.railway.app/webhook/ml/external/esteticaia`
- Postgres público: `postgresql://postgres:LdMDvxoqOaYxlEgRnfqSpykBNpvZvNQa@mainline.proxy.rlwy.net:13932/railway`
- Projeto no banco: Machine Learning (id: 9c22ad6e-ca38-48d4-8dbb-51bbcadf67a2)
- Número WhatsApp ativo: `5516988456918` (tipo: mono, agente_default: Katia — 55c1950e-cc7e-405f-a27d-bff44647c485)
- 1.229 mensagens capturadas, 90 sessões ativas
