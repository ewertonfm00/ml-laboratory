---
id: run-e2e-tests
name: Run E2E Tests
task: Run E2E Tests
squad: ml-plataforma-squad
agent: e2e-test-orchestrator
icon: "🧪"
atomic_layer: task
elicit: false
responsavel: e2e-test-orchestrator
responsavel_type: agent
Entrada: |
  - ambiente_alvo: URL base do ambiente a testar (Railway staging ou produção)
  - numero_mono: Número WhatsApp configurado como tipo='mono' para cenário mono-agente
  - numero_multi: Número WhatsApp configurado como tipo='multi' para cenário multi-agente
  - payload_teste: Payload JSON padrão simulando mensagem recebida pela Evolution API
Saida: |
  - relatorio_e2e: Relatório consolidado com status de cada cenário (PASS/FAIL/SKIP)
  - logs_webhook: Logs completos do endpoint POST /webhook/ml/captura/debug
  - cobertura_cenarios: Lista de tasks testadas (2.6 mono-agente, 2.7 e 2.8 multi-agente)
  - tempo_execucao: Tempo total de execução da suite em segundos
Checklist:
  - "[ ] Validar conectividade com o ambiente alvo antes de iniciar os testes"
  - "[ ] Executar cenário mono-agente (task 2.6): webhook → captura → dados → análise"
  - "[ ] Executar cenário multi-agente roteamento (task 2.7): distribuição por squad"
  - "[ ] Executar cenário multi-agente handoff (task 2.8): passagem de contexto entre agentes"
  - "[ ] Capturar logs de cada etapa via endpoint /webhook/ml/captura/debug"
  - "[ ] Validar persistência dos dados em ml_captura e ml_data_eng"
  - "[ ] Gerar relatório consolidado com PASS/FAIL por cenário"
---

# run-e2e-tests

Executa a suite completa de testes end-to-end do pipeline ML, cobrindo o fluxo webhook → captura → dados → análise nos cenários mono-agente (task 2.6) e multi-agente (tasks 2.7 e 2.8).

## Pré-condições

- Ambiente alvo disponível e com health check OK (Railway staging ou produção)
- Seeds de números WhatsApp aplicados (`seed-master` executado com sucesso)
- Endpoint de debug disponível: POST `.../webhook/ml/captura/debug`
- Schemas `ml_captura`, `ml_data_eng` e `ml_platform` criados e acessíveis
- Redis com prefixo `ml:{cliente_id}:` configurado

## Passos

1. Validar conectividade com o ambiente alvo: health check da API, Postgres e Redis
2. Executar cenário mono-agente (task 2.6): disparar payload via `/webhook/ml/captura/debug` com `numero_mono`, verificar captura, processamento de dados e análise pelo agente único
3. Executar cenário multi-agente roteamento (task 2.7): disparar payload via `numero_multi`, verificar distribuição correta da mensagem para o squad responsável com base no contexto
4. Executar cenário multi-agente handoff (task 2.8): verificar passagem de contexto entre agentes (histórico da conversa, dados do lead, estágio da negociação) sem perda de informação
5. Capturar e inspecionar logs de cada etapa via endpoint de debug
6. Validar persistência dos dados em `ml_captura.mensagens` e tabelas de `ml_data_eng`
7. Gerar relatório consolidado com status PASS/FAIL/SKIP por cenário e tempo de execução total

## Outputs

- `relatorio_e2e`: Relatório consolidado com status de cada cenário (PASS/FAIL/SKIP)
- `logs_webhook`: Logs completos do endpoint POST /webhook/ml/captura/debug
- `cobertura_cenarios`: Lista de tasks testadas (2.6 mono-agente, 2.7 e 2.8 multi-agente)
- `tempo_execucao`: Tempo total de execução da suite em segundos

## Critérios de sucesso

- Todos os cenários obrigatórios retornam PASS (mono-agente e ambos multi-agente)
- Dados persistidos corretamente nos schemas de destino após cada cenário
- Nenhum erro não tratado nos logs do webhook de debug
- Tempo de execução total documentado no relatório
