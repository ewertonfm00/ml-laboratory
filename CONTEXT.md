# ML Laboratory — Contexto do Projeto
**Projeto:** Laboratório de Inteligência Aplicada a Negócios
**Última sessão:** 2026-04-21 (sessão 11 — limpeza de arquivos, CLAUDE.md otimizado)

---

## Próximo passo imediato

**PRIORIDADE 1:** Conectar número WhatsApp via portal (ação manual — escanear QR Code).

Acessar: `https://portal-ml-production.up.railway.app/numeros/conectar`
Preencher: número (5516…), nome identificador, setor → escanear QR Code.

---

## Pendências

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

---

## Infraestrutura Railway — Estado Atual

| Serviço | Status | Detalhe |
|---------|--------|---------|
| Postgres | ✅ Ativo | 19 migrations executadas (001→019) |
| n8n | ✅ Ativo | 20+ workflows, ML-CAPTURA publicado |
| Evolution API | ✅ Ativo | Pronta, nenhuma instância conectada |
| Portal Next.js | ✅ HTTP 200 | `https://portal-ml-production.up.railway.app` |
| Metabase | ✅ Ativo | — |

## Portal — Rotas Disponíveis (todas funcionando)

| Rota | Tela |
|------|------|
| `/numeros/conectar` | Conectar número WhatsApp (QR Code) |
| `/p/[slug]/numeros` | Números conectados |
| `/p/[slug]/clinica` | Cadastro do Negócio (9 seções + procedimentos) |
| `/p/[slug]/procedimentos` | Produtos / Serviços |
| `/p/[slug]/materiais` | Materiais Técnicos |
| `/p/[slug]/metodologias` | Metodologias de Vendas |
| `/p/[slug]/conversas` | Conversas capturadas |
| `/p/[slug]/agente` | Perfil DISC + Painel Performance |
| `/p/[slug]/skills` | Skills |
| `/p/[slug]/validacao/fila` | Fila de Validação |

## Contexto técnico

- Portal: `https://portal-ml-production.up.railway.app`
- Webhook ML-CAPTURA: `https://n8n-production-47d0.up.railway.app/webhook/ml/webhook/whatsapp`
- n8n: `ewertonfm00@gmail.com` / `Senha1234`
- Evolution API Key: `ml-evo-key-2026`
- Postgres: `postgresql://postgres:LdMDvxoqOaYxlEgRnfqSpykBNpvZvNQa@mainline.proxy.rlwy.net:13932/railway`
- Projeto no banco: `omega-laser-locacoes` (id: 7bd3cbf2-cb83-42fa-a6bf-f52a57d99ea5)
