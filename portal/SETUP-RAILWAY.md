# Setup do Portal — Railway
Metabase (analytics) + Appsmith (portal interativo)
Revisado por @devops (Gage) em 2026-04-09 — alinhado ao PORTAL-SPEC.md v2.0

---

## Arquitetura de Serviços no Railway

```
Railway Project: ML Laboratory
│
├── postgres          ← já existe (compartilhado ml_* + _plataforma + _validacao)
├── redis             ← já existe (prefixo ml:)
├── n8n               ← já existe (workflows ML-*)
├── metabase          ← NOVO — analytics embedado
└── appsmith          ← NOVO — portal interativo
```

---

## Pré-requisito: Role `portal_app` no Postgres

O Appsmith precisa de acesso à tabela `usuarios` (autenticação) — o `ml_app` NÃO tem
esse acesso por design. Criar role separada antes de configurar o Appsmith.

```sql
-- Executar ANTES do deploy do Appsmith
-- Conectar como superuser (postgres)

CREATE ROLE portal_app LOGIN PASSWORD 'SENHA_PORTAL_APP_AQUI';

-- _plataforma: acesso completo ao que o portal precisa
GRANT USAGE ON SCHEMA _plataforma TO portal_app;
GRANT SELECT, INSERT, UPDATE ON _plataforma.usuarios         TO portal_app;
GRANT SELECT, INSERT, UPDATE ON _plataforma.projetos         TO portal_app;
GRANT SELECT, INSERT, UPDATE ON _plataforma.projeto_usuarios TO portal_app;
GRANT SELECT, INSERT, UPDATE ON _plataforma.numeros_projeto  TO portal_app;
GRANT SELECT, INSERT, UPDATE ON _plataforma.instancias_evolution TO portal_app;
GRANT SELECT, INSERT, UPDATE ON _plataforma.agentes_humanos  TO portal_app;
GRANT SELECT, INSERT         ON _plataforma.audit_log        TO portal_app;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA _plataforma TO portal_app;

-- _validacao: portal gerencia a fila e correções
GRANT USAGE ON SCHEMA _validacao TO portal_app;
GRANT SELECT, INSERT, UPDATE ON _validacao.fila_validacao     TO portal_app;
GRANT SELECT, INSERT         ON _validacao.validacoes         TO portal_app;
GRANT SELECT, INSERT, UPDATE ON _validacao.erros_produto      TO portal_app;
GRANT SELECT, INSERT         ON _validacao.correcoes          TO portal_app;
GRANT SELECT, INSERT, UPDATE ON _validacao.documentos_produto TO portal_app;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA _validacao TO portal_app;

-- ml_comercial: leitura para o portal exibir dados
GRANT USAGE ON SCHEMA ml_comercial TO portal_app;
GRANT SELECT ON ALL TABLES IN SCHEMA ml_comercial TO portal_app;

-- ml_captura: leitura para interações
GRANT USAGE ON SCHEMA ml_captura TO portal_app;
GRANT SELECT ON ALL TABLES IN SCHEMA ml_captura TO portal_app;

-- Segurança: portal_app NÃO pode DROP, TRUNCATE ou DELETE em dados de produção
-- (exceção: _plataforma.usuarios pode soft-delete via coluna ativo)
```

**Salvar em:** `database/migrations/006_portal_app_role.sql`

---

## Seed: Usuário MASTER e Projeto Inicial

```sql
-- Executar APÓS as migrations 001-005 e criação do portal_app
-- Ajuste os valores antes de executar

BEGIN;

-- Usuário MASTER (Ewerton)
INSERT INTO _plataforma.usuarios (
  nome, email, senha_hash, is_master, ativo
) VALUES (
  'Ewerton',
  'ewerton@seudominio.com',
  -- Gerar hash: node -e "require('bcrypt').hash('SENHA_AQUI',12).then(console.log)"
  '$2b$12$HASH_GERADO_AQUI',
  true,
  true
);

-- Projeto: Machine Learning
INSERT INTO _plataforma.projetos (
  nome, slug, schema_prefix, descricao, ativo
) VALUES (
  'Machine Learning — Omega Laser',
  'omega-laser',
  'ml',
  'Laboratório de inteligência aplicada a negócios',
  true
);

COMMIT;
```

