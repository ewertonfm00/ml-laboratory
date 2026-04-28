import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function toSlug(nome: string): string {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function enviarEmail(email: string, responsavel: string, link: string) {
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM!,
      to: email,
      subject: 'Conecte seu WhatsApp ao ML Laboratory',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Olá, ${responsavel}!</h2>
          <p>Você foi cadastrado como parceiro do <strong>ML Laboratory</strong>.</p>
          <p>Clique no link abaixo e preencha as credenciais da sua Evolution API para ativar a integração:</p>
          <p><a href="${link}" style="background: #7c3aed; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">Configurar Integração</a></p>
          <p style="color: #666; font-size: 12px; margin-top: 24px;">Ou copie e cole este link no navegador: ${link}</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('Erro ao enviar e-mail de onboarding:', err);
  }
}

async function enviarWhatsApp(telefone: string, responsavel: string, link: string) {
  try {
    const evolutionUrl = process.env.EVOLUTION_API_URL;
    const response = await fetch(`${evolutionUrl}/message/sendText/ml-5516988456918`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: 'ml-evo-key-2026',
      },
      body: JSON.stringify({
        number: telefone,
        text: `Olá ${responsavel}! Acesse o link para conectar seu WhatsApp ao ML Laboratory: ${link}`,
      }),
    });
    if (!response.ok) {
      console.error('Erro ao enviar WhatsApp de onboarding:', await response.text());
    }
  } catch (err) {
    console.error('Erro ao enviar WhatsApp de onboarding:', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { nome, responsavel, email, telefone, setor } = await req.json();

    if (!nome || !responsavel || !email || !telefone) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 });
    }

    const slug = toSlug(nome);

    const rows = await query<{ id: string; slug: string; onboarding_token: string }>(
      `INSERT INTO _plataforma.projetos (nome, slug, responsavel, email, telefone, setor, ativo)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING id, slug, onboarding_token`,
      [nome, slug, responsavel, email, telefone, setor ?? null]
    );

    const projeto = rows[0];
    const portalUrl = process.env.PORTAL_URL ?? 'http://localhost:3000';
    const onboardingLink = `${portalUrl}/onboarding/${projeto.onboarding_token}`;

    await Promise.all([
      enviarEmail(email, responsavel, onboardingLink),
      enviarWhatsApp(telefone, responsavel, onboardingLink),
    ]);

    return NextResponse.json({
      success: true,
      projeto_id: projeto.id,
      slug: projeto.slug,
      onboarding_link: onboardingLink,
    });
  } catch (error) {
    console.error('POST /api/admin/parceiros error:', error);
    return NextResponse.json({ error: 'Erro ao criar parceiro' }, { status: 500 });
  }
}
