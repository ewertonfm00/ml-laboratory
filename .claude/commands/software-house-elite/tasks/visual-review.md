# visual-review

## Purpose

Revisar a qualidade visual de uma UI existente — screenshot, URL ou descrição de tela — identificando problemas de hierarquia, consistência, ritmo visual e oportunidades concretas de melhoria. O output é um diagnóstico estruturado com prioridades, não uma lista de opiniões.

---

## Task Definition

```yaml
task: visualReview()
responsible: Pixel (Product Designer & Design System Architect)
atomic_layer: Organism

inputs:
  - campo: source
    tipo: enum
    valores: [screenshot, url, description, figma_url]
    obrigatório: true
    descrição: "Origem da UI a revisar"

  - campo: input_content
    tipo: string
    origem: User Input
    obrigatório: true
    descrição: "A URL, imagem, URL do Figma ou descrição da tela"

  - campo: focus_areas
    tipo: array
    valores: [hierarchy, consistency, spacing, typography, color, accessibility, overall]
    default: [overall]
    obrigatório: false
    descrição: "Áreas específicas a priorizar na revisão"

  - campo: context
    tipo: string
    origem: User Input
    obrigatório: false
    descrição: "Contexto do produto (ex: 'dashboard B2B', 'app mobile', 'landing page')"

outputs:
  - campo: review_report
    tipo: markdown
    destino: Response
    descrição: "Diagnóstico estruturado com problemas identificados, severidade e correções"
```

---

## Workflow

### Passo 1 — Primeiro Olhar (5 segundos)

Registrar a impressão imediata antes de analisar detalhes:
- O que chama atenção primeiro? (deve ser a ação principal)
- A hierarquia visual guia o olho na direção certa?
- O produto parece profissional e confiável?

### Passo 2 — Auditoria de Hierarquia Visual

Verificar:
- **Focal point:** existe um elemento dominante claro por seção?
- **Peso tipográfico:** headings, subheadings, body e caption têm tamanhos distintos o suficiente?
- **Contraste de importância:** o CTA primário se destaca dos secundários?
- **Espaço em branco:** existe respiro suficiente para não criar sobrecarga cognitiva?

### Passo 3 — Auditoria de Consistência

- Os mesmos componentes têm a mesma aparência em toda a tela?
- Espaçamentos seguem uma escala (múltiplos de 4px ou 8px)?
- Cores são usadas com intenção consistente (ex: azul = ação, cinza = desabilitado)?
- Bordas e raios são consistentes entre componentes do mesmo tipo?

### Passo 4 — Auditoria de Tipografia

- Máximo 2 famílias tipográficas na tela?
- Comprimento de linha: entre 45–75 caracteres por linha para texto corrido?
- Espaçamento entre linhas (line-height): ≥ 1.4 para texto corrido?
- Alinhamento: texto corrido sempre à esquerda (nunca centralizado em parágrafos)?

### Passo 5 — Auditoria de Cor

- A paleta tem hierarquia clara (primária, secundária, neutra, feedback)?
- Cores de feedback (erro, sucesso, aviso) são distintas da paleta de marca?
- As cores transmitem a emoção/posicionamento correto do produto?
- WCAG 2.2 AA: pares texto/fundo com contraste ≥ 4.5:1?

### Passo 6 — Gerar Diagnóstico

```markdown
## Visual Review — [Nome da Tela/Produto]

### Impressão Geral
[Primeiro olhar — o que funciona e o que não funciona imediatamente]

### Problemas Identificados

| # | Problema | Área | Severidade | Correção |
|---|----------|------|-----------|---------|
| 1 | CTA primário e secundário têm o mesmo peso visual | Hierarquia | Alta | Primary: filled button / Secondary: ghost button |
| 2 | Espaçamentos inconsistentes (14px, 17px, 22px) | Consistência | Média | Normalizar para escala 8px: 16px, 24px |
| 3 | Placeholder tem contraste 2.8:1 | Acessibilidade | Alta | Escurecer para #6B7280 (contraste 4.6:1) |

### O que está funcionando
[Pontos positivos que devem ser preservados]

### Prioridade de Correções
1. [Crítico] ...
2. [Alto] ...
3. [Médio] ...
```

### Passo 7 — Classificar Severidade

| Severidade | Critério |
|-----------|---------|
| Crítico | Impede o usuário de completar a ação principal |
| Alta | Causa confusão ou erro frequente |
| Média | Reduz qualidade percebida do produto |
| Baixa | Melhoria incremental de polish |

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] Impressão de primeiro olhar registrada
  - [ ] Problemas identificados por área com severidade
  - [ ] Cada problema tem correção específica e acionável
  - [ ] Pontos positivos documentados (evitar regredir o que funciona)
  - [ ] Prioridades ordenadas por impacto no usuário
```

---

## Metadata

```yaml
version: 1.0.0
tags: [visual-review, ux, hierarquia, consistencia, pixel, software-house-elite]
updated_at: 2026-04-18
```
