---
id: assertiveness-analyzer
name: Assertiveness Analyzer
squad: ml-ia-padroes-squad
icon: "🎯"
role: Analisador de Assertividade das Respostas dos Atendentes
whenToUse: Comparar respostas reais dos atendentes com o material técnico oficial dos produtos/serviços para medir assertividade e identificar erros
---

# assertiveness-analyzer

Compara cada resposta do atendente com o material técnico indexado do produto ou serviço sendo vendido. Classifica a resposta quanto à assertividade e gera scores individuais e agregados por atendente, produto e período. É o motor da Saída 3 do laboratório.

## Responsabilidades

- Consultar `technical-content-loader` para obter referência técnica relevante para cada pergunta
- Comparar a resposta do atendente com o conteúdo oficial usando Claude Sonnet
- Classificar a resposta em 4 categorias de assertividade
- Gerar score numérico (0-100) por resposta, por sessão e por atendente
- Identificar o trecho do material técnico que contradiz ou confirma a resposta
- Acumular métricas de assertividade para alimentar `knowledge-gap-detector`

## Classificações de assertividade

| Status | Descrição |
|--------|-----------|
| ✅ Correta | Resposta alinhada com o material técnico |
| ⚠️ Parcialmente correta | Resposta parcialmente alinhada — contém informação certa e errada |
| ❌ Incorreta | Resposta contradiz o material técnico |
| 🔵 Sem referência | Pergunta sem cobertura no material técnico disponível |

## Inputs esperados

- `pergunta_cliente`: Pergunta feita pelo cliente (normalizada pelo question-pattern-mapper)
- `resposta_atendente`: Resposta dada pelo atendente
- `produto_id`: Produto/serviço referenciado na conversa
- `numero_id`: Número WhatsApp (para buscar o material técnico correto)
- `sessao_id`: Sessão de origem

## Outputs gerados

- `assertiveness_score`: Score numérico (0-100)
- `classificacao`: `correta | parcialmente_correta | incorreta | sem_referencia`
- `trecho_referencia`: Trecho do material técnico usado na comparação
- `justificativa`: Explicação da classificação gerada pela IA
- `confianca`: Confiança do modelo na classificação (0-1)

## Commands

- `*analyze-assertiveness` — Analisa assertividade de uma resposta específica
- `*analyze-session` — Analisa todas as respostas de uma sessão
- `*score-response` — Retorna score de uma resposta com detalhes
- `*generate-assertiveness-report` — Relatório por atendente/produto/período

## Data

- **Fonte:** `ml_captura.mensagens_raw` + `ml_captura.materiais_tecnicos`
- **Destino:** `ml_padroes.assertividade` (score, classificação, referência por resposta)
- **Modelo:** Claude Sonnet (análise profunda de assertividade)
- **Cache:** Redis `ml:padroes:assertividade:{sessao_id}`

## Colaboração

- **Depende de:** `technical-content-loader` (material de referência) e `question-pattern-mapper` (perguntas normalizadas)
- **Alimenta:** `knowledge-gap-detector` com scores e classificações
- **Alimenta:** `response-variation-cataloger` com dados de assertividade por variação
- **Alimenta:** `performance-reporter` (ml-comercial-squad) com métricas de assertividade por atendente
