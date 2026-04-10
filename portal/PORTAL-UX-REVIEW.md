# ML Laboratory — Portal UX Review
Uma the Empathizer | @ux-design-expert | 2026-04-09

---

## 1. Diagnóstico: Gaps Identificados no Spec Original

### Críticos (bloqueiam uso)
| Gap | Impacto | Onde |
|-----|---------|------|
| Sem navegação persistente (sidebar/nav) | Usuário se perde entre seções aninhadas | Global |
| Fila de validação sem notificação push | Validações ficam invisíveis até o usuário abrir | `/validacao/fila` |
| Botão "Ignorar" sem confirmação | Pode descartar validação importante sem intenção | Modal validação |
| Sem fluxo de onboarding guiado | Usuário novo não sabe por onde começar | Dashboard |
| Sem empty states definidos | Projeto novo parece quebrado (listas vazias) | Todas as seções |

### Importantes (degradam experiência)
| Gap | Impacto | Onde |
|-----|---------|------|
| Sem breadcrumbs | Hierarquia profunda (/projetos/:slug/validacao/fila) sem localização visual | Deep nav |
| Sem busca nas interações | Lista cresce indefinidamente sem filtragem eficaz | `/interacoes` |
| Sem ações em lote na fila | Validar 1 item por vez é inviável em alto volume | Fila |
| Sem estados de erro/loading | Comportamento indefinido quando API falha | Global |
| Perfil do agente é só texto | Impacto visual zero para uma das telas mais estratégicas | `/agente-perfil` |
| Convite de usuário sem e-mail de confirmação | Fluxo de invite incompleto | `/usuarios` |
| Sync de documento com falha não tem ação clara | Usuário não sabe o que fazer quando sync falha | `/validacao/documentos` |

### Melhorias (elevam qualidade)
| Melhoria | Benefício |
|----------|-----------|
| Indicador de "saúde do laboratório" no card de projeto | Visão rápida sem entrar no projeto |
| Score de confiança visual (gauge/barra) no perfil do agente | Leitura imediata do nível de maturidade |
| Timeline de atividade recente no projeto | Contexto histórico sem precisar de gráfico |
| Filtro de período nas interações | Análise por semana/mês |
| Atalhos de teclado na fila de validação | Produtividade para revisores frequentes |

---

## 2. Arquitetura de Navegação Refinada

### Estrutura de Layout Universal

```
┌─────────────────────────────────────────────────────────────────────┐
│ TOPBAR                                                               │
│  🧠 ML Laboratory   [breadcrumb: Dashboard > Omega Laser > Validação]│
│                                            [🔔 3] [👤 Ana] [sair]   │
├──────────────┬──────────────────────────────────────────────────────┤
│              │                                                        │
│  SIDEBAR     │  CONTENT AREA                                         │
│  (240px)     │                                                        │
│              │                                                        │
│  ── Projeto ─│                                                        │
│  📊 Visão    │                                                        │
│  💬 Interações│                                                       │
│  📋 Materiais │                                                       │
│  📈 Evolução │                                                        │
│  🧠 Perfil   │                                                        │
│  ────────────│                                                        │
│  ✅ Validação│                                                        │
│   ├ Fila [3] │                                                        │
│   ├ Histórico│                                                        │
│   ├ Erros [2]│                                                        │
│   └ Documentos│                                                       │
│  ────────────│                                                        │
│  ⚙️ Usuários │                                                        │
│  ────────────│                                                        │
│  [← Projetos]│                                                        │
│              │                                                        │
└──────────────┴──────────────────────────────────────────────────────┘
```

### Hierarquia de Rotas Revisada

