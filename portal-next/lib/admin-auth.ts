import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';

/**
 * Valida o cookie `admin_session` contra `process.env.ADMIN_API_TOKEN`
 * usando comparação tempo-constante.
 *
 * Retorna:
 * - `null` se autenticado (handler pode prosseguir)
 * - `NextResponse` com 401/500 caso contrário (handler deve retornar)
 */
export function requireAdminAuth(req: NextRequest): NextResponse | null {
  const expected = process.env.ADMIN_API_TOKEN;

  if (!expected) {
    return NextResponse.json(
      { error: 'admin_auth_not_configured' },
      { status: 500 }
    );
  }

  const cookie = req.cookies.get('admin_session')?.value;
  if (!cookie) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const cookieBuf = Buffer.from(cookie, 'utf8');
  const expectedBuf = Buffer.from(expected, 'utf8');

  // timingSafeEqual exige buffers de tamanhos iguais — se diferem, já é inválido
  if (cookieBuf.length !== expectedBuf.length) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  if (!timingSafeEqual(cookieBuf, expectedBuf)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  return null;
}
