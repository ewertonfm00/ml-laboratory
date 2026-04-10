#!/usr/bin/env bash
# =============================================================================
# test-webhook-text.sh — Teste do ramo de texto no ML-CAPTURA
# =============================================================================
# Envia um payload simulando uma mensagem de texto do WhatsApp via Evolution API
# para o webhook do n8n em produção.
#
# USO:
#   chmod +x scripts/test-webhook-text.sh
#   ./scripts/test-webhook-text.sh
#
# PERSONALIZAÇÕES:
#   - Altere WEBHOOK_URL para ambiente local: http://localhost:5678/webhook/...
#   - Altere REMOTE_JID para um número cadastrado em _plataforma.numeros_projeto
#   - Altere MESSAGE_TEXT para o texto desejado
# =============================================================================

set -euo pipefail

WEBHOOK_URL="${ML_N8N_WEBHOOK_URL:-https://n8n-production-47d0.up.railway.app}/webhook/ml/webhook/whatsapp"
REMOTE_JID="5516999900001@s.whatsapp.net"   # Número de teste — substitua se necessário
INSTANCE="omega-laser-comercial"
MESSAGE_TEXT="Olá, gostaria de saber mais sobre o tratamento a laser facial."

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
MESSAGE_ID="TEXT_TEST_$(date +%s)"

echo "=== ML-CAPTURA — Teste Webhook (Texto) ==="
echo "URL: $WEBHOOK_URL"
echo "JID: $REMOTE_JID"
echo "Message ID: $MESSAGE_ID"
echo "Mensagem: $MESSAGE_TEXT"
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
        \"conversation\": \"$MESSAGE_TEXT\"
      },
      \"messageTimestamp\": \"$(date +%s)\",
      \"status\": \"DELIVERY_ACK\"
    }
  }" | python3 -m json.tool 2>/dev/null || echo "(resposta não é JSON válido)"

echo ""
echo "=== Teste concluído ==="
