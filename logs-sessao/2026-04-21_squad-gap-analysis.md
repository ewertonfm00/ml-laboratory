# Sessão 2026-04-21 — Gap Analysis Completo: Squads e Agentes ML

## O que foi feito

### Análise de gaps
- Mapeamento completo de todos os 12 squads ML: agentes declarados vs disco, tasks declaradas vs disco
- Identificados 3 tipos de gap: agentes ausentes (15), tasks ausentes (27), divergências de nome yaml vs disco (5 squads)
- Análise de necessidade de cada agente — resultado: quase todos necessários, 2 consolidações recomendadas

### Correções aplicadas (squad.yaml — 6 squads)
- ml-atendimento: satisfaction-analyst → satisfaction-analyzer, adicionado service-quality-monitor + churn-detector
- ml-financeiro: cashflow-analyst → cashflow-predictor, risk-detector → risk-analyzer, forecast-generator → collections-advisor
- ml-marketing: campaign-analyst → message-analyzer, message-optimizer → timing-optimizer
- ml-operacional: bottleneck-detector → failure-detector, analyze-process → map-process
- ml-pessoas: engagement-analyst → engagement-monitor, build-talent-profile → profile-talent
- ml-comercial: removidos profile-portability-evaluator + segment-match-scorer, adicionado profile-segment-matcher
- ml-orquestrador: tasks: [] → 4 tasks declaradas

### Agentes criados (17)
- ml-captura: webhook-manager, audio-transcriber, message-collector
- ml-data-eng: schema-designer, etl-engineer, data-classifier
- ml-ia-padroes: pattern-extractor, behavior-analyst, benchmark-generator
- ml-plataforma: infra-manager, monitor-agent, deploy-coordinator
- ml-skills: skill-generator, skill-validator, agent-trainer
- ml-comercial: profile-segment-matcher (substitui 2 obsoletos)
- ml-atendimento: churn-detector
- ml-ia-padroes: benchmark-generator

### Tasks criadas (27)
Todos os 12 squads agora têm tasks declaradas no squad.yaml e arquivos presentes no disco.

### Commit
- `bee29ee` — 62 arquivos, 2484 inserções, 148 deleções

## Decisões tomadas

1. **Consolidar profile-portability-evaluator + segment-match-scorer → profile-segment-matcher**: processo único, não dois agentes
2. **churn-detector + service-quality-monitor**: ambos mantidos — escopos distintos (predição de churn vs qualidade de serviço)
3. **benchmark-generator separado**: roda uma vez por cliente (geração inicial); benchmark-calibrator é contínuo
4. **Corrigir yaml para refletir disco**: arquivos existentes tinham nomes melhores; yaml atualizado para alinhar
5. **4 tasks core para o orquestrador**: synthesize-cross-area, generate-executive-report, detect-anomaly, schedule-insights

## Próximos passos

1. Validar squads com `*validate-squad`
2. Implementar workflows n8n (começar por ml-captura)
3. Seed do segment-catalog-manager
4. Conectar WhatsApp (QR Code — ação manual)
