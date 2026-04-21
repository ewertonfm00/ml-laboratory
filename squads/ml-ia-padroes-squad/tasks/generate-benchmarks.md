---
id: generate-benchmarks
name: Generate Performance Benchmarks
squad: ml-ia-padroes-squad
agent: benchmark-generator
icon: "📊"
---

# generate-benchmarks

Gerar benchmarks iniciais para novo cliente ou forçar regeneração quando volume mínimo é atingido, definindo thresholds de performance por indicador e tipo de venda.

## Pré-condições

- Mínimo de 50 conversas classificadas e analisadas disponíveis para o cliente
- Schema `ml_padroes.benchmarks` criado e acessível
- benchmark-calibrator disponível para receber notificação pós-geração
- Tipos de venda e produtos mapeados para o cliente

## Passos

1. Verificar volume de dados disponível: contar conversas classificadas com resultado definido (mínimo 50)
2. Calcular distribuição de assertividade por percentil: p25, p50, p75, p90 para o período base
3. Calcular distribuição de taxa de conversão por tipo_venda (varejo/consultiva/despertar_desejo)
4. Definir thresholds de performance: excelente (>= p90) / bom (p75-p90) / médio (p50-p75) / fraco (p25-p50) / crítico (< p25)
5. Gerar benchmarks específicos por produto e por tipo de venda
6. Persistir todos os benchmarks em `ml_padroes.benchmarks` com data_geracao, volume_base e thresholds
7. Notificar benchmark-calibrator via evento para agendar recalibração periódica

## Outputs

- `benchmarks_gerados`: Objeto com thresholds por indicador, produto e tipo de venda
- `thresholds_por_indicador`: Valores de corte para cada nível de performance
- `data_geracao`: Timestamp da geração dos benchmarks
- `volume_dados_base`: Total de conversas usadas como base de cálculo

## Critérios de sucesso

- Benchmarks gerados com volume >= 50 conversas
- Distribuição estatisticamente válida: desvio padrão calculado para cada indicador
- Thresholds cobrem 100% dos tipos de venda ativos do cliente
