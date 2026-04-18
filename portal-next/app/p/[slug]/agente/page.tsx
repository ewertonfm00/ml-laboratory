import { query } from '@/lib/db';
import { AgentePerfil, AgentePerformance } from '@/lib/types';

interface Props {
  params: Promise<{ slug: string }>;
}

interface PainelAgente {
  agente_nome: string;
  total_conversas: string;
  media_comercial: string | null;
  media_tecnica: string | null;
  total_sinalizacoes: string;
  ultima_conversa: string | null;
}

async function getData(slug: string) {
  // Buscar projeto_id pelo slug para o painel de performance
  let projetoId: string | null = null;
  try {
    const projRows = await query<{ id: string }>(
      `SELECT id FROM _plataforma.projetos WHERE slug = $1 LIMIT 1`,
      [slug]
    );
    projetoId = projRows[0]?.id ?? null;
  } catch {
    // ignora
  }

  const [perfisResult, performanceResult] = await Promise.allSettled([
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

  const perfis = perfisResult.status === 'fulfilled' ? perfisResult.value : [];
  const performance = performanceResult.status === 'fulfilled' ? performanceResult.value : [];

  // Painel de performance via analise_conversa
  let painelAgentes: PainelAgente[] = [];
  if (projetoId) {
    try {
      painelAgentes = await query<PainelAgente>(
        `SELECT
          agente_nome,
          COUNT(*) as total_conversas,
          ROUND(AVG(nota_comercial)::numeric, 1) as media_comercial,
          ROUND(AVG(nota_tecnica)::numeric, 1) as media_tecnica,
          SUM(CASE WHEN tem_sinalizacao THEN 1 ELSE 0 END) as total_sinalizacoes,
          MAX(data_conversa) as ultima_conversa
        FROM ml_analise.analise_conversa
        WHERE projeto_id = $1
        GROUP BY agente_nome
        ORDER BY agente_nome`,
        [projetoId]
      );
    } catch {
      painelAgentes = [];
    }
  }

  return { perfis, performance, painelAgentes };
}

const discColors: Record<string, { bg: string; text: string; border: string }> = {
  D: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  I: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  S: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
  C: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
};

export const revalidate = 120;

function notaCircle(nota: string | null, label: string) {
  if (!nota) return null;
  const n = parseFloat(nota);
  if (isNaN(n)) return null;
  const color = n >= 7 ? 'text-green-400 border-green-500/40' : n >= 5 ? 'text-yellow-400 border-yellow-500/40' : 'text-red-400 border-red-500/40';
  return (
    <div className="text-center">
      <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-sm ${color}`}>
        {n.toFixed(1)}
      </div>
      <p className="text-slate-500 text-xs mt-1">{label}</p>
    </div>
  );
}

export default async function AgentePage({ params }: Props) {
  const { slug } = await params;
  const { perfis, performance, painelAgentes } = await getData(slug);

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

      {/* Painel de Performance */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-white mb-4">Painel de Performance</h2>

        {painelAgentes.length === 0 ? (
          <div className="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-8 text-center">
            <p className="text-slate-400 text-sm">
              Análises disponíveis após as primeiras conversas serem capturadas e processadas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {painelAgentes.map((ag) => {
              const sinalizacoes = parseInt(ag.total_sinalizacoes ?? '0', 10);
              const totalConv = parseInt(ag.total_conversas ?? '0', 10);
              return (
                <div key={ag.agente_nome} className="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-5">
                  <p className="text-white font-semibold mb-4 truncate">{ag.agente_nome}</p>

                  <div className="flex items-center justify-center gap-6 mb-4">
                    {notaCircle(ag.media_comercial, 'Comercial')}
                    {notaCircle(ag.media_tecnica, 'Técnica')}
                  </div>

                  <div className="space-y-1 text-xs text-slate-500">
                    <div className="flex justify-between">
                      <span>Total conversas</span>
                      <span className="text-slate-300">{totalConv}</span>
                    </div>
                    {sinalizacoes > 0 && (
                      <div className="flex justify-between">
                        <span>Sinalizações pendentes</span>
                        <span className="text-red-400">{sinalizacoes}</span>
                      </div>
                    )}
                    {ag.ultima_conversa && (
                      <div className="flex justify-between">
                        <span>Última conversa</span>
                        <span className="text-slate-400">
                          {new Date(ag.ultima_conversa).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
