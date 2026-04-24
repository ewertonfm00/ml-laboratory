# ML Laboratory — Contexto do Projeto
**Projeto:** Laboratório de Inteligência Aplicada a Negócios
**Última sessão:** 2026-04-24 (auditoria Icarus — 51 agentes migrados, 3 novos agentes, gate segmento corrigido)

---

## Próximo passo imediato

**PRIORIDADE 1:** Fornecer dados do agente humano (nome + identificador) para seed em `_plataforma.agentes_humanos` e `agente_default_id` no número `5516988456918` — pré-requisito para testes 2.6–2.8.

**PRIORIDADE 2:** Importar `ML-CAPTURA-whatsapp-pipeline.json` atualizado na UI do n8n (lógica mono/multi não está ativa em produção).

---

## Pendências

### PIPELINE DE CAPTURA
- [ ] Confirmar que `sessoes_conversa` está sendo atualizado após último fix (`285b767`)
- [ ] Importar workflow `ML-CAPTURA-whatsapp-pipeline.json` atualizado na UI do n8n (lógica mono/multi não ativa)
- [ ] n8n workflow JSON tem encoding corrompido (curly quotes + mojibake) — sanitização manual a cada atualização via API

### SEED / CADASTROS
- [ ] Seed MASTER: usuário passa e-mail + senha → gerar SQL → executar no Railway
- [ ] Seed agente humano em `agentes_humanos` + vincular `agente_default_id` ao número `5516988456918`
- [ ] Seed ai:sdr, ai:closer, ai:agendamento → após onboarding EsteticaIA
- [ ] Avisar EsteticaIA: endpoint pronto em `/webhook/ml/external/esteticaia`

### TESTES
- [ ] Story 1.1 tasks 2.6–2.8: testes mono/multi com WhatsApp real (bloqueado: agentes_humanos vazia)
- [ ] Story 1.2 tasks 3.1–3.2: testes E2E payload EsteticaIA (aguarda homologação)

### SQUADS ML — OPERACIONALIZAÇÃO
- [ ] Implementar workflows n8n das tasks criadas (começar por ml-captura)
- [ ] Seed inicial do segment-catalog-manager (Saída 2 inoperante sem catálogo)

---

## Infraestrutura Railway — Estado Atual

| Serviço | Status | Detalhe |
|---------|--------|---------|
| Postgres | ✅ Ativo | 19 migrations executadas, migration 015 aplicada |
| n8n | ✅ Ativo | ML-CAPTURA ativo, workflow mono/multi pendente de import |
| Evolution API | ✅ Ativo | `ml-5516988456918` conectado, `state: open` |
| Portal Next.js | ✅ HTTP 200 | `https://portal-ml-production.up.railway.app` |
| Metabase | ✅ Ativo | — |

## Contexto técnico

- Webhook ML-CAPTURA: `https://n8n-production-47d0.up.railway.app/webhook/ml/webhook/whatsapp`
- Postgres público: `postgresql://postgres:LdMDvxoqOaYxlEgRnfqSpykBNpvZvNQa@mainline.proxy.rlwy.net:13932/railway`
- Projeto no banco: Machine Learning (id: 9c22ad6e-ca38-48d4-8dbb-51bbcadf67a2)
- Número WhatsApp ativo: `5516988456918` (tipo: mono, agente_default_id: NULL — pendente seed)
- 89 sessões existentes, agente_humano_id todas NULL (workflow não importado)
