import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { token, api_key } = await req.json();

    if (!token || !api_key) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 });
    }

    const projRows = await query<{ id: string; onboarding_status: string }>(
      `SELECT id, onboarding_status FROM _plataforma.projetos WHERE onboarding_token = $1`,
      [token]
    );

    if (!projRows[0]) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 404 });
    }

    await query(
      `UPDATE _plataforma.projetos
       SET webhook_api_key = $1, onboarding_status = 'conectado'
       WHERE id = $2`,
      [api_key, projRows[0].id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/onboarding/conectar error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
