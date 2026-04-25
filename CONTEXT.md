# ML Laboratory — Contexto do Projeto
**Projeto:** Laboratório de Inteligência Aplicada a Negócios
**Última sessão:** 2026-04-25 (configure-webhook criado e testado, commit fe9e8c6)

---

## Próximo passo imediato

**PRIORIDADE 1:** Sincronizar JSON local `ML-CAPTURA-whatsapp-pipeline.json` com versão em produção (mudanças da sessão anterior foram feitas via API diretamente, arquivo local está desatualizado).

**PRIORIDADE 2:** Story 1.1 task 2.8 — teste multi-agente com identificador_externo desconhecido (requer número tipo=multi).

---

## Pendências

### PIPELINE DE CAPTURA
- [x] Workflow n8n `configure-webhook` — criado, importado e testado ✅ (id: kDtiUtT7tS9572mQ, commit fe9e8c6)
- [ ] Sincronizar JSON local `ML-CAPTURA-whatsapp-pipeline.json` com produção (mudanças via API direto na sessão anterior)
- [ ] n8n workflow JSON tem encoding corrompido (curly quotes + mojibake) — sanitização manual a cada atualização via API

### SEED / CADASTROS
- [ ] Seed ai:sdr, ai:closer, ai:agendamento → após onboarding EsteticaIA
- [ ] Avisar EsteticaIA: endpoint pronto em `/webhook/ml/external/esteticaia`

### TESTES
- [ ] Story 1.1 task 2.8: teste multi-agente com identificador_externo desconhecido (deve gravar null)
- [ ] Story 1.2 tasks 3.1–3.2: testes E2E payload EsteticaIA (aguarda homologação)

### SQUADS ML — OPERACIONALIZAÇÃO
- [ ] Seed inicial do segment-catalog-manager (Saída 2 inoperante sem catálogo)

---

## Infraestrutura Railway — Estado Atual

| Serviço | Status | Detalhe |
|---------|--------|---------|
| Postgres | ✅ Ativo | 20 migrations executadas |
| n8n | ✅ Ativo | ML-CAPTURA ativo (16 nós), debug pipeline ativo |
| Evolution API | ✅ Ativo | `ml-5516988456918` conectado, `state: open` |
| Portal Next.js | ✅ HTTP 200 | `https://portal-ml-production.up.railway.app` |
| Metabase | ✅ Ativo | — |

## Contexto técnico

- Webhook ML-CAPTURA: `https://n8n-production-47d0.up.railway.app/webhook/ml/webhook/whatsapp`
- Debug pipeline: `POST https://n8n-production-47d0.up.railway.app/webhook/ml/captura/debug` (id: ndNJ8wXr1xoN8ZAs)
- Configure-webhook: `POST https://n8n-production-47d0.up.railway.app/webhook/ml/configure/webhook` body: `{"instancia_nome":"ml-{numero}"}` (id: kDtiUtT7tS9572mQ)
- Postgres público: `postgresql://postgres:LdMDvxoqOaYxlEgRnfqSpykBNpvZvNQa@mainline.proxy.rlwy.net:13932/railway`
- Projeto no banco: Machine Learning (id: 9c22ad6e-ca38-48d4-8dbb-51bbcadf67a2)
- Número WhatsApp ativo: `5516988456918` (tipo: mono, agente_default_id: Katia — 55c1950e-cc7e-405f-a27d-bff44647c485)
- 1.229 mensagens capturadas, 90 sessões ativas (88 sem agente_humano_id vinculado)
