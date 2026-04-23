---
id: debug-pipeline
name: Debug Pipeline de Captura
task: Debug Pipeline de Captura
squad: ml-captura-squad
agent: pipeline-debugger
icon: "🔍"
atomic_layer: task
elicit: false
responsavel: pipeline-debugger
responsavel_type: agent
Entrada: |
  - evento_webhook: Payload do evento recebido pelo webhook (JSON)
  - janela_tempo: Intervalo de tempo para análise (ex: "últimas 2 horas")
  - numero_whatsapp: Número WhatsApp de origem para filtrar logs (opcional)
Saida: |
  - diagnostico: Relatório com ponto de falha identificado no pipeline E2E
  - logs_relevantes: Registros de log que evidenciam a falha
  - acao_corretiva: Passos recomendados para resolver o problema
  - status_tabelas: Estado atual das tabelas mensagens_raw, sessoes_conversa e webhooks
Checklist:
  - "[ ] Verificar se webhook está recebendo e registrando eventos na tabela webhooks"
  - "[ ] Confirmar se trigger/function de insert em mensagens_raw está ativa"
  - "[ ] Checar filas Redis ml:captura:* por mensagens presas ou expiradas"
  - "[ ] Validar se sessoes_conversa está sendo criada/atualizada corretamente"
  - "[ ] Gerar relatório de diagnóstico com ponto de falha e ação corretiva"
---

# debug-pipeline

Diagnosticar E2E o pipeline de captura quando webhook recebe eventos mas inserts não ocorrem nas tabelas mensagens_raw ou sessoes_conversa.

## Pré-condições

- Acesso ao schema `ml_captura` com permissão de leitura nas tabelas `mensagens_raw`, `sessoes_conversa` e `webhooks`
- Acesso ao Redis com prefixo `ml:captura:*`
- Logs de execução do n8n disponíveis para consulta
- Evento de webhook recente disponível para referência cruzada

## Passos

1. Consultar tabela `webhooks` para verificar se o evento foi registrado e qual foi o status de processamento retornado
2. Cruzar o `webhook_id` com a tabela `mensagens_raw` para identificar se o insert ocorreu; se ausente, registrar lacuna
3. Inspecionar filas Redis `ml:captura:queue`, `ml:captura:pending` e `ml:captura:failed` por mensagens presas, expiradas ou em retry loop
4. Verificar se a sessão correspondente existe em `sessoes_conversa`; confirmar se `ultima_mensagem_at` foi atualizado
5. Consultar logs do n8n para o workflow de captura e identificar nodes com erro ou timeout no intervalo informado
6. Consolidar achados em relatório de diagnóstico com: ponto exato de falha, evidência em log, e ação corretiva prioritária

## Outputs

- `diagnostico`: Relatório estruturado com identificação do ponto de falha no pipeline E2E
- `logs_relevantes`: Trechos de log que comprovam a falha identificada
- `acao_corretiva`: Lista priorizada de passos para resolver o problema
- `status_tabelas`: Contagem de registros e último timestamp de cada tabela auditada

## Critérios de sucesso

- Ponto de falha identificado com evidência concreta (log ou query result)
- Status das 3 tabelas principais documentado com timestamps
- Ação corretiva fornecida com passos executáveis e ordem de prioridade
