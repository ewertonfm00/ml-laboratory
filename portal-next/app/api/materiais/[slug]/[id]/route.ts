import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface RouteParams {
  params: Promise<{ slug: string; id: string }>;
}

async function getProjetoId(slug: string): Promise<string | null> {
  const rows = await query<{ id: string }>(
    `SELECT id FROM _plataforma.projetos WHERE slug = $1 LIMIT 1`,
    [slug]
  );
  return rows[0]?.id ?? null;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug, id } = await params;
    const projetoId = await getProjetoId(slug);
    if (!projetoId) return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 });

    const body = await req.json();
    const { titulo, tipo, conteudo, numero_id, ativo, ordem } = body;

    const rows = await query(
      `UPDATE ml_clinica.materiais_tecnicos
       SET titulo = COALESCE($1, titulo),
           tipo = COALESCE($2, tipo),
           conteudo = COALESCE($3, conteudo),
           numero_id = $4,
           ativo = COALESCE($5, ativo),
           ordem = COALESCE($6, ordem),
           updated_at = NOW()
       WHERE id = $7 AND projeto_id = $8
       RETURNING *`,
      [titulo, tipo, conteudo, numero_id || null, ativo, ordem, id, projetoId]
    );

    if (!rows.length) return NextResponse.json({ error: 'Material não encontrado' }, { status: 404 });
    return NextResponse.json({ material: rows[0] });
  } catch (e) {
    console.error('PUT /api/materiais/[slug]/[id]:', e);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug, id } = await params;
    const projetoId = await getProjetoId(slug);
    if (!projetoId) return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 });

    await query(
      `DELETE FROM ml_clinica.materiais_tecnicos WHERE id = $1 AND projeto_id = $2`,
      [id, projetoId]
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('DELETE /api/materiais/[slug]/[id]:', e);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
