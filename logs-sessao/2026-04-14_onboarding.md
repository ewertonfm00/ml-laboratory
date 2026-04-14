# Log de Sessão — 2026-04-14

## Resumo
Sessão focada em criar solução de onboarding para clientes leigos (sem terminal). Criado workflow n8n completo que permite a um cliente preencher um formulário e receber um QR Code para conectar o WhatsApp da empresa. Acesso ao n8n continua bloqueado da sessão anterior.

---

## Contexto retomado

- Sessão anterior (2026-04-13) terminou por limite de contexto enquanto tentava criar o workflow
- O objetivo era: cliente preenche formulário → QR Code aparece na tela → escaneia → conectado
- Acesso ao n8n ainda bloqueado (senha perdida, SMTP não configurado)

---

## O que foi feito

### Workflow ML-ONBOARDING criado
- Arquivo: `infra/n8n/workflows/ML-ONBOARDING-conectar-cliente.json`
- 8 nodes em sequência:
  1. **Form Trigger** — formulário público com 4 campos (empresa, WhatsApp, responsável, setor)
  2. **Code — Preparar Dados** — sanitiza input, valida número, gera slug e `instance_name = 'ml-{slug}'`
  3. **HTTP Request — Criar Instância Evolution** — `POST /instance/create` com `qrcode: true`
  4. **Postgres — Inserir Projeto** — upsert em `_plataforma.projetos`
  5. **Postgres — Inserir Instância** — insert em `_plataforma.instancias_evolution`
  6. **Postgres — Inserir Número** — insert em `_plataforma.numeros_projeto` (status: `teste`)
  7. **HTTP Request — Configurar Webhook** — `POST /webhook/set/{instanceName}` apontando para ML-CAPTURA
  8. **Code — Gerar HTML** + **Respond to Webhook** — página HTML com QR Code em base64

### Variáveis de ambiente necessárias no n8n Railway
```
EVOLUTION_API_URL  = https://sua-evolution.railway.app
EVOLUTION_API_KEY  = sua_api_key_evolution
N8N_WEBHOOK_URL    = https://seu-n8n.railway.app/webhook
```

### Documentação atualizada
- `infra/n8n/README.md` — adicionada seção completa sobre o workflow de onboarding
- Memórias salvas em `.claude/memory/project_pendencias_imediatas.md`
- CONTEXT.md atualizado com o bloqueio e as prioridades

---

## Decisões técnicas

- **responseMode: "responseNode"** no Form Trigger — permite retornar HTML customizado com QR Code
- **qrcode: true** no payload do create instance — QR Code vem na resposta da Evolution API se disponível imediatamente
- **Fallback sem QR** — se a Evolution não retornar QR Code na resposta, página mostra spinner e redireciona para endpoint de connect
- **Sanitização SQL** — inputs do formulário são sanitizados no node Code antes de qualquer query (replace de aspas simples)
- **instance_name** gerado automaticamente por slug do nome da empresa com prefixo `ml-`

---

## Pendências deixadas

1. Acesso ao n8n (senha bloqueada) — bloqueio principal para importar o workflow
2. Testar formulário com dados reais após importação
3. Verificar se Evolution API retorna QR Code imediatamente no create ou se precisa de polling

---

## Arquivos modificados/criados nesta sessão

- `infra/n8n/workflows/ML-ONBOARDING-conectar-cliente.json` (criado)
- `infra/n8n/README.md` (atualizado)
- `CONTEXT.md` (atualizado)
- Memórias em `.claude/memory/` (atualizadas)