---

## 1. Metabase (dashboards de leitura)

### Deploy no Railway

```bash
# Via Railway dashboard:
# New Service → Docker Image → metabase/metabase:latest
# Ou: railway.app/new/template → buscar "Metabase"
```

### Variáveis de ambiente — Metabase

```env
MB_DB_TYPE=postgres
MB_DB_DBNAME=NOME_DO_BANCO
MB_DB_PORT=5432
MB_DB_USER=ml_app
MB_DB_PASS=SENHA_DO_ML_APP
MB_DB_HOST=HOST_POSTGRES_RAILWAY
MB_ENCRYPTION_SECRET_KEY=CHAVE_ALEATORIA_32_CHARS
# Embedding — obrigatório para embeds no Appsmith
MB_EMBEDDING_APP_SECRET=SEGREDO_EMBEDDING_32_CHARS
JAVA_TIMEZONE=America/Sao_Paulo
```

### Configuração pós-deploy

1. Abra o Metabase (URL gerada pelo Railway)
2. Crie conta admin
3. **Admin → Databases → Add Database**
   - Tipo: PostgreSQL
   - Host: `${{postgres.PGHOST}}` (Railway internal)
   - Database: nome do banco
   - Usuário: `ml_app`
   - Senha: senha do ml_app
4. Schemas a sincronizar: `ml_comercial`, `ml_captura`, `_validacao`
5. **Admin → Embedding → Enable Embedding** — copiar o segredo

### Queries dos dashboards

```sql
-- 1. Evolução da inteligência por semana
SELECT
  date_trunc('week', created_at)::date AS semana,
  count(*)                              AS conversas,
  round(avg(score_qualidade)::numeric, 2) AS score_medio,
  round(100.0 * count(*) FILTER (WHERE resultado = 'converteu') / count(*), 1) AS taxa_conversao
FROM ml_comercial.conversas
GROUP BY 1 ORDER BY 1;

-- 2. Maturidade por domínio (perfil do agente)
SELECT
  produto,
  count(*) AS total_conversas,
  round(avg(score_qualidade)::numeric, 2) AS confianca_media,
  count(*) FILTER (WHERE score_qualidade >= 7) AS alta_confianca
FROM ml_comercial.conversas
GROUP BY produto ORDER BY total_conversas DESC;

-- 3. Padrões identificados ao longo do tempo
SELECT
  date_trunc('week', created_at)::date AS semana,
  count(*) AS novos_padroes
FROM ml_comercial.abordagens_produto
GROUP BY 1 ORDER BY 1;

-- 4. Erros de produto ativos por frequência
SELECT produto_servico_nome, tipo_erro::text, frequencia, primeira_ocorrencia
FROM _validacao.erros_produto
WHERE status = 'ativo'
ORDER BY frequencia DESC;

-- 5. Performance por vendedor (semana atual)
SELECT v.nome,
  count(c.id) AS conversas,
  round(100.0 * count(*) FILTER (WHERE c.resultado = 'converteu') / count(*), 1) AS taxa,
  round(avg(c.score_qualidade)::numeric, 2) AS score
FROM ml_comercial.vendedores v
JOIN ml_comercial.conversas c ON c.vendedor_id = v.id
WHERE c.created_at >= NOW() - INTERVAL '7 days'
GROUP BY v.nome ORDER BY taxa DESC;

-- 6. Saúde do laboratório (KPI de progresso geral)
SELECT
  round(
    (
      (SELECT count(*) FROM ml_comercial.conversas)::float / 500 * 0.30 +
      (SELECT count(*) FROM ml_comercial.perfis_vendedor)::float / 10 * 0.25 +
      (SELECT count(*) FROM ml_comercial.abordagens_produto)::float / 20 * 0.25 +
      (1 - (SELECT count(*) FROM _validacao.erros_produto WHERE status='ativo')::float / 20) * 0.20
    ) * 100
  , 1) AS saude_pct;
```

---

## 2. Appsmith (portal interativo)

### Deploy no Railway

