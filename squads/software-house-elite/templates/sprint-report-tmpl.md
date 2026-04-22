# Template — Sprint Report para Cliente

```yaml
template:
  id: sprint-report
  version: 1.0.0
  created: 2026-04-22
  squad: software-house-elite
  agent: project-manager
  purpose: "Relatório de sprint para comunicação com clientes externos"
```

---

# Sprint {N} — Relatório de Progresso

**Projeto:** {Nome do Projeto}
**Cliente:** {Nome do Cliente}
**Período:** {DD/MM} a {DD/MM/AAAA}
**Status geral:** 🟢 No prazo / 🟡 Atenção / 🔴 Em risco

---

## Resumo Executivo

> 2-3 frases resumindo o sprint para leitura rápida do decisor.

{Resumo objetivo: o que foi entregue, situação atual, próximo passo principal.}

---

## Entregue neste Sprint

| # | Funcionalidade | Status | Observação |
|---|---------------|--------|-----------|
| 1 | {nome} | ✅ Concluído | {nota se necessário} |
| 2 | {nome} | ✅ Concluído | |
| 3 | {nome} | 🔄 Parcial | {motivo + % concluído} |

**Velocidade:** {N} pontos entregues de {N} planejados ({%}%)

---

## Demonstração

> Link para ambiente de staging com as funcionalidades do sprint:

**Staging:** {URL}
**Credenciais de teste:** {user} / {senha} *(remover após apresentação)*

---

## Próximo Sprint — Planejamento Preliminar

| Prioridade | Item | Estimativa |
|-----------|------|-----------|
| Alta | {item} | {N pts / N dias} |
| Alta | {item} | {N pts / N dias} |
| Média | {item} | {N pts / N dias} |

**Início:** {data} · **Fim:** {data}

---

## Pontos de Atenção

> Apenas se existirem riscos, dependências ou decisões pendentes do cliente.

| Tipo | Descrição | Ação necessária | Responsável | Prazo |
|------|-----------|----------------|------------|-------|
| Risco | {descrição} | {ação} | {quem} | {data} |
| Decisão | {descrição} | {ação} | Cliente | {data} |

---

## Métricas

| Métrica | Valor |
|---------|-------|
| Bugs abertos | {N} (críticos: {N}) |
| Cobertura de testes | {%}% |
| Uptime staging | {%}% |
| Próximo marco | {nome} em {data} |

---

*Relatório gerado por software-house-elite — Sprint {N} — {data}*
