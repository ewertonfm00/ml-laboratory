import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { id, action, correcao } = await req.json();

    if (!id || !action) {
      return NextResponse.json({ error: 'id e action são obrigatórios' }, { status: 400 });
    }

    if (action === 'aprovar') {
      await query(
        `UPDATE _validacao.fila_validacao
         SET status = 'aprovada', updated_at = NOW()
         WHERE id = $1`,
        [id]
      );
      return NextResponse.json({ success: true });
    }

    if (action === 'corrigir') {
      if (!correcao) {
        return NextResponse.json({ error: 'correcao é obrigatório para ação corrigir' }, { status: 400 });
      }
      await query(
        `UPDATE _validacao.fila_validacao
         SET status = 'corrigida', resposta_texto = $2, updated_at = NOW()
         WHERE id = $1`,
        [id, correcao]
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
  } catch (err) {
    console.error('Erro em POST /api/validacao:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
