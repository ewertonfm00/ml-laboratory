# ML Laboratory — Contexto do Projeto
**Projeto:** Laboratório de Inteligência Aplicada a Negócios
**Última sessão:** 2026-04-21 (validação completa dos squads ML — 12/12 ✅)

---

## Próximo passo imediato

**PRIORIDADE 1:** Conectar número WhatsApp via portal (ação manual — escanear QR Code).

Acessar: `https://portal-ml-production.up.railway.app/numeros/conectar`
Preencher: número (5516…), nome identificador, setor → escanear QR Code.

---

## Pendências

### SQUADS ML — OPERACIONALIZAÇÃO
- [ ] Implementar workflows n8n das tasks criadas (começar por ml-captura: configure-webhook → collect-messages → transcribe-audio)
- [ ] Seed inicial do segment-catalog-manager (catálogo vazio inutiliza Saída 2)

### CONEXÃO WHATSAPP
- [ ] Acessar `/numeros/conectar` e escanear QR Code
- [ ] Enviar mensagem de teste e capturar payload bruto no n8n
- [ ] Adaptar nó "Normalizar Payload" para formato real do payload
- [ ] Validar inserção em `ml_captura.mensagens_raw`

### SEED MASTER
- [ ] Usuário passa e-mail + senha → gerar SQL → executar no Railway

### TESTES (aguardam WhatsApp conectado)
- [ ] Story 1.1 tasks 2.6–2.8: testes mono/multi com WhatsApp real
- [ ] Story 1.2 tasks 3.1–3.2: testes E2E payload EsteticaIA (aguarda homologação)
- [ ] Seed ai:sofia-sdr, ai:sofia-closer, ai:sofia-agendador → após onboarding EsteticaIA

### DASHBOARD
- [ ] Forçar redeploy portal-ml no Railway (bloqueio do dashboard de conversas)
- [ ] Confirmar schema real via `/api/diagnostico` e fazer fix definitivo

### GIT
- [ ] Push dos 6 commits locais para origin/main (`@devops`)

---

## Infraestrutura Railway — Estado Atual

| Serviço | Status | Detalhe |
|---------|--------|---------|
| Postgres | ✅ Ativo | 19 migrations executadas (001→019) |
| n8n | ✅ Ativo | 20+ workflows, ML-CAPTURA publicado |
| Evolution API | ✅ Ativo | Pronta, aguardando QR Code |
| Portal Next.js | ✅ HTTP 200 | `https://portal-ml-production.up.railway.app` |
| Metabase | ✅ Ativo | — |

## Squads ML — Estado Atual (validação 12/12 ✅)

| Squad | Agentes | Tasks | Validação |
|-------|---------|-------|-----------|
| ml-captura | 6 | 3 | ✅ |
| ml-data-eng | 5 | 3 | ✅ |
| ml-ia-padroes | 8 | 3 | ✅ |
| ml-plataforma | 5 | 3 | ✅ |
| ml-skills | 6 | 3 | ✅ |
| ml-comercial | 9 | 6 | ✅ |
| ml-atendimento | 4 | 3 | ✅ |
| ml-financeiro | 3 | 4 | ✅ |
| ml-marketing | 3 | 3 | ✅ |
| ml-operacional | 3 | 3 | ✅ |
| ml-pessoas | 3 | 3 | ✅ |
| ml-orquestrador | 5 | 4 | ✅ |

## Contexto técnico

- Portal: `https://portal-ml-production.up.railway.app`
- Webhook ML-CAPTURA: `https://n8n-production-47d0.up.railway.app/webhook/ml/webhook/whatsapp`
- n8n: `ewertonfm00@gmail.com` / `Senha1234`
- Evolution API Key: `ml-evo-key-2026`
- Postgres: `postgresql://postgres:LdMDvxoqOaYxlEgRnfqSpykBNpvZvNQa@mainline.proxy.rlwy.net:13932/railway`
- Projeto no banco: `omega-laser-locacoes` (id: 7bd3cbf2-cb83-42fa-a6bf-f52a57d99ea5)
