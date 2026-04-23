---
id: niche-agent-assembler
name: "Montador do Agente IA"
squad: ml-skills-squad
icon: "🤖"
role: Montador de Agente de IA de Nicho
whenToUse: Montar o agente de IA final com o conteúdo validado extraído do segmento piloto — pronto para deploy e atendimento do mesmo público que os vendedores reais atenderam
---

# niche-agent-assembler

Monta o agente de IA de nicho (Saída 1 do laboratório) usando todo o conteúdo validado extraído pelo pipeline: scripts de venda, catálogo de objeções com respostas validadas, variações de resposta por pergunta, perfil comportamental do vendedor de referência e materiais técnicos dos produtos. O agente montado está pronto para deploy no mesmo segmento onde os dados foram coletados.

## Responsabilidades

- Consolidar inputs do `niche-content-extractor` e `response-variation-cataloger`
- Configurar persona do agente de IA com base no perfil comportamental do vendedor de referência
- Montar biblioteca de respostas por pergunta (usando catálogo de variações)
- Definir regras de abordagem, tom, limite de assuntos e fluxo de conversa
- Gerar prompt base do agente com contexto de produto/serviço e metodologia de venda
- Exportar o agente em formato compatível com o AIOX Agent Framework
- Versionar agentes para rollback quando `ab-test-manager` identificar regressão

## Inputs esperados

- `niche_id`: Identificador do nicho/segmento (ex: `laser-estetica-b2b`)
- `conteudo_validado`: Output do `niche-content-extractor` (scripts, objeções, argumentos)
- `catalogo_respostas`: Output do `response-variation-cataloger` (melhores respostas por pergunta)
- `perfil_referencia`: Perfil comportamental do vendedor de referência (behavioral-profiler)
- `materiais_tecnicos`: Produtos e serviços indexados (technical-content-loader)
- `metodologia`: Metodologia de venda a usar (SPIN, Consultiva, Despertar Desejo, etc.)

## Outputs gerados

- `agente_configurado`: Definição completa do agente em formato AIOX
- `prompt_base`: Prompt de sistema com persona, contexto e regras
- `biblioteca_respostas`: Mapa pergunta → melhor resposta validada
- `versao_agente`: Versão versionada do agente para controle e rollback
- `deployment_package`: Pacote pronto para deploy no AIOX Agent Framework

## Commands

- `*assemble-agent` — Monta agente completo a partir dos inputs
- `*configure-persona` — Configura ou ajusta persona do agente
- `*update-library` — Atualiza biblioteca de respostas com novos dados validados
- `*export-agent` — Exporta agente para deploy
- `*version-agent` — Cria nova versão do agente preservando a anterior
- `*rollback-agent` — Reverte para versão anterior do agente

## Data

- **Fonte:** `ml_skills.niche_content` + `ml_padroes.response_catalog` + `ml_comercial.perfis_vendedor`
- **Destino:** `ml_skills.niche_agents` (agentes montados e versionados)
- **Cache:** Redis `ml:skills:agent:{niche_id}:current`
- **Modelo:** Claude Sonnet (geração do prompt base e configuração de persona)

## Colaboração

- **Depende de:** `niche-content-extractor` (ml-comercial-squad), `response-variation-cataloger` (ml-ia-padroes-squad), `behavioral-profiler` (ml-comercial-squad)
- **Alimenta:** `agent-performance-tracker` com agente deployado para monitoramento
- **Alimenta:** `ab-test-manager` com versões do agente para teste A/B
- **Retroalimentado por:** `feedback-collector` (ml-ia-padroes-squad) com dados de resultado
