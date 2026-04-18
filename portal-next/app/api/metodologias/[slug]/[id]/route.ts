import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface RouteParams {
  params: Promise<{ slug: string; id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { nome, descricao, principios, tecnicas, quando_usar, ativo } = body;

    const rows = await query(
      `UPDATE ml_clinica.metodologias_vendas
       SET nome = COALESCE($1, nome),
           descricao = $2,
           principios = $3,
           tecnicas = $4,
           quando_usar = $5,
           ativo = COALESCE($6, ativo)
       WHERE id = $7
       RETURNING *`,
      [nome, descricao || null, principios || null, tecnicas || null, quando_usar || null, ativo, id]
    );

    if (!rows.length) return NextResponse.json({ error: 'Metodologia não encontrada' }, { status: 404 });
    return NextResponse.json({ metodologia: rows[0] });
  } catch (e) {
    console.error('PUT /api/metodologias/[slug]/[id]:', e);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await query(`DELETE FROM ml_clinica.metodologias_vendas WHERE id = $1`, [id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('DELETE /api/metodologias/[slug]/[id]:', e);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
