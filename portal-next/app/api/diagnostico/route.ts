import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  const results: Record<string, unknown> = {};

  try {
    results.projetos = await query(
      `SELECT id, slug, nome FROM _plataforma.projetos LIMIT 10`
    );
  } catch (e) { results.projetos_erro = String(e); }

  try {
    results.sessoes_colunas = await query(
      `SELECT column_name, data_type
       FROM information_schema.columns
       WHERE table_schema = 'ml_captura' AND table_name = 'sessoes_conversa'
       ORDER BY ordinal_position`
    );
  } catch (e) { results.sessoes_colunas_erro = String(e); }

  try {
    results.contagens = await query(
      `SELECT
        (SELECT COUNT(*) FROM ml_captura.mensagens_raw)      AS mensagens,
        (SELECT COUNT(*) FROM ml_captura.sessoes_conversa)   AS sessoes,
        (SELECT COUNT(*) FROM ml_analise.analise_conversa)   AS analises`
    );
  } catch (e) { results.contagens_erro = String(e); }

  try {
    results.sessoes_amostra = await query(
      `SELECT * FROM ml_captura.sessoes_conversa LIMIT 5`
    );
  } catch (e) { results.sessoes_amostra_erro = String(e); }

  try {
    results.mensagens_amostra = await query(
      `SELECT id, session_id, remote_jid, projeto_id, created_at
       FROM ml_captura.mensagens_raw LIMIT 5`
    );
  } catch (e) { results.mensagens_amostra_erro = String(e); }

  return NextResponse.json(results, { status: 200 });
}
