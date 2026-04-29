import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

interface Params {
  params: Promise<{ token: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { token } = await params;

    const rows = await query<{ nome: string; responsavel: string; onboarding_status: string; slug: string }>(
      `SELECT nome, responsavel, onboarding_status, slug
       FROM _plataforma.projetos
       WHERE onboarding_token = $1`,
      [token]
    );

    if (!rows[0]) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('GET /api/onboarding/[token] error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
