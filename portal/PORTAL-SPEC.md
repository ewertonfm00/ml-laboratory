# ML Laboratory — Portal Spec v2.0
Appsmith + Metabase | Railway
Revisado por @ux-design-expert (Uma) em 2026-04-09

---

## Hierarquia de Rotas

```
/login
/dashboard                              ← Painel Global (MASTER vê todos)
  /dashboard/novo-projeto               ← Criar projeto (master only)

/p/:slug                                ← Projeto (layout com sidebar persistente)
  /p/:slug/visao-geral                  ← Overview + KPIs + atividade recente
  /p/:slug/interacoes                   ← Feed de conversas em tempo real
    /p/:slug/interacoes/:id             ← Conversa individual
  /p/:slug/materiais/guias              ← Guias de abordagem gerados
  /p/:slug/materiais/treinamentos       ← Treinamentos personalizados
  /p/:slug/materiais/objecoes           ← Catálogo de objeções
  /p/:slug/materiais/relatorios         ← Relatórios de performance
  /p/:slug/evolucao                     ← Gráficos de evolução (Metabase embed)
  /p/:slug/agente                       ← Perfil visual do agente
  /p/:slug/numeros                      ← Números conectados
    /p/:slug/numeros/:id                ← Detalhe + teste de identificação
  /p/:slug/validacao/fila               ← Fila de validação (agente → humano)
  /p/:slug/validacao/historico          ← Histórico de validações e correções
  /p/:slug/validacao/erros              ← Rastreador de erros por produto
  /p/:slug/validacao/documentos         ← Docs de produto cadastrados
  /p/:slug/usuarios                     ← Gestão de usuários (project_admin)

/admin                                  ← Painel Master
  /admin/projetos                       ← CRUD de projetos
  /admin/usuarios                       ← Todos os usuários
  /admin/instancias                     ← Instâncias Evolution API
  /admin/audit-log                      ← Log completo de ações
```

---

## Layout Universal

Todo projeto usa layout de 3 zonas fixas:

```
┌─────────────────────────────────────────────────────────────────────┐
│ TOPBAR (64px)                                                         │
│  🧠 ML Laboratory   [breadcrumb: Projetos > Omega Laser > Validação] │
│                                              [🔔 3] [👤 Ana] [Sair]  │
├──────────────┬──────────────────────────────────────────────────────┤
│              │                                                        │
│  SIDEBAR     │  CONTENT AREA                                         │
│  (240px)     │  (padding: 24px, max-width: 1400px)                  │
│  dark bg     │                                                        │
│              │                                                        │
│  📊 Visão    │                                                        │
│  💬 Interações│                                                       │
│  📋 Materiais │  ▸ guias                                             │
│  📈 Evolução │    ▸ treinamentos                                     │
│  🧠 Perfil   │    ▸ objeções                                         │
│  ────────────│    ▸ relatórios                                        │
│  ✅ Validação│                                                        │
│   ├ Fila [3] │                                                        │
│   ├ Histórico│                                                        │
│   ├ Erros [2]│                                                        │
│   └ Documentos│                                                       │
│  ────────────│                                                        │
│  📱 Números  │                                                        │
│  ────────────│                                                        │
│  ⚙️ Usuários │                                                        │
│  ────────────│                                                        │
│  [← Projetos]│                                                        │
│              │                                                        │
└──────────────┴──────────────────────────────────────────────────────┘
```

---

