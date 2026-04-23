# design-system

## Purpose

Criar ou auditar um design system completo para um produto ou cliente da software house, seguindo a metodologia Atomic Design com tokens no formato Style Dictionary. Entrega um sistema visual que escala — consistente, acessível e handoff-ready para o @dev.

---

## Task Definition

```yaml
task: designSystem()
responsible: Pixel (Product Designer & Design System Architect)
atomic_layer: System

inputs:
  - campo: project_name
    tipo: string
    origem: User Input
    obrigatório: true
    descrição: "Nome do produto ou cliente (ex: 'Dashboard do Projeto X', 'App do Cliente Y')"

  - campo: mode
    tipo: enum
    valores: [create, audit]
    default: create
    obrigatório: false
    descrição: "Criar do zero ou auditar sistema existente"

  - campo: platforms
    tipo: array
    valores: [web, mobile, desktop]
    default: [web]
    obrigatório: false
    descrição: "Plataformas alvo do design system"

  - campo: brand_inputs
    tipo: string
    origem: User Input
    obrigatório: false
    descrição: "Guidelines de marca, paleta inicial, logo, referências visuais"

outputs:
  - campo: token_file
    tipo: json
    destino: Response
    descrição: "Tokens no formato Style Dictionary (primitive → semantic → component)"

  - campo: component_index
    tipo: markdown
    destino: Response
    descrição: "Índice de componentes com variantes, estados e dependências"

  - campo: system_doc
    tipo: markdown
    destino: Response
    descrição: "Documentação do design system para o time e para o cliente"
```

---

## Workflow

### Passo 1 — Elicitação de Contexto

Perguntar ao usuário:
1. Qual o produto e quem são os usuários finais?
2. Existe alguma identidade visual já definida (logo, cores, tipografia)?
3. Quais as plataformas alvo? (web, mobile, ambos)
4. Existe um design system parcial ou é do zero?
5. Quais os 5 componentes mais usados no produto?

### Passo 2 — Definir Tokens Primitivos

Estabelecer os valores brutos — nunca referenciados diretamente no produto:

```json
{
  "color": {
    "primitive": {
      "blue": { "500": "#3B82F6", "600": "#2563EB" },
      "neutral": { "50": "#F9FAFB", "900": "#111827" }
    }
  },
  "spacing": {
    "primitive": { "1": "4px", "2": "8px", "3": "12px", "4": "16px", "6": "24px", "8": "32px" }
  },
  "typography": {
    "primitive": {
      "fontFamily": { "sans": "Inter, system-ui, sans-serif" },
      "fontSize": { "sm": "14px", "base": "16px", "lg": "18px", "xl": "20px", "2xl": "24px" }
    }
  }
}
```

### Passo 3 — Definir Tokens Semânticos

Mapear intenção de uso sobre os primitivos:

```json
{
  "color": {
    "semantic": {
      "brand": { "primary": "{color.primitive.blue.500}", "primary-hover": "{color.primitive.blue.600}" },
      "text": { "default": "{color.primitive.neutral.900}", "muted": "{color.primitive.neutral.500}" },
      "surface": { "default": "#FFFFFF", "subtle": "{color.primitive.neutral.50}" }
    }
  },
  "spacing": {
    "semantic": { "xs": "{spacing.primitive.1}", "sm": "{spacing.primitive.2}", "md": "{spacing.primitive.4}", "lg": "{spacing.primitive.6}", "xl": "{spacing.primitive.8}" }
  }
}
```

### Passo 4 — Mapear Componentes (Atomic Design)

Estruturar da menor unidade para a maior:

- **Átomos:** Button, Input, Label, Badge, Icon, Avatar
- **Moléculas:** FormField (Label + Input + Error), SearchBar, Card Header
- **Organismos:** Navigation, DataTable, Modal, Form completo
- **Templates:** Page layouts (Dashboard, Auth, Settings)

Para cada componente definir: variantes, estados (default/hover/focus/disabled/error), responsividade.

### Passo 5 — Validar WCAG 2.2 AA

Verificar obrigatoriamente:
- Contraste texto normal ≥ 4.5:1 sobre o background
- Contraste texto grande (≥ 18px bold ou ≥ 24px) ≥ 3:1
- Estados de foco visíveis em todos os componentes interativos
- Semântica HTML correta nos componentes (role, aria-label)

### Passo 6 — Gerar Documentação

Entregar:
1. Token file JSON (Style Dictionary format)
2. Component index com variantes e estados
3. Usage guidelines para o time

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] Tokens primitivos definidos (cor, tipografia, espaçamento, sombra, raio, motion)
  - [ ] Tokens semânticos mapeados sobre os primitivos
  - [ ] Componentes indexados por nível Atomic Design
  - [ ] WCAG 2.2 AA validado na paleta completa
  - [ ] Documentação entregue em Markdown
```

---

## Metadata

```yaml
version: 1.0.0
tags: [design-system, tokens, atomic-design, pixel, software-house-elite]
updated_at: 2026-04-18
```
