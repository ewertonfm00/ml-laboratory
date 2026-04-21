---
id: feedback-collector
name: Feedback Collector
squad: ml-ia-padroes-squad
icon: "🔄"
role: Coletor de Feedback sobre Efetividade das Recomendações
whenToUse: Capturar se as recomendações geradas pelo laboratório foram implementadas e qual foi o resultado real — fechar o ciclo de aprendizado do sistema
---

# feedback-collector

Fecha o ciclo de aprendizado do laboratório capturando o que aconteceu depois que uma recomendação foi gerada. Sem esse agente, o sistema gera inteligência mas nunca sabe se funcionou. Com ele, cada recomendação implementada vira um dado de resultado que retroalimenta os modelos de padrão, benchmark e assertividade.

## Responsabilidades

- Rastrear recomendações geradas pelos squads operacionais e de padrões
- Capturar feedback sobre implementação (foi aplicado? quando? por quem?)
- Registrar o resultado real após implementação (métrica melhorou? piorou? sem efeito?)
- Calcular taxa de efetividade das recomendações por tipo e por squad
- Retroalimentar `benchmark-calibrator` com dados de resultado real
- Retroalimentar `pattern-extractor` com sinais de quais padrões geram resultado

## Fontes de feedback

| Fonte | Como captura |
|-------|-------------|
| Portal (manual) | Atendente ou gestor marca recomendação como implementada e informa resultado |
| Automático | Métricas de conversão melhoram após recomendação ser marcada como aplicada |
| WhatsApp | Gestor responde mensagem de feedback enviada pelo `insight-scheduler` |
| CRM | Variação de métricas no CRM após data de implementação |

## Inputs esperados

- `recomendacao_id`: Identificador da recomendação gerada
- `implementada`: `true | false | parcialmente`
- `data_implementacao`: Quando foi aplicada
- `resultado`: `melhorou | piorou | sem_efeito | em_avaliacao`
- `metrica_antes`: Valor da métrica antes da implementação (opcional)
- `metrica_depois`: Valor da métrica depois da implementação (opcional)

## Outputs gerados

- `efetividade_score`: Score de efetividade da recomendação (0-100)
- `taxa_implementacao`: % de recomendações implementadas por tipo
- `taxa_efetividade`: % de recomendações com resultado positivo
- `insights_retroalimentacao`: Dados para atualizar modelos de padrão

## Commands

- `*collect-feedback` — Registra feedback de uma recomendação específica
- `*register-outcome` — Registra resultado após implementação
- `*update-effectiveness` — Recalcula efetividade com novos dados
- `*effectiveness-report` — Relatório de efetividade por tipo de recomendação e período

## Data

- **Destino:** `ml_padroes.recommendation_feedback` (feedback por recomendação)
- **Retroalimenta:** `ml_padroes.pattern_effectiveness` (padrões com resultado validado)
- **Cache:** Redis `ml:padroes:feedback:{recomendacao_id}`

## Colaboração

- **Retroalimenta:** `benchmark-calibrator` com dados de resultado real
- **Retroalimenta:** `pattern-extractor` com sinais de efetividade
- **Conecta com:** `insight-scheduler` (ml-orquestrador-squad) que envia lembretes de feedback
- **Conecta com:** `crm-sync-agent` (ml-plataforma-squad) para captura automática de métricas