```bash
# Via Railway dashboard:
# New Service → Docker Image → appsmith/appsmith-ce:latest
# Volume obrigatório: /appsmith-stacks (persistência de dados)
```

### Variáveis de ambiente — Appsmith

```env
APPSMITH_ENCRYPTION_PASSWORD=SENHA_FORTE_32_CHARS
APPSMITH_ENCRYPTION_SALT=SALT_FORTE_16_CHARS
APPSMITH_SUPERVISOR_PASSWORD=SENHA_ADMIN_INICIAL
APPSMITH_DISABLE_TELEMETRY=true

# URLs internas Railway
APPSMITH_REDIS_URL=redis://${{redis.REDIS_URL}}
APPSMITH_MONGODB_URI=  # Appsmith CE usa MongoDB interno — deixar vazio para usar o padrão

# Custom domain (configurar após deploy)
APPSMITH_CUSTOM_DOMAIN=portal.seudominio.com
```

### Datasources a configurar no Appsmith

| Nome da datasource | Tipo | Usuário | Schemas |
|-------------------|------|---------|---------|
| `ML Portal DB` | PostgreSQL | `portal_app` | `_plataforma`, `_validacao`, `ml_comercial`, `ml_captura` |

**Configuração:**
1. Appsmith → Datasources → + New → PostgreSQL
2. Host: `${{postgres.PGHOST}}` (host interno Railway)
3. Database: nome do banco
4. Usuário: `portal_app` / Senha: `SENHA_PORTAL_APP`
5. SSL: Enable (Railway exige)

### SPA Routing — Configuração

O Appsmith usa roteamento SPA nativo. Para as rotas do portal spec v2.0:

```
/dashboard                    → App: "ML Dashboard" (página: Dashboard)
/p/[slug]/visao-geral         → App: "ML Dashboard" (página: ProjetoVisaoGeral)
/p/[slug]/interacoes          → App: "ML Dashboard" (página: ProjetoInteracoes)
/p/[slug]/materiais/[tipo]    → App: "ML Dashboard" (página: ProjetoMateriais)
/p/[slug]/evolucao            → App: "ML Dashboard" (página: ProjetoEvolucao)
/p/[slug]/agente              → App: "ML Dashboard" (página: ProjetoAgente)
/p/[slug]/numeros             → App: "ML Dashboard" (página: ProjetoNumeros)
/p/[slug]/validacao/fila      → App: "ML Dashboard" (página: ValidacaoFila)
/p/[slug]/validacao/historico → App: "ML Dashboard" (página: ValidacaoHistorico)
/p/[slug]/validacao/erros     → App: "ML Dashboard" (página: ValidacaoErros)
/p/[slug]/validacao/documentos→ App: "ML Dashboard" (página: ValidacaoDocumentos)
/p/[slug]/usuarios            → App: "ML Dashboard" (página: ProjetoUsuarios)
/admin                        → App: "ML Admin" (separado, acesso master)
```

**Passing context entre páginas via URL params:**
```javascript
// Navegar para projeto
navigateTo('ProjetoVisaoGeral', { slug: 'omega-laser' }, 'SAME_WINDOW');

// Ler slug na página destino
const slug = appsmith.URL.queryParams.slug;
```

### Sistema de Notificações — Polling

Appsmith não tem WebSocket nativo. Usar API queries com auto-refresh:

**Query: `q_notificacoes_pendentes`**
```sql
SELECT
  'validacao' AS tipo,
  'Nova validação pendente — ' || u.nome AS mensagem,
  fv.created_at,
  '/p/' || p.slug || '/validacao/fila' AS link
FROM _validacao.fila_validacao fv
JOIN _plataforma.numeros_projeto np ON np.id = fv.numero_id
JOIN _plataforma.projetos p ON p.id = np.projeto_id
JOIN ml_captura.sessoes_conversa sc ON sc.id = fv.sessao_id
JOIN ml_captura.mensagens_raw mr ON mr.sessao_id = sc.id
JOIN _plataforma.agentes_humanos ah ON ah.identificador_externo = mr.agente_externo_id
JOIN _plataforma.usuarios u ON u.id = ah.usuario_id
WHERE fv.status = 'pendente_humano'
  AND fv.atribuido_a = {{current_user_id}}

UNION ALL

SELECT
  'erro_produto' AS tipo,
  'Erro recorrente: "' || ep.produto_servico_nome || '" — ' || ep.frequencia || 'x' AS mensagem,
  ep.updated_at,
  '/p/' || p.slug || '/validacao/erros' AS link
FROM _validacao.erros_produto ep
JOIN _plataforma.projetos p ON TRUE  -- join via schema_prefix
WHERE ep.status = 'ativo'
  AND ep.frequencia >= 5
  AND ep.frequencia % 5 = 0   -- notifica a cada múltiplo de 5

ORDER BY created_at DESC
LIMIT 10;
```

