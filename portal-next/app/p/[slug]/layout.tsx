import { query } from '@/lib/db';
import { Projeto } from '@/lib/types';
import Sidebar from '@/components/Sidebar';
import { notFound } from 'next/navigation';

interface Props {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

async function getProjeto(slug: string): Promise<Projeto | null> {
  try {
    const rows = await query<Projeto>(
      `SELECT id, nome, slug, ativo FROM _plataforma.projetos WHERE slug = $1`,
      [slug]
    );
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

async function getPendentesCount(projetoId: string): Promise<number> {
  try {
    const rows = await query<{ total: string }>(
      `SELECT COUNT(*) as total FROM _validacao.fila_validacao
       WHERE projeto_id = $1 AND status IN ('pendente_agente', 'pendente_humano')`,
      [projetoId]
    );
    return parseInt(rows[0]?.total ?? '0');
  } catch {
    return 0;
  }
}

export default async function ProjetoLayout({ children, params }: Props) {
  const { slug } = await params;
  const projeto = await getProjeto(slug);

  if (!projeto) {
    notFound();
  }

  const pendentes = await getPendentesCount(projeto.id);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        slug={slug}
        projetoNome={projeto.nome}
        pendentesValidacao={pendentes}
      />
      <div className="flex-1 md:ml-60">
        {children}
      </div>
    </div>
  );
}
