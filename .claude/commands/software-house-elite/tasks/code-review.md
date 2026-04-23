# code-review

## Purpose

Conduzir code review estruturado de um PR, branch ou conjunto de arquivos, com foco em qualidade, padrões do time, segurança e testabilidade — para projetos de clientes da software house.

---

## Task Definition

```yaml
task: codeReview()
responsible: Kai (Tech Lead)
atomic_layer: Organism

inputs:
  - campo: target
    tipo: string
    origem: User Input
    obrigatório: true
    descrição: "PR number, branch name, ou lista de arquivos a revisar"

  - campo: focus_areas
    tipo: array
    valores: [security, performance, patterns, tests, architecture, all]
    default: all
    obrigatório: false

outputs:
  - campo: review_report
    tipo: markdown
    destino: Response
    descrição: "Review completo: APPROVE / REQUEST CHANGES / COMMENT"
```

---

## Workflow

### Passo 1 — Contexto da Mudança

- O que esta mudança faz? (ler PR description ou pedir ao autor)
- Qual story/issue está sendo endereçada?
- Quais arquivos foram modificados? (`git diff --stat`)
- É uma feature nova, bugfix, refactor ou hotfix?

### Passo 2 — Análise do Código

**Qualidade e Padrões:**
- [ ] Naming conventions seguidas (camelCase para JS/TS, kebab-case para arquivos)
- [ ] Funções com responsabilidade única (SRP)
- [ ] Sem código duplicado que deveria ser extraído
- [ ] TypeScript types definidos (sem `any` desnecessário)
- [ ] Async/await usado corretamente (sem Promise hell)
- [ ] Sem console.log em código de produção

**Segurança (para projetos de clientes):**
- [ ] Sem secrets hardcoded (API keys, senhas, tokens)
- [ ] Row-Level Security respeitada nas queries de banco de dados
- [ ] Inputs validados antes de uso
- [ ] SQL injection impossível (ORM ou parameterized queries)
- [ ] Multi-tenancy: dados de um tenant não vazam para outro

**Testes:**
- [ ] Novos comportamentos têm testes
- [ ] Testes cobrem happy path E edge cases
- [ ] Testes são independentes (sem dependências entre si)
- [ ] Mocks usados apenas onde necessário

**Performance:**
- [ ] Sem N+1 queries (verificar loops com queries dentro)
- [ ] Cache usado onde apropriado
- [ ] Queries com índices adequados
- [ ] Sem blocking operations em loops críticos

### Passo 3 — Veredicto

**APPROVE:** Código pronto para merge — padrões seguidos, testes adequados, sem issues críticos

**REQUEST CHANGES:** Issues que precisam ser corrigidos antes do merge:
- Listar cada issue com: local, severidade (CRITICAL/HIGH/MEDIUM), descrição, sugestão de fix

**COMMENT:** Observações não-bloqueantes, sugestões, perguntas

### Passo 4 — Formato do Report

```markdown
## Code Review — {branch/PR} — {data}

**Revisor:** Kai (Tech Lead)
**Veredicto:** ✅ APPROVE | ⚠️ REQUEST CHANGES | 💬 COMMENT

### Issues Encontrados

| Arquivo | Linha | Severidade | Descrição | Sugestão |
|---------|-------|-----------|-----------|---------|
| src/api/resource.ts | 42 | HIGH | Secret hardcoded | Usar process.env.API_KEY |

### Pontos Positivos
- ...

### Sugestões (não-bloqueantes)
- ...
```

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] Todos os arquivos modificados foram revisados
  - [ ] Veredicto emitido com justificativa
  - [ ] Issues categorizados por severidade
```

---

## Metadata

```yaml
version: 1.0.0
tags: [code-review, quality, tech-lead]
updated_at: 2026-04-06
```
