'use client';

import { useState } from 'react';
import { FilaValidacao } from '@/lib/types';

interface Props {
  items: FilaValidacao[];
  slug: string;
}

export default function FilaValidacaoClient({ items: initialItems, slug }: Props) {
  const [items, setItems] = useState(initialItems);
  const [loading, setLoading] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const handleAction = async (id: string, action: 'aprovar' | 'corrigir', correcao?: string) => {
    setLoading(id);
    try {
      const res = await fetch('/api/validacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, correcao }),
      });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        setEditingId(null);
      }
    } catch (err) {
      console.error('Erro ao processar validação:', err);
    } finally {
      setLoading(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-12 text-center">
        <p className="text-5xl mb-4">✅</p>
        <p className="text-slate-300 font-medium">Fila limpa!</p>
        <p className="text-slate-500 text-sm mt-1">Não há itens pendentes de validação</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const confianca = item.confianca_deteccao ?? 0;
        const confiancaColor =
          confianca >= 0.8 ? 'text-green-400' : confianca >= 0.5 ? 'text-yellow-400' : 'text-red-400';
        const isEditing = editingId === item.id;
        const isLoading = loading === item.id;
        const isPendentHumano = item.status === 'pendente_humano';

        return (
          <div
            key={item.id}
            className={`bg-[#1A1A2E] border rounded-xl p-4 sm:p-5 ${
              isPendentHumano ? 'border-yellow-500/30' : 'border-[#2A2A3E]'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
              <div className="flex-1 min-w-0">
                {isPendentHumano && (
                  <span className="inline-block text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded mb-2">
                    Validação humana necessária
                  </span>
                )}
                {item.produto_servico_detectado && (
                  <div className="mb-2">
                    <span className="text-xs text-slate-500 uppercase tracking-wide">Produto/Serviço</span>
                    <p className="text-white font-medium mt-0.5">{item.produto_servico_detectado}</p>
                  </div>
                )}
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wide">Resposta</span>
                  <p className="text-slate-300 text-sm mt-0.5 leading-relaxed line-clamp-3">
                    {item.resposta_texto}
                  </p>
                </div>
                {item.contexto_conversa && (
                  <details className="mt-2">
                    <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-400">
                      Ver contexto da conversa
                    </summary>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed whitespace-pre-line">
                      {item.contexto_conversa}
                    </p>
                  </details>
                )}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {confianca > 0 && (
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Confiança</p>
                    <p className={`font-bold text-sm ${confiancaColor}`}>
                      {(confianca * 100).toFixed(0)}%
                    </p>
                  </div>
                )}
                <span className="text-xs text-slate-600">
                  {new Date(item.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>
            </div>

            {/* Correction input */}
            {isEditing && (
              <div className="mb-3">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  placeholder="Digite a resposta corrigida…"
                  rows={3}
                  className="w-full bg-[#0F0F1A] border border-[#2A2A3E] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 resize-none placeholder:text-slate-600"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleAction(item.id, 'aprovar')}
                disabled={isLoading}
                className="flex-1 sm:flex-none bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isLoading ? '…' : '✅ Aprovar'}
              </button>

              {!isEditing ? (
                <button
                  onClick={() => {
                    setEditingId(item.id);
                    setEditText(item.resposta_texto);
                  }}
                  disabled={isLoading}
                  className="flex-1 sm:flex-none bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 border border-yellow-600/30 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  ✏️ Corrigir
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleAction(item.id, 'corrigir', editText)}
                    disabled={isLoading || !editText.trim()}
                    className="flex-1 sm:flex-none bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    Salvar Correção
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-slate-400 hover:text-white text-sm px-2"
                  >
                    Cancelar
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
