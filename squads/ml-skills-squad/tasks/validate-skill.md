---
id: validate-skill
name: Validate Skill Before Deployment
squad: ml-skills-squad
agent: skill-validator
icon: "✅"
---

# validate-skill

Validar skill gerada pelo skill-generator através de simulação de cenários e verificação de alinhamento com material técnico dos produtos antes de incorporar ao agente de nicho.

## Pré-condições

- Skill gerada pelo skill-generator disponível em ml_skills.skills_geradas com status `pendente_validacao`
- Material técnico dos produtos acessível via technical-content-loader
- Schema `ml_skills.validacoes` criado para persistir resultados
- Acesso à API Claude para simulação de conversas

## Passos

1. Carregar skill do skill-generator pelo skill_id fornecido
2. Simular 10 cenários de conversa distintos usando a skill como instrução do agente via Claude API
3. Para cada simulação: verificar se a skill produziu resposta coerente e alinhada ao cenário
4. Verificar alinhamento com material técnico: cada informação factual da skill vs conteúdo do technical-content-loader
5. Detectar contradições internas: triggers conflitantes, instruções ambíguas ou exemplos incorretos
6. Detectar lacunas: cenários críticos do nicho não cobertos pela skill atual
7. Calcular score de validação (0-100): 50% cobertura de cenários + 30% alinhamento técnico + 20% ausência de contradições
8. Aprovar skill (score >= 80) ou reprovar com lista detalhada de problemas para correção
9. Registrar resultado em `ml_skills.validacoes` com score, status e lista de problemas

## Outputs

- `validation_score`: Score de validação calculado (0-100)
- `status`: Resultado da validação (aprovada / reprovada)
- `problemas_encontrados`: Lista de contradições, lacunas ou erros técnicos identificados
- `cenarios_testados`: Descrição dos 10 cenários simulados e resultado de cada um

## Critérios de sucesso

- Score de validação >= 80 para aprovação
- Zero contradições com material técnico oficial dos produtos
- Skill reprovada retorna lista acionável de problemas para o skill-generator corrigir
