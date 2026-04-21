---
task: Mapear Processo Operacional
agent: process-analyst
squad: ml-operacional-squad
atomic_layer: task
elicit: false
responsavel: process-analyst
responsavel_type: agent
Entrada: |
  - conversa_raw: Texto transcrito da interação operacional
  - area: Área operacional
  - processo_id: Processo sendo mapeado
Saida: |
  - mapa_processo: JSON com etapas, responsáveis e tempos
  - gargalos: Lista de pontos de lentidão ou falha
  - inconsistencias: Desvios do processo padrão
  - criticidade: baixa | média | alta | crítica
Checklist:
  - "[ ] Identificar todas as etapas mencionadas na conversa"
  - "[ ] Mapear responsável por cada etapa"
  - "[ ] Estimar tempo de cada etapa quando mencionado"
  - "[ ] Identificar pontos de espera ou bloqueio"
  - "[ ] Comparar com processo padrão documentado (se existir)"
  - "[ ] Classificar criticidade dos desvios"
  - "[ ] Persistir mapeamento em ml_operacional.processos"
---

# map-process

Mapeia um processo operacional real a partir de conversas ou registros capturados, gerando uma representação estruturada do fluxo real vs esperado.

## Processo

1. Extrair menções a etapas, responsáveis e tempos da conversa
2. Montar sequência lógica do processo descrito
3. Identificar gaps (etapas puladas ou não mencionadas)
4. Detectar pontos de espera, retrabalho ou bloqueio
5. Classificar criticidade de cada desvio encontrado
6. Persistir no banco com metadados

## Output Schema

```json
{
  "processo_id": "string",
  "area": "string",
  "etapas": [
    {
      "nome": "string",
      "responsavel": "string",
      "tempo_estimado_min": 0,
      "status": "normal|lento|bloqueado"
    }
  ],
  "gargalos": [],
  "inconsistencias": [],
  "criticidade": "baixa|media|alta|critica",
  "mapeado_em": "ISO8601"
}
```
