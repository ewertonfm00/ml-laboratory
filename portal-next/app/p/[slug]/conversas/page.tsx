import { query } from '@/lib/db';

interface Props {
  params: Promise<{ slug: string }>;
}

interface ConversaRow {
  sessao_id: string;
  numero_whatsapp: string | null;
  agente_nome: string | null;
  total_mensagens: string;
  inicio: string;
  fim: string;
  nota_comercial: string | null;
  nota_tecnica: string | null;
  disc_identificado: string | null;
  tem_sinalizacao: boolean | null;
  revisado: boolean | null;
  total_sinalizacoes: string;
}

async function getConversas(slug: string): Promise<ConversaRow[]> {
  try {
    // Buscar projeto_id pelo slug
    const projRows = await query<{ id: string }>(
      `SELECT id FROM _plataforma.projetos WHERE slug = $1 LIMIT 1`,
      [slug]
    );
    const projetoId = projRows[0]?.id;
    if (!projetoId) return [];

    // Fonte primária: sessoes_conversa + analise_conversa
    let rows: ConversaRow[] = [];
    try {
      rows = await query<ConversaRow>(
        `SELECT
          sc.id::text                      AS sessao_id,
          sc.remote_jid                    AS numero_whatsapp,
          ah.nome                          AS agente_nome,
          sc.total_mensagens::text         AS total_mensagens,
          sc.iniciada_em                   AS inicio,
          sc.updated_at                    AS fim,
          ac.nota_comercial,
          ac.nota_tecnica,
          ac.disc_identificado,
          ac.tem_sinalizacao,
          ac.revisado,
          COUNT(s.id)                      AS total_sinalizacoes
        FROM ml_captura.sessoes_conversa sc
        LEFT JOIN _plataforma.agentes_humanos ah ON ah.id = sc.agente_humano_id
        LEFT JOIN ml_analise.analise_conversa ac
          ON ac.projeto_id = sc.projeto_id AND ac.numero_whatsapp = sc.remote_jid
        LEFT JOIN ml_analise.sinalizacoes s ON s.analise_id = ac.id AND s.resolvido = false
        WHERE sc.projeto_id = $1
        GROUP BY sc.id, ah.nome, ac.nota_comercial, ac.nota_tecnica,
                 ac.disc_identificado, ac.tem_sinalizacao, ac.revisado
        ORDER BY sc.updated_at DESC
        LIMIT 50`,
        [projetoId]
      );
    } catch { /* ignora, tenta fallback */ }

    // Fallback: mensagens_raw quando sessoes_conversa está vazio
    if (rows.length === 0) {
      try {
        rows = await query<ConversaRow>(
          `SELECT
            mr.remote_jid              AS sessao_id,
            mr.remote_jid              AS numero_whatsapp,
            NULL::text                 AS agente_nome,
            COUNT(*)::text             AS total_mensagens,
            MIN(mr.created_at)         AS inicio,
            MAX(mr.created_at)         AS fim,
            NULL::numeric              AS nota_comercial,
            NULL::numeric              AS nota_tecnica,
            NULL::text                 AS disc_identificado,
            false                      AS tem_sinalizacao,
            false                      AS revisado,
            0::bigint                  AS total_sinalizacoes
          FROM ml_captura.mensagens_raw mr
          WHERE mr.projeto_id = $1
          GROUP BY mr.remote_jid
          ORDER BY MAX(mr.created_at) DESC
          LIMIT 50`,
          [projetoId]
        );
      } catch { /* retorna vazio */ }
    }
    return rows;
  } catch {
    return [];
  }
}

function notaBadge(nota: string | null): { bg: string; text: string; label: string } | null {
  if (!nota) return null;
  const n = parseFloat(nota);
  if (isNaN(n)) return null;
  if (n >= 7) return { bg: 'bg-green-500/20', text: 'text-green-400', label: n.toFixed(1) };
  if (n >= 5) return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: n.toFixed(1) };
  return { bg: 'bg-red-500/20', text: 'text-red-400', label: n.toFixed(1) };
}

function formatDuration(inicio: string, fim: string): string {
  const diff = new Date(fim).getTime() - new Date(inicio).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '< 1 min';
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h${m > 0 ? ` ${m}min` : ''}`;
}

export const revalidate = 60;

export default async function ConversasPage({ params }: Props) {
  const { slug } = await params;
  const conversas = await getConversas(slug);

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-white">Conversas</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          {conversas.length > 0
            ? `${conversas.length} conversa${conversas.length !== 1 ? 's' : ''} capturada${conversas.length !== 1 ? 's' : ''}`
            : 'Nenhuma conversa capturada'}
        </p>
      </div>

      {conversas.length === 0 ? (
        <div className="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-12 text-center">
          <p className="text-4xl mb-4">💬</p>
          <p className="text-slate-300 font-medium">Nenhuma conversa capturada ainda</p>
          <p className="text-slate-500 text-sm mt-1">
            Conecte um número WhatsApp para começar a capturar interações.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {conversas.map(conv => {
            const comercial = notaBadge(conv.nota_comercial);
            const tecnica = notaBadge(conv.nota_tecnica);
            const totalSin = parseInt(conv.total_sinalizacoes ?? '0', 10);
            const temAnalise = conv.nota_comercial !== null || conv.nota_tecnica !== null || conv.disc_identificado !== null;

            return (
              <div
                key={conv.sessao_id}
                className="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-5 hover:border-violet-500/30 transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-white font-medium">
                      {conv.numero_whatsapp ?? 'Número desconhecido'}
                    </p>
                    {conv.agente_nome && (
                      <p className="text-slate-500 text-xs mt-0.5">Agente: {conv.agente_nome}</p>
                    )}
                  </div>
                  {/* Status badges */}
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {conv.revisado && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                        Revisado
                      </span>
                    )}
                    {totalSin > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                        {totalSin} sinaliza{totalSin !== 1 ? 'ções' : 'ção'}
                      </span>
                    )}
                    {!temAnalise && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-400">
                        Aguardando análise
                      </span>
                    )}
                  </div>
                </div>

                {/* Meta info */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mb-3">
                  <span>
                    {new Date(conv.inicio).toLocaleDateString('pt-BR')} {new Date(conv.inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span>Duração: {formatDuration(conv.inicio, conv.fim)}</span>
                  <span>{conv.total_mensagens} mensagen{parseInt(conv.total_mensagens, 10) !== 1 ? 's' : ''}</span>
                </div>

                {/* Analysis badges */}
                {temAnalise && (
                  <div className="flex flex-wrap gap-2">
                    {comercial && (
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${comercial.bg} ${comercial.text}`}>
                        <span>Comercial</span>
                        <span className="font-bold">{comercial.label}</span>
                      </div>
                    )}
                    {tecnica && (
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${tecnica.bg} ${tecnica.text}`}>
                        <span>Técnica</span>
                        <span className="font-bold">{tecnica.label}</span>
                      </div>
                    )}
                    {conv.disc_identificado && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-violet-500/20 text-violet-400">
                        <span>DISC</span>
                        <span className="font-bold">{conv.disc_identificado}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
