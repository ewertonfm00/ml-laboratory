# ML Laboratory — Workflows n8n

Workflows do projeto Machine Learning — todos tagueados com `[ML-*]` para isolamento.

## Workflows

| Arquivo | Tag | Trigger | Função |
|---------|-----|---------|--------|
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
```
