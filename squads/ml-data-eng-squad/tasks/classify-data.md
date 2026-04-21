---
id: classify-data
name: Classify Conversations by Type and Area
squad: ml-data-eng-squad
agent: data-classifier
icon: "🏷️"
---

# classify-data

Classificar conversas capturadas por tipo de venda e área de negócio usando Claude Haiku, garantindo roteamento correto para o schema do squad responsável.

## Pré-condições

- Conversas disponíveis em `ml_captura.mensagens_raw` com status `pendente_classificacao`
- Chave de API Claude configurada com modelo Haiku disponível
- Schemas dos squads operacionais criados e acessíveis
- Tabela `ml_captura.classificacoes` criada para persistir resultados

## Passos

1. Ler conversas com status `pendente_classificacao` em lotes de 50 registros de ml_captura.mensagens_raw
2. Para cada conversa, montar prompt para Claude Haiku com texto da conversa e taxonomia de classificação
3. Classificar por `tipo_venda`: varejo / consultiva / despertar_desejo
4. Classificar por `area_negocio`: comercial / atendimento / financeiro / operacional / marketing / pessoas
5. Calcular confiança da classificação (0.0 a 1.0) com base na certeza do modelo
6. Persistir classificação em `ml_captura.classificacoes` com tipo, área, confiança e justificativa
7. Rotear conversa para schema do squad correspondente via insert na tabela de entrada do squad
8. Sinalizar casos com confiança < 0.75 para revisão manual com status `revisao_necessaria`

## Outputs

- `tipo_venda`: Classificação do tipo de abordagem comercial (varejo/consultiva/despertar_desejo)
- `area_negocio`: Área de negócio responsável pela conversa
- `confianca_classificacao`: Score de confiança do modelo (0.0 a 1.0)
- `schema_destino`: Schema Postgres de destino para roteamento da conversa

## Critérios de sucesso

- Confiança >= 0.75 em >= 90% das conversas classificadas
- Erro de roteamento 0%: nenhuma conversa enviada para schema incorreto
- Casos de baixa confiança sinalizados e não roteados automaticamente
