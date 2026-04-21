---
id: collect-messages
name: Collect and Normalize Messages
squad: ml-captura-squad
agent: message-collector
icon: "📥"
---

# collect-messages

Coletar e normalizar mensagens recebidas via webhook, identificar o tipo de conteúdo e encaminhar para o processador correto no pipeline de análise.

## Pré-condições

- Webhook configurado e ativo (configure-webhook executado com sucesso)
- Schema `ml_captura.mensagens_raw` criado no Postgres
- audio-transcriber e privacy-filter disponíveis para receber eventos
- Redis disponível para controle de deduplicação por message_id

## Passos

1. Receber evento do webhook-manager com payload bruto da Evolution API
2. Verificar deduplicação no Redis usando `ml:captura:msg:{message_id}` — descartar se já processado
3. Extrair campos do payload: mensagem, remetente, destinatário, timestamp, tipo de mídia e message_id
4. Normalizar formato para schema padrão interno do laboratório ML
5. Identificar tipo de conteúdo: texto, áudio, imagem ou documento
6. Encaminhar áudios para audio-transcriber com URL de download e sessao_id
7. Encaminhar textos diretamente para privacy-filter
8. Persistir mensagem bruta em `ml_captura.mensagens_raw` com todos os campos e status de roteamento

## Outputs

- `mensagem_normalizada`: Objeto com campos padronizados da mensagem
- `tipo_conteudo`: Enum (texto/audio/imagem/documento)
- `sessao_id`: UUID gerado ou associado à conversa em andamento
- `numero_id`: Identificador da instância Evolution API de origem

## Critérios de sucesso

- Todas as mensagens persistidas em ml_captura.mensagens_raw sem perda
- Tipos de conteúdo identificados corretamente em >= 99% dos casos
- Deduplicação funcionando: zero mensagens duplicadas processadas
- Roteamento correto: áudios para transcriber, textos para privacy-filter
