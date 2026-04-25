import Link from 'next/link';
import { query } from '@/lib/db';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string; sessao_id: string }>;
}

interface Sessao {
  remote_jid: string;
  contato_nome: string | null;
  agente_nome: string | null;
  total_mensagens: string;
  iniciada_em: string;
  updated_at: string;
}

interface Mensagem {
  id: string;
  tipo: string;
  conteudo_raw: string | null;
  audio_url: string | null;
  duracao_audio: string | null;
  direction: string;
  respondent_type: string;
  respondent_name: string | null;
  created_at: string;
}

async function getSessao(sessaoId: string): Promise<Sessao | null> {
  const rows = await query<Sessao>(
    `SELECT
      sc.remote_jid,
      sc.contato_nome,
      ah.nome AS agente_nome,
      sc.total_mensagens::text,
      sc.iniciada_em,
      sc.updated_at
    FROM ml_captura.sessoes_conversa sc
    LEFT JOIN _plataforma.agentes_humanos ah ON ah.id = sc.agente_humano_id
    WHERE sc.id = $1
    LIMIT 1`,
    [sessaoId]
  );
  return rows[0] ?? null;
}

async function getMensagens(sessaoId: string): Promise<Mensagem[]> {
  // Buscar remote_jid e projeto_id da sessão para usar como chave nas mensagens
  const sessRows = await query<{ remote_jid: string; projeto_id: string }>(
    `SELECT remote_jid, projeto_id FROM ml_captura.sessoes_conversa WHERE id = $1 LIMIT 1`,
    [sessaoId]
  );
  if (!sessRows[0]) return [];

  const { remote_jid, projeto_id } = sessRows[0];

  return query<Mensagem>(
    `SELECT
      id::text,
      tipo,
      conteudo_raw,
      audio_url,
      duracao_audio::text,
      COALESCE(direction, 'incoming') AS direction,
      COALESCE(respondent_type, 'unknown') AS respondent_type,
      respondent_name,
      created_at
    FROM ml_captura.mensagens_raw
    WHERE remote_jid = $1 AND projeto_id = $2
    ORDER BY created_at ASC
    LIMIT 500`,
    [remote_jid, projeto_id]
  );
}

function formatTime(dt: string): string {
  return new Date(dt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dt: string): string {
  return new Date(dt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export const dynamic = 'force-dynamic';

export default async function ConversaDetalhePage({ params }: Props) {
  const { slug, sessao_id } = await params;
  const [sessao, mensagens] = await Promise.all([
    getSessao(sessao_id),
    getMensagens(sessao_id),
  ]);

  if (!sessao) notFound();

  const contato = sessao.contato_nome ?? sessao.remote_jid.replace('@s.whatsapp.net', '');

  // Agrupar mensagens por dia
  const grupos: { data: string; itens: Mensagem[] }[] = [];
  for (const m of mensagens) {
    const dia = formatDate(m.created_at);
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.data === dia) {
      ultimo.itens.push(m);
    } else {
      grupos.push({ data: dia, itens: [m] });
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[#2A2A3E] bg-[#0F0F23]">
        <Link href={`/p/${slug}/conversas`} className="text-slate-400 hover:text-white transition-colors">
          ← Voltar
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold truncate">{contato}</p>
          <p className="text-slate-500 text-xs">
            {sessao.agente_nome ? `Agente: ${sessao.agente_nome} · ` : ''}
            {sessao.total_mensagens} mensagens
          </p>
        </div>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {mensagens.length === 0 ? (
          <div className="text-center text-slate-500 mt-12">
            Nenhuma mensagem encontrada para esta conversa.
          </div>
        ) : (
          grupos.map(grupo => (
            <div key={grupo.data}>
              {/* Separador de dia */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-[#2A2A3E]" />
                <span className="text-xs text-slate-500 whitespace-nowrap">{grupo.data}</span>
                <div className="flex-1 h-px bg-[#2A2A3E]" />
              </div>

              <div className="space-y-2">
                {grupo.itens.map(msg => {
                  const isOutgoing = msg.direction === 'outgoing';
                  const isAudio = msg.tipo === 'audio';
                  const conteudo = msg.conteudo_raw
                    ? (typeof msg.conteudo_raw === 'string'
                        ? msg.conteudo_raw
                        : JSON.stringify(msg.conteudo_raw))
                    : null;

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                          isOutgoing
                            ? 'bg-violet-600/80 text-white rounded-br-sm'
                            : 'bg-[#1A1A2E] border border-[#2A2A3E] text-slate-200 rounded-bl-sm'
                        }`}
                      >
                        {/* Remetente (quando há nome) */}
                        {msg.respondent_name && !isOutgoing && (
                          <p className="text-xs text-violet-400 font-medium mb-1">{msg.respondent_name}</p>
                        )}

                        {/* Conteúdo */}
                        {isAudio ? (
                          <div className="flex items-center gap-2 text-sm">
                            <span>🎤</span>
                            <span className="text-slate-400">
                              Áudio{msg.duracao_audio ? ` · ${msg.duracao_audio}s` : ''}
                            </span>
                          </div>
                        ) : conteudo ? (
                          <p className="text-sm whitespace-pre-wrap break-words">{conteudo}</p>
                        ) : (
                          <p className="text-sm text-slate-500 italic">
                            {msg.tipo === 'image' ? '📷 Imagem' : msg.tipo === 'document' ? '📄 Documento' : 'Mensagem sem texto'}
                          </p>
                        )}

                        {/* Horário */}
                        <p className={`text-xs mt-1 ${isOutgoing ? 'text-violet-200/70' : 'text-slate-500'} text-right`}>
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
