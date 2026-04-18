import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

async function getProjetoId(slug: string): Promise<string | null> {
  const rows = await query<{ id: string }>(
    `SELECT id FROM _plataforma.projetos WHERE slug = $1 LIMIT 1`,
    [slug]
  );
  return rows[0]?.id ?? null;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const projetoId = await getProjetoId(slug);
    if (!projetoId) return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 });

    const [materiais, numeros] = await Promise.all([
      query(
        `SELECT id, numero_id, titulo, tipo, conteudo, ativo, ordem, created_at, updated_at
         FROM ml_clinica.materiais_tecnicos
         WHERE projeto_id = $1
         ORDER BY ordem ASC, created_at DESC`,
        [projetoId]
      ),
      query(
        `SELECT id, numero_whatsapp, nome_identificador
         FROM _plataforma.numeros_projeto
         WHERE projeto_id = $1 AND ativo = true
         ORDER BY nome_identificador`,
        [projetoId]
      ),
    ]);

    return NextResponse.json({ materiais, numeros });
  } catch (e) {
    console.error('GET /api/materiais/[slug]:', e);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const projetoId = await getProjetoId(slug);
    if (!projetoId) return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 });

    const body = await req.json();
    const { titulo, tipo = 'geral', conteudo, numero_id, ativo = true, ordem = 0 } = body;

    if (!titulo?.trim() || !conteudo?.trim()) {
      return NextResponse.json({ error: 'Título e conteúdo são obrigatórios' }, { status: 400 });
    }

    const rows = await query(
      `INSERT INTO ml_clinica.materiais_tecnicos
         (projeto_id, numero_id, titulo, tipo, conteudo, ativo, ordem)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [projetoId, numero_id || null, titulo.trim(), tipo, conteudo.trim(), ativo, ordem]
    );

    return NextResponse.json({ material: rows[0] }, { status: 201 });
  } catch (e) {
    console.error('POST /api/materiais/[slug]:', e);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
