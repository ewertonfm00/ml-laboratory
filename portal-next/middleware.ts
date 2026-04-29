import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware do portal: protege rotas `/admin/*` (exceto `/admin/login`)
 * exigindo cookie `admin_session` válido. Sem cookie ou inválido → redirect
 * para `/admin/login`.
 *
 * Comparação tempo-constante não é estritamente necessária aqui (o atacante
 * que controla o cookie já burlou a barreira), mas mantemos verificação simples
 * de igualdade exata para evitar drift com `lib/admin-auth.ts`.
 *
 * Rotas `/api/admin/*` não passam por este middleware — são protegidas pelo
 * helper `requireAdminAuth` chamado dentro de cada handler.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // /admin/login é a única rota /admin pública
  if (pathname === '/admin/login' || pathname.startsWith('/admin/login/')) {
    return NextResponse.next();
  }

  const expected = process.env.ADMIN_API_TOKEN;
  const cookie = req.cookies.get('admin_session')?.value;

  if (!expected || !cookie || cookie !== expected) {
    const loginUrl = new URL('/admin/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
