# token-audit

## Purpose

Extrair, organizar e gerar design tokens a partir de qualquer input visual — screenshots, Figma, guidelines de marca ou código existente. Produz um token file pronto para uso no Style Dictionary, com hierarquia primitive → semantic → component.

---

## Task Definition

```yaml
task: tokenAudit()
responsible: Pixel (Product Designer & Design System Architect)
atomic_layer: Atom

inputs:
  - campo: source
    tipo: enum
    valores: [screenshot, figma_url, brand_guidelines, existing_code, description]
    obrigatório: true
    descrição: "Origem do input visual para extração de tokens"

  - campo: input_content
    tipo: string
    origem: User Input
    obrigatório: true
    descrição: "O conteúdo em si: URL do Figma, imagem, descrição de cores, snippet de CSS"

  - campo: token_categories
    tipo: array
    valores: [color, typography, spacing, shadow, radius, motion, opacity]
    default: [color, typography, spacing]
    obrigatório: false
    descrição: "Categorias de tokens a extrair"

outputs:
  - campo: token_file
    tipo: json
    destino: Response
    descrição: "Token file completo no formato Style Dictionary"

  - campo: wcag_report
    tipo: markdown
    destino: Response
    descrição: "Relatório de contraste e conformidade WCAG 2.2 AA"

  - campo: consolidation_notes
    tipo: markdown
    destino: Response
    descrição: "Notas sobre cores similares consolidadas, inconsistências detectadas e recomendações"
```

---

## Workflow

### Passo 1 — Analisar o Input

Dependendo da origem:

**Screenshot/imagem:**
- Identificar paleta de cores predominante (máx. 8 cores distintas)
- Mapear hierarquia tipográfica (H1, H2, body, caption)
- Detectar grid base (4px ou 8px) pelo espaçamento entre elementos
- Identificar raios de borda e sombras presentes

**Figma URL (via MCP Figma):**
- Extrair estilos de cor e tipografia diretamente dos estilos do arquivo
- Verificar variáveis Figma existentes

**Brand guidelines / descrição:**
- Mapear cores primárias, secundárias e neutras declaradas
- Registrar fontes e pesos indicados
- Derivar escala de espaçamento a partir do base unit informado

**CSS/código existente:**
- Identificar variáveis CSS já definidas
- Consolidar valores repetidos
- Detectar valores hardcoded que deveriam ser tokens

### Passo 2 — Consolidar e Nomear

Agrupar valores similares (diferença < 5% em hex → consolidar):
- Nomear cores por papel semântico, não por valor (brand.primary, não #3B82F6)
- Detectar duplicatas e sugerir consolidação
- Separar o que é primitivo do que é semântico

### Passo 3 — Gerar Token File

Estrutura obrigatória Style Dictionary:

```json
{
  "color": {
    "primitive": {},
    "semantic": {}
  },
  "typography": {
    "primitive": {
      "fontFamily": {},
      "fontSize": {},
      "fontWeight": {},
      "lineHeight": {}
    }
  },
  "spacing": {
    "primitive": {},
    "semantic": {}
  },
  "shadow": {},
  "radius": {},
  "motion": {
    "duration": {},
    "easing": {}
  }
}
```

Regra: tokens semânticos sempre referenciam primitivos com `{path.to.primitive}` — nunca valor hardcoded.

### Passo 4 — Validar WCAG 2.2

Para cada par texto/fundo identificado:
- Calcular razão de contraste (fórmula luminância relativa WCAG)
- Marcar: PASS AA / FAIL AA / PASS AAA
- Sugerir ajuste de valor quando FAIL

### Passo 5 — Entregar com Notas

Junto ao token file, entregar:
- Lista de consolidações feitas ("cor #1E3A5F era 2% diferente de brand.primary — consolidada")
- Inconsistências detectadas ("espaçamento 14px detectado — fora da escala 4px, sugerido 16px")
- Próximos passos (quais categorias faltam, o que precisa de input adicional)

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] Token file JSON gerado com hierarquia primitive → semantic
  - [ ] Cores consolidadas sem duplicatas
  - [ ] WCAG 2.2 AA validado nos pares texto/fundo
  - [ ] Notas de consolidação e inconsistências entregues
```

---

## Metadata

```yaml
version: 1.0.0
tags: [tokens, style-dictionary, wcag, audit, pixel, software-house-elite]
updated_at: 2026-04-18
```
