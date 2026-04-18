import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    // Metodologias são globais — slug é aceito por consistência mas não filtra
    void slug;

    const metodologias = await query(
      `SELECT id, nome, descricao, principios, tecnicas, quando_usar, ativo, created_at
       FROM ml_clinica.metodologias_vendas
       ORDER BY nome ASC`
    );

    return NextResponse.json({ metodologias });
  } catch (e) {
    console.error('GET /api/metodologias/[slug]:', e);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    void slug;

    const body = await req.json();
    const { nome, descricao, principios, tecnicas, quando_usar, ativo = true } = body;

    if (!nome?.trim()) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    const rows = await query(
      `INSERT INTO ml_clinica.metodologias_vendas
         (nome, descricao, principios, tecnicas, quando_usar, ativo)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [nome.trim(), descricao || null, principios || null, tecnicas || null, quando_usar || null, ativo]
    );

    return NextResponse.json({ metodologia: rows[0] }, { status: 201 });
  } catch (e) {
    console.error('POST /api/metodologias/[slug]:', e);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