## Tela: Dashboard `/dashboard`

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
│  ┌────────────────────────────────────────────────────────┐          │
│  │  🧠 Machine Learning — Omega Laser                      │          │
│  │  ─────────────────────────────────────────────────     │          │
│  │  2 números ativos  │  47 msgs hoje  │  3 ⚠️ fila       │          │
│  │                                                         │          │
│  │  Saúde do laboratório:  ████████░░  78%                │          │
│  │  Score médio: 8.1 📈   Taxa conversão: 52% 📈         │          │
│  │                                                         │          │
│  │                              [Acessar Projeto →]        │          │
│  └────────────────────────────────────────────────────────┘          │
│                                                                        │
│  ┌────────────────────────────────────────────────────────┐          │
│  │  + Adicionar novo projeto  (apenas master)              │          │
│  └────────────────────────────────────────────────────────┘          │
└──────────────────────────────────────────────────────────────────────┘
```

**Empty state** (master sem projetos):
```
            🧠
      Nenhum projeto ainda

   Crie seu primeiro laboratório de inteligência
   para começar a capturar e analisar dados reais.

              [+ Criar Primeiro Projeto]
```

---

## Tela: Visão Geral `/p/:slug/visao-geral`

```
KPIs Rápidos
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ 47 msgs  │ │ 52% conv.│ │ 3 ⏳ fila│ │ 2 🔴 err │
│  hoje    │ │  semana  │ │ validação│ │  produto │
└──────────┘ └──────────┘ └──────────┘ └──────────┘

Atividade Recente
──────────────────────────────────────────────────
Hoje 14:23 — João analisou conversa sobre laser diodo
Hoje 09:15 — Treinamento gerado para Maria
Ontem 22:00 — Behavioral profiler executou
Ontem 08:00 — Performance report gerado
[Ver mais →]

Números Conectados
┌──────────────┬───────────┬──────────┬────────┐
│ Número       │ Setor     │ Hoje     │ Status │
├──────────────┼───────────┼──────────┼────────┤
│ 5516-9999-01 │ Comercial │ 47 msgs  │  🟢   │
│ 5516-9999-02 │ Comercial │ 12 msgs  │  🟢   │
└──────────────┴───────────┴──────────┴────────┘
[Gerenciar números →]

Onboarding Checklist (visível até 5/5 completo):
████████████░░░░░░░  3/5
✅ 1. Projeto criado
✅ 2. Número cadastrado
✅ 3. Migrations executadas
⏳ 4. Workflows n8n importados    [Ver instruções]
⏳ 5. WhatsApp conectado          [Conectar agora]
```

---

## Tela: Interações `/p/:slug/interacoes`

```
Filtros: [Número ▼] [Agente Humano ▼] [Período ▼] [Status ▼]  [🔍 Buscar]

João — 5516-9999-0001    14min atrás
"Cliente perguntou sobre preço do laser..."
Produto: Equipamentos | Score: 7.2 | Converteu
[Ver conversa] [Validar produto]

Maria — 5516-9999-0001   2h atrás
"Apresentei o laser diodo para cliente novo..."
Produto: Equipamentos | Score: 8.5 | Pendente análise
[Ver conversa]
```

**Empty state** (projeto novo):
```
            💬
      Nenhuma interação ainda

   Para começar a capturar dados:
   1. Execute as migrations do banco
   2. Importe os workflows no n8n
   3. Configure a instância Evolution API
   4. Escaneie o QR code

              [Ver Guia de Ativação →]
```

---

## Tela: Perfil do Agente `/p/:slug/agente`

```
Perfil do Agente Comercial ML
Última atualização: hoje 02:00 (behavioral profiler)
────────────────────────────────────────────────────

Maturidade Geral do Laboratório
████████████████░░░░  78%  [Avançado]

Por domínio:
┌─────────────────────┬─────────────┬──────────────────┐
│ Domínio             │ Confiança   │ Dados            │
├─────────────────────┼─────────────┼──────────────────┤
│ Abord. Equipamentos │ ██████ Alta │ 89 conv. validadas│
│ Objeção de Preço    │ █████░ Alta │ 23 respostas val. │
│ Abord. Locação      │ ███░░░ Média│ 12 conv. ⚠️       │
│ Dermocosméticos     │ █░░░░░ Baixa│ 2 conv. ❌        │
└─────────────────────┴─────────────┴──────────────────┘

