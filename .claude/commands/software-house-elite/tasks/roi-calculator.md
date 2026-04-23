# roi-calculator

## Purpose

Calcular o ROI (Retorno sobre Investimento) projetado do sistema para um cliente específico, gerando três cenários (conservador, realista, otimista) com break-even e payback period para suportar o argumento comercial do Flex.

---

## Task Definition

```yaml
task: roiCalculator()
responsible: Flex (sales-engineer)
atomic_layer: Atom

inputs:
  - campo: volume_operacoes_mes
    tipo: number
    origem: User Input
    obrigatório: true
    descrição: "Número de operações/transações realizadas por mês atualmente"

  - campo: ticket_medio
    tipo: number
    origem: User Input
    obrigatório: true
    descrição: "Valor médio por operação em R$"

  - campo: taxa_conversao_atual
    tipo: number
    origem: User Input
    obrigatório: false
    default: 60
    descrição: "Percentual de leads que convertem atualmente (0-100, default: 60%)"

  - campo: taxa_perda_atual
    tipo: number
    origem: User Input
    obrigatório: false
    default: 20
    descrição: "Percentual de oportunidades perdidas atualmente (0-100, default: 20%)"

  - campo: custo_plano
    tipo: number
    origem: Config
    obrigatório: false
    default: 1497
    descrição: "Custo mensal do plano em R$ (default: R$1.497 — Plano Profissional)"

outputs:
  - campo: roi_conservador
    tipo: number
    destino: Response + relatorio_md
    descrição: "ROI anual no cenário conservador (R$)"

  - campo: roi_realista
    tipo: number
    destino: Response + relatorio_md
    descrição: "ROI anual no cenário realista (R$)"

  - campo: roi_otimista
    tipo: number
    destino: Response + relatorio_md
    descrição: "ROI anual no cenário otimista (R$)"

  - campo: break_even_operacoes
    tipo: number
    destino: Response + relatorio_md
    descrição: "Quantidade de operações extras mensais necessárias para pagar o plano"

  - campo: payback_meses
    tipo: number
    destino: Response + relatorio_md
    descrição: "Meses estimados para o investimento se pagar (cenário realista)"

  - campo: relatorio_md
    tipo: markdown
    destino: Response
    descrição: "Relatório completo em Markdown com todos os cálculos e tabelas"
```

---

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] volume_operacoes_mes fornecido
  - [ ] ticket_medio fornecido
  - [ ] Dados coletados do prospect (discovery call ou demo)
```

---

## Workflow

### Passo 1 — Coletar Dados do Cliente

Se dados não fornecidos, elicitar:

1. "Quantas operações/transações vocês fazem por mês em média?"
2. "Qual o valor médio por operação?"
3. "De cada 10 leads que chegam, quantos se convertem? (taxa de conversão)"
4. "De cada 10 que avançam, quantos são perdidos ou não concluem? (taxa de perda)"

### Passo 2 — Calcular Métricas Base

```
# Receita atual
receita_atual_mes = volume_operacoes_mes × ticket_medio

# Perda atual
perdas_em_operacoes = volume_operacoes_mes × (taxa_perda_atual / 100)
perdas_mes = perdas_em_operacoes × ticket_medio

# Potencial de leads não convertidos
leads_nao_convertidos = volume_operacoes_mes / (taxa_conversao_atual / 100) × (1 - taxa_conversao_atual / 100)
receita_perdida_conversao = leads_nao_convertidos × ticket_medio
```

### Passo 3 — Calcular Cenários de Ganho

**Premissas dos cenários:**
- Conservador: o sistema melhora conversão em +5pp e reduz perdas em 30%
- Realista: o sistema melhora conversão em +15pp e reduz perdas em 50%
- Otimista: o sistema melhora conversão em +25pp e reduz perdas em 70%

```
# Ganho por melhora na conversão
ganho_conversao_conservador = leads_nao_convertidos × 0.05 × ticket_medio
ganho_conversao_realista    = leads_nao_convertidos × 0.15 × ticket_medio
ganho_conversao_otimista    = leads_nao_convertidos × 0.25 × ticket_medio