```
/login
/dashboard                        ← Painel Global
  /dashboard/novo-projeto          ← Criar projeto (master only)

/p/:slug                           ← Detalhe do Projeto (slug = nome-projeto)
  /p/:slug/visao-geral              ← Overview com KPIs (era /projetos/:slug)
  /p/:slug/interacoes               ← Feed de conversas
    /p/:slug/interacoes/:id          ← Conversa individual
  /p/:slug/materiais                ← Guias, treinamentos, objeções
    /p/:slug/materiais/guias
    /p/:slug/materiais/treinamentos
    /p/:slug/materiais/objecoes
    /p/:slug/materiais/relatorios
  /p/:slug/evolucao                 ← Gráficos Metabase embed
  /p/:slug/agente                   ← Perfil do agente (refatorado)
  /p/:slug/numeros                  ← Números conectados
    /p/:slug/numeros/:id             ← Detalhe do número + teste de identificação
  /p/:slug/validacao/fila           ← Fila de validação (acesso direto via sidebar)
  /p/:slug/validacao/historico
  /p/:slug/validacao/erros
  /p/:slug/validacao/documentos
  /p/:slug/usuarios                 ← Gestão de usuários

/admin                             ← Master admin
  /admin/projetos
  /admin/usuarios
  /admin/instancias
  /admin/audit-log
```

---

## 3. Telas Refinadas

### 3.1 Dashboard `/dashboard` — Refinado

```
┌──────────────────────────────────────────────────────────────────────┐
│  🧠 ML Laboratory                              [🔔] [👤 Ewerton] [⚙️]│
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  Bom dia, Ewerton 👋  Você tem 3 validações pendentes               │
│  [→ Ver fila de validação]                                            │
│                                                                        │
│  Meus Projetos                                        [+ Novo Projeto]│
│                                                                        │
│  ┌───────────────────────────────────────────────────┐               │
│  │  🧠 Machine Learning — Omega Laser                 │               │
│  │  ─────────────────────────────────────────────    │               │
│  │  2 números ativos   │  47 msgs hoje  │  3 ⚠️ fila │               │
│  │                                                    │               │
│  │  Saúde do laboratório:  ████████░░  78%           │               │
│  │  Score médio: 8.1 📈   Taxa conversão: 52% 📈    │               │
│  │                                                    │               │
│  │                             [Acessar Projeto →]   │               │
│  └───────────────────────────────────────────────────┘               │
│                                                                        │
│  ┌───────────────────────────────────────────────────┐               │
│  │  + Adicionar novo projeto                          │               │
│  │  (apenas master)                                   │               │
│  └───────────────────────────────────────────────────┘               │
└──────────────────────────────────────────────────────────────────────┘
```

**Mudanças:** Mensagem de boas-vindas contextual com CTA de urgência para fila; "Saúde do laboratório" como barra de progresso visual; métricas mais densas no card.

---

### 3.2 Visão Geral do Projeto `/p/:slug/visao-geral` — Nova tela

```
┌── Sidebar ──┬──────────────────────────────────────────────────────┐
│  📊 Visão   │  Machine Learning — Omega Laser                       │
│  💬 Interações│  ─────────────────────────────────────────────────  │
│  📋 Materiais│                                                        │
│  📈 Evolução│  KPIs Rápidos                                          │
│  🧠 Perfil  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  ── Validação│  │ 47 msgs  │ │ 52% conv.│ │ 3 ⏳ fila│ │ 2 🔴 erros││
│  Fila [3]   │  │  hoje    │ │  semana  │ │ validação│ │  produto ││
│  Histórico  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘│
│  Erros [2]  │                                                        │
│  Documentos │  Atividade Recente                                     │
│  ── Números │  ────────────────────────────────────────────────     │
│  ⚙️ Usuários│  Hoje 14:23 — João analisou conversa sobre laser diodo│
│             │  Hoje 09:15 — Treinamento gerado para Maria           │
│ [← Projetos]│  Ontem 22:00 — Behavioral profiler executou           │
│             │  Ontem 08:00 — Performance report gerado              │
│             │  [Ver mais →]                                          │
│             │                                                        │
│             │  Números Conectados                                    │
│             │  ┌──────────────┬───────────┬──────────┬───────┐     │
│             │  │ Número       │ Setor     │ Hoje     │ Status│     │
│             │  ├──────────────┼───────────┼──────────┼───────┤     │
│             │  │ 5516-9999-01 │ Comercial │ 47 msgs  │  🟢   │     │
│             │  │ 5516-9999-02 │ Comercial │ 12 msgs  │  🟢   │     │
│             │  └──────────────┴───────────┴──────────┴───────┘     │
│             │  [Gerenciar números →]                                 │
└─────────────┴──────────────────────────────────────────────────────┘
```

