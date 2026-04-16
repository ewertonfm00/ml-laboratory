import { query } from '@/lib/db';
import { Projeto, NumerosProjeto } from '@/lib/types';
import Link from 'next/link';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getData(slug: string) {
  const projetos = await query<Projeto>(
    `SELECT id, nome, slug FROM _plataforma.projetos WHERE slug = $1`,
    [slug]
  );
  const projeto = projetos[0];
  if (!projeto) return { projeto: null, numeros: [] };

  const numeros = await query<NumerosProjeto>(
    `SELECT id, projeto_id, numero_whatsapp, nome_identificador, setor, status, total_mensagens, ultima_mensagem_em
     FROM _plataforma.numeros_projeto
     WHERE projeto_id = $1
     ORDER BY nome_identificador`,
    [projeto.id]
  );
  return { projeto, numeros };
}

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  conectado: { label: 'Conectado', color: 'text-green-400', dot: 'bg-green-400' },
  desconectado: { label: 'Desconectado', color: 'text-red-400', dot: 'bg-red-400' },
  aguardando_qr: { label: 'Aguardando QR', color: 'text-yellow-400', dot: 'bg-yellow-400 animate-pulse' },
  erro: { label: 'Erro', color: 'text-red-500', dot: 'bg-red-500' },
};

const setorLabel: Record<string, string> = {
  comercial: 'Comercial',
  atendimento: 'Atendimento',
  operacional: 'Operacional',
  financeiro: 'Financeiro',
  marketing: 'Marketing',
  pessoas: 'Pessoas',
};

export const revalidate = 30;

export default async function NumerosPage({ params }: Props) {
  const { slug } = await params;
  const { projeto, numeros } = await getData(slug);

  if (!projeto) return <div className="p-8 text-slate-400">Projeto não encontrado.</div>;

  const conectados = numeros.filter((n) => n.status === 'conectado').length;

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl font-bold text-white">Números WhatsApp</h1>
          <p className="text-slate-400 text-sm mt-0.5">{projeto.nome}</p>
        </div>
        <Link
          href="/numeros/conectar"
          className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          ➕ Conectar Número
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: numeros.length, color: 'text-white' },
          { label: 'Conectados', value: conectados, color: 'text-green-400' },
          { label: 'Desconectados', value: numeros.filter((n) => n.status === 'desconectado').length, color: 'text-red-400' },
          { label: 'Aguardando QR', value: numeros.filter((n) => n.status === 'aguardando_qr').length, color: 'text-yellow-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-4">
            <p className="text-slate-500 text-xs mb-1">{stat.label}</p>
            <p className={`font-bold text-2xl ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {numeros.length === 0 ? (
        <div className="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-12 text-center">
          <p className="text-5xl mb-4">📱</p>
          <p className="text-slate-300 font-medium">Nenhum número conectado</p>
          <p className="text-slate-500 text-sm mt-1 mb-6">
            Conecte o primeiro número WhatsApp para este projeto
          </p>
          <Link
            href="/numeros/conectar"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            ➕ Conectar Agora
          </Link>
        </div>
      ) : (
        <div className="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] overflow-hidden">
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2A2A3E]">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Nome</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Número</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Setor</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Status</th>
                  <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Mensagens</th>
                  <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wide px-4 py-3">Última Msg</th>
                </tr>
              </thead>
              <tbody>
                {numeros.map((n, i) => {
                  const st = statusConfig[n.status] ?? { label: n.status, color: 'text-slate-400', dot: 'bg-slate-400' };
                  return (
                    <tr key={n.id} className={`border-b border-[#2A2A3E] last:border-0 ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}>
                      <td className="px-4 py-3 text-white text-sm font-medium">{n.nome_identificador}</td>
                      <td className="px-4 py-3 text-slate-300 text-sm font-mono">{n.numero_whatsapp}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-slate-700/50 text-slate-300 px-2 py-0.5 rounded">
                          {setorLabel[n.setor] ?? n.setor}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1.5 text-sm ${st.color}`}>
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${st.dot}`} />
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-400 text-sm">
                        {(n.total_mensagens ?? 0).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500 text-xs">
                        {n.ultima_mensagem_em
                          ? new Date(n.ultima_mensagem_em).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
                          : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-[#2A2A3E]">
            {numeros.map((n) => {
              const st = statusConfig[n.status] ?? { label: n.status, color: 'text-slate-400', dot: 'bg-slate-400' };
              return (
                <div key={n.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-white font-medium">{n.nome_identificador}</p>
                    <span className={`flex items-center gap-1 text-xs ${st.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                      {st.label}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm font-mono mb-1">{n.numero_whatsapp}</p>
                  <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
                    <span className="bg-slate-700/50 text-slate-300 px-2 py-0.5 rounded">
                      {setorLabel[n.setor] ?? n.setor}
                    </span>
                    <span>{(n.total_mensagens ?? 0).toLocaleString('pt-BR')} msgs</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
