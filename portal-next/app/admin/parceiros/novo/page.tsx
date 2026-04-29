'use client';

import { useState } from 'react';
import Link from 'next/link';

const SETORES: { value: string; label: string }[] = [
  { value: 'comercial', label: 'Comercial' },
  { value: 'atendimento', label: 'Atendimento' },
  { value: 'operacional', label: 'Operacional' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'pessoas', label: 'Pessoas' },
];

export default function NovoParceiro() {
  const [form, setForm] = useState({
    nome: '',
    responsavel: '',
    email: '',
    telefone: '',
  });
  const [setores, setSetores] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    slug: string;
    onboarding_link: string;
    email_status: 'enviado' | 'falhou';
    email_error: string | null;
    whatsapp_status: 'enviado' | 'falhou';
    whatsapp_error: string | null;
  } | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleSetor = (value: string) => {
    setSetores((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (setores.length === 0) {
      setError('Selecione ao menos um setor');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/parceiros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, setores }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Erro ao criar parceiro');
        return;
      }

      setResult({
        slug: data.slug,
        onboarding_link: data.onboarding_link,
        email_status: data.email_status,
        email_error: data.email_error,
        whatsapp_status: data.whatsapp_status,
        whatsapp_error: data.whatsapp_error,
      });
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
    const emailOk = result.email_status === 'enviado';
    const whatsappOk = result.whatsapp_status === 'enviado';
    const algumaFalha = !emailOk || !whatsappOk;

    return (
      <div className="p-6 md:p-8 max-w-lg mx-auto">
        <div className="bg-[#1A1A2E] border border-[#2A2A3E] rounded-xl p-8 text-center">
          <p className="text-4xl mb-4">{algumaFalha ? '⚠️' : '✅'}</p>
          <h2 className="text-white text-xl font-bold mb-2">Parceiro criado com sucesso!</h2>
          <p className="text-slate-400 text-sm mb-6">
            {algumaFalha
              ? 'O parceiro foi criado, mas alguns avisos não foram entregues.'
              : 'E-mail e WhatsApp enviados com o link de onboarding.'}
          </p>

          <div className="space-y-2 mb-4 text-left">
            <div className={`flex items-center gap-2 text-sm ${emailOk ? 'text-emerald-400' : 'text-amber-400'}`}>
              <span>{emailOk ? '✅' : '⚠️'}</span>
              <span>E-mail: {emailOk ? 'enviado' : 'falhou'}</span>
            </div>
            {!emailOk && result.email_error && (
              <p className="text-amber-300 text-xs ml-6 break-all">{result.email_error}</p>
            )}
            <div className={`flex items-center gap-2 text-sm ${whatsappOk ? 'text-emerald-400' : 'text-amber-400'}`}>
              <span>{whatsappOk ? '✅' : '⚠️'}</span>
              <span>WhatsApp: {whatsappOk ? 'enviado' : 'falhou'}</span>
            </div>
            {!whatsappOk && result.whatsapp_error && (
              <p className="text-amber-300 text-xs ml-6 break-all">{result.whatsapp_error}</p>
            )}
          </div>

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
          <label className="block text-slate-300 text-sm font-medium mb-2">
            Setores * <span className="text-slate-500 font-normal">(selecione um ou mais)</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {SETORES.map((s) => {
              const checked = setores.includes(s.value);
              return (
                <label
                  key={s.value}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                    checked
                      ? 'bg-violet-600/20 border-violet-500 text-white'
                      : 'bg-[#0F0F1A] border-[#2A2A3E] text-slate-300 hover:border-violet-500/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSetor(s.value)}
                    className="accent-violet-500"
                  />
                  {s.label}
                </label>
              );
            })}
          </div>
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
