# Onboarding — AIOX Machine Learning

**Projeto:** Laboratório de Inteligência Aplicada a Negócios  
**Última atualização:** 2026-04-21

---

## Visão Geral

Plataforma de ML que captura conversas de WhatsApp de múltiplos projetos (clientes), processa via agentes de IA e disponibiliza análises no Portal. Recebe dados do projeto EsteticaIA via webhook.

---

## Estado Atual do Projeto

| Componente | Status |
|------------|--------|
| Infraestrutura Railway (Postgres, n8n, Evolution, Portal) | ✅ Ativo |
| Portal Next.js — todas as rotas | ✅ HTTP 200 |
| 18 migrations Postgres (001→018) | ✅ Executadas |
| Workflow ML-CAPTURA (n8n) | ✅ Publicado |
| WhatsApp conectado | ❌ Pendente (QR Code) |

---

## Infraestrutura Railway

| Serviço | URL / Endpoint | Status |
|---------|----------------|--------|
| Portal Next.js | https://portal-ml-production.up.railway.app | ✅ |
| n8n | https://n8n-production-47d0.up.railway.app | ✅ |
| Evolution API | (Railway interno) | ✅ Pronta |
| Postgres | mainline.proxy.rlwy.net:13932 | ✅ |
| Metabase | (Railway interno) | ✅ |

---

## Credenciais de Acesso

> ⚠️ **As credenciais reais NÃO ficam neste arquivo** (repositório é público).
> Consultar no Railway dashboard ou no arquivo local `.env` (gitignored).

| Sistema | Usuário/Key | Onde consultar |
|---------|-------------|----------------|
| n8n | `ewertonfm00@gmail.com` | senha no `.env` local ou cofre pessoal |
| Evolution API Key | `EVOLUTION_API_KEY` | Railway → service `evolution-api-ml` → Variables |
| Postgres | `DATABASE_URL` | Railway → service `Postgres` → Variables |

---

## Webhooks

| Webhook | URL |
|---------|-----|
| ML-CAPTURA (WhatsApp) | https://n8n-production-47d0.up.railway.app/webhook/ml/webhook/whatsapp |
| Externo EsteticaIA | https://n8n-production-47d0.up.railway.app/webhook/ml/external/esteticaia |

---

## Portal — Rotas Disponíveis

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

---

## Pendências Abertas

### CONEXÃO WHATSAPP (prioridade 1)
- [ ] Acessar `/numeros/conectar` e escanear QR Code
- [ ] Enviar mensagem de teste e capturar payload bruto no n8n
- [ ] Adaptar nó "Normalizar Payload" para formato real do payload
- [ ] Validar inserção em `ml_captura.mensagens_raw`

### SEED MASTER
- [ ] Usuário passa e-mail + senha → gerar SQL → executar no Railway

### TESTES (aguardam WhatsApp conectado)
- [ ] Story 1.1 tasks 2.6–2.8: testes mono/multi com WhatsApp real
- [ ] Story 1.2 tasks 3.1–3.2: testes E2E payload EsteticaIA (aguarda homologação)
- [ ] Seed `ai:sdr`, `ai:closer`, `ai:agendamento` → após onboarding EsteticaIA

---

## Banco de Dados

- Schema principal: `ml_captura`
- 18 migrations aplicadas (001→018)
- Projeto de referência no banco: `omega-laser-locacoes` (id: 7bd3cbf2-cb83-42fa-a6bf-f52a57d99ea5)

---

## Integração com EsteticaIA

O projeto EsteticaIA envia dados via:
- **Fan-out WF01**: POST para `ML_WEBHOOK_URL` com payload de cada mensagem recebida
- **Endpoint `/api/ml-messages`**: grava na tabela `ml_messages` do Postgres EsteticaIA
- **`client_id`**: `clinica-piloto` identifica a clínica no banco ML

---

## Fluxo ML-CAPTURA (n8n)

```
WhatsApp → Webhook → Normalizar Payload → Inserir ml_captura.mensagens_raw
                                        → Processar agente IA
                                        → Atualizar portal
```

---

## Git

- Branch principal: `master`
- Remote: origin/master
