'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Parceiro = {
  id: string;
  nome: string;
  slug: string;
  responsavel: string | null;
  email: string | null;
  telefone: string | null;
  setor: string | null;
  ativo: boolean;
  onboarding_status: string | null;
  created_at: string;
  total_setores: number;
};

export default function ListarParceiros() {
  const [parceiros, setParceiros] = useState<Parceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [incluirInativos, setIncluirInativos] = useState(false);
  const [exclusaoAlvo, setExclusaoAlvo] = useState<Parceiro | null>(null);
  const [textoConfirmacao, setTextoConfirmacao] = useState('');
  const [executando, setExecutando] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ tipo: 'ok' | 'erro'; msg: string } | null>(null);

  const carregar = async () => {
    setLoading(true);
    setErro('');
    try {
      const res = await fetch(
        `/api/admin/parceiros${incluirInativos ? '?incluirInativos=true' : ''}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erro ao listar');
      setParceiros(data.parceiros ?? []);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao listar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incluirInativos]);

  const toggleAtivo = async (p: Parceiro) => {
    setExecutando(p.id);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/parceiros/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: !p.ativo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erro');
      setFeedback({
        tipo: 'ok',
        msg: `${p.nome} ${!p.ativo ? 'reativado' : 'desativado'}`,
      });
      await carregar();
    } catch (e) {
      setFeedback({ tipo: 'erro', msg: e instanceof Error ? e.message : 'Erro' });
    } finally {
      setExecutando(null);
    }
  };

  const confirmarExclusao = async () => {
    if (!exclusaoAlvo) return;
    setExecutando(exclusaoAlvo.id);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/parceiros/${exclusaoAlvo.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmacao: textoConfirmacao }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erro');
      const total = Object.values(data.registros_excluidos ?? {}).reduce(
        (acc: number, n) => acc + (typeof n === 'number' ? n : 0),
        0
      );
      setFeedback({
        tipo: 'ok',
        msg: `${exclusaoAlvo.nome} excluído (${total} registros)`,
      });
      setExclusaoAlvo(null);
      setTextoConfirmacao('');
      await carregar();
    } catch (e) {
      setFeedback({ tipo: 'erro', msg: e instanceof Error ? e.message : 'Erro' });
    } finally {
      setExecutando(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Parceiros</h1>
            <p className="text-slate-400 text-sm mt-1">
              Lista de projetos cadastrados — desativar ou excluir
            </p>
          </div>
          <Link
            href="/admin/parceiros/novo"
            className="bg-violet-600 hover:bg-violet-500 text-white text-sm px-4 py-2 rounded-lg"
          >
            + Novo parceiro
          </Link>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={incluirInativos}
              onChange={(e) => setIncluirInativos(e.target.checked)}
              className="accent-violet-500"
            />
            Mostrar inativos
          </label>
        </div>

        {feedback && (
          <div
            className={`mb-4 px-4 py-2 rounded-lg text-sm ${
              feedback.tipo === 'ok'
                ? 'bg-emerald-900/40 border border-emerald-700 text-emerald-200'
                : 'bg-rose-900/40 border border-rose-700 text-rose-200'
            }`}
          >
            {feedback.msg}
          </div>
        )}

        {erro && (
          <div className="mb-4 px-4 py-2 rounded-lg bg-rose-900/40 border border-rose-700 text-rose-200 text-sm">
            {erro}
          </div>
        )}

        {loading ? (
          <div className="text-slate-400 text-sm">Carregando...</div>
        ) : parceiros.length === 0 ? (
          <div className="text-slate-400 text-sm bg-[#1A1A2E] border border-[#2A2A3E] rounded-lg p-8 text-center">
            Nenhum parceiro {incluirInativos ? 'cadastrado' : 'ativo'}.
          </div>
        ) : (
          <div className="bg-[#1A1A2E] border border-[#2A2A3E] rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#0F0F1A] text-slate-400 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3">Nome</th>
                  <th className="text-left px-4 py-3">Slug</th>
                  <th className="text-left px-4 py-3">Responsável</th>
                  <th className="text-left px-4 py-3">Setores</th>
                  <th className="text-left px-4 py-3">Onboarding</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {parceiros.map((p) => (
                  <tr key={p.id} className="border-t border-[#2A2A3E] hover:bg-[#22223a]">
                    <td className="px-4 py-3">
                      <div className="font-medium">{p.nome}</div>
                      <div className="text-xs text-slate-500">
                        {new Date(p.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      <code className="text-xs">{p.slug}</code>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {p.responsavel ?? '—'}
                      {p.email && (
                        <div className="text-xs text-slate-500">{p.email}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{p.total_setores}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          p.onboarding_status === 'conectado'
                            ? 'bg-emerald-900/40 text-emerald-300'
                            : 'bg-amber-900/40 text-amber-300'
                        }`}
                      >
                        {p.onboarding_status ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          p.ativo
                            ? 'bg-violet-900/40 text-violet-300'
                            : 'bg-slate-700/40 text-slate-400'
                        }`}
                      >
                        {p.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleAtivo(p)}
                          disabled={executando === p.id}
                          className="text-xs px-3 py-1.5 rounded bg-[#2A2A3E] hover:bg-[#3A3A4E] text-slate-200 disabled:opacity-50"
                        >
                          {p.ativo ? 'Desativar' : 'Reativar'}
                        </button>
                        <button
                          onClick={() => {
                            setExclusaoAlvo(p);
                            setTextoConfirmacao('');
                          }}
                          disabled={executando === p.id}
                          className="text-xs px-3 py-1.5 rounded bg-rose-900/40 hover:bg-rose-800/60 text-rose-200 border border-rose-800 disabled:opacity-50"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {exclusaoAlvo && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1A1A2E] border border-rose-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold text-rose-200 mb-2">
              Excluir definitivamente?
            </h2>
            <p className="text-slate-300 text-sm mb-4">
              Esta ação é <strong className="text-rose-300">irreversível</strong>. Todos
              os dados de <strong>{exclusaoAlvo.nome}</strong> serão apagados —
              mensagens, sessões, agentes, números, conhecimento, validações e o próprio
              projeto.
            </p>
            <p className="text-slate-300 text-sm mb-2">
              Para confirmar, digite o nome exato do projeto:
            </p>
            <div className="text-xs text-slate-500 mb-2">
              <code>{exclusaoAlvo.nome}</code>
            </div>
            <input
              type="text"
              value={textoConfirmacao}
              onChange={(e) => setTextoConfirmacao(e.target.value)}
              className="w-full bg-[#0F0F1A] border border-[#2A2A3E] text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-rose-500 mb-4"
              placeholder="Digite o nome do projeto..."
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setExclusaoAlvo(null);
                  setTextoConfirmacao('');
                }}
                disabled={executando === exclusaoAlvo.id}
                className="px-4 py-2 rounded bg-[#2A2A3E] hover:bg-[#3A3A4E] text-slate-200 text-sm disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarExclusao}
                disabled={
                  textoConfirmacao !== exclusaoAlvo.nome ||
                  executando === exclusaoAlvo.id
                }
                className="px-4 py-2 rounded bg-rose-700 hover:bg-rose-600 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {executando === exclusaoAlvo.id
                  ? 'Excluindo...'
                  : 'Excluir definitivamente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
