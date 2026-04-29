import pool from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const TABELAS_HARD_DELETE = [
  'ml_captura.mensagens_raw',
  'ml_captura.sessoes_conversa',
  '_validacao.correcoes',
  '_validacao.validacoes',
  '_validacao.erros_produto',
  '_validacao.fila_validacao',
  '_validacao.documentos_produto',
  '_plataforma.skill_avaliacoes',
  '_plataforma.skill_analises',
  '_plataforma.agentes_humanos',
  '_plataforma.numeros_projeto',
  '_plataforma.instancias_evolution',
] as const;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  try {
    const { ativo } = await req.json();
    if (typeof ativo !== 'boolean') {
      return NextResponse.json({ error: 'Campo "ativo" deve ser boolean' }, { status: 400 });
    }

    const result = await pool.query<{ id: string; nome: string; ativo: boolean }>(
      `UPDATE _plataforma.projetos
       SET ativo = $2, updated_at = NOW()
       WHERE id = $1::uuid
       RETURNING id::text, nome, ativo`,
      [id, ativo]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Parceiro não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, parceiro: result.rows[0] });
  } catch (error) {
    console.error('PATCH /api/admin/parceiros/[id] error:', error);
    return NextResponse.json({ error: 'Erro ao atualizar parceiro' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  let confirmacao: string | undefined;
  try {
    const body = await req.json();
    confirmacao = body?.confirmacao;
  } catch {
    confirmacao = undefined;
  }

  if (!confirmacao || typeof confirmacao !== 'string') {
    return NextResponse.json(
      { error: 'Confirmação obrigatória — digite o nome exato do projeto' },
      { status: 400 }
    );
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const projetoRes = await client.query<{ nome: string; slug: string }>(
      `SELECT nome, slug FROM _plataforma.projetos WHERE id = $1::uuid FOR UPDATE`,
      [id]
    );
    if (projetoRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'Parceiro não encontrado' }, { status: 404 });
    }
    const projeto = projetoRes.rows[0];

    if (confirmacao !== projeto.nome) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { error: `Confirmação não bate — digite exatamente "${projeto.nome}"` },
        { status: 400 }
      );
    }

    const counts: Record<string, number> = {};
    for (const tabela of TABELAS_HARD_DELETE) {
      const r = await client.query(
        `DELETE FROM ${tabela} WHERE projeto_id = $1::uuid`,
        [id]
      );
      counts[tabela] = r.rowCount ?? 0;
    }

    const auditRes = await client.query(
      `UPDATE _plataforma.audit_log SET projeto_id = NULL WHERE projeto_id = $1::uuid`,
      [id]
    );
    counts['_plataforma.audit_log (set null)'] = auditRes.rowCount ?? 0;

    const projetoDel = await client.query(
      `DELETE FROM _plataforma.projetos WHERE id = $1::uuid`,
      [id]
    );
    counts['_plataforma.projetos'] = projetoDel.rowCount ?? 0;

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      projeto: { id, nome: projeto.nome, slug: projeto.slug },
      registros_excluidos: counts,
    });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    console.error('DELETE /api/admin/parceiros/[id] error:', error);
    const msg = error instanceof Error ? error.message : 'Erro ao excluir parceiro';
    return NextResponse.json({ error: msg }, { status: 500 });
  } finally {
    client.release();
  }
}
