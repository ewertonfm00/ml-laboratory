---
id: check-connection-status
name: Check WhatsApp Connection Status
task: Check WhatsApp Connection Status
squad: ml-captura-squad
agent: whatsapp-recovery-agent
icon: "📶"
atomic_layer: task
elicit: false
responsavel: whatsapp-recovery-agent
responsavel_type: agent
Entrada: |
  - numero: Número WhatsApp a verificar (formato internacional, ex: 5511999999999)
  - instancia_evolution: Nome da instância na Evolution API (opcional — infere pelo número se omitido)
Saida: |
  - estado: Estado atual da conexão (open | close | connecting | disconnected)
  - ultima_conexao: Timestamp da última conexão bem-sucedida
  - causa_provavel: Causa provável da desconexão se estado != open
  - acao_recomendada: reconnect | scan-qr | aguardar | sem-acao
Checklist:
  - "[ ] Consultar _plataforma.instancias_evolution para obter instância associada ao número"
  - "[ ] Chamar GET /instance/connectionState/{instancia} na Evolution API"
  - "[ ] Interpretar estado retornado (open/close/connecting/disconnected)"
  - "[ ] Registrar timestamp e estado em log de conexões"
  - "[ ] Determinar causa provável (inatividade, bloqueio, troca de chip)"
  - "[ ] Retornar acao_recomendada com base no estado e histórico"
---

# check-connection-status

Verifica o estado atual da conexão de um número WhatsApp via Evolution API e determina a ação recomendada para recuperação se necessário.

## Pré-condições

- Acesso à Evolution API com credenciais configuradas
- Número WhatsApp registrado em `_plataforma.instancias_evolution`
- Evolution API com status healthy (verificar antes de consultar)

## Passos

1. Consultar `_plataforma.instancias_evolution` para obter o nome da instância associada ao número
2. Chamar `GET /instance/connectionState/{instancia}` na Evolution API
3. Interpretar o estado retornado:
   - `open` → conexão ativa, nenhuma ação necessária
   - `connecting` → tentativa de reconexão em andamento, aguardar 30s e reverificar
   - `close` → desconectado por inatividade ou erro — tentar `*reconnect`
   - `disconnected` → sessão encerrada — pode requerer novo QR Code
4. Registrar timestamp, estado e causa provável no log de conexões
5. Retornar diagnóstico com ação recomendada

## Outputs

- `estado`: Estado atual da conexão (`open` | `close` | `connecting` | `disconnected`)
- `ultima_conexao`: Timestamp da última conexão bem-sucedida
- `causa_provavel`: Causa inferida da desconexão
- `acao_recomendada`: `reconnect` | `scan-qr` | `aguardar` | `sem-acao`

## Critérios de sucesso

- Estado retornado com latência < 5s
- Causa provável identificada com base no histórico e no estado atual
- Ação recomendada compatível com o estado retornado
- Log de consulta registrado com timestamp