Vendedores Mapeados (4)
┌───────────┬──────────────┬──────────┬───────────┐
│ João      │ Consultivo   │ Score 8.3│ ✅ Ativo   │
│ Maria     │ Emocional    │ Score 7.9│ ✅ Ativo   │
│ Pedro     │ Técnico      │ Score 7.1│ ⚠️ Poucos  │
│ Carlos    │ Relacional   │ Score 8.0│ ✅ Ativo   │
└───────────┴──────────────┴──────────┴───────────┘

Erros Ativos que afetam o agente (2)
🔴 "Preço laser diodo" — 7x repetido    [Corrigir →]
🔴 "Garantia equipamento" — 3x          [Corrigir →]
```

---

## Tela: Fila de Validação `/p/:slug/validacao/fila`

```
[Pendente (3) ▼]  [Produto ▼]  [Agente ▼]  [🔍 Buscar]
                                              [✅ Aprovar todos]

──────────────────────────────────────────────────────────────

┌──────────────────────────────────────────────────────────┐
│ ⏳ PENDENTE HUMANO                      João — há 23min  │
│ Produto: Laser Diodo 808nm                                │
│                                                           │
│ Resposta detectada:                                       │
│ "O equipamento tem potência de 800W e opera em           │
│  comprimento de onda de 808nm..."                        │
│                                                           │
│ 🤖 Validador automático:                                 │
│  ❌ Não encontrou informação suficiente                   │
│     Documento consultado: Catálogo Laser 2026.pdf        │
│                                                           │
│ [👁 Ver conversa]     [✅ Correto]     [❌ Corrigir]     │
└──────────────────────────────────────────────────────────┘
```

Atalhos de teclado (foco no item ativo): `A` = Aprovar · `C` = Corrigir · `V` = Ver conversa · `↓↑` = Navegar itens

**Empty state** (fila limpa):
```
            ✅
      Fila limpa! Nenhuma validação pendente.
   Todas as respostas de produto foram validadas.
```

---

### Modal: Corrigir Resposta

```
┌─── Corrigir Resposta de Produto ──────────────────────────────────┐
│                                                         [✕ Fechar] │
│  Produto: Laser Diodo 808nm                                         │
│  Atendente: João | Número: 5516-9999-0001 | 23min atrás            │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                      │
│  Resposta original:                                                 │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ "O equipamento tem potência de 800W e opera em             │    │
│  │  comprimento de onda de 808nm..."                          │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  O que está incorreto: (obrigatório)                                │
│  [_____________________________________________]                     │
│  Ex: "Potência correta é 600W, não 800W"                           │
│                                                                      │
│  Resposta correta: (obrigatório)                                    │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ [área de texto para a resposta correta]                    │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  Fonte da informação:                                                │
│  ○ Catálogo Laser 2026.pdf   ○ Meu conhecimento   ○ Outro [____]   │
│                                                                      │
│  ─────────────────────────────────────────────────────────────────  │
│  ⚙️  Efeito desta correção (definido pela sua permissão):           │
│     ✅ Registrar no histórico de correções                           │
│     ✅ Atualizar base do laboratório automaticamente                 │
│         ↑ você tem esta permissão ativada                           │
│  ─────────────────────────────────────────────────────────────────  │
│                              [Cancelar]    [💾 Salvar Correção]     │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Tela: Documentos de Produto `/p/:slug/validacao/documentos`

```
                                         [+ Adicionar Documento]

Produto/Serviço    Tipo   Fonte          Última sync  Status
──────────────────────────────────────────────────────────────────
Laser Diodo 808nm  PDF    Upload         Hoje 09h     🟢 OK
Dermocosméticos    URL    Google Drive   Ontem        🟢 OK
Locação de Equip.  API    ERP Interno    2h atrás     🟢 OK
Manual Técnico     DOCX   Upload         3 dias atrás 🟡 Sync falhou
                                                      [↻ Tentar novamente]
```

