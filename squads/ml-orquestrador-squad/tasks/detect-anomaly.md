---
id: detect-anomaly
name: Detect Cross-Area Anomalies
squad: ml-orquestrador-squad
agent: anomaly-detector
icon: "🔔"
---

# detect-anomaly

Detectar anomalias e correlações incomuns entre áreas que indicam risco ou oportunidade relevante, classificar urgência e disparar alerta para o insight-scheduler.

## Pré-condições

- Métricas-chave de todos os squads operacionais disponíveis em tempo real ou com latência máxima de 1 hora
- Baseline dos últimos 30 dias calculado e armazenado em `ml_orquestrador.metricas_baseline`
- insight-scheduler disponível para receber alertas e disparar notificações
- Thresholds de anomalia configurados por métrica (padrão: 2 desvios padrão)

## Passos

1. Monitorar métricas-chave de todos os squads operacionais: churn score médio, taxa de conversão, score de risco financeiro, frequência de gargalos, engajamento de campanha
2. Comparar valores atuais com baseline dos últimos 30 dias: calcular desvio em unidades de desvio padrão
3. Detectar desvios >= 2 desvios padrão em qualquer métrica monitorada
4. Verificar se o desvio ocorre simultaneamente em múltiplas áreas (correlação cross-área): desvio isolado é incidente local, desvio correlacionado é anomalia sistêmica
5. Classificar anomalia como risco (desvio negativo) ou oportunidade (desvio positivo)
6. Calcular urgência: imediata (desvio >= 3σ ou risco em área crítica), esta semana (2-3σ), monitorar (próximo a 2σ)
7. Disparar alerta para insight-scheduler com anomalia, áreas afetadas, urgência e recomendação de ação inicial
8. Persistir anomalia em `ml_orquestrador.anomalias_detectadas` com timestamp, métricas e urgência

## Outputs

- `anomalias_detectadas`: Lista de anomalias identificadas com métrica, desvio e áreas afetadas
- `tipo`: Classificação de cada anomalia como risco ou oportunidade
- `urgencia`: Nível de urgência por anomalia (imediata/esta semana/monitorar)
- `areas_afetadas`: Squads com métricas em desvio para cada anomalia detectada
- `recomendacao_acao`: Ação inicial recomendada para cada anomalia identificada

## Critérios de sucesso

- Verificação completa de todas as métricas monitoradas em < 5 minutos
- Alertas com urgência classificada corretamente: imediata resulta em notificação instantânea
- Anomalias sistêmicas (multi-área) identificadas e separadas de incidentes locais
