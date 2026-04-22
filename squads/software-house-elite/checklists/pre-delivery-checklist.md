# Pre-Delivery Checklist

```yaml
checklist:
  id: pre-delivery
  version: 1.0.0
  created: 2026-04-22
  squad: software-house-elite
  purpose: "Validar qualidade e completude antes de entrega ao cliente"
  mode: blocking
  agents: [dev, qa, sdet, security-architect, tech-writer, project-manager]
```

---

## Bloco 1 — Qualidade de Código

```yaml
code_quality:
  - id: cq-001
    check: "Todos os testes automatizados passando (unit + integration)"
    type: blocking
    agent: sdet

  - id: cq-002
    check: "Cobertura de testes >= 80% nos módulos críticos"
    type: blocking
    agent: sdet

  - id: cq-003
    check: "CodeRabbit sem issues CRITICAL ou HIGH não resolvidos"
    type: blocking
    agent: dev

  - id: cq-004
    check: "Build de produção executando sem erros ou warnings críticos"
    type: blocking
    agent: dev

  - id: cq-005
    check: "Sem console.log, credenciais hardcoded ou TODOs críticos"
    type: blocking
    agent: dev
```

---

## Bloco 2 — Segurança

```yaml
security:
  - id: sec-001
    check: "OWASP Top 10 verificado para a entrega"
    type: blocking
    agent: security-architect

  - id: sec-002
    check: "Variáveis de ambiente em .env.example documentadas (sem valores reais)"
    type: blocking
    agent: devops

  - id: sec-003
    check: "Dependências verificadas: sem vulnerabilidades críticas (npm audit)"
    type: blocking
    agent: sdet

  - id: sec-004
    check: "Autenticação e autorização testadas com casos de borda"
    type: blocking
    agent: sdet
```

---

## Bloco 3 — Performance e Confiabilidade

```yaml
performance:
  - id: perf-001
    check: "Core Web Vitals: LCP < 2.5s, CLS < 0.1, FID < 100ms (se frontend)"
    type: blocking
    agent: frontend-specialist

  - id: perf-002
    check: "APIs críticas com tempo de resposta < 500ms sob carga esperada"
    type: recommended
    agent: sre

  - id: perf-003
    check: "Health checks e monitoring configurados em produção"
    type: blocking
    agent: sre
```

---

## Bloco 4 — Documentação e Aceite

```yaml
documentation:
  - id: doc-001
    check: "README atualizado com instruções de setup e deploy"
    type: blocking
    agent: tech-writer

  - id: doc-002
    check: "Changelog da entrega documentado"
    type: blocking
    agent: tech-writer

  - id: doc-003
    check: "Critérios de aceite do cliente validados um a um"
    type: blocking
    agent: project-manager

  - id: doc-004
    check: "Demo/walkthrough preparado para apresentação ao cliente"
    type: recommended
    agent: project-manager
```

---

## Resultado

```markdown
## Pre-Delivery Gate: {project_name} — {sprint/milestone}

**Blocking:** ___/16 passou
**Recommended:** ___/3 passou

**Decisão:**
[ ] APPROVED — Entrega pode ser realizada
[ ] APPROVED WITH CONCERNS — Entregar com ressalvas documentadas
[ ] BLOCKED — Corrigir antes de entregar

Bloqueadores:
-
```
