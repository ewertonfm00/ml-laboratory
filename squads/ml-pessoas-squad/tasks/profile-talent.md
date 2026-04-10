---
task: Criar Perfil Comportamental de Colaborador
agent: talent-profiler
squad: ml-pessoas-squad
atomic_layer: task
elicit: false
Entrada: |
  - dados_desempenho: Métricas e resultados do colaborador
  - interacoes: Conversas e registros de trabalho
  - funcao: Cargo/função do colaborador
Saida: |
  - perfil_comportamental: JSON com dimensões comportamentais
  - score_aderencia: % de aderência ao perfil ideal
  - gaps_identificados: Áreas de desenvolvimento
  - pontos_fortes: Diferenciais do colaborador
Checklist:
  - "[ ] Analisar métricas de desempenho no período"
  - "[ ] Identificar padrões de comportamento nas interações"
  - "[ ] Mapear dimensões comportamentais (comunicação, proatividade, qualidade, etc.)"
  - "[ ] Comparar com perfil ideal da função"
  - "[ ] Calcular score de aderência"
  - "[ ] Identificar gaps prioritários de desenvolvimento"
  - "[ ] Destacar pontos fortes diferenciadores"
  - "[ ] Persistir perfil em ml_pessoas.perfis_colaborador"
---

# profile-talent

Constrói um perfil comportamental completo de um colaborador a partir de dados reais de desempenho e interações.

## Processo

1. Consolidar métricas de desempenho do período
2. Analisar padrões comportamentais nas interações
3. Mapear em dimensões padronizadas (comunicação, execução, iniciativa, qualidade, relacionamento)
4. Comparar com perfil ideal compilado de top performers da função
5. Calcular score de aderência e gaps
6. Persistir no banco

## Output Schema

```json
{
  "colaborador_id": "string",
  "funcao": "string",
  "dimensoes": {
    "comunicacao": 0.0,
    "execucao": 0.0,
    "iniciativa": 0.0,
    "qualidade": 0.0,
    "relacionamento": 0.0
  },
  "score_aderencia": 0.0,
  "pontos_fortes": [],
  "gaps_identificados": [],
  "gerado_em": "ISO8601"
}
```
