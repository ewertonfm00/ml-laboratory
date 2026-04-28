'use client';

import { useState } from 'react';
import Link from 'next/link';

const SETORES = [
  'Comercial/Vendas',
  'Atendimento/Recepção',
  'Operacional',
  'Marketing',
  'Estética/Saúde',
  'Outro',
];

export default function NovoParceiro() {
  const [form, setForm] = useState({
    nome: '',
    responsavel: '',
    email: '',
    telefone: '',
    setor: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ slug: string; onboarding_link: string } | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/admin/parceiros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Erro ao criar parceiro');
        return;
      }

      setResult({ slug: data.slug, onboarding_link: data.onboarding_link });
    } catch {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.onboarding_link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (result) {
    return (
      <div className="p-6 md:p-8 max-w-lg mx-auto">
        <div className="bg-[#1A1A2E] border border-[#2A2A3E] rounded-xl p-8 text-center">
          <p className="text-4xl mb-4">✅</p>
          <h2 className="text-white text-xl font-bold mb-2">Parceiro criado com sucesso!</h2>
          <p className="text-slate-400 text-sm mb-6">E-mail e WhatsApp enviados com o link de onboarding.</p>

          <div className="bg-[#0F0F1A] border border-[#2A2A3E] rounded-lg p-3 text-left mb-4">
            <p className="text-slate-500 text-xs mb-1">Link de onboarding</p>
            <p className="text-violet-300 text-sm break-all">{result.onboarding_link}</p>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={handleCopy}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {copied ? '✅ Copiado!' : '📋 Copiar link'}
            </button>
            <Link
              href={`/p/${result.slug}/perfil`}
              className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Ver parceiro
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-lg mx-auto">
      <div className="mb-8">
        <Link href="/" className="text-slate-400 hover:text-white text-sm transition-colors">
          ← Voltar ao painel
        </Link>
        <h1 className="text-2xl font-bold text-white mt-4">Novo Parceiro</h1>
        <p className="text-slate-400 mt-1 text-sm">Cadastre um parceiro externo e envie o link de onboarding.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-1">Nome da empresa *</label>
          <input
            type="text"
            name="nome"
            value={form.nome}
            onChange={handleChange}
            required
            className="w-full bg-[#0F0F1A] border border-[#2A2A3E] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500"
            placeholder="Ex: Clínica Omega Laser"
          />
        </div>

        <div>
          <label className="block text-slate-300 text-sm font-medium mb-1">Nome do responsável *</label>
          <input
            type="text"
            name="responsavel"
            value={form.responsavel}
            onChange={handleChange}
            required
            className="w-full bg-[#0F0F1A] border border-[#2A2A3E] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500"
            placeholder="Ex: Maria Silva"
          />
        </div>

        <div>
          <label className="block text-slate-300 text-sm font-medium mb-1">E-mail *</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full bg-[#0F0F1A] border border-[#2A2A3E] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500"
            placeholder="contato@empresa.com"
          />
        </div>

        <div>
          <label className="block text-slate-300 text-sm font-medium mb-1">WhatsApp *</label>
          <input
            type="text"
            name="telefone"
            value={form.telefone}
            onChange={handleChange}
            required
            className="w-full bg-[#0F0F1A] border border-[#2A2A3E] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500"
            placeholder="5516988230361"
          />
        </div>

        <div>
          <label className="block text-slate-300 text-sm font-medium mb-1">Setor</label>
          <select
            name="setor"
            value={form.setor}
            onChange={handleChange}
            className="w-full bg-[#0F0F1A] border border-[#2A2A3E] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500"
          >
            <option value="">Selecionar setor...</option>
            {SETORES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          {loading ? 'Criando parceiro...' : 'Criar parceiro e enviar link'}
        </button>
      </form>
    </div>
  );
}
