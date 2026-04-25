-- =============================================================================
-- Seed: 001_segment_catalog_inicial.sql
-- Propósito: Catálogo inicial de segmentos de mercado para segment-catalog-manager
-- Piloto: Omega Laser (estetica-equipamentos) + 3 segmentos de comparação
-- Todos partem com dados_suficientes=false (sem cases validados ainda)
-- =============================================================================

INSERT INTO ml_orquestrador.segment_catalog
    (id, nome, descricao, ciclo_venda, nivel_tecnico, decisao, relacionamento,
     disc_preferido, metodologia, ticket_medio, dados_suficientes, metadados)
VALUES

-- Segmento piloto: Omega Laser
(
    'estetica-equipamentos',
    'Estética — Equipamentos e Locação',
    'Venda e locação de equipamentos estéticos para clínicas, spas e profissionais de beleza. Decisão técnica (eficácia do equipamento) combinada com viabilidade financeira (ROI para o negócio). Canal principal: WhatsApp.',
    'medio',
    'medio',
    'misto',
    'consultivo',
    ARRAY['D', 'I'],
    ARRAY['SPIN', 'produto-abordagem', 'ROI-demonstracao'],
    'alto',
    false,
    '{"piloto": true, "fonte": "Omega Laser - ML Laboratory", "nota": "Segmento piloto — cases sendo coletados via pipeline de captura"}'
),

-- Comparação 1: Saúde — equipamentos e serviços para clínicas médicas
(
    'saude-clinicas-b2b',
    'Saúde — Equipamentos e Serviços para Clínicas',
    'Venda de equipamentos médicos e serviços para clínicas, consultórios e hospitais. Decisão predominantemente racional com alto nível técnico — comprador é profissional de saúde ou gestor clínico.',
    'medio',
    'alto',
    'racional',
    'consultivo',
    ARRAY['C', 'D'],
    ARRAY['SPIN', 'Challenger', 'Solution Selling'],
    'alto',
    false,
    '{"nota": "Segmento de alta similaridade técnica com estetica-equipamentos — base de comparação prioritária"}'
),

-- Comparação 2: Beleza — varejo e serviços ao consumidor final
(
    'beleza-varejo-b2c',
    'Beleza — Varejo e Serviços ao Consumidor',
    'Venda de produtos e serviços de beleza direto ao consumidor final (salões, barbearias, clientes individuais). Decisão emocional, ciclo curto, relacionamento transacional ou de fidelização.',
    'curto',
    'baixo',
    'emocional',
    'transacional',
    ARRAY['I', 'S'],
    ARRAY['rapport-emocional', 'demonstracao-produto'],
    'medio',
    false,
    '{"nota": "Mesmo setor do piloto mas modelo B2C — comparação de portabilidade de perfil"}'
),

-- Comparação 3: B2B genérico — equipamentos industriais/profissionais
(
    'b2b-equipamentos-industria',
    'B2B — Equipamentos Industriais e Profissionais',
    'Venda de equipamentos industriais ou profissionais para empresas de médio/grande porte. Processo de compra formal, múltiplos decisores, alto nível técnico exigido.',
    'longo',
    'alto',
    'racional',
    'consultivo',
    ARRAY['C', 'D'],
    ARRAY['SPIN', 'Solution Selling', 'Challenger'],
    'alto',
    false,
    '{"nota": "Segmento de referência para ciclo longo e decisão racional — perfil DISC C/D dominante"}'
)

ON CONFLICT (id) DO NOTHING;
