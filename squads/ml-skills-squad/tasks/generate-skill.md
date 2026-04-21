---
id: generate-skill
name: Generate Niche Agent Skill
task: Generate Niche Agent Skill
squad: ml-skills-squad
agent: skill-generator
icon: "⚡"
atomic_layer: task
elicit: false
responsavel: skill-generator
responsavel_type: agent
Entrada: |
  - padroes_validados: Padrões comportamentais validados em ml_padroes.padroes_extraidos para o nicho/produto
  - conteudo_tecnico: Conteúdo técnico dos produtos carregado pelo niche-content-extractor
  - top_cenarios: Top 10 cenários do nicho mapeados e priorizados
Saida: |
  - skill_id: UUID único da skill gerada
  - skill_content: Skill estruturada no formato AIOX Agent Framework
  - cenarios_cobertos: Lista dos cenários do nicho contemplados pela skill
  - score_cobertura: Percentual dos top 10 cenários cobertos (0.0 a 1.0)
Checklist:
  - "[ ] Carregar padrões do ml-ia-padroes-squad para o nicho e produto específico"
  - "[ ] Carregar conteúdo técnico do produto via niche-content-extractor"
  - "[ ] Estruturar skill com 4 componentes (cenário, trigger, instrução, exemplo)"
  - "[ ] Validar cobertura dos top 10 cenários prioritários do nicho"
  - "[ ] Formatar skill no padrão AIOX Agent Framework (YAML + exemplos em markdown)"
  - "[ ] Persistir skill em ml_skills.skills_geradas com versão e score de cobertura"
  - "[ ] Encaminhar skill para skill-validator antes de marcar como disponível"
---

# generate-skill

Gerar skill estruturada para o agente de IA de nicho a partir de padrões comportamentais validados e conteúdo técnico dos produtos, cobrindo os cenários mais frequentes do nicho.

## Pré-condições

- Padrões comportamentais validados disponíveis em ml_padroes.padroes_extraidos para o nicho/produto
- Conteúdo técnico dos produtos carregado pelo niche-content-extractor (ml-comercial)
- Schema `ml_skills.skills_geradas` criado e acessível
- Top 10 cenários do nicho mapeados e priorizados

## Passos

1. Carregar padrões do ml-ia-padroes-squad para o nicho e produto específico (filtrar por tipo_venda e area)
2. Carregar conteúdo técnico do produto via niche-content-extractor: especificações, benefícios, diferenciais
3. Estruturar skill com 4 componentes: cenário (quando usar), trigger (gatilho de ativação), instrução (o que fazer) e exemplo (conversa real de referência)
4. Validar cobertura: verificar se a skill contempla os top 10 cenários prioritários do nicho
5. Formatar skill no padrão do AIOX Agent Framework: YAML com campos definidos e exemplos em markdown
6. Persistir skill em `ml_skills.skills_geradas` com nicho, produto, versão e score de cobertura
7. Encaminhar skill para skill-validator antes de marcar como disponível para uso

## Outputs

- `skill_id`: UUID único da skill gerada
- `skill_content`: Skill estruturada no formato AIOX Agent Framework
- `cenarios_cobertos`: Lista dos cenários do nicho contemplados pela skill
- `score_cobertura`: Percentual dos top 10 cenários cobertos (0.0 a 1.0)

## Critérios de sucesso

- Skill cobre >= 80% dos top 10 cenários do nicho
- Sem contradições internas: triggers únicos, instruções não conflitantes
- Exemplos baseados em conversas reais do dataset do cliente
