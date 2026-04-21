---
id: deploy-update
name: Deploy Update with Rollback
task: Deploy Update with Rollback
squad: ml-plataforma-squad
agent: deploy-coordinator
icon: "🚀"
atomic_layer: task
elicit: false
responsavel: deploy-coordinator
responsavel_type: agent
Entrada: |
  - manifest_atualizacao: Lista de serviços e versões a atualizar
  - janela_manutencao: Janela de manutenção aprovada ou confirmação de horário fora de pico
  - backup_config: Configuração de backup automatizado no Railway para o cliente
Saida: |
  - deploy_id: UUID único do deploy executado
  - status: Resultado do deploy (sucesso/rollback/falha_critica)
  - servicos_atualizados: Lista de serviços com versão anterior e nova versão
  - tempo_total: Duração total do processo em segundos
Checklist:
  - "[ ] Receber manifest de atualização (serviços, versões atuais e novas)"
  - "[ ] Criar snapshot/backup (dump Postgres + export workflows n8n)"
  - "[ ] Aplicar atualização em ordem segura (Railway → n8n → agentes)"
  - "[ ] Executar smoke tests pós-deploy nos endpoints críticos"
  - "[ ] Monitorar health score por 5 minutos (verificações a cada 60 segundos)"
  - "[ ] Acionar rollback automático se health score < 70 em qualquer verificação"
  - "[ ] Registrar resultado em ml_platform.deploy_history com status e serviços"
---

# deploy-update

Coordenar deploy de atualização no laboratório ML com validação pós-deploy e rollback automático em caso de degradação de saúde dos serviços.

## Pré-condições

- Manifest de atualização definido com lista de serviços e versões a atualizar
- Backup automatizado configurado no Railway para o cliente
- monitor-agent disponível para verificação de health pós-deploy
- Janela de manutenção aprovada ou deploy fora de horário de pico

## Passos

1. Receber manifest de atualização: lista de serviços, versões atuais e novas versões
2. Criar snapshot/backup do estado atual: dump Postgres relevante + export de workflows n8n
3. Aplicar atualização em ordem segura: infraestrutura Railway → workflows n8n → configuração de agentes
4. Executar smoke tests pós-deploy: testar endpoints críticos de cada serviço atualizado
5. Monitorar health score por 5 minutos usando monitor-agent com verificações a cada 60 segundos
6. Se health score cair abaixo de 70 em qualquer verificação: acionar rollback automático imediato
7. Registrar resultado completo do deploy em `ml_platform.deploy_history` com status, duração e serviços

## Outputs

- `deploy_id`: UUID único do deploy executado
- `status`: Resultado do deploy (sucesso / rollback / falha_critica)
- `servicos_atualizados`: Lista de serviços com versão anterior e nova versão
- `tempo_total`: Duração total do processo em segundos

## Critérios de sucesso

- Todos os serviços com status healthy após 5 minutos de monitoramento
- Zero downtime: nenhuma mensagem perdida durante o deploy
- Rollback executado em < 3 minutos quando acionado automaticamente
