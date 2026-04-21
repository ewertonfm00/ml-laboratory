---
id: setup-infrastructure
name: Setup Client Infrastructure
squad: ml-plataforma-squad
agent: infra-manager
icon: "🏗️"
---

# setup-infrastructure

Provisionar toda a infraestrutura necessária para um novo cliente no laboratório ML, incluindo banco de dados, cache, orquestração e integração WhatsApp.

## Pré-condições

- Conta Railway com permissão para criar projetos
- Credenciais de acesso à Evolution API disponíveis
- Templates base de n8n disponíveis em `.aiox-core/`
- Dados do cliente: número WhatsApp, nome do projeto e squads ativos

## Passos

1. Criar projeto Railway para o cliente com serviços: Postgres, Redis e n8n
2. Configurar schemas Postgres com prefixo `ml_*` para cada squad ativo do cliente
3. Criar usuários Postgres com permissões granulares por schema (cada squad lê apenas seu schema + ml_captura)
4. Configurar Redis com prefixo `ml:{cliente_id}:` para isolamento de chaves entre clientes
5. Inicializar n8n com import dos templates base de workflows do laboratório ML
6. Configurar Evolution API: criar instância com número WhatsApp do cliente e conectar QR code
7. Registrar toda a infraestrutura em `ml_platform.infra_registry` com IDs, URLs e status de cada serviço

## Outputs

- `railway_project_id`: ID do projeto criado no Railway
- `postgres_connection_string`: String de conexão Postgres com usuário de aplicação
- `redis_url`: URL de conexão Redis com prefixo configurado
- `n8n_url`: URL de acesso à instância n8n do cliente
- `status_provisionado`: Status geral de saúde de todos os serviços

## Critérios de sucesso

- Todos os serviços com status healthy no Railway
- Conectividade testada entre todos os serviços (n8n → Postgres, n8n → Redis, n8n → Evolution API)
- Schemas e permissões criados e validados para todos os squads ativos
