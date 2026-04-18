import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

interface Params {
  params: Promise<{ slug: string; id: string }>;
}

async function getProjetoId(slug: string): Promise<string | null> {
  const rows = await query<{ id: string }>(
    `SELECT id FROM _plataforma.projetos WHERE slug = $1 AND ativo = true`,
    [slug]
  );
  return rows[0]?.id ?? null;
}

async function recompilarKnowledgeBase(projetoId: string): Promise<void> {
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
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { slug, id } = await params;
    const projetoId = await getProjetoId(slug);
    if (!projetoId) {
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 });
    }

    const body = await req.json();

    if (!body.nome?.trim()) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    const rows = await query(
      `UPDATE ml_clinica.procedimentos SET
        nome = $1,
        finalidade = $2,
        regiao = $3,
        qtd_sessoes = $4,
        duracao_sessao = $5,
        intervalo_sessoes = $6,
        valor_avulso = $7,
        valor_sessao_pacote = $8,
        valor_pacote = $9,
        descricao = $10,
        beneficios = $11,
        contraindicacoes = $12,
        resultados_esperados = $13,
        cuidados_pre = $14,
        cuidados_pos = $15,
        status = $16,
        observacoes = $17,
        sugestoes_respostas = $18,
        ordem = $19,
        updated_at = NOW()
      WHERE id = $20 AND projeto_id = $21
      RETURNING *`,
      [
        body.nome.trim(),
        body.finalidade ?? null,
        body.regiao ?? null,
        body.qtd_sessoes ?? null,
        body.duracao_sessao ?? null,
        body.intervalo_sessoes ?? null,
        body.valor_avulso ?? null,
        body.valor_sessao_pacote ?? null,
        body.valor_pacote ?? null,
        body.descricao ?? null,
        body.beneficios ?? null,
        body.contraindicacoes ?? null,
        body.resultados_esperados ?? null,
        body.cuidados_pre ?? null,
        body.cuidados_pos ?? null,
        body.status ?? 'ativo',
        body.observacoes ?? null,
        body.sugestoes_respostas ?? null,
        body.ordem ?? 0,
        id,
        projetoId,
      ]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Procedimento não encontrado' }, { status: 404 });
    }

    await recompilarKnowledgeBase(projetoId);

    return NextResponse.json({ procedimento: rows[0] });
  } catch (error) {
    console.error('PUT /api/clinica/[slug]/procedimentos/[id] error:', error);
    return NextResponse.json({ error: 'Erro ao atualizar procedimento' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { slug, id } = await params;
    const projetoId = await getProjetoId(slug);
    if (!projetoId) {
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 });
    }

    const rows = await query(
      `DELETE FROM ml_clinica.procedimentos WHERE id = $1 AND projeto_id = $2 RETURNING id`,
      [id, projetoId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Procedimento não encontrado' }, { status: 404 });
    }

    await recompilarKnowledgeBase(projetoId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/clinica/[slug]/procedimentos/[id] error:', error);
    return NextResponse.json({ error: 'Erro ao remover procedimento' }, { status: 500 });
  }
}
