---
id: synthesize-cross-area
name: Synthesize Cross-Area Intelligence
squad: ml-orquestrador-squad
agent: cross-area-synthesizer
icon: "🔀"
---

# synthesize-cross-area

Executar síntese cross-área de todas as inteligências geradas pelos squads operacionais no período, identificando correlações temporais e causas raiz sistêmicas entre áreas distintas.

## Pré-condições

- Relatórios e insights de todos os squads ativos disponíveis no período (comercial, atendimento, financeiro, operacional, marketing, pessoas)
- Schema `ml_orquestrador.cross_area_insights` criado e acessível
- Período de síntese definido (semanal ou mensal)
- Acesso de leitura aos schemas de todos os squads ativos

## Passos

1. Coletar resumos de padrões e métricas-chave de todos os squads ativos: taxa de conversão (comercial), churn score (atendimento), risco financeiro (financeiro), gargalos (operacional), engajamento de campanha (marketing), engajamento de equipe (pessoas)
2. Identificar correlações temporais entre métricas de áreas diferentes: ex: queda de conversão comercial + aumento de churn + piora financeira podem indicar problema sistêmico de produto
3. Detectar causa raiz sistêmica das correlações: problema de produto, processo, equipe ou mercado
4. Priorizar insights por impacto estimado no negócio: impacto financeiro × urgência × abrangência
5. Gerar narrativa integrada do estado do negócio: situação atual, tendências, correlações detectadas e hipóteses de causa raiz
6. Persistir síntese em `ml_orquestrador.cross_area_insights` com período, correlações e narrativa

## Outputs

- `correlacoes_detectadas`: Lista de correlações identificadas entre métricas de áreas distintas com força da correlação
- `narrativa_integrada`: Narrativa em linguagem executiva descrevendo o estado integrado do negócio
- `insights_priorizados`: Top insights ordenados por impacto estimado no negócio
- `hipoteses_causa_raiz`: Hipóteses explicativas para as correlações detectadas com evidências

## Critérios de sucesso

- Síntese cobre todos os squads ativos do cliente no período
- >= 1 correlação cross-área identificada com evidências de pelo menos 2 squads distintos
- Narrativa gerada em linguagem executiva sem jargão técnico
