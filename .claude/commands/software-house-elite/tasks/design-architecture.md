# design-architecture

## Purpose

Desenhar ou revisar a arquitetura de um componente ou sistema do projeto usando o modelo C4 (Context, Container, Component, Code), com foco em multi-tenancy, escalabilidade e integração entre os sistemas existentes.

---

## Task Definition

```yaml
task: designArchitecture()
responsible: Nova (Enterprise Architect)
atomic_layer: Organism

inputs:
  - campo: scope
    tipo: string
    origem: User Input
    obrigatório: true
    descrição: "O que está sendo arquitetado (ex: 'módulo de processamento', 'módulo multi-tenant', 'dashboard realtime')"

  - campo: level
    tipo: enum
    valores: [context, container, component, all]
    default: container
    obrigatório: false
    descrição: "Nível do modelo C4 a produzir"

  - campo: constraints
    tipo: array
    origem: User Input
    obrigatório: false
    descrição: "Restrições técnicas ou de negócio (ex: 'deve usar Railway', 'custo < R$500/mês')"

outputs:
  - campo: architecture_doc
    tipo: markdown
    destino: Response + docs/architecture/
    descrição: "Diagrama C4 em texto + decisões técnicas + ADRs necessários"
```

---

## Workflow

### Passo 1 — Entender o Escopo

Elicitar:
1. O que este sistema/componente faz?
2. Quem são os atores (usuários, sistemas externos)?
3. Quais sistemas existentes ele integra?
4. Qual o volume esperado? (N tenants, N transações/dia, N usuários no dashboard)
5. Quais os requisitos não-funcionais? (latência, disponibilidade, custo)

### Passo 2 — Contexto Existente do Projeto

Sempre considerar o stack atual documentado em `config/tech-stack.md` e `docs/architecture/`.
Mapear os serviços existentes, bancos de dados, APIs externas e fluxos de dados antes de propor mudanças.

### Passo 3 — Desenho C4

**Nível Context (L1):** Sistemas externos e usuários que interagem com o componente
**Nível Container (L2):** Serviços, aplicações, bancos de dados e seus relacionamentos
**Nível Component (L3):** Módulos internos de um container específico

Produzir diagrama em Mermaid ou texto estruturado.

### Passo 4 — Decisões Arquiteturais

Para cada decisão não-óbvia, criar ou referenciar um ADR:
- Decisão tomada
- Alternativas consideradas
- Razão da escolha
- Consequências

### Passo 5 — Gaps e Riscos

Identificar:
- O que ainda não está resolvido na arquitetura
- Riscos técnicos (single points of failure, vendor lock-in, etc.)
- Débito técnico introduzido (se houver)
- Próximos passos recomendados

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] Diagrama C4 no nível solicitado produzido
  - [ ] Decisões arquiteturais documentadas
  - [ ] Riscos identificados
  - [ ] ADRs criados para decisões irreversíveis
```

---

## Metadata

```yaml
version: 1.0.0
tags: [architecture, c4, design, enterprise-architect]
updated_at: 2026-04-06
```
