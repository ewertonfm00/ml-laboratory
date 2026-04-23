# technical-demo

## Purpose

Executar demo técnica ao vivo para um prospect, demonstrando o fluxo completo do sistema em tempo real com dados contextualizados para a realidade do cliente.

---

## Task Definition

```yaml
task: technicalDemo()
responsible: Flex (sales-engineer)
atomic_layer: Molecule

inputs:
  - campo: nome_cliente
    tipo: string
    origem: User Input
    obrigatório: true
    descrição: "Nome do cliente para personalizar o roteiro da demo"

  - campo: contato_prospect
    tipo: string
    origem: User Input
    obrigatório: true
    descrição: "Nome do contato e cargo (ex: 'João Silva, CEO')"

  - campo: dores_identificadas
    tipo: array
    origem: User Input
    obrigatório: true
    descrição: "Lista de dores coletadas na prospecção (ex: ['alto índice de perdas', 'processo manual lento', 'sem atendimento fora do horário'])"

outputs:
  - campo: demo_executada
    tipo: boolean
    destino: CRM / Registro
    descrição: "Confirma se a demo foi apresentada com sucesso"

  - campo: reacao_prospect
    tipo: enum
    valores: [muito_positiva, positiva, neutra, negativa, sem_retorno]
    destino: CRM
    descrição: "Avaliação qualitativa da reação do prospect durante a demo"

  - campo: proximo_passo
    tipo: enum
    valores: [proposta_enviada, poc_agendada, follow_up_agendado, perdido, sem_interesse]
    destino: CRM
    descrição: "Ação definida ao final da demo"
```

---

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] Ambiente de demo aquecido e instâncias ativas
  - [ ] nome_cliente, contato_prospect e dores_identificadas fornecidos
  - [ ] Roteiro personalizado preparado antes da reunião com o prospect
  - [ ] Prospect confirmou disponibilidade para a demo ao vivo
  - [ ] Conexão de internet estável no ambiente de apresentação
```

---

## Workflow

### Passo 1 — Preparar Roteiro Personalizado

Com base nas dores identificadas, montar o script de abertura:

1. **Saudar** com nome do cliente e tom adequado ao segmento
2. **Contextualizar** o problema identificado na prospecção
3. **Demonstrar** a solução para cada dor identificada
4. **Encaminhar** para o próximo passo natural

Exemplo de abertura adaptada:
```
"Olá! Obrigado por estar aqui, {{nome_cliente}}.
Na nossa conversa anterior, vocês mencionaram [dor_1] e [dor_2]...
Vou mostrar exatamente como o sistema resolve isso."
```

### Passo 2 — Verificar Ambiente de Demo

Antes de iniciar a demo ao vivo:

1. Confirmar que o ambiente de demo está operacional
2. Enviar requisição de teste interna para validar o fluxo completo
3. Verificar que todos os módulos estão respondendo corretamente
4. Se algum módulo não responder: acionar @ai-engineer antes de prosseguir

### Passo 3 — Executar Demo ao Vivo

Sequência de execução com o prospect presente:

**Fase A — Entrada e triagem (primeiros 60-90 segundos):**
- Demonstrar como o sistema recebe e processa automaticamente uma requisição
- Apresentar ao prospect: "Qualquer entrada no sistema recebe resposta instantânea, 24h por dia"

**Fase B — Processamento inteligente (2-3 minutos):**
- Demonstrar a lógica de roteamento e processamento do sistema
- Apresentar: "O sistema entende o contexto e toma a ação correta automaticamente"

**Fase C — Resultado final (1-2 minutos):**
- Mostrar o output final e a persistência dos dados
- Apresentar: "Tudo registrado e rastreável. Zero trabalho manual."

### Passo 4 — Capturar Reação do Prospect

Ao final da demo, fazer perguntas de ancoragem:

1. "O que chamou mais atenção para vocês nessa demonstração?"
2. "Isso resolve o problema de [dor principal identificada]?"
3. "Vocês conseguem imaginar como ficaria o processo de vocês com isso?"

Registrar a reação observada: linguagem corporal, perguntas feitas, objeções levantadas.

### Passo 5 — Definir Próximo Passo

Com base na reação, apresentar o caminho natural:

| Reação | Próximo Passo | Ação Flex |
|--------|---------------|-----------|
| Muito positiva | PoC 7 dias gratuita | Acionar `poc-setup` |
| Positiva | Proposta personalizada | Acionar `proposal-builder` |
| Neutra / Objeção | Follow-up com ROI calculado | Acionar `roi-calculator` + agendar retorno |
| Negativa | Encerrar com porta aberta | Registrar motivo no CRM |

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] Demo executada e reação do prospect registrada
  - [ ] Próximo passo definido e comunicado ao prospect
  - [ ] Registro atualizado no CRM com outcome da demo
  - [ ] Ação de follow-up agendada (se aplicável)
```

---

## Acceptance Criteria

```yaml
acceptance-criteria:
  - [ ] Roteiro personalizado com dores do prospect foi preparado antes da demo
  - [ ] Ambiente de demo estava ativo durante toda a apresentação
  - [ ] Fluxo completo do sistema foi demonstrado sem interrupção
  - [ ] Reação do prospect foi classificada e registrada
  - [ ] Próximo passo foi definido ao final da demo
  - [ ] CRM atualizado com demo_executada, reacao_prospect e proximo_passo
```

---

## Metadata

```yaml
version: 1.0.0
tags: [sales, demo, prospect]
responsible: sales-engineer
updated_at: 2026-04-18
```
