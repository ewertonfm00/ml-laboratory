# ML Laboratory — Contexto do Projeto
**Projeto:** Laboratório de Inteligência Aplicada a Negócios
**Última sessão:** 2026-04-18 (sessão 9 — expansão portal, painel da clínica, novas telas)

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

### IDENTIFICAÇÃO DE AGENTE
- [ ] Verificar variáveis do Redrive expostas no chatflow (agente/atendente)
- [ ] Mapear campo do agente no nó Normalizar Payload

---

## Infraestrutura Railway — Estado Atual

| Serviço | Status | Detalhe |
|---------|--------|---------|
| Postgres | ✅ Ativo | 14 migrations executadas (001→014) |
| n8n | ✅ Ativo | 20 workflows, ML-CAPTURA publicado |
| Evolution API | ✅ Ativo | Pronta, nenhuma instância conectada |
| Portal Next.js | ✅ Deploy OK | `https://portal-ml-production.up.railway.app` |
| Appsmith | ⚠️ Abandonado | Ainda no ar — remover quando conveniente |
| Metabase | ✅ Ativo | — |

## Portal — Rotas Disponíveis

| Rota | Tela |
|------|------|
| `/numeros/conectar` | Conectar número WhatsApp |
| `/p/[slug]/numeros` | Números conectados |
| `/p/[slug]/clinica` | Cadastro do Negócio |
| `/p/[slug]/procedimentos` | Produtos / Serviços (30 itens) |
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
