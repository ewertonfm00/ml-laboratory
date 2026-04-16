import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { numero_whatsapp, projeto_id, setor, nome_identificador } = body;

    if (!numero_whatsapp || !projeto_id || !setor || !nome_identificador) {
      return NextResponse.json(
        { success: false, error: 'Todos os campos são obrigatórios.' },
        { status: 400 }
      );
    }

    // Verify projeto exists
    const projetos = await query(
      `SELECT id FROM _plataforma.projetos WHERE id = $1 AND ativo = true`,
      [projeto_id]
    );
    if (!projetos.length) {
      return NextResponse.json(
        { success: false, error: 'Projeto não encontrado ou inativo.' },
        { status: 404 }
      );
    }

    // Check duplicate
    const existing = await query(
      `SELECT id FROM _plataforma.numeros_projeto WHERE numero_whatsapp = $1 AND projeto_id = $2`,
      [numero_whatsapp, projeto_id]
    );
    if (existing.length) {
      return NextResponse.json(
        { success: false, error: 'Este número já está conectado neste projeto.' },
        { status: 409 }
      );
    }

    // Call n8n webhook
    const n8nUrl = process.env.N8N_SETUP_URL;
    if (!n8nUrl) {
      return NextResponse.json(
        { success: false, error: 'URL do webhook não configurada.' },
        { status: 500 }
      );
    }

    const n8nRes = await fetch(n8nUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numero_whatsapp, projeto_id, setor, nome_identificador }),
      signal: AbortSignal.timeout(30000),
    });

    if (!n8nRes.ok) {
      const text = await n8nRes.text();
      console.error('n8n error:', text);
      return NextResponse.json(
        { success: false, error: `Erro no webhook: ${n8nRes.status}` },
        { status: 502 }
      );
    }

    const text = await n8nRes.text();
    if (!text || !text.trim()) {
      return NextResponse.json({ success: false, error: 'n8n não retornou resposta.' }, { status: 502 });
    }
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      console.error('n8n resposta não-JSON:', text);
      return NextResponse.json({ success: false, error: `Resposta inválida do n8n: ${text.slice(0, 200)}` }, { status: 502 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error('Erro em POST /api/numeros/conectar:', err);
    const message = err instanceof Error ? err.message : 'Erro interno';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
