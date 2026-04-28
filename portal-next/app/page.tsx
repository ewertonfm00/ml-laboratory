import { query } from '@/lib/db';
import { Projeto } from '@/lib/types';
import Link from 'next/link';

async function getProjetos(): Promise<Projeto[]> {
  try {
    return await query<Projeto>(
      `SELECT id, nome, slug, ativo, created_at FROM _plataforma.projetos WHERE ativo = true ORDER BY nome`
    );
  } catch (e) {
    console.error('Erro ao buscar projetos:', e);
    return [];
  }
}

async function getProjetoStats(projetoId: string) {
  try {
    const [total, conectados] = await Promise.all([
      query<{ total: string }>(
        `SELECT COUNT(*) as total FROM _plataforma.numeros_projeto WHERE projeto_id = $1`,
        [projetoId]
      ),
      query<{ total: string }>(
        `SELECT COUNT(*) as total FROM _plataforma.numeros_projeto WHERE projeto_id = $1 AND status = 'ativo'`,
        [projetoId]
      ),
    ]);
    return {
      totalNumeros: parseInt(total[0]?.total ?? '0'),
      totalConectados: parseInt(conectados[0]?.total ?? '0'),
    };
  } catch {
    return { totalNumeros: 0, totalConectados: 0 };
  }
}

export const revalidate = 60;

export default async function DashboardPage() {
  const projetos = await getProjetos();

  const statsArray = await Promise.all(
    projetos.map(async (p) => ({
      id: p.id,
      ...(await getProjetoStats(p.id)),
    }))
  );
  const statsMap = Object.fromEntries(statsArray.map((s) => [s.id, s]));

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">ML Laboratory</h1>
        <p className="text-slate-400 mt-1">Painel de controle</p>
      </div>

      {/* Quick actions */}
      <div className="mb-6 flex flex-wrap gap-3">
        <Link
          href="/numeros/conectar"
          className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          ➕ Conectar Número WhatsApp
        </Link>
        <Link
          href="/admin/parceiros/novo"
          className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          ➕ Novo Parceiro
        </Link>
      </div>

      {/* Projects grid */}
      {projetos.length === 0 ? (
        <div className="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-12 text-center">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-slate-300 font-medium">Nenhum projeto encontrado</p>
          <p className="text-slate-500 text-sm mt-1">
            Verifique a conexão com o banco de dados
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projetos.map((projeto) => {
            const s = statsMap[projeto.id] ?? { totalNumeros: 0, totalConectados: 0 };
            return (
              <Link
                key={projeto.id}
                href={`/p/${projeto.slug}/numeros`}
                className="bg-[#1A1A2E] hover:bg-[#1E1E35] border border-[#2A2A3E] hover:border-violet-500/40 rounded-xl p-5 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-violet-600/20 flex items-center justify-center text-violet-400 font-bold text-sm">
                    {projeto.nome.substring(0, 2).toUpperCase()}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    projeto.ativo
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-slate-500/20 text-slate-400'
                  }`}>
                    {projeto.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                <h3 className="text-white font-semibold mb-1 group-hover:text-violet-300 transition-colors">
                  {projeto.nome}
                </h3>
                <p className="text-slate-500 text-xs mb-4">/{projeto.slug}</p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#0F0F1A] rounded-lg p-3">
                    <p className="text-slate-500 text-xs mb-1">Números</p>
                    <p className="text-white font-bold text-lg">{s.totalNumeros}</p>
                  </div>
                  <div className="bg-[#0F0F1A] rounded-lg p-3">
                    <p className="text-slate-500 text-xs mb-1">Conectados</p>
                    <p className="text-green-400 font-bold text-lg">{s.totalConectados}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
