---
id: monitor-health
name: Monitor Services Health
squad: ml-plataforma-squad
agent: monitor-agent
icon: "🩺"
---

# monitor-health

Executar verificação de saúde de todos os serviços do laboratório ML para um cliente e disparar alertas automáticos quando o health score cair abaixo do threshold.

## Pré-condições

- Infraestrutura provisionada e registrada em `ml_platform.infra_registry`
- Credenciais de acesso a todos os serviços disponíveis no ambiente
- Número WhatsApp de alerta configurado para o cliente
- Tabela `ml_platform.health_checks` criada para histórico

## Passos

1. Checar conectividade Postgres em todos os schemas ativos: ping + tempo de resposta
2. Checar Redis: ping + latência média em 3 chamadas consecutivas
3. Checar n8n: listar workflows ativos e verificar execuções das últimas 2 horas (sem erros críticos)
4. Checar Evolution API: verificar se webhook está conectado e recebendo eventos (último evento < 30 minutos)
5. Checar filas pendentes no Redis: mensagens não processadas acima de threshold (> 100 mensagens)
6. Calcular health score global (0-100): média ponderada dos scores individuais de cada serviço
7. Disparar alerta via WhatsApp para número de plantão se health score < 80
8. Persistir resultado em `ml_platform.health_checks` com scores individuais e timestamp

## Outputs

- `health_score`: Score global de saúde da infraestrutura (0-100)
- `servicos_status`: Objeto com status e latência de cada serviço verificado
- `alertas_disparados`: Lista de alertas enviados com descrição do problema
- `timestamp_verificacao`: Timestamp ISO da verificação realizada

## Critérios de sucesso

- Health score calculado com verificação de 100% dos serviços registrados
- Alertas enviados corretamente quando score < 80
- Tempo total de verificação < 2 segundos por cliente
