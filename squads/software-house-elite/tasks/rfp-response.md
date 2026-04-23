# rfp-response

## Purpose

Elaborar resposta técnica completa a RFP (Request for Proposal) ou processo formal de seleção de fornecedor, mapeando aderência do sistema aos requisitos, identificando e endereçando gaps, e estruturando proposta comercial alinhada ao budget informado.

---

## Task Definition

```yaml
task: rfpResponse()
responsible: Flex (sales-engineer)
atomic_layer: Organism

inputs:
  - campo: rfp_documento
    tipo: string
    origem: User Input
    obrigatório: true
    descrição: "Texto completo do RFP ou lista de requisitos (pode ser colado diretamente)"

  - campo: prazo_resposta
    tipo: date
    origem: User Input
    obrigatório: true
    descrição: "Data limite para entrega da resposta ao RFP"

  - campo: requisitos_tecnicos
    tipo: array
    origem: rfp_documento (extraído)
    obrigatório: false
    descrição: "Lista de requisitos técnicos identificados no RFP (extraídos ou fornecidos)"

  - campo: budget_informado
    tipo: number
    origem: User Input
    obrigatório: false
    descrição: "Budget declarado no RFP em R$/mês (se informado)"

  - campo: concorrentes_provavel
    tipo: array
    origem: User Input
    obrigatório: false
    descrição: "Concorrentes prováveis no processo (para posicionamento diferencial)"

outputs:
  - campo: rfp_response_md
    tipo: markdown
    destino: File (docs/rfp/)
    persistido: true
    descrição: "Resposta completa ao RFP em Markdown pronta para envio"

  - campo: pontuacao_aderencia
    tipo: number
    destino: Response + rfp_response_md
    descrição: "Percentual de requisitos do RFP atendidos pelo sistema (0-100%)"

  - campo: gaps_identificados
    tipo: array
    destino: Response + rfp_response_md
    descrição: "Lista de requisitos não atendidos nativamente com plano de endereçamento"
```

---

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] rfp_documento fornecido (texto completo ou lista de requisitos)
  - [ ] prazo_resposta definido
  - [ ] Pelo menos 3 dias úteis disponíveis antes do prazo (alerta se menor)
  - [ ] Acesso às capacidades técnicas do sistema para mapeamento de aderência
```

---

## Workflow

### Passo 1 — Analisar Requisitos do RFP

Extrair e categorizar todos os requisitos do documento:

**Categorias de requisitos:**

| Categoria | Exemplos |
|-----------|---------|
| Funcional — Automação | "Processamento automático 24/7", "qualificação de leads", "notificações automáticas" |
| Funcional — Integração | "Integração com Google Calendar", "API aberta", "webhook" |
| Técnico — Segurança | "Dados em servidor nacional", "LGPD", "criptografia" |
| Técnico — Performance | "Tempo de resposta < 5s", "uptime 99.9%", "volume X operações/dia" |
| Comercial | "Contrato mínimo X meses", "SLA de suporte", "preço por usuário" |
| Diferencial | "IA generativa", "personalização", "relatórios analíticos" |

Para cada requisito, classificar:
- `ATENDIDO` — o sistema atende nativamente
- `PARCIAL` — Atende com customização ou workaround documentado
- `GAP` — Não atende — requer desenvolvimento ou parceria
- `N/A` — Não aplicável ao contexto do projeto

### Passo 2 — Mapear Capacidades vs. Requisitos

Mapear as capacidades nativas do sistema (conforme `config/tech-stack.md` e `docs/architecture/`) contra os requisitos identificados. Documentar cada capacidade com:
- Descrição técnica
- Evidência de implementação (se disponível)
- Limitações conhecidas

### Passo 3 — Identificar e Endereçar Gaps

Para cada requisito classificado como `GAP` ou `PARCIAL`:

1. **Avaliar impacto:** é bloqueante ou nice-to-have?
2. **Plano de endereçamento:**
   - Roadmap comprometido: "Previsto para Q3 2026"
   - Customização possível: "Desenvolvemos sob demanda em até 30 dias"
   - Integração via parceiro: "Integramos com [ferramenta X] do cliente"
   - Workaround documentado: "Resolvemos com [abordagem alternativa]"
3. **Impacto no preço:** customização muda o valor?

### Passo 4 — Calcular Pontuação de Aderência

```
total_requisitos = COUNT(todos os requisitos extraídos)
atendidos = COUNT(ATENDIDO) + (COUNT(PARCIAL) × 0.5)
pontuacao_aderencia = (atendidos / total_requisitos) × 100
```

Meta mínima para responder o RFP: `pontuacao_aderencia >= 70%`.
Se menor: comunicar ao prospect limitações antes de investir na resposta completa.

### Passo 5 — Elaborar Resposta Técnica

Estrutura da resposta:

```markdown
# Resposta ao RFP — {Sistema/Empresa}
**Data:** {{data}}
**Validade:** 30 dias

## 1. Sumário Executivo
[2 parágrafos: quem somos + por que somos a melhor escolha para este RFP]

## 2. Aderência aos Requisitos
[Tabela com todos os requisitos e classificação ATENDIDO/PARCIAL/GAP]

## 3. Solução Proposta
[Descrição técnica de como o sistema atende os principais requisitos]

## 4. Endereçamento de Gaps
[Para cada GAP identificado: plano e prazo]

## 5. Diferenciais Competitivos
[Por que nossa solução vs. concorrentes]

## 6. Proposta Comercial
[Plano recomendado, valor, condições alinhadas ao budget informado]

## 7. Referências e Cases
[Clientes similares que usam o sistema]

## 8. Próximos Passos
[Timeline de implementação se for selecionado]
```

### Passo 6 — Posicionamento vs. Concorrentes

Para cada concorrente provável, destacar diferencial do sistema:
- Analisar fraquezas típicas dos concorrentes com base no contexto do RFP
- Mapear diferenciais técnicos e comerciais da solução

### Passo 7 — Salvar e Revisar

Salvar em `docs/rfp/{empresa}-rfp-response-{YYYY-MM-DD}.md`.
Verificar: todos os requisitos endereçados? Budget compatível? Prazo viável?

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] Todos os requisitos do RFP mapeados e classificados
  - [ ] Pontuacao_aderencia calculada
  - [ ] Gaps endereçados com plano e prazo
  - [ ] Resposta completa gerada em Markdown
  - [ ] Proposta comercial alinhada ao budget informado
  - [ ] Arquivo salvo em docs/rfp/
```

---

## Acceptance Criteria

```yaml
acceptance-criteria:
  - [ ] Cada requisito do RFP tem classificação explícita (ATENDIDO/PARCIAL/GAP/N/A)
  - [ ] Pontuação de aderência calculada com fórmula documentada
  - [ ] Nenhum GAP ignorado — todos têm plano de endereçamento
  - [ ] Diferencial vs. concorrentes incluído
  - [ ] Proposta comercial compatível com budget informado (ou justificativa se acima)
  - [ ] Resposta entregue antes do prazo_resposta
  - [ ] Arquivo salvo e caminho retornado
```

---

## Metadata

```yaml
version: 1.0.0
tags: [sales, rfp, proposal, enterprise, competitive]
responsible: sales-engineer
updated_at: 2026-04-18
```
