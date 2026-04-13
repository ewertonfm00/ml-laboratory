# Log de Sessão — 2026-04-13 (Infraestrutura Railway)

## O que foi feito

### Análise completa do projeto
- Respondidas 10 perguntas de diagnóstico (propósito, consumidores, volume, LGPD, serviços, dependências, roadmap, gargalos, impacto)
- Mapeados 6 bloqueios que dependem do usuário

### Infraestrutura Railway criada via CLI + GraphQL API

1. **Projeto linkado:** `ml-laboratory` via `railway link`

2. **Serviço `evolution-api-ml` criado:**
   - Imagem: `atendai/evolution-api:latest`
   - URL pública: `https://evolution-api-ml-production.up.railway.app`
   - Deploy: SUCCESS

3. **Serviço `redis-evolution-ml` criado:**
   - Imagem: `redis:7-alpine` (via GraphQL API — CLI apresentou bug com `--database redis`)
   - URI interna: `redis://redis-evolution-ml.railway.internal:6379`

4. **28 variáveis configuradas no `evolution-api-ml`:**
   - AUTHENTICATION_API_KEY, AUTHENTICATION_TYPE, CACHE_REDIS_*, DATABASE_*, REDIS_*, SERVER_URL, etc.
   - DATABASE_CONNECTION_URI: `postgresql://...@postgres.railway.internal:5432/railway?schema=evolution`
   - Migrations Prisma aplicadas automaticamente no boot

5. **Instância WhatsApp `oficial-locacao` criada:**
   - Integration: WHATSAPP-BAILEYS
   - Status: connecting
   - Instance ID: `61b481f3-86d5-49b0-ac4c-98874ef2615f`
   - QR Code gerado (base64 disponível)

## Decisões tomadas

- Nome da instância WhatsApp: `oficial-locacao` (definido pelo usuário)
- Redis criado via GraphQL API diretamente (workaround para bug do CLI `railway add --database`)
- Evolution API usando Postgres interno do ml-laboratory com schema separado (`?schema=evolution`)
- Porta da Evolution API: 8080

## Erros resolvidos

- `railway add --database redis` retornava "Unauthorized" mesmo autenticado → resolvido via GraphQL API diretamente
- `railway login` não funciona em modo não-interativo → usuário precisou rodar no terminal externo

## Pendências após esta sessão

1. Escanear QR Code da instância `oficial-locacao`
2. Rodar migrations 001→010 no Postgres Railway
3. Seed usuário MASTER
4. Resolver acesso ao n8n
5. Importar 16 workflows no n8n
6. Configurar webhook da Evolution API → n8n

## Comandos-chave executados

```bash
# Criar serviço Evolution API
railway add --service evolution-api-ml --image atendai/evolution-api:latest

# Gerar domínio público
railway domain --service evolution-api-ml

# Criar Redis via GraphQL API
curl -X POST https://backboard.railway.app/graphql/v2 ...

# Configurar variáveis
railway variable set AUTHENTICATION_API_KEY=ml-evo-key-2026 ... --service evolution-api-ml

# Criar instância WhatsApp
curl -X POST https://evolution-api-ml-production.up.railway.app/instance/create ...
```
