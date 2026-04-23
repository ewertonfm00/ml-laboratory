# handoff-spec

## Purpose

Gerar a especificação de handoff completa de um componente ou tela para o @dev implementar sem ambiguidade e sem reunião de esclarecimento. O handoff é um contrato — tudo que o dev precisa saber para implementar fielmente está no documento.

---

## Task Definition

```yaml
task: handoffSpec()
responsible: Pixel (Product Designer & Design System Architect)
atomic_layer: Organism

inputs:
  - campo: target
    tipo: string
    origem: User Input
    obrigatório: true
    descrição: "Componente ou tela a entregar em handoff (ex: 'Button component', 'tela de Login')"

  - campo: platform
    tipo: enum
    valores: [web, mobile, responsive]
    default: web
    obrigatório: false
    descrição: "Plataforma de implementação"

  - campo: framework
    tipo: string
    origem: User Input
    obrigatório: false
    descrição: "Framework de implementação (ex: React, Next.js, Vue, React Native)"

outputs:
  - campo: handoff_doc
    tipo: markdown
    destino: Response
    descrição: "Documento de handoff completo e implementável"
```

---

## Workflow

### Passo 1 — Identificar o Escopo

Confirmar com o usuário:
1. É um componente isolado ou uma tela completa?
2. Qual o framework de implementação?
3. Já existe token file gerado para este projeto?
4. O componente tem dependências de outros componentes?

### Passo 2 — Gerar Especificação de Tokens

Listar todos os tokens que o componente usa — nunca valores hardcoded:

```markdown
## Tokens Utilizados

| Propriedade | Token | Valor Resolvido |
|-------------|-------|----------------|
| Background default | `color.semantic.surface.default` | #FFFFFF |
| Background hover | `color.semantic.brand.primary` | #3B82F6 |
| Texto | `color.semantic.text.default` | #111827 |
| Padding horizontal | `spacing.semantic.md` | 16px |
| Padding vertical | `spacing.semantic.sm` | 8px |
| Border radius | `radius.md` | 6px |
| Sombra | `shadow.sm` | 0 1px 2px rgba(0,0,0,0.05) |
```

### Passo 3 — Especificar Variantes e Estados

Para cada variante do componente:

```markdown
## Variantes

### Primary Button
- Background: `color.semantic.brand.primary`
- Texto: `color.semantic.text.on-brand`
- Border: nenhum

### Secondary Button
- Background: transparent
- Texto: `color.semantic.brand.primary`
- Border: 1px solid `color.semantic.brand.primary`

### Ghost Button
- Background: transparent
- Texto: `color.semantic.text.muted`
- Border: nenhum

## Estados

| Estado | Mudança visual | Transição |
|--------|---------------|-----------|
| Default | — | — |
| Hover | Background escurece 10% | 150ms ease |
| Focus | Outline 2px `color.semantic.focus.ring` offset 2px | instant |
| Active | Background escurece 20% + scale(0.98) | 100ms ease |
| Disabled | Opacity 40% + cursor not-allowed | instant |
| Loading | Ícone spinner substitui label + disabled | instant |
```

### Passo 4 — Responsividade

```markdown
## Responsividade

| Breakpoint | Comportamento |
|-----------|--------------|
| mobile (< 768px) | width: 100% |
| tablet (768px+) | width: auto, min-width: 120px |
| desktop (1280px+) | sem alteração |
```

### Passo 5 — Acessibilidade

```markdown
## Acessibilidade

- Elemento HTML: `<button>` (nunca `<div>` ou `<span>`)
- role: button (nativo, não precisar declarar)
- aria-disabled="true" quando disabled (não usar atributo disabled puro)
- aria-busy="true" + aria-label="Carregando..." quando loading
- Navegação por teclado: Enter e Space ativam a ação
- Focus ring visível: outline 2px, offset 2px, cor `color.semantic.focus.ring`
```

### Passo 6 — Animações e Motion

```markdown
## Motion

| Interação | Propriedade | Duração | Easing |
|-----------|------------|---------|--------|
| Hover | background-color | 150ms | ease |
| Active | transform scale | 100ms | ease |
| Loading in | opacity | 200ms | ease-in |
```

### Passo 7 — Notas de Implementação

Qualquer detalhe que não caiba nas seções anteriores:
- Gotchas conhecidos
- Dependências de outros componentes
- Comportamentos condicionais por contexto
- O que NÃO implementar (anti-patterns identificados)

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] Todos os tokens referenciados por nome (sem valor hardcoded)
  - [ ] Todas as variantes especificadas
  - [ ] Todos os estados documentados com transição
  - [ ] Responsividade por breakpoint definida
  - [ ] Requisitos de acessibilidade completos
  - [ ] Motion/animações especificadas com duração e easing
  - [ ] Dev consegue implementar sem perguntas adicionais
```

---

## Metadata

```yaml
version: 1.0.0
tags: [handoff, spec, tokens, acessibilidade, pixel, software-house-elite]
updated_at: 2026-04-18
```