---

### 3.3 Fila de Validação `/p/:slug/validacao/fila` — Refinada

```
┌── Sidebar ──┬──────────────────────────────────────────────────────┐
│  ✅ Fila [3]│  Fila de Validação                                    │
│             │                                                        │
│             │  [Pendente (3) ▼]  [Produto ▼]  [Agente ▼]  [Buscar] │
│             │                                    [✅ Aprovar todos] │
│             │                                                        │
│             │  ──────────────────────────────────────────────────  │
│             │                                                        │
│             │  ┌──────────────────────────────────────────────┐    │
│             │  │ ⏳ PENDENTE HUMANO          João — há 23min  │    │
│             │  │ Produto: Laser Diodo 808nm                    │    │
│             │  │                                               │    │
│             │  │ Resposta detectada:                           │    │
│             │  │ "O equipamento tem potência de 800W e        │    │
│             │  │  opera em comprimento de onda..."            │    │
│             │  │                                               │    │
│             │  │ 🤖 Validador automático:                     │    │
│             │  │  ❌ Não encontrou info suficiente no doc      │    │
│             │  │     Documento consultado: Catálogo 2026.pdf  │    │
│             │  │                                               │    │
│             │  │ [👁 Ver conversa]  [✅ Correto]  [❌ Corrigir]│    │
│             │  │                    ↑ confirmação implícita   │    │
│             │  └──────────────────────────────────────────────┘    │
│             │                                                        │
│             │  ┌──────────────────────────────────────────────┐    │
│             │  │ ⏳ PENDENTE HUMANO          Maria — há 1h    │    │
│             │  │ Produto: Dermocosméticos                      │    │
│             │  │ ...                                           │    │
│             │  └──────────────────────────────────────────────┘    │
│             │                                                        │
│             │  ┌──────────────────────────────────────────────┐    │
│             │  │ ⏳ PENDENTE HUMANO         Carlos — há 3h    │    │
│             │  │ Produto: Locação                              │    │
│             │  │ ...                                           │    │
│             │  └──────────────────────────────────────────────┘    │
└─────────────┴──────────────────────────────────────────────────────┘
```

**Mudanças:** Removido botão "Ignorar" (ação irreversível sem contexto claro). Substituído por fluxo: `✅ Correto` (aprovação direta, sem modal) e `❌ Corrigir` (abre modal de correção). Adicionado "Aprovar todos" para alto volume.

---

### 3.4 Modal de Correção — Refinado

```
┌─── Corrigir Resposta de Produto ──────────────────────────────────┐
│                                                          [✕ Fechar] │
│  Produto: Laser Diodo 808nm                                         │
│  Atendente: João | Número: 5516-9999-0001 | 23min atrás            │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                      │
│  Resposta original do atendente:                                    │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ "O equipamento tem potência de 800W e opera em             │    │
│  │  comprimento de onda de 808nm, sendo ideal para..."        │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  O que está incorreto: (obrigatório)                                │
│  [_________________________________________________]                │
│  Ex: "Potência correta é 600W, não 800W"                           │
│                                                                      │
│  Resposta correta: (obrigatório)                                    │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ [área de texto]                                             │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  Fonte da informação:                                                │
│  ○ Catálogo Laser 2026.pdf  ○ Meu conhecimento  ○ Outro [____]     │
│                                                                      │
│  ─────────────────────────────────────────────────────────────────  │
│  ⚙️ Efeito desta correção (definido pela sua permissão):           │
│                                                                      │
│     ✅ Registrar no histórico de correções                          │
│     ✅ Atualizar base do laboratório automaticamente                 │
│          ↑ você tem esta permissão ativada                          │
│                                                                      │
│  ─────────────────────────────────────────────────────────────────  │
│                              [Cancelar]  [💾 Salvar Correção]       │
└──────────────────────────────────────────────────────────────────────┘
```

