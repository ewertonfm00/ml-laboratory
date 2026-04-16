# Deploy — ML Laboratory Portal (Next.js)

## Primeiro Passo Obrigatório: npm install

Antes de qualquer coisa, rodar no terminal Windows (PowerShell ou CMD):

```powershell
cd "Z:\My Folders\Projetos - Claude Code\AIOX - Machine Learning\portal-next"
npm install
npm run build   # verifica se compila
npm run dev     # http://localhost:3000
```

> Nota: O node_modules pode estar incompleto se houve erros de permissão (EPERM) durante a instalação. Se `npm install` falhar, tente fechar o Antivírus temporariamente ou rodar como Administrador.

## Railway Deploy

### 1. Criar serviço no Railway

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Dentro da pasta portal-next:
cd portal-next
railway link  # selecione o projeto existente ML Laboratory
railway up    # deploy
```

### 2. Variáveis de Ambiente

Configurar no painel Railway → Service → Variables:

| Variável | Valor |
|----------|-------|
| `DATABASE_URL` | `postgresql://postgres:LdMDvxoqOaYxlEgRnfqSpykBNpvZvNQa@mainline.proxy.rlwy.net:13932/postgres` |
| `N8N_SETUP_URL` | `https://n8n-production-47d0.up.railway.app/webhook/ml/setup/instancia` |
| `EVOLUTION_API_URL` | `https://evolution-api-ml-production.up.railway.app` |
| `EVOLUTION_API_KEY` | `ml-evo-key-2026` |
| `NODE_ENV` | `production` |

### 3. Build Settings no Railway

- **Build Command:** `npm run build`
- **Start Command:** `npm start`
- **Root Directory:** `portal-next` (se o repositório contiver outros projetos)

### 4. Via GitHub (recomendado)

1. Push do repositório para GitHub
2. Railway → New Project → Deploy from GitHub Repo
3. Selecione o repositório e configure Root Directory como `portal-next`
4. Adicione as variáveis de ambiente
5. Railway faz o deploy automaticamente em cada push para `main`

### 5. Deploy local (teste)

```bash
cd portal-next
npm install
cp .env.local .env.local  # já existe com as variáveis
npm run dev   # http://localhost:3000
```

### 6. Build de produção local

```bash
npm run build
npm start
```

## Rotas Disponíveis

| Rota | Descrição |
|------|-----------|
| `/` | Dashboard — lista de projetos com KPIs |
| `/numeros/conectar` | Formulário conectar número + QR Code |
| `/p/[slug]/numeros` | Tabela de números do projeto |
| `/p/[slug]/validacao/fila` | Fila de validação com aprovar/corrigir |
| `/p/[slug]/agente` | Perfis DISC e performance dos agentes |
| `/p/[slug]/skills` | Categorias e skills do projeto |

## API Routes

| Rota | Método | Descrição |
|------|--------|-----------|
| `/api/numeros/conectar` | POST | Chama n8n webhook, cria instância Evolution |
| `/api/numeros/status` | GET | Verifica status da instância no Evolution API |
| `/api/validacao` | POST | Aprova ou corrige item da fila |

## Troubleshooting

### Erro de conexão com banco
- Verificar `DATABASE_URL` nas variáveis de ambiente
- Railway → Metrics → verificar se o Postgres está rodando
- Testar localmente: `psql $DATABASE_URL -c "SELECT 1"`

### QR Code não aparece
- Verificar logs do n8n webhook
- Confirmar que `N8N_SETUP_URL` está correto
- Checar Evolution API: `curl https://evolution-api-ml-production.up.railway.app/instance/fetchInstances -H "apikey: ml-evo-key-2026"`

### Status não atualiza
- O polling acontece a cada 5s via `/api/numeros/status`
- Verificar CORS e autenticação do Evolution API
- Logs: Railway → Service → Deployments → View Logs