# Ganho por redução de perdas
ganho_perda_conservador = perdas_mes × 0.30
ganho_perda_realista    = perdas_mes × 0.50
ganho_perda_otimista    = perdas_mes × 0.70

# Ganho total mensal por cenário
ganho_mes_conservador = ganho_conversao_conservador + ganho_perda_conservador
ganho_mes_realista    = ganho_conversao_realista    + ganho_perda_realista
ganho_mes_otimista    = ganho_conversao_otimista    + ganho_perda_otimista

# ROI anual (ganho × 12 - custo anual do plano)
roi_conservador = (ganho_mes_conservador × 12) - (custo_plano × 12)
roi_realista    = (ganho_mes_realista    × 12) - (custo_plano × 12)
roi_otimista    = (ganho_mes_otimista    × 12) - (custo_plano × 12)
```

### Passo 4 — Calcular Break-even e Payback

```
# Break-even: quantas operações extras pagam o plano por mês
break_even_operacoes = ARREDONDAR_PARA_CIMA(custo_plano / ticket_medio)

# Payback (cenário realista): meses para o ganho acumulado cobrir o custo do plano
payback_meses = ARREDONDAR_PARA_CIMA(custo_plano / ganho_mes_realista)
```

### Passo 5 — Gerar Relatório em Markdown

```markdown
## ROI Calculado — {{cliente_nome}}

### Dados Base
| Métrica | Valor |
|---------|-------|
| Operações/mês | {{volume}} |
| Ticket médio | R$ {{ticket}} |
| Taxa de conversão atual | {{conversao}}% |
| Taxa de perda atual | {{perda}}% |
| Custo do plano | R$ {{custo_plano}}/mês |

### Projeção de Ganhos

| Cenário | Ganho/mês | ROI Anual | Multiplicador |
|---------|-----------|-----------|---------------|
| Conservador (+5% conversão, -30% perdas) | R$ {{ganho_conservador}} | R$ {{roi_conservador}} | {{mult_c}}x |
| Realista (+15% conversão, -50% perdas) | R$ {{ganho_realista}} | R$ {{roi_realista}} | {{mult_r}}x |
| Otimista (+25% conversão, -70% perdas) | R$ {{ganho_otimista}} | R$ {{roi_otimista}} | {{mult_o}}x |

### Break-even

**O plano se paga com apenas {{break_even_operacoes}} operações extras por mês.**

Com ticket médio de R$ {{ticket}}, isso representa {{break_even_operacoes}} atendimentos adicionais — 
gerados automaticamente pelo sistema a partir de oportunidades que antes eram perdidas.

### Payback

No cenário realista, o investimento se paga em **{{payback_meses}} mês(es)**.
```

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] ROI calculado nos três cenários (conservador, realista, otimista)
  - [ ] Break-even em operações calculado e apresentado
  - [ ] Payback em meses calculado (cenário realista)
  - [ ] Relatório em Markdown gerado
```

---

## Acceptance Criteria

```yaml
acceptance-criteria:
  - [ ] Cálculos consistentes — ganho × 12 - custo_anual = ROI anual
  - [ ] Break-even em operações (não apenas em R$) — mais tangível para o prospect
  - [ ] Três cenários distintos com premissas documentadas
  - [ ] Payback calculado no cenário realista
  - [ ] Relatório formatado em Markdown pronto para copiar em proposta
  - [ ] Mensagem de valor clara: "se paga com X operações extras por mês"
```

---

## Metadata

```yaml
version: 1.0.0
tags: [sales, roi, calculator, financeiro]
responsible: sales-engineer
used_by: [proposal-builder, poc-setup, technical-demo]
updated_at: 2026-04-18
```
