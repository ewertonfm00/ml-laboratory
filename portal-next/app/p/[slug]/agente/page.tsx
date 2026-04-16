import { query } from '@/lib/db';
import { AgentePerfil, AgentePerformance } from '@/lib/types';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getData() {
  try {
    const [perfis, performance] = await Promise.all([
      query<AgentePerfil>(
        `SELECT id, nome_agente, tipo_disc, perfil_resumo, estilo_comunicacao, updated_at
         FROM _plataforma.agente_perfis
         ORDER BY nome_agente`
      ),
      query<AgentePerformance>(
        `SELECT id, agente_id, metrica, valor, periodo
         FROM _plataforma.agente_performance
         ORDER BY periodo DESC, metrica`
      ),
    ]);
    return { perfis, performance };
  } catch (e) {
    console.error('Erro ao buscar perfis:', e);
    return { perfis: [], performance: [] };
  }
}

const discColors: Record<string, { bg: string; text: string; border: string }> = {
  D: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  I: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  S: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
  C: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
};

export const revalidate = 120;

export default async function AgentePage({ params }: Props) {
  const { slug } = await params;
  const { perfis, performance } = await getData();

  // Group performance by agente_id
  const perfMap = performance.reduce<Record<string, AgentePerformance[]>>((acc, p) => {
    if (!acc[p.agente_id]) acc[p.agente_id] = [];
    acc[p.agente_id].push(p);
    return acc;
  }, {});

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-white">Perfil do Agente</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Perfis DISC e métricas de performance
        </p>
      </div>

      {perfis.length === 0 ? (
        <div className="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-12 text-center">
          <p className="text-5xl mb-4">🧠</p>
          <p className="text-slate-300 font-medium">Nenhum perfil cadastrado</p>
        </div>
      ) : (
        <div className="space-y-4">
          {perfis.map((perfil) => {
            const discChar = perfil.tipo_disc?.charAt(0).toUpperCase() ?? '';
            const discStyle = discColors[discChar] ?? { bg: 'bg-slate-700/30', text: 'text-slate-400', border: 'border-slate-700' };
            const metricas = perfMap[perfil.id] ?? [];

            return (
              <div key={perfil.id} className="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-5">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* DISC badge + name */}
                  <div className="flex items-center gap-3 sm:w-48 flex-shrink-0">
                    {perfil.tipo_disc && (
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border ${discStyle.bg} ${discStyle.text} ${discStyle.border}`}>
                        {perfil.tipo_disc.substring(0, 2)}
                      </div>
                    )}
                    <div>
                      <p className="text-white font-medium">{perfil.nome_agente}</p>
                      {perfil.tipo_disc && (
                        <p className={`text-xs font-medium ${discStyle.text}`}>
                          Perfil {perfil.tipo_disc}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    {perfil.perfil_resumo && (
                      <p className="text-slate-300 text-sm mb-2 leading-relaxed">
                        {perfil.perfil_resumo}
                      </p>
                    )}
                    {perfil.estilo_comunicacao && (
                      <p className="text-slate-500 text-xs">
                        <span className="text-slate-400">Estilo:</span> {perfil.estilo_comunicacao}
                      </p>
                    )}

                    {/* Performance metrics */}
                    {metricas.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {metricas.slice(0, 4).map((m) => (
                          <div key={m.id} className="bg-[#0F0F1A] rounded-lg px-3 py-1.5 text-xs">
                            <span className="text-slate-500">{m.metrica}: </span>
                            <span className="text-white font-medium">
                              {typeof m.valor === 'number' ? m.valor.toFixed(1) : m.valor}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Updated at */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-slate-600 text-xs">
                      {new Date(perfil.updated_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
