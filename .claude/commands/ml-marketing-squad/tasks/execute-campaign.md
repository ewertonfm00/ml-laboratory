---
task: Executar Campanha de Marketing via Evolution API
agent: campaign-executor
squad: ml-marketing-squad
atomic_layer: task
elicit: true
responsavel: campaign-executor
responsavel_type: agent
Entrada: |
  - campanha_id: Identificador único da campanha
  - segmento_validado: Lista de contatos aprovada pelo segmentation-advisor
  - janela_envio: Janela de tempo aprovada pelo timing-optimizer
  - mensagem_aprovada: Mensagem validada pelo message-analyzer ou @icarus
  - instancia_evolution: ID da instância Evolution API ativa
Saida: |
  - total_enviados: Quantidade de mensagens disparadas
  - total_entregues: Confirmação de entrega (webhook Evolution)
  - taxa_bloqueio: % de contatos que bloquearam após receber
  - execucao_id: ID do registro de execução para auditoria
  - status_final: concluida | abortada | parcial
Checklist:
  - "[ ] Verificar que segmento_validado está disponível"
  - "[ ] Verificar que janela_envio está ativa (dentro do horário)"
  - "[ ] Verificar que instância Evolution API está conectada e respondendo"
  - "[ ] Verificar que mensagem_aprovada está definida"
  - "[ ] Criar registro em ml_marketing.execucoes_campanha com status=iniciada"
  - "[ ] Disparar mensagens respeitando rate limit (máx 1/segundo)"
  - "[ ] Monitorar taxa de bloqueio a cada 50 envios"
  - "[ ] Abortar se taxa_bloqueio > 5%"
  - "[ ] Atualizar registro de execução a cada 10% do segmento"
  - "[ ] Persistir logs em ml_marketing.logs_disparo"
  - "[ ] Atualizar status final em ml_marketing.execucoes_campanha"
  - "[ ] Notificar message-analyzer com dados de entrega para análise pós-campanha"
---

# execute-campaign

Executa campanha de marketing via Evolution API com controle de rate limiting, monitoramento de bloqueios e registro completo de auditoria.

## Pré-requisitos obrigatórios

Antes de iniciar, validar:
1. `segmento_validado` presente (saída do segmentation-advisor)
2. Dentro da `janela_envio` aprovada (saída do timing-optimizer)
3. Instância Evolution API ativa e com WhatsApp conectado
4. Mensagem aprovada definida

## Processo

1. Criar registro de execução em `ml_marketing.execucoes_campanha` (status=iniciada)
2. Para cada contato no `segmento_validado`:
   - Verificar se ainda está dentro da `janela_envio`
   - Disparar mensagem via Evolution API
   - Aguardar 1 segundo (rate limiting)
   - Registrar resultado em `ml_marketing.logs_disparo`
3. A cada 50 envios: calcular `taxa_bloqueio` — se > 5%, abortar campanha
4. Ao finalizar: atualizar status final e notificar message-analyzer

## Output Schema

```json
{
  "execucao_id": "string",
  "campanha_id": "string",
  "total_no_segmento": 0,
  "total_enviados": 0,
  "total_entregues": 0,
  "taxa_entrega_pct": 0.0,
  "taxa_bloqueio_pct": 0.0,
  "status_final": "concluida | abortada | parcial",
  "motivo_abort": "string | null",
  "iniciada_em": "ISO8601",
  "finalizada_em": "ISO8601"
}
```

## Regras de Segurança

- **Rate limit:** máximo 1 mensagem por segundo por instância Evolution
- **Abort threshold:** abortar se `taxa_bloqueio > 5%` do segmento
- **Janela de envio:** não disparar fora da janela aprovada pelo timing-optimizer
- **Auditoria:** todos os disparos DEVEM ser registrados em `logs_disparo`
