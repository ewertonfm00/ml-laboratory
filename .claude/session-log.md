# Session Log — AIOX Machine Learning Laboratory

---
## Sessão 2026-04-19

### 1. Implementações
- Nenhuma implementação de código nesta sessão — sessão de discovery e análise arquitetural.

### 2. Decisões

**Arquitetura — Identificação de Atendente nas Conversas**
- A tabela `ml_captura.sessoes_conversa` não possui campo de atendente — precisa de `agente_humano_id`
- O campo `responsavel` do formulário de onboarding **não é** o atendente das conversas — é apenas o contato que fez o cadastro da empresa, e não está sendo persistido no banco
- Os atendentes são registrados em `_plataforma.agentes_humanos` (com `identificador_externo` para integração com Redrive), mas sem vínculo com as sessões

**Dois modelos de operação identificados:**
- **Mono-agente:** 1 número WhatsApp → 1 pessoa fixa. O número já identifica o atendente. `agente_default_id` deve ser preenchido em `numeros_projeto`
- **Multi-agente:** 1 número → N atendentes (ex: Redrive). A plataforma identifica o atendente via `identificador_externo` no payload do webhook. Conversas precisam ser separadas por atendente para evitar distorções nas análises dos agentes de ML

**Modelo de dados proposto:**
```
numeros_projeto
  └── tipo: 'mono' | 'multi'
  └── agente_default_id (FK → agentes_humanos) — só para tipo=mono

sessoes_conversa
  └── agente_humano_id (FK → agentes_humanos) — sempre preenchido

Lógica de resolução no n8n (captura):
  → mono: agente_humano_id = agente_default_id do número
  → multi: extrai identificador_externo do webhook → resolve agente_humano_id
```

**Squads e Agentes (mapeamento completo desta sessão):**
- 11 squads: 6 com agentes ativos, 5 vazios
- 27 agentes definidos distribuídos em: ml-atendimento (3), ml-comercial (6), ml-financeiro (3), ml-marketing (3), ml-operacional (3), ml-pessoas (3)
- Squads vazios: ml-captura, ml-data-eng, ml-ia-padroes, ml-plataforma, ml-skills
- Nenhum agente tem `capability_level` definido explicitamente

**Banco de dados:** Supabase (PostgreSQL) com schemas por squad (`ml_comercial`, `ml_atendimento`, etc.) + schema global `_plataforma`

### 3. Todos Ativos

**PRIORIDADE ALTA — Migration + Workflow:**
- [ ] Adicionar campo `tipo` ('mono'|'multi') em `_plataforma.numeros_projeto`
- [ ] Adicionar campo `agente_default_id` em `_plataforma.numeros_projeto`
- [ ] Adicionar campo `agente_humano_id` em `ml_captura.sessoes_conversa`
- [ ] Ajustar workflow n8n de captura para resolver e preencher `agente_humano_id` automaticamente (lógica mono vs multi)
- [ ] Persistir campo `responsavel` do onboarding na tabela `_plataforma.projetos` (ou remover do formulário)

**PENDÊNCIA ANTERIOR (da memória):**
- [ ] Conectar número WhatsApp via Appsmith → escanear QR Code (ML-SETUP-INSTANCIA ativo)
- [ ] Painel da Clínica: telas para substituir formulário da planilha (dados operacionais + procedimentos + sugestões IA)

**Próximo passo sugerido:** Criar story para migration + ajuste de captura — acionar `@sm` para draftar ou ir direto com `@data-engineer` + `@dev`
