# ML Laboratory — Contexto do Projeto
**Projeto:** Laboratório de Inteligência Aplicada a Negócios
**Última sessão:** 2026-04-23 (pipeline ML-CAPTURA validado, bugs n8n corrigidos)

---

## Próximo passo imediato

**PRIORIDADE 1:** Validar upsert `sessoes_conversa` — enviar mensagem de teste e confirmar que `total_mensagens` incrementa e `updated_at` atualiza.

Último fix aplicado: `INSERT ON CONFLICT DO UPDATE` + remoção de referência a `mr.agente_humano_id` — ainda não confirmado funcionando.

---

## Pendências

### PIPELINE DE CAPTURA
- [ ] Confirmar que `sessoes_conversa` está sendo atualizado após último fix (`285b767`)
- [ ] n8n workflow JSON tem encoding corrompido (curly quotes U+201C/U+201D + mojibake em-dash) — sanitização manual necessária a cada atualização via API

### SEED MASTER
- [ ] Usuário passa e-mail + senha → gerar SQL → executar no Railway

### TESTES
- [ ] Story 1.1 tasks 2.6–2.8: testes mono/multi com WhatsApp real
- [ ] Story 1.2 tasks 3.1–3.2: testes E2E payload EsteticaIA (aguarda homologação)
- [ ] Seed ai:sdr, ai:closer, ai:agendamento → após onboarding EsteticaIA
- [ ] Avisar EsteticaIA: endpoint pronto em `/webhook/ml/external/esteticaia`

### SQUADS ML — OPERACIONALIZAÇÃO
- [ ] Implementar workflows n8n das tasks criadas (começar por ml-captura)
- [ ] Seed inicial do segment-catalog-manager (Saída 2 inoperante sem catálogo)
- [ ] Migrar 62 agentes para formato completo do template — `@icarus *scan-agents all`

### GIT
- [ ] Push dos commits locais para origin/main (`@devops`) — branch 10+ commits à frente

---

## Infraestrutura Railway — Estado Atual

| Serviço | Status | Detalhe |
|---------|--------|---------|
| Postgres | ✅ Ativo | 19 migrations executadas |
| n8n | ✅ Ativo | ML-CAPTURA ativo, 3 bugs corrigidos esta sessão |
| Evolution API | ✅ Ativo | `ml-5516988456918` conectado, `state: open` |
| Portal Next.js | ✅ HTTP 200 | `https://portal-ml-production.up.railway.app` |
| Metabase | ✅ Ativo | — |

## Pipeline ML-CAPTURA — Estado dos Nós

| Nó | Status | Observação |
|----|--------|-----------|
| Webhook Evolution API | ✅ | Recebendo `messages.upsert` |
| Normalizar Payload | ✅ | `$json.body \|\| $json` — corrigido |
| Lookup Setor | ✅ | `projeto_id` preenchido corretamente |
| Inserir mensagens_raw | ✅ | Confirmado com dados reais |
| Upsert sessoes_conversa | ⚠️ | Fix aplicado, aguarda validação |

## Contexto técnico

- Portal: `https://portal-ml-production.up.railway.app`
- Webhook ML-CAPTURA: `https://n8n-production-47d0.up.railway.app/webhook/ml/webhook/whatsapp`
- Postgres público: `postgresql://postgres:LdMDvxoqOaYxlEgRnfqSpykBNpvZvNQa@mainline.proxy.rlwy.net:13932/railway`
- Projeto no banco: Machine Learning (id: 9c22ad6e-ca38-48d4-8dbb-51bbcadf67a2)
