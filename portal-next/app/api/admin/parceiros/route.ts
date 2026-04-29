import pool from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { requireAdminAuth } from '@/lib/admin-auth';

const SETORES_VALIDOS = [
  'comercial',
  'atendimento',
  'operacional',
  'financeiro',
  'marketing',
  'pessoas',
] as const;
type SetorEnum = (typeof SETORES_VALIDOS)[number];

const SETOR_LABEL: Record<SetorEnum, string> = {
  comercial: 'Comercial',
  atendimento: 'Atendimento',
  operacional: 'Operacional',
  financeiro: 'Financeiro',
  marketing: 'Marketing',
  pessoas: 'Pessoas',
};

function toSlug(nome: string): string {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

type EnvioResultado = { ok: true } | { ok: false; error: string };

async function enviarEmail(email: string, responsavel: string, link: string): Promise<EnvioResultado> {
  try {
    if (!process.env.RESEND_API_KEY) {
      const error = 'RESEND_API_KEY ausente';
      console.error('Erro ao enviar e-mail de onboarding:', error);
      return { ok: false, error };
    }
    if (!process.env.RESEND_FROM) {
      const error = 'RESEND_FROM ausente';
      console.error('Erro ao enviar e-mail de onboarding:', error);
      return { ok: false, error };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM,
      to: email,
      subject: 'Ative sua integração com o ML Laboratory',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Olá, ${responsavel}!</h2>
          <p>Você foi cadastrado como parceiro do <strong>ML Laboratory</strong>.</p>
          <p>Acesse o link abaixo para configurar a integração — você verá o endpoint do ML Laboratory e poderá colar a API Key gerada pelo seu sistema:</p>
          <p><a href="${link}" style="background: #7c3aed; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">Configurar Integração</a></p>
          <p style="color: #666; font-size: 12px; margin-top: 24px;">Ou copie e cole este link no navegador: ${link}</p>
        </div>
      `,
    });

    if (result.error) {
      const error = `${result.error.name ?? 'ResendError'}: ${result.error.message ?? JSON.stringify(result.error)}`;
      console.error('Erro ao enviar e-mail de onboarding:', error);
      return { ok: false, error };
    }

    return { ok: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error('Erro ao enviar e-mail de onboarding:', err);
    return { ok: false, error };
  }
}

async function enviarWhatsApp(telefone: string, responsavel: string, link: string): Promise<EnvioResultado> {
  try {
    const evolutionUrl = process.env.ONBOARDING_EVOLUTION_URL;
    const apiKey = process.env.ONBOARDING_EVOLUTION_API_KEY;
    const instanceName = process.env.ONBOARDING_INSTANCE_NAME;

    if (!evolutionUrl || !apiKey || !instanceName) {
      const error = 'Variáveis de onboarding ausentes (ONBOARDING_EVOLUTION_URL/API_KEY/INSTANCE_NAME)';
      console.error(error);
      return { ok: false, error };
    }

    const response = await fetch(`${evolutionUrl}/message/sendText/${instanceName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: apiKey,
      },
      body: JSON.stringify({
        number: telefone,
        text: `Olá ${responsavel}! Acesse o link para conectar seu WhatsApp ao ML Laboratory: ${link}`,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      const error = `Evolution ${response.status}: ${body}`;
      console.error('Erro ao enviar WhatsApp de onboarding:', error);
      return { ok: false, error };
    }

    return { ok: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error('Erro ao enviar WhatsApp de onboarding:', err);
    return { ok: false, error };
  }
}

export async function GET(req: NextRequest) {
  const auth = requireAdminAuth(req);
  if (auth) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const incluirInativos = searchParams.get('incluirInativos') === 'true';

    const result = await pool.query<{
      id: string;
      nome: string;
      slug: string;
      responsavel: string | null;
      email: string | null;
      telefone: string | null;
      setor: string | null;
      ativo: boolean;
      onboarding_status: string | null;
      created_at: string;
      total_setores: number;
    }>(
      `SELECT
         p.id::text,
         p.nome,
         p.slug,
         p.responsavel,
         p.email,
         p.telefone,
         p.setor,
         p.ativo,
         p.onboarding_status,
         p.created_at,
         (SELECT COUNT(*)::int FROM _plataforma.numeros_projeto n WHERE n.projeto_id = p.id) AS total_setores
       FROM _plataforma.projetos p
       ${incluirInativos ? '' : 'WHERE p.ativo = true'}
       ORDER BY p.created_at DESC`
    );

    return NextResponse.json({ parceiros: result.rows });
  } catch (error) {
    console.error('GET /api/admin/parceiros error:', error);
    return NextResponse.json({ error: 'Erro ao listar parceiros' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAdminAuth(req);
  if (auth) return auth;

  try {
    const body = await req.json();
    const { nome, responsavel, email, telefone } = body;
    const setoresInput: unknown = body.setores;

    if (!nome || !responsavel || !email || !telefone) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 });
    }

    if (!Array.isArray(setoresInput) || setoresInput.length === 0) {
      return NextResponse.json(
        { error: 'Selecione ao menos um setor' },
        { status: 400 }
      );
    }

    const setores = Array.from(new Set(setoresInput.map((s) => String(s)))) as string[];
    const setoresInvalidos = setores.filter(
      (s): s is string => !SETORES_VALIDOS.includes(s as SetorEnum)
    );
    if (setoresInvalidos.length > 0) {
      return NextResponse.json(
        { error: `Setor inválido: ${setoresInvalidos.join(', ')}` },
        { status: 400 }
      );
    }

    const slug = toSlug(nome);
    const setoresCsv = setores.join(',');

    const client = await pool.connect();
    let projeto: { id: string; slug: string; onboarding_token: string };
    try {
      await client.query('BEGIN');

      const projetoRes = await client.query<{ id: string; slug: string; onboarding_token: string }>(
        `INSERT INTO _plataforma.projetos (nome, slug, schema_prefix, responsavel, email, telefone, setor, ativo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true)
         RETURNING id, slug, onboarding_token`,
        [nome, slug, slug, responsavel, email, telefone, setoresCsv]
      );
      projeto = projetoRes.rows[0];

      for (const setor of setores as SetorEnum[]) {
        await client.query(
          `INSERT INTO _plataforma.numeros_projeto
             (projeto_id, nome_identificador, setor, ativo, multi_agente)
           VALUES ($1::uuid, $2, $3::_plataforma.setor_tipo, true, false)`,
          [projeto.id, `${nome} - ${SETOR_LABEL[setor]}`, setor]
        );
      }

      await client.query('COMMIT');
    } catch (txErr) {
      await client.query('ROLLBACK').catch(() => undefined);
      throw txErr;
    } finally {
      client.release();
    }

    const portalUrl = process.env.PORTAL_URL ?? 'http://localhost:3000';
    const onboardingLink = `${portalUrl}/onboarding/${projeto.onboarding_token}`;

    const [emailResult, whatsappResult] = await Promise.all([
      enviarEmail(email, responsavel, onboardingLink),
      enviarWhatsApp(telefone, responsavel, onboardingLink),
    ]);

    return NextResponse.json({
      success: true,
      projeto_id: projeto.id,
      slug: projeto.slug,
      onboarding_link: onboardingLink,
      email_status: emailResult.ok ? 'enviado' : 'falhou',
      email_error: emailResult.ok ? null : emailResult.error,
      whatsapp_status: whatsappResult.ok ? 'enviado' : 'falhou',
      whatsapp_error: whatsappResult.ok ? null : whatsappResult.error,
    });
  } catch (error) {
    console.error('POST /api/admin/parceiros error:', error);
    return NextResponse.json({ error: 'Erro ao criar parceiro' }, { status: 500 });
  }
}
