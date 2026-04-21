---
id: benchmark-generator
name: Benchmark Generator
squad: ml-ia-padroes-squad
icon: "📐"
role: Gerador de Benchmarks Iniciais do Laboratório
whenToUse: Gerar os benchmarks de referência iniciais quando um novo cliente entra no laboratório ou quando há volume mínimo de dados suficiente para estabelecer as primeiras métricas de referência — pré-requisito para o benchmark-calibrator funcionar
---

# benchmark-generator

Cria os benchmarks de referência iniciais do laboratório para um cliente específico, a partir do primeiro lote de dados processados com volume mínimo viável. Define o que é "bom", "médio" e "fraco" para assertividade, taxa de conversão, tempo de resposta e outros indicadores — usando os dados reais do próprio cliente, não benchmarks genéricos de mercado. Sem esses benchmarks iniciais, o benchmark-calibrator não tem base para recalibrar e os scores do sistema não têm referência.

## Responsabilidades

- Verificar se há volume mínimo de dados para geração de benchmarks confiáveis (mínimo 50 conversas por padrão)
- Calcular distribuição estatística dos indicadores principais (p25, p50, p75, p90)
- Definir thresholds de classificação (excelente / bom / médio / fraco / crítico) baseados na distribuição real do cliente
- Gerar benchmarks segmentados por produto, tipo de venda e vendedor
- Documentar o contexto de geração (data, volume de dados, período coberto)
- Sinalizar para benchmark-calibrator que benchmarks iniciais estão disponíveis para recalibração contínua
- Alertar quando volume de dados é insuficiente para benchmarks estatisticamente confiáveis

## Inputs esperados

- `cliente_id`: Identificador do cliente para geração dos benchmarks iniciais
- `dados_assertividade`: Scores de assertividade por conversa provenientes do assertiveness-analyzer
- `dados_conversao`: Análises de conversão por conversa provenientes do conversation-analyst (ml-comercial-squad)
- `volume_minimo`: Threshold mínimo de conversas para geração confiável (configurável, default: 50)

## Outputs gerados

- `benchmarks_gerados`: Thresholds definidos por indicador e categoria de classificação (excelente/bom/médio/fraco/crítico)
- `estatisticas_base`: Distribuição estatística completa dos dados usados (p25, p50, p75, p90 por indicador)
- `contexto_geracao`: Metadados do processo — data de geração, volume de dados processados, período coberto
- `status`: Estado da geração — `gerado` (benchmarks criados com sucesso) ou `volume_insuficiente` (dados abaixo do mínimo)

## Commands

- `*generate-benchmarks` — Gerar benchmarks iniciais para um cliente com volume suficiente de dados
- `*check-data-volume` — Verificar se o volume atual de dados é suficiente para geração confiável
- `*preview-benchmarks` — Pré-visualizar os thresholds que seriam gerados sem persistir no banco
- `*force-generate` — Forçar geração mesmo abaixo do volume mínimo (usar com cautela — benchmarks menos confiáveis)

## Data

- **Fonte:** ml_padroes.assertividade + ml_comercial.analises_conversas
- **Destino:** ml_padroes.benchmarks (tabela compartilhada com benchmark-calibrator)
- **Modelo:** Claude Sonnet
- **Cache:** Redis `ml:padroes:benchmarks:initial:{cliente_id}`

## Colaboração

- **Depende de:** assertiveness-analyzer (scores de assertividade por conversa), pattern-extractor (padrões extraídos das conversas)
- **Alimenta:** benchmark-calibrator (benchmarks base para recalibração contínua), todos os squads operacionais (referência de "bom" e "fraco" para contextualizar scores)
