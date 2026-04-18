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

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const projetoId = await getProjetoId(slug);
    if (!projetoId) {
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 });
    }

    const rows = await query(
      `SELECT * FROM ml_clinica.procedimentos
       WHERE projeto_id = $1
       ORDER BY ordem, nome`,
      [projetoId]
    );

    return NextResponse.json({ procedimentos: rows });
  } catch (error) {
    console.error('GET /api/clinica/[slug]/procedimentos error:', error);
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

    if (!body.nome?.trim()) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    const rows = await query(
      `INSERT INTO ml_clinica.procedimentos (
        projeto_id, nome, finalidade, regiao, qtd_sessoes, duracao_sessao,
        intervalo_sessoes, valor_avulso, valor_sessao_pacote, valor_pacote,
        descricao, beneficios, contraindicacoes, resultados_esperados,
        cuidados_pre, cuidados_pos, status, observacoes, sugestoes_respostas, ordem
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
      ) RETURNING *`,
      [
        projetoId,
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
      ]
    );

    await recompilarKnowledgeBase(projetoId);

    return NextResponse.json({ procedimento: rows[0] }, { status: 201 });
  } catch (error) {
    console.error('POST /api/clinica/[slug]/procedimentos error:', error);
    return NextResponse.json({ error: 'Erro ao criar procedimento' }, { status: 500 });
  }
}
