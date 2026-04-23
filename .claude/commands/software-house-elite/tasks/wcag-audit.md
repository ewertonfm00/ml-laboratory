# wcag-audit

## Purpose

Auditar a acessibilidade de um componente, paleta de cores ou tela completa contra o padrão WCAG 2.2 AA. Entrega um relatório com status de conformidade, falhas identificadas e correções específicas prontas para aplicar.

---

## Task Definition

```yaml
task: wcagAudit()
responsible: Pixel (Product Designer & Design System Architect)
atomic_layer: Atom

inputs:
  - campo: target
    tipo: string
    origem: User Input
    obrigatório: true
    descrição: "O que auditar: paleta de cores, componente específico, ou tela completa"

  - campo: level
    tipo: enum
    valores: [AA, AAA]
    default: AA
    obrigatório: false
    descrição: "Nível WCAG alvo. AA é o mínimo obrigatório; AAA recomendado para produtos de saúde ou acessibilidade crítica."

  - campo: context
    tipo: string
    origem: User Input
    obrigatório: false
    descrição: "Contexto de uso (ex: 'app voltado para terceira idade', 'dashboard interno corporativo')"

outputs:
  - campo: audit_report
    tipo: markdown
    destino: Response
    descrição: "Relatório completo com status por critério, falhas e correções"
```

---

## Workflow

### Passo 1 — Identificar Pares de Contraste

Para cada combinação texto/fundo presente no target:

| Par | Cor do Texto | Cor do Fundo | Razão | Status |
|-----|-------------|-------------|-------|--------|
| Body text | #111827 | #FFFFFF | 16.1:1 | PASS AAA |
| Placeholder | #9CA3AF | #FFFFFF | 2.8:1 | FAIL AA |
| Label sobre primary | #FFFFFF | #3B82F6 | 3.1:1 | FAIL AA (texto normal) / PASS AA (texto grande) |

**Limites WCAG 2.2:**
- Texto normal (< 18px regular ou < 14px bold): AA ≥ 4.5:1 | AAA ≥ 7:1
- Texto grande (≥ 18px regular ou ≥ 14px bold): AA ≥ 3:1 | AAA ≥ 4.5:1
- Componentes UI e gráficos: AA ≥ 3:1

### Passo 2 — Auditar Interatividade (se componente)

Verificar:
- [ ] Foco visível: todo elemento interativo tem estado de foco com outline ≥ 2px e contraste ≥ 3:1 contra o fundo
- [ ] Ordem de foco: sequência de tab lógica e previsível
- [ ] Tamanho de toque: área clicável mínima de 44×44px (WCAG 2.5.5 AAA) ou 24×24px (AA)
- [ ] Não depende apenas de cor para transmitir informação (WCAG 1.4.1)
- [ ] Animações respeitam `prefers-reduced-motion` (WCAG 2.3.3)

### Passo 3 — Auditar Semântica (se tela)

- [ ] Hierarquia de headings lógica (H1 → H2 → H3, sem pular níveis)
- [ ] Imagens decorativas têm `alt=""` | imagens informativas têm `alt` descritivo
- [ ] Formulários: cada input tem `<label>` associado (não apenas placeholder)
- [ ] Ícones interativos têm `aria-label`
- [ ] Mensagens de erro associadas ao campo via `aria-describedby`
- [ ] Modais: foco entra no modal ao abrir, retorna ao trigger ao fechar

### Passo 4 — Gerar Relatório

```markdown
## Relatório WCAG 2.2 AA — [Nome do Target]
Data: YYYY-MM-DD | Nível auditado: AA

### Resumo
- Total de critérios verificados: N
- PASS: N | FAIL: N | N/A: N

### Falhas Críticas (bloqueiam conformidade)
...

### Avisos (melhorias recomendadas)
...

### Correções Sugeridas

| Falha | Correção | Token/Valor |
|-------|---------|------------|
| Placeholder contraste 2.8:1 | Escurecer para #6B7280 | color.semantic.text.placeholder |
```

### Passo 5 — Priorizar Correções

Ordenar por impacto:
1. **Crítico:** contraste de texto (leitura bloqueada)
2. **Alto:** foco invisível (navegação por teclado impossível)
3. **Médio:** semântica incorreta (screen readers confusos)
4. **Baixo:** melhorias AAA opcionais

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] Todos os pares texto/fundo auditados com razão de contraste
  - [ ] Status AA declarado para cada par
  - [ ] Falhas listadas com correção específica (token ou valor)
  - [ ] Checklist de interatividade completo (se componente)
  - [ ] Relatório pronto para compartilhar com o time e cliente
```

---

## Metadata

```yaml
version: 1.0.0
tags: [wcag, acessibilidade, contraste, audit, pixel, software-house-elite]
updated_at: 2026-04-18
```
