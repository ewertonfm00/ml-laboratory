import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

interface Params {
  params: Promise<{ slug: string }>;
}

async function getProjetoId(slug: string): Promise<string | null> {
  const rows = await query<{ id: string }>(
    `SELECT id FROM _plataforma.projetos WHERE slug = $1 AND ativo = true`,
    [slug]
  );
  return rows[0]?.id ?? null;
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const projetoId = await getProjetoId(slug);
    if (!projetoId) {
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 });
    }

    const [perfilRows, faqRows, depoimentosRows] = await Promise.all([
      query(
        `SELECT * FROM ml_clinica.perfil WHERE projeto_id = $1`,
        [projetoId]
      ),
      query(
        `SELECT * FROM ml_clinica.faq WHERE projeto_id = $1 ORDER BY ordem, created_at`,
        [projetoId]
      ),
      query(
        `SELECT * FROM ml_clinica.depoimentos WHERE projeto_id = $1 ORDER BY ordem, created_at`,
        [projetoId]
      ),
    ]);

    return NextResponse.json({
      perfil: perfilRows[0] ?? null,
      faq: faqRows,
      depoimentos: depoimentosRows,
    });
  } catch (error) {
    console.error('GET /api/clinica/[slug]/perfil error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const projetoId = await getProjetoId(slug);
    if (!projetoId) {
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 });
    }

    const body = await req.json();
    const { faq = [], depoimentos = [], ...perfilData } = body;

    // Upsert perfil
    await query(
      `INSERT INTO ml_clinica.perfil (
        projeto_id,
        nome_clinica, nome_responsavel, cargo_formacao, mini_curriculum,
        registro_profissional, cnpj, instagram, site,
        whatsapp, whatsapp_exclusivo,
        rua, numero, complemento, bairro, cidade, estado, cep, ponto_referencia,
        dias_atendimento, horario_seg_sex, horario_sabado, pausa_almoco,
        capacidade_dia, tempo_entre_atendimentos, tolerancia_atraso,
        antecedencia_cancelamento, politica_agendamento, avaliacao_gratuita,
        formas_pagamento, aceita_parcelamento, regras_parcelamento,
        desconto_vista, politica_entrada, politica_reembolso, beneficios_fidelidade,
        apresentacao_agente, tom_comunicacao, frases_proibidas, objecoes_comuns,
        argumentos_persuasao, procedimentos_prioritarios, regras_limitacoes, regras_internas,
        contraindicacoes_gerais, restricoes_saude, outras_restricoes,
        autoriza_whatsapp, autoriza_acesso_conversas
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32,
        $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47,
        $48, $49
      )
      ON CONFLICT (projeto_id) DO UPDATE SET
        nome_clinica = EXCLUDED.nome_clinica,
        nome_responsavel = EXCLUDED.nome_responsavel,
        cargo_formacao = EXCLUDED.cargo_formacao,
        mini_curriculum = EXCLUDED.mini_curriculum,
        registro_profissional = EXCLUDED.registro_profissional,
        cnpj = EXCLUDED.cnpj,
        instagram = EXCLUDED.instagram,
        site = EXCLUDED.site,
        whatsapp = EXCLUDED.whatsapp,
        whatsapp_exclusivo = EXCLUDED.whatsapp_exclusivo,
        rua = EXCLUDED.rua,
        numero = EXCLUDED.numero,
        complemento = EXCLUDED.complemento,
        bairro = EXCLUDED.bairro,
        cidade = EXCLUDED.cidade,
        estado = EXCLUDED.estado,
        cep = EXCLUDED.cep,
        ponto_referencia = EXCLUDED.ponto_referencia,
        dias_atendimento = EXCLUDED.dias_atendimento,
        horario_seg_sex = EXCLUDED.horario_seg_sex,
        horario_sabado = EXCLUDED.horario_sabado,
        pausa_almoco = EXCLUDED.pausa_almoco,
        capacidade_dia = EXCLUDED.capacidade_dia,
        tempo_entre_atendimentos = EXCLUDED.tempo_entre_atendimentos,
        tolerancia_atraso = EXCLUDED.tolerancia_atraso,
        antecedencia_cancelamento = EXCLUDED.antecedencia_cancelamento,
        politica_agendamento = EXCLUDED.politica_agendamento,
        avaliacao_gratuita = EXCLUDED.avaliacao_gratuita,
        formas_pagamento = EXCLUDED.formas_pagamento,
        aceita_parcelamento = EXCLUDED.aceita_parcelamento,
        regras_parcelamento = EXCLUDED.regras_parcelamento,
        desconto_vista = EXCLUDED.desconto_vista,
        politica_entrada = EXCLUDED.politica_entrada,
        politica_reembolso = EXCLUDED.politica_reembolso,
        beneficios_fidelidade = EXCLUDED.beneficios_fidelidade,
        apresentacao_agente = EXCLUDED.apresentacao_agente,
        tom_comunicacao = EXCLUDED.tom_comunicacao,
        frases_proibidas = EXCLUDED.frases_proibidas,
        objecoes_comuns = EXCLUDED.objecoes_comuns,
        argumentos_persuasao = EXCLUDED.argumentos_persuasao,
        procedimentos_prioritarios = EXCLUDED.procedimentos_prioritarios,
        regras_limitacoes = EXCLUDED.regras_limitacoes,
        regras_internas = EXCLUDED.regras_internas,
        contraindicacoes_gerais = EXCLUDED.contraindicacoes_gerais,
        restricoes_saude = EXCLUDED.restricoes_saude,
        outras_restricoes = EXCLUDED.outras_restricoes,
        autoriza_whatsapp = EXCLUDED.autoriza_whatsapp,
        autoriza_acesso_conversas = EXCLUDED.autoriza_acesso_conversas,
        updated_at = NOW()`,
      [
        projetoId,
        perfilData.nome_clinica ?? null,
        perfilData.nome_responsavel ?? null,
        perfilData.cargo_formacao ?? null,
        perfilData.mini_curriculum ?? null,
        perfilData.registro_profissional ?? null,
        perfilData.cnpj ?? null,
        perfilData.instagram ?? null,
        perfilData.site ?? null,
        perfilData.whatsapp ?? null,
        perfilData.whatsapp_exclusivo ?? true,
        perfilData.rua ?? null,
        perfilData.numero ?? null,
        perfilData.complemento ?? null,
        perfilData.bairro ?? null,
        perfilData.cidade ?? null,
        perfilData.estado ?? null,
        perfilData.cep ?? null,
        perfilData.ponto_referencia ?? null,
        perfilData.dias_atendimento ?? null,
        perfilData.horario_seg_sex ?? null,
        perfilData.horario_sabado ?? null,
        perfilData.pausa_almoco ?? null,
        perfilData.capacidade_dia ?? null,
        perfilData.tempo_entre_atendimentos ?? null,
        perfilData.tolerancia_atraso ?? null,
        perfilData.antecedencia_cancelamento ?? null,
        perfilData.politica_agendamento ?? null,
        perfilData.avaliacao_gratuita ?? null,
        perfilData.formas_pagamento ?? null,
        perfilData.aceita_parcelamento ?? true,
        perfilData.regras_parcelamento ?? null,
        perfilData.desconto_vista ?? null,
        perfilData.politica_entrada ?? null,
        perfilData.politica_reembolso ?? null,
        perfilData.beneficios_fidelidade ?? null,
        perfilData.apresentacao_agente ?? null,
        perfilData.tom_comunicacao ?? null,
        perfilData.frases_proibidas ?? null,
        perfilData.objecoes_comuns ?? null,
        perfilData.argumentos_persuasao ?? null,
        perfilData.procedimentos_prioritarios ?? null,
        perfilData.regras_limitacoes ?? null,
        perfilData.regras_internas ?? null,
        perfilData.contraindicacoes_gerais ?? null,
        perfilData.restricoes_saude ?? null,
        perfilData.outras_restricoes ?? null,
        perfilData.autoriza_whatsapp ?? true,
        perfilData.autoriza_acesso_conversas ?? true,
      ]
    );

    // Substituir FAQ (delete + insert)
    await query(`DELETE FROM ml_clinica.faq WHERE projeto_id = $1`, [projetoId]);
    for (let i = 0; i < faq.length; i++) {
      const item = faq[i];
      if (item.pergunta?.trim() && item.resposta?.trim()) {
        await query(
          `INSERT INTO ml_clinica.faq (projeto_id, pergunta, resposta, ordem) VALUES ($1, $2, $3, $4)`,
          [projetoId, item.pergunta.trim(), item.resposta.trim(), i]
        );
      }
    }

    // Substituir depoimentos (delete + insert)
    await query(`DELETE FROM ml_clinica.depoimentos WHERE projeto_id = $1`, [projetoId]);
    for (let i = 0; i < depoimentos.length; i++) {
      const item = depoimentos[i];
      if (item.nome_paciente?.trim() && item.depoimento?.trim()) {
        await query(
          `INSERT INTO ml_clinica.depoimentos (projeto_id, nome_paciente, depoimento, ordem) VALUES ($1, $2, $3, $4)`,
          [projetoId, item.nome_paciente.trim(), item.depoimento.trim(), i]
        );
      }
    }

    // Compilar e upsert knowledge_base
    const kbRows = await query<{ conteudo: string }>(
      `SELECT ml_clinica.compilar_knowledge_base($1) AS conteudo`,
      [projetoId]
    );
    const conteudo = kbRows[0]?.conteudo ?? '';
    await query(
      `INSERT INTO ml_clinica.knowledge_base (projeto_id, conteudo, versao)
       VALUES ($1, $2, 1)
       ON CONFLICT (projeto_id) DO UPDATE SET
         conteudo = EXCLUDED.conteudo,
         versao = ml_clinica.knowledge_base.versao + 1,
         updated_at = NOW()`,
      [projetoId, conteudo]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/clinica/[slug]/perfil error:', error);
    return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 });
  }
}