**Mudanças:** Adicionado campo "O que está incorreto" para forçar especificidade; campo "Fonte da informação" para rastreabilidade; permissão exibida de forma transparente (sem checkbox — é um estado informativo, não configurável no momento da correção).

---

### 3.5 Perfil do Agente `/p/:slug/agente` — Refatorado (visual-first)

```
┌── Sidebar ──┬──────────────────────────────────────────────────────┐
│  🧠 Perfil  │  Perfil do Agente Comercial ML                        │
│             │  Última atualização: hoje 02:00 (behavioral profiler)  │
│             │  ─────────────────────────────────────────────────    │
│             │                                                        │
│             │  Maturidade Geral do Laboratório                       │
│             │  ████████████████░░░░  78%  [Avançado]               │
│             │                                                        │
│             │  Por domínio:                                          │
│             │  ┌─────────────────────┬─────────┬──────────────────┐│
│             │  │ Domínio             │ Conf.   │ Dados            ││
│             │  ├─────────────────────┼─────────┼──────────────────┤│
│             │  │ Abord. Equipamentos │ ██████  │ 89 conv. validadas││
│             │  │                     │ Alta    │                  ││
│             │  ├─────────────────────┼─────────┼──────────────────┤│
│             │  │ Objeção de Preço    │ █████░  │ 23 respostas val.││
│             │  │                     │ Alta    │                  ││
│             │  ├─────────────────────┼─────────┼──────────────────┤│
│             │  │ Abord. Locação      │ ███░░░  │ 12 conv. — ⚠️    ││
│             │  │                     │ Média   │ crescendo        ││
│             │  ├─────────────────────┼─────────┼──────────────────┤│
│             │  │ Dermocosméticos     │ █░░░░░  │ 2 conv. — ❌     ││
│             │  │                     │ Baixa   │ insuficiente     ││
│             │  └─────────────────────┴─────────┴──────────────────┘│
│             │                                                        │
│             │  Vendedores Mapeados (4)                               │
│             │  ┌───────────┬──────────────┬──────────┬───────────┐ │
│             │  │ João      │ Consultivo   │ Score 8.3│ ✅ Ativo   │ │
│             │  │ Maria     │ Emocional    │ Score 7.9│ ✅ Ativo   │ │
│             │  │ Pedro     │ Técnico      │ Score 7.1│ ⚠️ Poucos │ │
│             │  │ Carlos    │ Relacional   │ Score 8.0│ ✅ Ativo   │ │
│             │  └───────────┴──────────────┴──────────┴───────────┘ │
│             │                                                        │
│             │  Erros Ativos que afetam o agente (2)                 │
│             │  🔴 "Preço laser diodo" — 7x repetido  [Corrigir]    │
│             │  🔴 "Garantia equipamento" — 3x         [Corrigir]   │
└─────────────┴──────────────────────────────────────────────────────┘
```

---

### 3.6 Empty States — Definidos