**Configuração do auto-refresh no Appsmith:**
1. Selecionar query `q_notificacoes_pendentes`
2. Settings → Run on page load: ✅
3. Settings → Auto-refresh: **30 seconds**
4. Bind no badge do sino: `{{q_notificacoes_pendentes.data.length}}`

### Design Tokens — Custom CSS no Appsmith

No Appsmith, ir em **App Settings → Custom CSS** e adicionar:

```css
/* ML Laboratory Design System — Tokens */

:root {
  /* Brand */
  --color-brand-primary:    #1A1A2E;
  --color-brand-secondary:  #16213E;
  --color-brand-accent:     #0F3460;
  --color-brand-highlight:  #E94560;

  /* Status */
  --color-status-success:   #10B981;
  --color-status-warning:   #F59E0B;
  --color-status-error:     #EF4444;
  --color-status-pending:   #6366F1;
  --color-status-info:      #3B82F6;

  /* Backgrounds */
  --color-bg-page:          #F8FAFC;
  --color-bg-card:          #FFFFFF;
  --color-bg-sidebar:       #1A1A2E;

  /* Text */
  --color-text-primary:     #0F172A;
  --color-text-secondary:   #475569;
  --color-text-muted:       #94A3B8;
  --color-text-inverse:     #F8FAFC;

  /* Spacing */
  --space-1: 4px;  --space-2: 8px;   --space-3: 12px;
  --space-4: 16px; --space-6: 24px;  --space-8: 32px;

  /* Layout */
  --sidebar-width:      240px;
  --topbar-height:      64px;
  --content-padding:    24px;
  --content-max-width:  1400px;
}

/* Sidebar escura */
.sidebar-container {
  background-color: var(--color-bg-sidebar) !important;
  width: var(--sidebar-width) !important;
}

/* Topbar */
.topbar-container {
  height: var(--topbar-height) !important;
  background: var(--color-bg-card) !important;
  border-bottom: 1px solid #E2E8F0 !important;
}

/* Cards */
.t--widget-containerwidget {
  background: var(--color-bg-card) !important;
  border-radius: 8px !important;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
}

/* Status badges */
.status-active   { color: var(--color-status-success); font-weight: 600; }
.status-warning  { color: var(--color-status-warning);  font-weight: 600; }
.status-error    { color: var(--color-status-error);    font-weight: 600; }
.status-pending  { color: var(--color-status-pending);  font-weight: 600; }

/* Focus ring acessibilidade */
*:focus-visible {
  outline: 2px solid var(--color-brand-accent) !important;
  outline-offset: 2px !important;
}
```

### Embed do Metabase no Appsmith

Para a tela `/p/:slug/evolucao`:

```javascript
// Gerar URL assinada do Metabase (via API do n8n ou função JS no Appsmith)
// Requer: MB_EMBEDDING_APP_SECRET configurado no Metabase

const jwt = require('jsonwebtoken'); // usar no n8n ou backend

const token = jwt.sign(
  {
    resource: { dashboard: DASHBOARD_ID_EVOLUCAO },
    params: { projeto_slug: slug },
    exp: Math.round(Date.now() / 1000) + (10 * 60), // 10min
  },
  MB_EMBEDDING_APP_SECRET
);

const iframeUrl = `${METABASE_URL}/embed/dashboard/${token}#bordered=true&titled=false`;
```

No Appsmith: Iframe widget com `src: {{iframeUrl}}`

---

## 3. Ordem de Setup

```
FASE 1 — Banco de Dados
  ├── 001: Executar migration 006_portal_app_role.sql
  ├── 002: Executar seed do usuário MASTER
  └── 003: Verificar: SELECT * FROM _plataforma.usuarios;

