# Evolution API — Setup ML Laboratory

Configuração do webhook da Evolution API para captura isolada do projeto Machine Learning.

## Instância

Crie uma instância **separada** das outras que você já usa:

```bash
# Nome da instância: ml-omega-laser (isolada)
curl -X POST https://SUA_EVOLUTION_API/instance/create \
  -H "apikey: $ML_EVOLUTION_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "ml-omega-laser",
    "token": "SEU_TOKEN_AQUI",
    "qrcode": true
  }'
```

## Configurar Webhook

Aponta para o n8n do projeto ML — endpoint `/ml/webhook/whatsapp` (isolado):

```bash
curl -X POST https://SUA_EVOLUTION_API/webhook/set/ml-omega-laser \
  -H "apikey: $ML_EVOLUTION_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://SEU_N8N.railway.app/webhook/ml/webhook/whatsapp",
    "webhook_by_events": false,
    "webhook_base64": false,
    "events": [
      "MESSAGES_UPSERT",
      "MESSAGES_UPDATE",
      "CONNECTION_UPDATE"
    ]
  }'
```

## Verificar Conexão

```bash
curl -X GET https://SUA_EVOLUTION_API/instance/connectionState/ml-omega-laser \
  -H "apikey: $ML_EVOLUTION_API_KEY"
```

## Payload de Exemplo (MESSAGES_UPSERT)

O n8n receberá este formato — já mapeado no workflow:

```json
{
  "event": "messages.upsert",
  "instance": "ml-omega-laser",
  "data": {
    "key": {
      "remoteJid": "5511999999999@s.whatsapp.net",
      "fromMe": false,
      "id": "MSG_ID_UNICO"
    },
    "message": {
      "conversation": "Texto da mensagem aqui"
    },
    "messageTimestamp": 1712700000
  }
}
```

## Payload de Áudio

```json
{
  "event": "messages.upsert",
  "data": {
    "key": { "remoteJid": "5511999@s.whatsapp.net", "fromMe": false, "id": "AUDIO_ID" },
    "message": {
      "audioMessage": {
        "url": "https://mmg.whatsapp.net/...",
        "seconds": 45,
        "mimetype": "audio/ogg; codecs=opus"
      }
    }
  }
}
```

## Isolamento Confirmado

| Recurso | Este projeto | Outros projetos |
|---------|-------------|-----------------|
| Instância Evolution | `ml-omega-laser` | suas outras instâncias |
| Webhook endpoint | `/ml/webhook/whatsapp` | endpoints diferentes |
| Postgres schema | `ml_captura`, `ml_comercial` | outros schemas |
| Redis prefix | `ml:` | outros prefixos |
| n8n workflows | tag `[ML-*]` | outras tags |

## Conexão do WhatsApp

Após criar a instância, escaneie o QR code:

```bash
# Obter QR code
curl https://SUA_EVOLUTION_API/instance/qrcode/ml-omega-laser \
  -H "apikey: $ML_EVOLUTION_API_KEY"
```
