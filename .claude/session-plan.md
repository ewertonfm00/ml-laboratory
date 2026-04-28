# Execution Plan
_Criado em 2026-04-21 — atualizado pelo agente a cada task_

## Decisões
- **Seed tipo='multi' bloqueado**: não existe clínica com esse perfil ainda — seed só será criado quando houver caso real de negócio
- **entity-registry WARN ignorado**: `install --force` sobrescreve settings.json (80 deny rules) — resolver com backup+restore quando necessário

## Pendente
- [ ] **#1 — PRIORIDADE:** Testar Redis Dedup Check — enviar mesma mensagem WhatsApp 2x e confirmar que apenas 1 registro entra em ml_captura.mensagens_raw (Redis SET usa TTL 24h, key: dedup:{message_id})
- [ ] entity-registry 132h+: backup settings.json → npx aiox-core install --force → restore
- [ ] Seed SQL tipo='multi': BLOQUEADO — aguarda clínica com serviço multi

## Concluído
- [x] GAP-006: 3 tasks do whatsapp-recovery-agent criadas + squad.yaml atualizado — commit da225cc
- [x] Migration 022: diagnostic_runs + validation_log — commit 7fbd936
- [x] SHE: 14 agentes autoClaude v1.0 → v3.0 — commit ee6c8ec (+ sync Omega Laser e Estetica.IA)
- [x] Redis Dedup Check: pass-through substituído por 3 nós Redis reais (GET + IF + SET, TTL 24h) — workflow eM0qnKGXShlOuCsV ativo
