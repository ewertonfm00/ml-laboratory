# proposal-builder

## Purpose

Construir proposta técnica personalizada com ROI calculado para um cliente específico, selecionando o plano mais adequado ao perfil e gerando documento pronto para envio ao decisor.

---

## Task Definition

```yaml
task: proposalBuilder()
responsible: Flex (sales-engineer)
atomic_layer: Organism

inputs:
  - campo: cliente_nome
    tipo: string
    origem: User Input
    obrigatório: true
    descrição: "Nome completo do cliente"

  - campo: volume_operacoes_mes
    tipo: number
    origem: User Input
    obrigatório: true
    descrição: "Número de operações/transações realizadas por mês atualmente"

  - campo: ticket_medio
    tipo: number
    origem: User Input
    obrigatório: true
    descrição: "Valor médio por operação/transação em R$"

  - campo: taxa_perda_atual
    tipo: number
    origem: User Input
    obrigatório: true
    descrição: "Percentual de oportunidades perdidas atualmente (0-100)"

  - campo: plano_recomendado
    tipo: enum
    valores: [profissional, enterprise, custom]
    origem: User Input
    obrigatório: false
    default: profissional
    descrição: "Plano a ser apresentado na proposta"

  - campo: case_similar
    tipo: string
    origem: User Input
    obrigatório: false
    descrição: "Nome de cliente similar para prova social (anonimizado se necessário)"

outputs:
  - campo: proposta_md
    tipo: markdown
    destino: File (docs/proposals/)
    persistido: true
    descrição: "Proposta completa em Markdown com todas as seções preenchidas"

  - campo: roi_calculado
    tipo: number
    destino: Response + proposta_md
    descrição: "ROI anual projetado no cenário realista (R$)"

  - campo: prazo_validade
    tipo: date
    destino: proposta_md
    descrição: "Data limite de validade da proposta (padrão: 15 dias a partir da geração)"
```

---

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] cliente_nome, volume_operacoes_mes, ticket_medio e taxa_perda_atual fornecidos
  - [ ] Dores e contexto do cliente coletados (idealmente após demo ou discovery call)
  - [ ] Plano a recomendar identificado (default: Profissional)
  - [ ] Template de proposta disponível em squads/software-house-elite/templates/proposal-tmpl.md
```

---

## Workflow

### Passo 1 — Coletar Dados do Cliente

Se algum dado obrigatório não foi fornecido, elicitar:

1. **Volume:** "Quantas operações/transações vocês realizam em média por mês?"
2. **Ticket:** "Qual é o valor médio por operação?"
3. **Perda:** "Qual o percentual de oportunidades que não se convertem ou são perdidas?"
4. **Equipe:** "Quantas pessoas estão envolvidas no processo atual?"
5. **Processo atual:** "Como vocês gerenciam isso hoje? (manual, planilha, sistema?)"

### Passo 2 — Calcular ROI Projetado

Usando a task `roi-calculator` (ou inline se simples):

```
receita_atual_mes = volume_operacoes_mes × ticket_medio
perda_atual_mes = receita_atual_mes × (taxa_perda_atual / 100)

# Cenários de ganho com o sistema
ganho_conservador = perda_atual_mes × 0.30   # recupera 30% das perdas
ganho_realista    = perda_atual_mes × 0.50   # recupera 50% das perdas
ganho_otimista    = perda_atual_mes × 0.70   # recupera 70% das perdas

# Adicionar ganho de novas operações via automação
novos_conservador = volume_operacoes_mes × 0.05 × ticket_medio
novos_realista    = volume_operacoes_mes × 0.15 × ticket_medio
novos_otimista    = volume_operacoes_mes × 0.25 × ticket_medio

roi_conservador_anual = (ganho_conservador + novos_conservador) × 12 - (custo_plano × 12)
roi_realista_anual    = (ganho_realista    + novos_realista)    × 12 - (custo_plano × 12)
roi_otimista_anual    = (ganho_otimista    + novos_otimista)    × 12 - (custo_plano × 12)

break_even = custo_plano / ticket_medio  # operações extras para pagar o plano
```

### Passo 3 — Selecionar Plano Recomendado

| Perfil do Cliente | Plano | Justificativa |
|-------------------|-------|---------------|
| Pequeno porte, até 100 operações/mês | Profissional | Melhor custo-benefício |
| Médio porte, 100-300 operações/mês | Enterprise | Volume justifica features avançadas |
| Grande porte ou rede | Custom | Precificação por negociação |

### Passo 4 — Gerar Proposta Personalizada

Usar o template `proposal-tmpl.md` e substituir todos os placeholders:

| Placeholder | Valor |
|-------------|-------|
| `{{CLIENTE_NOME}}` | cliente_nome |
| `{{DATA_PROPOSTA}}` | data atual |
| `{{ROI_REALISTA}}` | roi_realista_anual formatado em R$ |
| `{{ROI_CONSERVADOR}}` | roi_conservador_anual |
| `{{ROI_OTIMISTA}}` | roi_otimista_anual |
| `{{BREAK_EVEN}}` | break_even (número de operações) |
| `{{PLANO_NOME}}` | nome do plano selecionado |
| `{{PLANO_PRECO}}` | preço do plano |
| `{{VOLUME_MES}}` | volume_operacoes_mes |
| `{{TICKET_MEDIO}}` | ticket_medio |
| `{{PERDA_ATUAL}}` | taxa_perda_atual% |
| `{{CASE_SIMILAR}}` | case_similar (ou placeholder genérico) |
| `{{PRAZO_VALIDADE}}` | data atual + 15 dias |

### Passo 5 — Incluir Prova Social

Se `case_similar` fornecido: referenciar resultado obtido por cliente similar.
Se não fornecido: usar case genérico baseado em resultados médios do portfólio da software house.

### Passo 6 — Definir Validade e Próximo Passo

- Prazo padrão: 15 dias corridos a partir da data de geração
- Próximo passo: "Aprovar a proposta → assinar contrato → iniciar setup em até 3 dias úteis"
- Salvar em `docs/proposals/{cliente_nome}-proposta-{YYYY-MM-DD}.md`

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] Proposta gerada em Markdown com todos os campos preenchidos
  - [ ] ROI calculado nos três cenários (conservador, realista, otimista)
  - [ ] Break-even em operações calculado
  - [ ] Arquivo salvo em docs/proposals/
  - [ ] Prazo de validade definido
```

---

## Acceptance Criteria

```yaml
acceptance-criteria:
  - [ ] Proposta contém nome do cliente e dados reais (não placeholders em branco)
  - [ ] ROI calculado com fórmula documentada e valores consistentes
  - [ ] Break-even apresentado em número de operações extras (não só em R$)
  - [ ] Plano recomendado justificado pelo perfil do cliente
  - [ ] Prova social incluída (case real ou genérico)
  - [ ] Próximos passos claros e com prazo de validade
  - [ ] Arquivo salvo e caminho retornado
```

---

## Metadata

```yaml
version: 1.0.0
tags: [sales, proposal, roi]
responsible: sales-engineer
updated_at: 2026-04-18
```
