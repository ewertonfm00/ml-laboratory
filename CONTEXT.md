# ML Laboratory — Contexto do Projeto
**Projeto:** Laboratório de Inteligência Aplicada a Negócios
**Última sessão:** 2026-04-16 (portal Next.js commitado; aguardando deploy e conexão WhatsApp)

---

## Próximo passo imediato

**PRIORIDADE 1:** Build e deploy do portal Next.js no Railway.

```powershell
cd "Z:\My Folders\Projetos - Claude Code\AIOX - Machine Learning\portal-next"
npm install
npm run build
npm run dev   # validar em http://localhost:3000
```

Após validar local → deploy no Railway (ver `portal-next/DEPLOY.md`).

---

## Pendências

### PORTAL NEXT.JS — deploy
- [ ] Rodar `npm install` e `npm run build` localmente
- [ ] Testar rotas: `/`, `/numeros/conectar`, `/p/[slug]/numeros`, `/p/[slug]/validacao/fila`
- [ ] Deploy no Railway com variáveis: DATABASE_URL, N8N_SETUP_URL, EVOLUTION_API_URL, EVOLUTION_API_KEY

### PIPELINE DE CAPTURA — conexão do número
- [ ] Acessar portal Next.js → `/numeros/conectar`
- [ ] Preencher número WhatsApp (5511…), nome identificador, setor
- [ ] Escanear QR Code → instância Evolution ativa

### PÓS-CONEXÃO
- [ ] Enviar mensagem de teste e capturar payload bruto no n8n
- [ ] Adaptar nó "Normalizar Payload" para formato real do payload
- [ ] Validar inserção em `ml_captura.mensagens_raw`

### IDENTIFICAÇÃO DE AGENTE
- [ ] Verificar variáveis do Redrive expostas no chatflow (agente/atendente)
- [ ] Mapear campo do agente no nó Normalizar Payload

### SEED MASTER
- [ ] Usuário passa e-mail + senha → gerar SQL → executar no Railway

---

## Infraestrutura Railway — Estado Atual

| Serviço | Status | Detalhe |
|---------|--------|---------|
| Postgres | ✅ Ativo | 12 migrations executadas (001→012) |
| n8n | ✅ Ativo | 20 workflows, 17 ativos — ML-CAPTURA publicado |
| Evolution API | ✅ Ativo | Pronta, nenhuma instância conectada |
| Portal Next.js | ⏳ Pendente deploy | `portal-next/` commitado, Railway ainda não configurado |
| Appsmith | ❌ Abandonado | Substituído pelo portal Next.js |
| Metabase | ✅ Ativo | — |

## Arquitetura de Captura Atual

```
WhatsApp → Redrive chatflow
  → Bloco Requisição POST
    → n8n ML-CAPTURA (eM0qnKGXShlOuCsV)
      → Normalizar Payload → Postgres ml_captura.mensagens_raw
```

**Importantes:**
- Número 1632363666 exclusivo no Redrive — NÃO conectar na Evolution API própria
- Webhook global Redrive NÃO dispara para mensagens recebidas — usar bloco Requisição
- Nó Groq Whisper: authentication=none, usa `$vars.ML_GROQ_API_KEY`

## Contexto técnico

- Webhook ML-CAPTURA: `https://n8n-production-47d0.up.railway.app/webhook/ml/webhook/whatsapp`
- n8n: `ewertonfm00@gmail.com` / `Senha1234`
- Evolution API Key: `ml-evo-key-2026`
- Instância WhatsApp banco: `omega-laser-locacoes` (551632363666)
- Postgres: `postgresql://postgres:LdMDvxoqOaYxlEgRnfqSpykBNpvZvNQa@mainline.proxy.rlwy.net:13932/railway`
- Projeto no banco: `omega-laser-locacoes` (id: 7bd3cbf2-cb83-42fa-a6bf-f52a57d99ea5)
- Agentes cadastrados: Tabata, Rodrigo, Larissa, Ewerton
- Redrive: `ewerton@omegalaser.com.br` / `Solo@2026` | Bot UUID: `7cdb13fe-44c5-4e8b-b842-44e9c8fddeba`
