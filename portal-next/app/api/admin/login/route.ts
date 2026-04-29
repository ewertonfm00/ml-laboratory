import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';

/**
 * POST /api/admin/login
 * Body: { password: string }
 *
 * Valida senha contra `ADMIN_PASSWORD`. Em sucesso, seta cookie HttpOnly
 * `admin_session` com valor = `ADMIN_API_TOKEN` (esse é o valor que o
 * middleware e o helper `requireAdminAuth` esperam).
 *
 * Decisão: usamos timingSafeEqual mesmo sendo one-shot — defesa em profundidade
 * e custo zero.
 */
export async function POST(req: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminToken = process.env.ADMIN_API_TOKEN;

  if (!adminPassword || !adminToken) {
    return NextResponse.json(
      { error: 'admin_auth_not_configured' },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const password =
    typeof body === 'object' && body !== null && 'password' in body
      ? String((body as { password: unknown }).password ?? '')
      : '';

  if (!password) {
    return NextResponse.json({ error: 'password_required' }, { status: 400 });
  }

  const passBuf = Buffer.from(password, 'utf8');
  const expectedBuf = Buffer.from(adminPassword, 'utf8');

  if (
    passBuf.length !== expectedBuf.length ||
    !timingSafeEqual(passBuf, expectedBuf)
  ) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set({
    name: 'admin_session',
    value: adminToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  });
  return res;
}