### Modal: Adicionar Documento

```
┌─── Adicionar Documentação de Produto ────────────────────────┐
│  Produto/Serviço: [___________________________]               │
│  Aplica para:     [Todo o projeto ▼]                          │
│                                                                │
│  Tipo de documento:                                            │
│                                                                │
│  ○ 📎 Upload direto                                           │
│    Indicado para: catálogos PDF, manuais DOCX, listas CSV     │
│    Ideal para: pequenos e médios catálogos, documentos fixos  │
│    Formatos aceitos: PDF, DOCX, TXT, CSV, XLSX, MD, JSON      │
│    [Selecionar arquivo]  Máx: 50MB                            │
│                                                                │
│  ○ 🔗 Link externo (URL)                                      │
│    Indicado para: Google Docs, Notion, Dropbox, OneDrive      │
│    Ideal para: documentos que se atualizam frequentemente     │
│    URL: [___________________________]                          │
│    Sincronizar automaticamente? [x] Sim  A cada: [24h ▼]      │
│                                                                │
│  ○ 🔌 Integração API                                          │
│    Indicado para: ERP, PIM, sistema de gestão de produto      │
│    Ideal para: empresas com catálogo grande e dinâmico        │
│    Endpoint: [___________________________]                     │
│    Autenticação: variável de ambiente ML_PRODUTO_API_KEY      │
│    Sincronizar automaticamente? [x] Sim  A cada: [1h ▼]       │
│                                                                │
│  [Cancelar]                          [💾 Salvar]              │
└────────────────────────────────────────────────────────────────┘
```

---

## Tela: Rastreador de Erros `/p/:slug/validacao/erros`

```
[Ativos (2) ▼]  [Produto ▼]                  2 erros ativos

Produto             Tipo           Freq  Primeira vez  Status
──────────────────────────────────────────────────────────────────
Laser Diodo 808nm   info_incorreta   7x  15/03/2026   🔴 Ativo
[Ver ocorrências]  [Corrigir definitivamente]

Garantia Equip.     info_incorreta   3x  18/03/2026   🔴 Ativo
[Ver ocorrências]  [Corrigir definitivamente]

Preço Dermocos.     info_desatual.   1x  20/03/2026   ✅ Corrigido
Corrigido por: Ana em 21/03/2026
```

---

## Tela: Gestão de Usuários `/p/:slug/usuarios`

```
                                               [+ Convidar Usuário]

Nome      Email            Role         Permissões-chave     Status
─────────────────────────────────────────────────────────────────────
João      joao@omega.com   Admin        Todas                🟢 Ativo
Ana       ana@omega.com    Contributor  Validar + Corrigir   🟢 Ativo
Carlos    carlos@omega.com Viewer       Ver relatórios       🟢 Ativo

[✏️ Editar]  [🔴 Desativar]
```

### Modal: Configurar Usuário

```
┌─── Configurar Usuário ──────────────────────────────────────────┐
│  Nome:  [___________________]                                    │
│  Email: [___________________]                                    │
│  Role:  [Contributor ▼]                                          │
│                                                                   │
│  Permissões:                                                      │
│  [x] Ver relatórios e dashboards                                  │
│  [ ] Gerenciar números conectados                                 │
│  [x] Validar respostas na fila                                    │
│  [ ] Pode fazer upload de documentos de produto                   │
│  [ ] Pode cadastrar outros usuários                               │
│                                                                   │
│  Correções:                                                       │
│  [ ] Pode fazer correções de resposta?                            │
│       ↳ [ ] Correção atualiza a base automaticamente?            │
│            (desabilitado se "pode fazer correções" = não)        │
│                                                                   │
│  [Cancelar]                          [💾 Salvar]                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tela: Validação de Identificação de Agente `/p/:slug/numeros/:id`

```
Número: 5516-9999-0001 | Ferramenta: Redrive | Status: ⏳ Pendente

