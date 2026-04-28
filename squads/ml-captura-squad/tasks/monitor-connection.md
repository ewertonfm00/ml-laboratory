---
id: monitor-connection
name: Monitor WhatsApp Connection
task: Monitor WhatsApp Connection
squad: ml-captura-squad
agent: whatsapp-recovery-agent
icon: "📡"
atomic_layer: task
elicit: false
responsavel: whatsapp-recovery-agent
responsavel_type: agent
Entrada: |
  - numero: Número WhatsApp a monitorar (formato internacional)
  - intervalo_segundos: Intervalo de verificação em segundos (padrão: 60)
  - alertar_pipeline_debugger: true | false (padrão: true — aciona @pipeline-debugger se desconexão coincidir com falha)
Saida: |
  - eventos: Lista de mudanças de estado detectadas com timestamps
  - desconexoes_detectadas: Contagem de desconexões no período
  - reconexoes_automaticas: Contagem de reconexões bem-sucedidas automaticamente
  - alertas_emitidos: Lista de alertas enviados ao usuário ou outros agentes
Checklist:
  - "[ ] Iniciar loop de verificação com intervalo configurado"
  - "[ ] A cada ciclo: chamar check-connection-status e comparar com estado anterior"
  - "[ ] Se mudança de estado detectada: registrar evento com timestamp e causa"
  - "[ ] Se estado != open: acionar reconnect-whatsapp automaticamente (respeitar limite 3x)"
  - "[ ] Se desconexão coincidir com falha de captura: notificar @pipeline-debugger"
  - "[ ] Se requer_qr=true: emitir alerta imediato ao usuário com instruções"
---

# monitor-connection

Monitora continuamente o estado de conexão de um número WhatsApp, detecta mudanças de estado, aciona reconexão automática quando necessário e alerta o usuário ou outros agentes em caso de falha persistente.

## Pré-condições

- Número WhatsApp registrado em `_plataforma.instancias_evolution`
- Acesso à Evolution API funcional
- Estado inicial verificado via `check-connection-status`

## Passos

1. Registrar estado inicial do número com timestamp
2. Iniciar loop de monitoramento com intervalo configurado (padrão: 60s)
3. A cada ciclo:
   - Chamar `check-connection-status` para o número
   - Comparar com estado anterior
   - Se estado mudou: registrar evento com timestamp, estado anterior e novo estado
4. Se estado passa a `close` ou `disconnected`:
   - Acionar `reconnect-whatsapp` automaticamente
   - Se `reconexao_automatica = true` → registrar sucesso e continuar monitoramento
   - Se `requer_qr = true` → emitir alerta imediato ao usuário com link de QR Code
5. Se desconexão coincidir com ausência de eventos no pipeline de captura: notificar `@pipeline-debugger`
6. Continuar monitoramento até comando `*stop` ou resolução definitiva

## Outputs

- `eventos`: Lista cronológica de mudanças de estado com timestamps
- `desconexoes_detectadas`: Total de desconexões no período
- `reconexoes_automaticas`: Total de reconexões bem-sucedidas sem intervenção humana
- `alertas_emitidos`: Lista de alertas enviados ao usuário ou `@pipeline-debugger`

## Critérios de sucesso

- Mudanças de estado detectadas dentro de 1 ciclo de verificação
- Reconexão automática acionada em < 5s após detecção de desconexão
- Alertas ao usuário emitidos quando QR Code necessário
- Log completo de eventos disponível para análise posterior
