import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { token, evolution_url, api_key, instance_name } = await req.json();

    if (!token || !evolution_url || !api_key || !instance_name) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 });
    }

    const projRows = await query<{ id: string; telefone: string; onboarding_status: string }>(
      `SELECT id, telefone, onboarding_status FROM _plataforma.projetos WHERE onboarding_token = $1`,
      [token]
    );

    if (!projRows[0]) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 404 });
    }

    const projeto = projRows[0];

    const webhookUrl = 'https://n8n-production-47d0.up.railway.app/webhook/ml/webhook/whatsapp';

    const webhookRes = await fetch(`${evolution_url}/webhook/set/${instance_name}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: api_key,
      },
      body: JSON.stringify({
        url: webhookUrl,
        webhook_by_events: false,
        webhook_base64: false,
        events: ['MESSAGES_UPSERT', 'MESSAGES_UPDATE', 'CONNECTION_UPDATE'],
      }),
    });

    if (!webhookRes.ok) {
      const errText = await webhookRes.text();
      console.error('Erro ao configurar webhook na Evolution do parceiro:', errText);
      return NextResponse.json({ error: 'Falha ao configurar webhook na Evolution' }, { status: 502 });
    }

    const instanciaRows = await query<{ id: string }>(
      `INSERT INTO _plataforma.instancias_evolution
         (projeto_id, instance_name, api_url, api_key_ref, webhook_path, status)
       VALUES ($1, $2, $3, $4, $5, 'ativo')
       RETURNING id`,
      [projeto.id, instance_name, evolution_url, api_key, '/webhook/ml/webhook/whatsapp']
    );

    await query(
      `INSERT INTO _plataforma.numeros_projeto
         (projeto_id, numero_whatsapp, nome_identificador, setor, status, tipo)
       VALUES ($1, $2, $3, 'Geral', 'ativo', 'multi')
       ON CONFLICT DO NOTHING`,
      [projeto.id, projeto.telefone, instance_name]
    );

    await query(
      `UPDATE _plataforma.projetos SET onboarding_status = 'conectado' WHERE id = $1`,
      [projeto.id]
    );

    return NextResponse.json({ success: true, instancia_id: instanciaRows[0].id });
  } catch (error) {
    console.error('POST /api/onboarding/conectar error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