FASE 2 — Metabase
  ├── 001: Deploy no Railway (Docker: metabase/metabase:latest)
  ├── 002: Configurar variáveis de ambiente
  ├── 003: Conectar ao Postgres com ml_app
  ├── 004: Importar 6 queries dos dashboards
  └── 005: Ativar embedding + copiar segredo

FASE 3 — Appsmith
  ├── 001: Deploy no Railway (Docker: appsmith/appsmith-ce:latest)
  ├── 002: Configurar variáveis de ambiente
  ├── 003: Criar datasource "ML Portal DB" com portal_app
  ├── 004: Configurar custom CSS com design tokens
  ├── 005: Criar páginas conforme estrutura de rotas
  ├── 006: Configurar query de notificações (auto-refresh 30s)
  └── 007: Configurar embed do Metabase na tela de Evolução

FASE 4 — Pós-deploy
  ├── 001: Acessar portal.seudominio.com
  ├── 002: Login com usuário MASTER
  ├── 003: Criar projeto "Machine Learning — Omega Laser"
  ├── 004: Cadastrar números conectados
  └── 005: Executar teste de identificação de agente (Redrive)
```

---

## 4. Domínios no Railway (custom domain)

```
portal.seudominio.com     → Appsmith  (portal principal)
analytics.seudominio.com  → Metabase  (acesso direto quando necessário)
```

**Configurar em:** Railway → Service → Settings → Custom Domain

---

## 5. Variáveis de ambiente consolidadas (`.env.example` — seção portal)

```env
# ============================================================
# PORTAL — Appsmith + Metabase
# ============================================================

# Postgres — role portal_app (acesso completo ao portal)
ML_PORTAL_DB_URL=postgresql://portal_app:SENHA_AQUI@host:5432/banco
ML_PORTAL_DB_PASSWORD=SENHA_PORTAL_APP_AQUI

# Metabase
ML_METABASE_URL=https://analytics.seudominio.com
ML_METABASE_EMBEDDING_SECRET=SEGREDO_EMBEDDING_32_CHARS
ML_METABASE_ADMIN_EMAIL=admin@seudominio.com
ML_METABASE_ADMIN_PASSWORD=SENHA_METABASE_ADMIN

# Appsmith
ML_APPSMITH_URL=https://portal.seudominio.com
ML_APPSMITH_ENCRYPTION_PASSWORD=SENHA_FORTE_32_CHARS
ML_APPSMITH_ENCRYPTION_SALT=SALT_16_CHARS

# Notificações (polling interval em segundos)
ML_NOTIFICATION_POLLING_INTERVAL=30
ML_NOTIFICATION_ERRO_THRESHOLD=5
```

---

## 6. Tipos de documento recomendados por porte de cliente

| Porte | Recomendação | Por quê |
|-------|-------------|---------|
| Pequeno | PDF ou DOCX — upload direto | Simples, sem integração, documentação estática |
| Médio | URL (Google Docs, Notion, Dropbox) | Atualiza automaticamente sem re-enviar |
| Grande | API JSON/REST (ERP, PIM, Salesforce) | Catálogo dinâmico, centenas de produtos |

**Formatos aceitos por porte:**
- **Pequeno:** PDF ⭐, DOCX, TXT, CSV
- **Médio:** Google Docs ⭐, Notion, Dropbox, site de produto
- **Grande:** JSON API ⭐, REST com autenticação via `ML_PRODUTO_API_KEY`

---

## Changelog

| Versão | Data | Autor | Descrição |
|--------|------|-------|-----------|
| v2.0 | 2026-04-09 | @devops (Gage) | Role portal_app, seed MASTER, SPA routing, notificações polling, design tokens CSS, embed Metabase, ordem de setup atualizada |
| v1.0 | 2026-04-09 | @dev (Dex) | Setup inicial Metabase + Appsmith |
