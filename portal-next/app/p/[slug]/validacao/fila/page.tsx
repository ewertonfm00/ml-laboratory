import { query } from '@/lib/db';
import { FilaValidacao } from '@/lib/types';
import FilaValidacaoClient from './FilaValidacaoClient';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getFila(slug: string): Promise<FilaValidacao[]> {
  try {
    return await query<FilaValidacao>(
      `SELECT fv.id, fv.resposta_texto, fv.contexto_conversa,
              fv.produto_servico_detectado, fv.confianca_deteccao,
              fv.status, fv.created_at
       FROM _validacao.fila_validacao fv
       JOIN _plataforma.projetos p ON p.id = fv.projeto_id
       WHERE p.slug = $1
         AND fv.status IN ('pendente_agente', 'pendente_humano')
       ORDER BY fv.created_at ASC
       LIMIT 50`,
      [slug]
    );
  } catch (e) {
    console.error('Erro ao buscar fila:', e);
    return [];
  }
}

export const revalidate = 0;

export default async function FilaPage({ params }: Props) {
  const { slug } = await params;
  const fila = await getFila(slug);

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-white">Fila de Validação</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          {fila.length} item{fila.length !== 1 ? 's' : ''} pendente{fila.length !== 1 ? 's' : ''}
        </p>
      </div>
      <FilaValidacaoClient items={fila} slug={slug} />
    </div>
  );
}
