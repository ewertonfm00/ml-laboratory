#!/usr/bin/env bash
# =============================================================================
# test-webhook-audio.sh — Teste do ramo de áudio no ML-CAPTURA
# =============================================================================
# Envia um payload simulando uma mensagem de áudio do WhatsApp via Evolution API
# para o webhook do n8n em produção.
#
# USO:
#   chmod +x scripts/test-webhook-audio.sh
#   ./scripts/test-webhook-audio.sh
#
# PERSONALIZAÇÕES:
#   - Altere WEBHOOK_URL se o ambiente for diferente (local: http://localhost:5678)
#   - Altere REMOTE_JID para um número cadastrado em _plataforma.numeros_projeto
#   - Substitua AUDIO_URL por uma URL real de áudio acessível publicamente
# =============================================================================

set -euo pipefail

WEBHOOK_URL="${ML_N8N_WEBHOOK_URL:-https://n8n-production-47d0.up.railway.app}/webhook/ml/webhook/whatsapp"
REMOTE_JID="5516999900001@s.whatsapp.net"   # Número de teste — substitua se necessário
INSTANCE="omega-laser-comercial"

# TODO: Substitua por uma URL real de arquivo .ogg ou .mp4 acessível publicamente
AUDIO_URL="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
MESSAGE_ID="AUDIO_TEST_$(date +%s)"

echo "=== ML-CAPTURA — Teste Webhook (Áudio) ==="
echo "URL: $WEBHOOK_URL"
echo "JID: $REMOTE_JID"
echo "Message ID: $MESSAGE_ID"
echo ""

curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"event\": \"messages.upsert\",
    \"instance\": \"$INSTANCE\",
    \"data\": {
      \"key\": {
        \"remoteJid\": \"$REMOTE_JID\",
        \"fromMe\": false,
        \"id\": \"$MESSAGE_ID\"
      },
      \"message\": {
        \"audioMessage\": {
          \"url\": \"$AUDIO_URL\",
          \"mimetype\": \"audio/ogg; codecs=opus\",
          \"fileSha256\": \"dGVzdA==\",
          \"fileLength\": 12345,
          \"seconds\": 15,
          \"ptt\": true,
          \"mediaKey\": \"dGVzdE1lZGlhS2V5\",
          \"fileEncSha256\": \"dGVzdA==\",
          \"directPath\": \"/v/t62.7117-24/test.enc\"
        }
      },
      \"messageTimestamp\": \"$(date +%s)\",
      \"status\": \"DELIVERY_ACK\"
    }
  }" | python3 -m json.tool 2>/dev/null || echo "(resposta não é JSON válido)"

echo ""
echo "=== Teste concluído ==="
