---
id: reconnect-whatsapp
name: Reconnect WhatsApp Number
task: Reconnect WhatsApp Number
squad: ml-captura-squad
agent: whatsapp-recovery-agent
icon: "🔄"
atomic_layer: task
elicit: false
responsavel: whatsapp-recovery-agent
responsavel_type: agent
Entrada: |
  - numero: Número WhatsApp a reconectar (formato internacional)
  - tentativa: Número da tentativa atual (1-3, padrão: 1)
Saida: |
  - sucesso: true | false
  - novo_estado: Estado após tentativa de reconexão
  - tentativas_realizadas: Contagem de tentativas nesta sequência
  - requer_qr: true se reconexão automática falhou e QR Code é necessário
  - mensagem: Descrição do resultado
Checklist:
  - "[ ] Verificar número de tentativas anteriores (bloquear se >= 3)"
  - "[ ] Chamar POST /instance/restart/{instancia} na Evolution API"
  - "[ ] Aguardar 15s e verificar novo estado via check-connection-status"
  - "[ ] Registrar tentativa com timestamp, estado antes e estado após"
  - "[ ] Se estado = open → sucesso, notificar @webhook-manager para validar webhook"
  - "[ ] Se estado != open após 3 tentativas → escalar com requer_qr: true"
---

# reconnect-whatsapp

Tenta reconectar automaticamente um número WhatsApp desconectado via Evolution API, respeitando o limite de 3 tentativas para evitar ban temporário.

## Pré-condições

- Estado do número confirmado como `close` ou `disconnected` via `check-connection-status`
- Menos de 3 tentativas de reconexão automática realizadas nesta sequência
- Acesso à Evolution API com permissão de restart de instância

## Passos

1. Verificar histórico de tentativas — bloquear e escalar se já foram realizadas 3 tentativas
2. Registrar estado atual antes da tentativa com timestamp
3. Chamar `POST /instance/restart/{instancia}` na Evolution API
4. Aguardar 15 segundos para estabilização da conexão
5. Verificar novo estado via `check-connection-status`
6. Se `open`:
   - Registrar sucesso com timestamp
   - Notificar `@webhook-manager` para validar configuração do webhook
7. Se não `open`:
   - Incrementar contador de tentativas
   - Se tentativas < 3: aguardar 30s e repetir
   - Se tentativas >= 3: retornar `requer_qr: true` e escalar para usuário

## Outputs

- `sucesso`: `true` se estado final é `open`
- `novo_estado`: Estado após tentativa
- `tentativas_realizadas`: Total de tentativas nesta sequência
- `requer_qr`: `true` se esgotadas as tentativas automáticas
- `mensagem`: Descrição legível do resultado

## Critérios de sucesso

- Reconexão automática bem-sucedida sem intervenção humana
- Máximo 3 tentativas respeitado — nunca ultrapassar sem escalar
- Webhook validado por `@webhook-manager` após reconexão
- Todas as tentativas registradas com timestamps e estados
