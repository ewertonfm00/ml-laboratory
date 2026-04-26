# ML Laboratory — Contexto do Projeto
**Projeto:** Laboratório de Inteligência Aplicada a Negócios
**Última sessão:** 2026-04-26 (fix Redis Dedup Check + validação portal conversas)

---

## Próximo passo imediato

**PRIORIDADE 1:** Enviar mensagem teste para `5516988456918` e confirmar `contato_nome` sendo gravado em `sessoes_conversa` (fix Redis Dedup Check aplicado esta sessão — pipeline deve processar agora).

**PRIORIDADE 2:** Story 1.1 task 2.8 — teste multi-agente com `identificador_externo` desconhecido (requer número `tipo=multi` configurado).

---

## Pendências

### PIPELINE DE CAPTURA
- [ ] Confirmar `contato_nome` sendo gravado após fix Redis Dedup Check — enviar mensagem teste e checar banco
- [ ] n8n workflow JSON local desatualizado — nó Redis Dedup Check foi corrigido via API (`continueOnFail: true`), JSON local precisa ser sincronizado
- [ ] Encoding corrompido no workflow JSON (curly quotes + mojibake) — sanitização manual a cada atualização via API

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
| n8n | ✅ Ativo | ML-CAPTURA ativo, Redis Dedup Check com continueOnFail=true |
| Evolution API | ✅ Ativo | `ml-5516988456918` conectado, `state: open` |
| Portal Next.js | ✅ Ativo | drill-down conversas validado (2026-04-26) |
| Metabase | ✅ Ativo | `https://metabase-production-11a7.up.railway.app` |

## Contexto técnico

- Webhook ML-CAPTURA: `https://n8n-production-47d0.up.railway.app/webhook/ml/webhook/whatsapp`
- Debug pipeline: `POST https://n8n-production-47d0.up.railway.app/webhook/ml/captura/debug`
- Configure-webhook: `POST https://n8n-production-47d0.up.railway.app/webhook/ml/configure/webhook`
- EsteticaIA: `POST https://n8n-production-47d0.up.railway.app/webhook/ml/external/esteticaia`
- Postgres público: `postgresql://postgres:LdMDvxoqOaYxlEgRnfqSpykBNpvZvNQa@mainline.proxy.rlwy.net:13932/railway`
- Projeto no banco: Machine Learning (id: 9c22ad6e-ca38-48d4-8dbb-51bbcadf67a2)
- Número WhatsApp ativo: `5516988456918` (tipo: mono, agente_default: Katia — 55c1950e-cc7e-405f-a27d-bff44647c485)
- Workflow ML-CAPTURA: ID `eM0qnKGXShlOuCsV`, n8n API key em credentials.md
