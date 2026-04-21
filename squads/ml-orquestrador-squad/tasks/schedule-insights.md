---
id: schedule-insights
name: Schedule and Deliver Insights
task: Schedule and Deliver Insights
squad: ml-orquestrador-squad
agent: insight-scheduler
icon: "📬"
atomic_layer: task
elicit: false
responsavel: insight-scheduler
responsavel_type: agent
Entrada: |
  - alertas_anomaly: Alertas do anomaly-detector com urgência classificada na fila de entrega
  - relatorios_executive: Relatórios do executive-reporter disponíveis na fila de entrega
  - delivery_config: Agenda e mapeamento de destinatários em ml_orquestrador.delivery_config
Saida: |
  - entrega_id: UUID único de cada entrega registrada
  - destinatarios: Lista de destinatários que receberam a entrega
  - canal_usado: Canal de entrega utilizado (whatsapp/email)
  - timestamp_entrega: Timestamp ISO da confirmação de entrega
  - status_entrega: Status final (entregue/falha/pendente_retry)
Checklist:
  - "[ ] Receber alertas e relatórios na fila de entrega"
  - "[ ] Verificar agenda de entregas configurada (digest diário, relatório semanal)"
  - "[ ] Identificar destinatários por tipo de insight e urgência"
  - "[ ] Selecionar canal de entrega (WhatsApp para urgente/digest, e-mail para semanal)"
  - "[ ] Formatar mensagem para o canal (WhatsApp: curto/direto, e-mail: formatado+PDF)"
  - "[ ] Enviar mensagem via canal selecionado (Evolution API ou SMTP)"
  - "[ ] Registrar entrega e executar retry automático em caso de falha"
---

# schedule-insights

Entregar insights, alertas e relatórios para as pessoas certas no momento certo pelo canal certo, garantindo zero perda de entrega e SLA de 2 minutos para alertas críticos.

## Pré-condições

- Alertas do anomaly-detector e relatórios do executive-reporter disponíveis na fila de entrega
- Agenda de entregas configurada para o cliente: horário do digest diário, dia do relatório semanal
- Mapeamento de destinatários por tipo de insight configurado em `ml_orquestrador.delivery_config`
- Credenciais de envio configuradas: Evolution API (WhatsApp) e servidor de e-mail

## Passos

1. Receber alertas do anomaly-detector (urgência: imediata/esta semana/monitorar) e relatórios do executive-reporter na fila de entrega
2. Verificar agenda de entregas configurada: digest diário (hora configurada), relatório semanal (dia e hora configurados)
3. Identificar destinatários por tipo de insight: alerta crítico/imediato → gestão imediata via WhatsApp; digest → equipe via WhatsApp; relatório semanal → diretoria via e-mail
4. Selecionar canal de entrega por tipo e urgência: WhatsApp para urgente e digest, e-mail para relatório semanal e documentação
5. Formatar mensagem para o canal: WhatsApp (curto, direto, máximo 3 linhas + recomendação), e-mail (formatado, com sumário e anexo PDF)
6. Enviar mensagem via canal selecionado: Evolution API para WhatsApp, SMTP para e-mail
7. Registrar entrega em `ml_orquestrador.deliveries` com destinatário, canal, timestamp e status de confirmação
8. Retry automático em caso de falha de entrega: 3 tentativas com intervalo de 30 segundos

## Outputs

- `entrega_id`: UUID único de cada entrega registrada
- `destinatarios`: Lista de destinatários que receberam a entrega
- `canal_usado`: Canal de entrega utilizado (whatsapp/email)
- `timestamp_entrega`: Timestamp ISO da confirmação de entrega
- `status_entrega`: Status final (entregue/falha/pendente_retry)

## Critérios de sucesso

- Zero entregas perdidas: todas as mensagens na fila entregues ou com retry registrado
- Alertas críticos entregues em < 2 minutos após recebimento do anomaly-detector
- Retry automático executado para todas as falhas transitórias de entrega