#### Dashboard sem projetos (novo usuário master):
```
┌──────────────────────────────────────────────────────────┐
│                                                            │
│            🧠                                              │
│      Nenhum projeto ainda                                  │
│                                                            │
│   Crie seu primeiro laboratório de inteligência           │
│   para começar a capturar e analisar dados reais.         │
│                                                            │
│              [+ Criar Primeiro Projeto]                   │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

#### Fila vazia:
```
┌──────────────────────────────────────────────────────────┐
│            ✅                                              │
│      Fila limpa! Nenhuma validação pendente.              │
│   Todas as respostas de produto foram validadas.          │
└──────────────────────────────────────────────────────────┘
```

#### Interações sem dados (projeto novo):
```
┌──────────────────────────────────────────────────────────┐
│            💬                                              │
│      Nenhuma interação ainda                              │
│   O laboratório ainda não recebeu mensagens.             │
│                                                            │
│   Para começar a capturar dados:                          │
│   1. Execute as migrations do banco                       │
│   2. Importe os workflows no n8n                          │
│   3. Configure a instância Evolution API                  │
│   4. Escaneie o QR code                                   │
│                                                            │
│              [Ver Guia de Ativação →]                     │
└──────────────────────────────────────────────────────────┘
```

---

### 3.7 Onboarding Guiado — Novo Fluxo

Quando projeto existe mas sistema não está ativado:

```
┌── Checklist de Ativação ──────────────────────────────────────────┐
│  Configure seu laboratório                           3/5 passos   │
│  ████████████░░░░░░░  60%                                          │
│                                                                     │
│  ✅ 1. Projeto criado                                              │
│  ✅ 2. Número cadastrado (5516-9999-0001)                          │
│  ✅ 3. Migrations executadas                                        │
│  ⏳ 4. Workflows n8n importados         [Ver instruções]           │
│  ⏳ 5. WhatsApp conectado (QR Code)     [Conectar agora]           │
│                                                                     │
└───────────────────────────────────────────────────────────────────┘
```

---

## 4. Sistema de Notificações

### Badge no topbar (🔔)

```
🔔 3 notificações

─────────────────────────────────────
⏳ Nova validação pendente — João enviou
  resposta sobre Laser Diodo · 23min atrás
  [→ Revisar]

🔴 Erro de produto: "Preço laser diodo"
  atingiu 7 ocorrências sem correção
  [→ Corrigir]

✅ Behavioral Profiler executou com sucesso
  4 perfis de vendedor atualizados · hoje 02:00
─────────────────────────────────────
[Ver todas as notificações]
```

### Regras de notificação
| Evento | Para quem | Urgência |
|--------|-----------|----------|
| Nova validação pendente_humano | Usuários com permissão `pode_validar` | 🔴 Imediata |
| Erro atingiu 5+ ocorrências | project_admin | 🟡 Atenção |
| Workflow executou com sucesso | project_admin | ⚪ Info |
| Sync de documento falhou | project_admin | 🟡 Atenção |
| Novo usuário adicionado | project_admin | ⚪ Info |

---

## 5. Design System — Appsmith

### 5.1 Tokens de Cor

```css
/* Brand */
--color-brand-primary:     #1A1A2E;  /* azul-escuro — header, sidebar */
--color-brand-secondary:   #16213E;  /* sidebar fundo */
--color-brand-accent:      #0F3460;  /* links ativos, CTAs */
--color-brand-highlight:   #E94560;  /* badges urgência, erros críticos */

/* Semantic */
--color-status-success:    #10B981;  /* 🟢 ativo, aprovado */
--color-status-warning:    #F59E0B;  /* 🟡 atenção, média confiança */
--color-status-error:      #EF4444;  /* 🔴 erro, crítico */
--color-status-pending:    #6366F1;  /* ⏳ aguardando */
--color-status-info:       #3B82F6;  /* ℹ️ info, neutro */

/* Backgrounds */
--color-bg-page:           #F8FAFC;  /* fundo geral */
--color-bg-card:           #FFFFFF;  /* cards */
--color-bg-sidebar:        #1A1A2E;  /* sidebar */
--color-bg-topbar:         #FFFFFF;  /* topbar */

/* Text */
--color-text-primary:      #0F172A;  /* títulos */
--color-text-secondary:    #475569;  /* labels, metadados */
--color-text-muted:        #94A3B8;  /* placeholders */
--color-text-inverse:      #F8FAFC;  /* texto sobre dark */
```

### 5.2 Tipografia

```css
/* Font Stack */
--font-family-base:        'Inter', system-ui, sans-serif;
--font-family-mono:        'JetBrains Mono', 'Fira Code', monospace;

/* Scale */
--font-size-xs:    11px;  /* badges, labels */
--font-size-sm:    13px;  /* metadados, timestamps */
--font-size-base:  14px;  /* corpo, tabelas */
--font-size-md:    16px;  /* títulos de seção */
--font-size-lg:    20px;  /* títulos de página */
--font-size-xl:    24px;  /* KPIs grandes */
--font-size-2xl:   32px;  /* números de destaque */

