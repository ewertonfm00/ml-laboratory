---
id: configure-webhook
name: Configure Webhook Evolution API
squad: ml-captura-squad
agent: webhook-manager
icon: "🔗"
---

# configure-webhook

Configurar webhook no Evolution API para um número WhatsApp específico, criando o endpoint no n8n e persistindo a configuração no Postgres.

## Pré-condições

- Número WhatsApp válido e ativo na Evolution API
- Instância n8n acessível com permissão para criar workflows
- Banco de dados Postgres disponível com schema ml_captura criado
- Credenciais da Evolution API configuradas no ambiente

## Passos

1. Validar se o número informado existe e está ativo na Evolution API via GET `/instance/fetchInstances`
2. Criar endpoint receptor no n8n (webhook node) com rota `/ml/captura/{numero_id}`
3. Registrar webhook na Evolution API via POST `/webhook/set/{instance}` apontando para o endpoint criado
4. Enviar mensagem de teste para o número e verificar se o evento chega no endpoint n8n
5. Persistir configuração em `ml_captura.webhooks_config` com status, numero_id e webhook_url
6. Retornar confirmação com dados da configuração ativa

## Outputs

- `webhook_url`: URL completa do endpoint n8n configurado
- `numero_id`: Identificador da instância na Evolution API
- `status_configurado`: Boolean indicando se o webhook está ativo e recebendo eventos

## Critérios de sucesso

- Webhook recebendo eventos em tempo real sem erros 5xx
- Mensagem de teste capturada e persistida em ml_captura.mensagens_raw
- Configuração registrada no Postgres com timestamp e status ativo
