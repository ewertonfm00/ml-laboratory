# ML Laboratory — Workflows n8n

Workflows do projeto Machine Learning — todos tagueados com `[ML-*]` para isolamento.

## Workflows

| Arquivo | Tag | Trigger | Função |
|---------|-----|---------|--------|
| `ML-ONBOARDING-conectar-cliente.json` | [ML-ONBOARDING] | Form Trigger (URL pública) | Cadastra cliente + cria instância Evolution + exibe QR Code |
| `ML-CAPTURA-whatsapp-pipeline.json` | [ML-CAPTURA] | Webhook Evolution API | Captura e transcreve mensagens WhatsApp |
| `ML-COMERCIAL-analise-conversa.json` | [ML-COMERCIAL] | Schedule 5min | Analisa conversas encerradas via Claude Haiku |

## Como importar no n8n

1. Abra seu n8n
2. Menu → **Workflows** → **Import from file**
3. Selecione o JSON correspondente
4. Configure as credenciais (ver abaixo)

## Credenciais necessárias no n8n

| Nome da credencial | Tipo | Usado em |
|-------------------|------|----------|
| `ML Postgres` | PostgreSQL | Todos os workflows |
| `ML Groq` | HTTP Header Auth | ML-CAPTURA |
| `ML Anthropic` | HTTP Header Auth | ML-COMERCIAL |

## Pipeline completo

```
WhatsApp
  ↓ (mensagem enviada)
Evolution API (instância: ml-omega-laser)
  ↓ (webhook POST /ml/webhook/whatsapp)
[ML-CAPTURA] WhatsApp Pipeline
  ├── texto → ml_captura.mensagens_raw (status: processada)
  └── áudio → Groq Whisper → texto → ml_captura.mensagens_raw
                                    → ml_captura.transcricoes_audio
  ↓ (agrupa por sessão)
ml_captura.sessoes_conversa (30min inatividade → encerrada)
  ↓ (schedule 5min)
[ML-COMERCIAL] Análise de Conversa
  └── Claude Haiku → ml_comercial.conversas
                   → ml_comercial.objecoes (catálogo automático)
```

## Variáveis de ambiente no n8n

Configure em **Settings → Variables**:

```
ML_EVOLUTION_WEBHOOK_SECRET = seu_secret
ML_GROQ_API_KEY             = sua_chave
ML_ANTHROPIC_API_KEY        = sua_chave
ML_CLAUDE_CLASSIFIER_MODEL  = claude-haiku-4-5-20251001
ML_GROQ_WHISPER_MODEL       = whisper-large-v3
ML_GROQ_WHISPER_LANGUAGE    = pt

# Necessário para o workflow de onboarding:
EVOLUTION_API_URL           = https://sua-evolution.railway.app
EVOLUTION_API_KEY           = sua_api_key_evolution
N8N_WEBHOOK_URL             = https://seu-n8n.railway.app/webhook
```

## Workflow de Onboarding — Como usar

O workflow `ML-ONBOARDING-conectar-cliente.json` permite conectar um novo cliente sem usar o terminal.

### Fluxo para o cliente leigo

```
Você envia o link → Cliente abre no celular → Preenche 4 campos →
Clica Enviar → QR Code aparece na tela → Cliente escaneia com WhatsApp → Conectado ✅
```

### O que o workflow faz automaticamente

1. **Cria a instância** na Evolution API com o nome gerado a partir do nome da empresa
2. **Registra o projeto** em `_plataforma.projetos`
3. **Registra a instância** em `_plataforma.instancias_evolution`
4. **Registra o número** em `_plataforma.numeros_projeto` (status: `teste`)
5. **Configura o webhook** apontando para o pipeline ML-CAPTURA
6. **Exibe o QR Code** diretamente na tela para escaneamento

### Como obter o link para enviar ao cliente

Após importar e ativar o workflow no n8n:
1. Clique no node **"Formulário — Conectar Cliente"**
2. Copie a **Test URL** ou **Production URL** mostrada
3. Envie esse link para o cliente via WhatsApp, email ou mensagem

O link terá formato similar a:
```
https://seu-n8n.railway.app/form/ml-onboarding-conectar
```

### Campos do formulário

| Campo | Exemplo |
|-------|---------|
| Nome da empresa | Clínica Beleza Plena |
| WhatsApp (DDI+DDD+número) | 5516988230361 |
| Nome do responsável | Ana Paula |
| Setor principal | Comercial / Vendas |
