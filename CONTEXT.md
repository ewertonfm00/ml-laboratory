# ML Laboratory — Contexto do Projeto
**Projeto:** Laboratório de Inteligência Aplicada a Negócios
**Última sessão:** 2026-04-27 (fix Redis Dedup Check — contato_nome gravando + pipeline end-to-end validado)

---

## Próximo passo imediato

**PRIORIDADE 1:** Sincronizar JSON local do ML-CAPTURA com a versão em produção (Redis Dedup Check foi corrigido via API, local está desatualizado).

**PRIORIDADE 2:** Rodar testes pendentes das Stories 1.1 e 1.2 (ver seção Testes abaixo).

---

## Pendências

### PIPELINE DE CAPTURA
- [x] `contato_nome` sendo gravado — confirmado "Ewerton Margonar" após fix Redis Dedup Check (2026-04-27) ✅
- [ ] n8n workflow JSON local desatualizado — Redis Dedup Check corrigido via API, JSON local precisa sincronizar
- [ ] Encoding corrompido no workflow JSON (curly quotes + mojibake) — usar código ASCII-only em toda edição via API
- [ ] Reimplementar lógica Redis no Dedup Check (atualmente pass-through — sem deduplicação real)

### SEED / CADASTROS
- [ ] Seed ai:sdr, ai:closer, ai:agendamento → após onboarding EsteticaIA
- [ ] Avisar EsteticaIA: endpoint pronto em `/webhook/ml/external/esteticaia`

### TESTES
- [ ] Story 1.1 task 2.6: teste mono-agente — enviar msg e confirmar `agente_humano_id` = Kátia
- [ ] Story 1.1 task 2.8: teste multi-agente com `identificador_externo` desconhecido (gravar null) — requer número tipo=multi
- [ ] Story 1.2 tasks 3.1–3.2: testes E2E payload EsteticaIA (aguarda homologação)

### SQUADS ML — OPERACIONALIZAÇÃO
- [ ] `*enrich-segment estetica-equipamentos` — só após primeiro deploy real de agente validado

---

## Infraestrutura Railway — Estado Atual

| Serviço | Status | Detalhe |
|---------|--------|---------|
| Postgres | ✅ Ativo | Migrations 001–017 executadas |
| n8n | ✅ Ativo | ML-CAPTURA ativo, Redis Dedup Check com continueOnFail=true |
| Evolution API | ✅ Ativo | `ml-5516988456918` conectado, `state: open` |
| Portal Next.js | ✅ Railway | `https://portal-ml-production.up.railway.app` (deployado 2026-04-26) |
| Metabase | ✅ Ativo | `https://metabase-production-11a7.up.railway.app` |

## Contexto técnico

- Portal ML: `https://portal-ml-production.up.railway.app/p/machine-learning/conversas`
- Webhook ML-CAPTURA: `https://n8n-production-47d0.up.railway.app/webhook/ml/webhook/whatsapp`
- Debug pipeline: `POST https://n8n-production-47d0.up.railway.app/webhook/ml/captura/debug`
- Postgres público: `postgresql://postgres:LdMDvxoqOaYxlEgRnfqSpykBNpvZvNQa@mainline.proxy.rlwy.net:13932/railway`
- Projeto no banco: Machine Learning (id: 9c22ad6e-ca38-48d4-8dbb-51bbcadf67a2)
- Número WhatsApp ativo: `5516988456918` (tipo: mono, agente_default: Katia — 55c1950e-cc7e-405f-a27d-bff44647c485)
- Workflow ML-CAPTURA: ID `eM0qnKGXShlOuCsV`, n8n API key em credentials.md
- DB Railway tem 2 bancos: `railway` (dados reais) e `postgres` (vazio — não usar)
