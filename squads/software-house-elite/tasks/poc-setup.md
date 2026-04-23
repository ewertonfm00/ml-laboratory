# poc-setup

## Purpose

Configurar a Prova de Conceito (PoC) de 7 dias para lead qualificado via MEDDIC, ativando o sistema no ambiente real do cliente e definindo métricas de sucesso claras para a avaliação final.

---

## Task Definition

```yaml
task: pocSetup()
responsible: Flex (sales-engineer) + @ai-engineer (configuração técnica)
atomic_layer: Organism

inputs:
  - campo: cliente_nome
    tipo: string
    origem: User Input
    obrigatório: true
    descrição: "Nome do cliente onde a PoC será configurada"

  - campo: contato_responsavel
    tipo: string
    origem: User Input
    obrigatório: false
    descrição: "Nome e contato do responsável no cliente para check-ins"

  - campo: requisitos_poc
    tipo: array
    origem: User Input
    obrigatório: true
    descrição: "Lista de funcionalidades a validar na PoC"

  - campo: meddic_score
    tipo: number
    origem: Qualificação anterior
    obrigatório: true
    descrição: "Score MEDDIC obtido na qualificação (mínimo 4 para acionar PoC)"

outputs:
  - campo: poc_configurada
    tipo: boolean
    destino: CRM
    descrição: "Confirma se a PoC foi configurada com sucesso"

  - campo: metricas_sucesso
    tipo: object
    destino: poc-agreement + CRM
    descrição: "Métricas acordadas para avaliação no dia 7"

  - campo: data_checkin
    tipo: date
    destino: Agenda + CRM
    descrição: "Data do check-in intermediário (dia 3 da PoC)"

  - campo: data_avaliacao
    tipo: date
    destino: Agenda + CRM
    descrição: "Data da avaliação final (dia 7 da PoC)"
```

---

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] meddic_score >= 4 (PoC bloqueada para leads com score < 4)
  - [ ] Requisitos da PoC definidos com pelo menos 3 itens mensuráveis
  - [ ] Template de acordo poc-agreement-tmpl.md disponível em squads/software-house-elite/templates/
  - [ ] @ai-engineer (Aiden) disponível para configuração técnica
```

---

## Workflow

### Passo 1 — Verificar Qualificação MEDDIC

Confirmar que o score MEDDIC é suficiente antes de prosseguir:

| Score MEDDIC | Decisão |
|--------------|---------|
| >= 6 | PoC autorizada — prioridade alta |
| 4-5 | PoC autorizada — padrão |
| < 4 | PoC BLOQUEADA — retornar para nurturing |

Dimensões do MEDDIC:
- **M** Metrics: tem dados quantitativos do problema atual?
- **E** Economic Buyer: fala com o dono/decisor?
- **D** Decision Criteria: critérios de avaliação definidos?
- **D** Decision Process: como a decisão será tomada?
- **I** Identified Pain: dor clara e urgente?
- **C** Champion: tem alguém interno defendendo a solução?

### Passo 2 — Coletar Dados Técnicos

Elicitar dados necessários para a configuração:

1. **Ambiente do cliente:** sistemas existentes, integrações necessárias
2. **Requisitos funcionais:** quais funcionalidades devem ser validadas na PoC
3. **Critérios de sucesso:** como o cliente medirá o êxito da PoC
4. **Restrições técnicas:** infraestrutura, segurança, compliance

### Passo 3 — Acionar @ai-engineer para Configuração Técnica

Delegar a Aiden (@ai-engineer):

```
Briefing para @ai-engineer:
- cliente_nome: {{cliente_nome}}
- requisitos_poc: {{lista}}
- Ação: configurar instância do sistema para o cliente
- Prazo: antes da data_inicio_poc
```

Aguardar confirmação de `poc_configurada: true` do @ai-engineer.

### Passo 4 — Definir Métricas de Sucesso

Acordar com o prospect as métricas que serão avaliadas no dia 7:

| Métrica | Meta Sugerida | Ajustável? |
|---------|---------------|-----------|
| Funcionalidades validadas | >= 80% dos requisitos definidos | Sim |
| Tempo de resposta do sistema | conforme SLO definido | Sim |
| Itens processados automaticamente | >= N definido no início | Sim |
| Satisfação do prospect | "Aprovaria o sistema" | Não |

Registrar as metas acordadas em `metricas_sucesso`.

### Passo 5 — Gerar Acordo de PoC

Usar template `poc-agreement-tmpl.md` para gerar o documento formal:

1. Preencher todos os placeholders com dados reais
2. Incluir as métricas de sucesso definidas no Passo 4
3. Definir `data_inicio`: D+1 após assinatura do acordo
4. Calcular `data_checkin`: data_inicio + 3 dias
5. Calcular `data_avaliacao`: data_inicio + 7 dias

Salvar em `docs/poc/{cliente_nome}-poc-agreement-{YYYY-MM-DD}.md`.

### Passo 6 — Agendar Check-ins

1. **Check-in Dia 3:** reunião de 15 min para ajustes rápidos (call ou mensagem)
2. **Avaliação Dia 7:** reunião de 45 min para análise dos resultados e decisão de contratação

Enviar convites de calendário para o contato responsável do cliente.

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] meddic_score >= 4 verificado e registrado
  - [ ] @ai-engineer configurou o sistema no ambiente do cliente
  - [ ] Métricas de sucesso acordadas e documentadas
  - [ ] Acordo de PoC gerado e salvo
  - [ ] Check-in (D+3) e avaliação (D+7) agendados na agenda do prospect
  - [ ] CRM atualizado com poc_configurada, metricas_sucesso, data_checkin, data_avaliacao
```

---

## Acceptance Criteria

```yaml
acceptance-criteria:
  - [ ] PoC só iniciada com meddic_score >= 4
  - [ ] Sistema funcionando no ambiente do cliente antes do dia 1
  - [ ] Requisitos corretamente configurados para validação
  - [ ] Métricas de sucesso específicas e mensuráveis acordadas com o prospect
  - [ ] Acordo de PoC assinado (ou confirmado) antes do início
  - [ ] Check-in D+3 e avaliação D+7 agendados com o prospect
```

---

## Metadata

```yaml
version: 1.0.0
tags: [sales, poc, meddic, onboarding]
responsible: sales-engineer
depends_on: [roi-calculator, proposal-builder]
delegates_to: [ai-engineer]
updated_at: 2026-04-18
```