⚠️  Validação obrigatória para números multi-agente
────────────────────────────────────────────────────────────────────
Para que o laboratório saiba qual vendedor enviou cada mensagem,
precisamos confirmar que o Redrive está identificando corretamente
o agente humano no payload do webhook.

Como testar:
1. Peça para João enviar uma mensagem de teste pelo Redrive
2. Aguarde aparecer abaixo (≤ 1 minuto)
3. Confirme se o campo "agente" está preenchido corretamente

Última mensagem recebida:
┌──────────────────────────────────────────────────────────────┐
│ Recebida: há 2min                                             │
│ Agente identificado: "João Silva" ✅                          │
│ Campo no payload: data.agent.name = "João Silva"             │
└──────────────────────────────────────────────────────────────┘

[✅ Confirmar — identificação funcionando]
[❌ Não funcionou — registrar como pendente para análise]
```

---

## Sistema de Notificações

### Badge no topbar (🔔)

```
🔔 3 notificações
─────────────────────────────────────────────────
⏳ Nova validação pendente
  João — resposta sobre Laser Diodo · 23min atrás
  [→ Revisar]

🔴 Erro recorrente: "Preço laser diodo" atingiu 7x
  Nenhuma correção definitiva registrada
  [→ Corrigir]

✅ Behavioral Profiler executou com sucesso
  4 perfis atualizados · hoje 02:00
─────────────────────────────────────────────────
[Ver todas as notificações]
```

### Regras de disparo
| Evento | Para quem | Urgência |
|--------|-----------|----------|
| Nova validação pendente_humano | Usuários com `pode_validar` | 🔴 |
| Erro atingiu 5+ ocorrências | project_admin | 🟡 |
| Workflow executado com sucesso | project_admin | ⚪ |
| Sync de documento falhou | project_admin | 🟡 |
| Novo usuário adicionado ao projeto | project_admin | ⚪ |

---

## Design System — Tokens para Appsmith

```css
/* Cores — Brand */
--color-brand-primary:    #1A1A2E;
--color-brand-secondary:  #16213E;
--color-brand-accent:     #0F3460;
--color-brand-highlight:  #E94560;

/* Cores — Status */
--color-status-success:   #10B981;
--color-status-warning:   #F59E0B;
--color-status-error:     #EF4444;
--color-status-pending:   #6366F1;
--color-status-info:      #3B82F6;

/* Backgrounds */
--color-bg-page:          #F8FAFC;
--color-bg-card:          #FFFFFF;
--color-bg-sidebar:       #1A1A2E;

/* Texto */
--color-text-primary:     #0F172A;
--color-text-secondary:   #475569;
--color-text-muted:       #94A3B8;
--color-text-inverse:     #F8FAFC;

/* Tipografia */
--font-family-base:       'Inter', system-ui, sans-serif;
--font-size-sm:           13px;  /* metadados */
--font-size-base:         14px;  /* corpo */
--font-size-md:           16px;  /* seções */
--font-size-lg:           20px;  /* páginas */
--font-size-xl:           24px;  /* KPIs */

/* Espaçamento (grid 4px) */
--space-1: 4px;  --space-2: 8px;   --space-3: 12px;
--space-4: 16px; --space-6: 24px;  --space-8: 32px;

/* Layout */
--sidebar-width: 240px;
--topbar-height: 64px;
--content-padding: 24px;
--content-max-width: 1400px;
```

---

## Changelog do Spec

| Versão | Data | Autor | Descrição |
|--------|------|-------|-----------|
| v2.0 | 2026-04-09 | @ux-design-expert (Uma) | Sidebar persistente, breadcrumbs, notificações, empty states, onboarding, perfil visual do agente, remoção do "Ignorar", design tokens |
| v1.0 | 2026-04-09 | @dev (Dex) | Spec inicial com mockups ASCII |

---

*— Uma, desenhando com empatia 💝*