/* Weight */
--font-weight-normal:   400;
--font-weight-medium:   500;
--font-weight-semibold: 600;
--font-weight-bold:     700;
```

### 5.3 Espaçamento (Grid de 4px)

```css
--space-1:   4px;
--space-2:   8px;
--space-3:   12px;
--space-4:   16px;
--space-5:   20px;
--space-6:   24px;
--space-8:   32px;
--space-10:  40px;
--space-12:  48px;
--space-16:  64px;
```

### 5.4 Componentes Atômicos — Appsmith

#### Atoms

**StatusBadge** — `status: 'active' | 'warning' | 'error' | 'pending' | 'success'`
```
🟢 Ativo    🟡 Atenção    🔴 Erro    🔵 Pendente    ✅ OK
```

**ConfidenceBar** — barra de progresso de confiança
```
████████░░  78%  [label opcional]
```

**KPICard** — card de métrica
```
┌───────────────┐
│    47          │
│  msgs hoje    │
│  ↑ +12% semana│
└───────────────┘
```

**ValidationItem** — item da fila de validação
```
┌────────────────────────────────────────────┐
│ [status badge]  [nome] · [número] · [tempo]│
│ [produto detectado]                        │
│ [trecho da resposta]                       │
│ [ação validador automático]                │
│              [Ver] [✅ Correto] [❌ Corrigir]│
└────────────────────────────────────────────┘
```

#### Molecules

**SidebarNavGroup** — grupo de navegação com itens e badges
**ProjectCard** — card do dashboard com métricas e CTA
**EmptyState** — estado vazio com ícone, mensagem e CTA opcional
**NotificationItem** — item no dropdown de notificações
**UserPermissionForm** — formulário de permissões com flags dependentes

### 5.5 Layout

```
Sidebar:    240px fixo (dark)
Topbar:      64px fixo
Content:    calc(100vw - 240px) com padding 24px
Card grid:  auto-fill, min 280px, gap 16px
Max width:  1400px centrado
```

---

## 6. Acessibilidade (WCAG AA — Appsmith)

| Item | Implementação |
|------|---------------|
| Contraste texto/fundo | Min 4.5:1 em todos os tokens de texto |
| Focus ring | Visível em todos os elementos interativos (outline 2px brand-accent) |
| Labels nos ícones | Todo ícone-only tem aria-label ou tooltip |
| Fila de validação | Suporte a teclado: `a` = Aprovar, `c` = Corrigir, `n` = Próximo |
| Status badges | Não dependem só de cor (incluem texto ou ícone) |

---

## 7. Resumo das Alterações Propostas

| # | Seção | Tipo | Prioridade |
|---|-------|------|------------|
| 1 | Sidebar + topbar persistentes | Estrutural | 🔴 Crítico |
| 2 | Breadcrumbs | Navegação | 🔴 Crítico |
| 3 | Sistema de notificações | Feature | 🔴 Crítico |
| 4 | Empty states (5 telas) | UX | 🟡 Importante |
| 5 | Onboarding checklist | UX | 🟡 Importante |
| 6 | KPI cards no dashboard | Visual | 🟡 Importante |
| 7 | Perfil do agente visual | Visual | 🟡 Importante |
| 8 | Remoção do botão "Ignorar" | UX/Segurança | 🟡 Importante |
| 9 | Campo "O que está incorreto" no modal | UX | 🟡 Importante |
| 10 | Atalhos de teclado na fila | Produtividade | 🟢 Melhoria |
| 11 | Design tokens Appsmith | Sistema | 🟡 Importante |
| 12 | Componentes atômicos definidos | Sistema | 🟡 Importante |

---

*— Uma, desenhando com empatia 💝*
*Handoff pronto para @devops (Gage) — SETUP-RAILWAY.md precisa de revisão de infra após estas mudanças de estrutura de rotas.*
