'use client';

import { useState } from 'react';
import QRCodeDisplay from './QRCodeDisplay';
import { Projeto, ConectarNumeroResponse } from '@/lib/types';

const SETORES = [
  { value: 'comercial', label: 'Comercial' },
  { value: 'atendimento', label: 'Atendimento' },
  { value: 'operacional', label: 'Operacional' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'pessoas', label: 'Pessoas' },
];

interface Props {
  projetos: Projeto[];
}

export default function ConectarNumeroForm({ projetos }: Props) {
  const [form, setForm] = useState({
    projeto_id: '',
    setor: '',
    numero_whatsapp: '',
    nome_identificador: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ConectarNumeroResponse | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const formatNumero = (value: string) => {
    // Remove non-digits and ensure starts with 55
    const digits = value.replace(/\D/g, '');
    return digits;
  };

  const handleNumero = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumero(e.target.value);
    setForm((prev) => ({ ...prev, numero_whatsapp: formatted }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.projeto_id) return setError('Selecione um projeto.');
    if (!form.setor) return setError('Selecione um setor.');
    if (!form.numero_whatsapp || form.numero_whatsapp.length < 12)
      return setError('Informe um número válido com DDD (ex: 5511999998888).');
    if (!form.nome_identificador.trim())
      return setError('Informe um nome identificador.');

    setLoading(true);
    try {
      const res = await fetch('/api/numeros/conectar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data: ConectarNumeroResponse = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error ?? data.message ?? 'Erro ao conectar número.');
        return;
      }

      setResult(data);
    } catch (err) {
      setError('Erro de conexão. Verifique sua rede e tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (result?.qrcode) {
    return (
      <div className="space-y-4">
        <div className="bg-[#1A1A2E] rounded-xl border border-green-500/30 p-4">
          <p className="text-green-400 text-sm font-medium">✅ Instância criada com sucesso</p>
          <p className="text-slate-400 text-xs mt-1">{result.message}</p>
        </div>
        <QRCodeDisplay
          qrcode={result.qrcode}
          instanceName={result.instance_name ?? ''}
          onConnected={() => {
            // Show success and redirect after 3s
            setTimeout(() => {
              const projeto = projetos.find((p) => p.id === form.projeto_id);
              if (projeto) window.location.href = `/p/${projeto.slug}/numeros`;
              else window.location.href = '/';
            }, 3000);
          }}
        />
        <button
          onClick={() => {
            setResult(null);
            setForm({ projeto_id: '', setor: '', numero_whatsapp: '', nome_identificador: '' });
          }}
          className="text-slate-400 hover:text-white text-sm underline"
        >
          Conectar outro número
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Projeto */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Projeto <span className="text-red-400">*</span>
        </label>
        <select
          name="projeto_id"
          value={form.projeto_id}
          onChange={handleChange}
          className="w-full bg-[#0F0F1A] border border-[#2A2A3E] text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500 transition-colors"
          required
        >
          <option value="">Selecione um projeto…</option>
          {projetos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>
      </div>

      {/* Setor */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Setor <span className="text-red-400">*</span>
        </label>
        <select
          name="setor"
          value={form.setor}
          onChange={handleChange}
          className="w-full bg-[#0F0F1A] border border-[#2A2A3E] text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500 transition-colors"
          required
        >
          <option value="">Selecione um setor…</option>
          {SETORES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Número WhatsApp */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Número WhatsApp <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">+</span>
          <input
            type="tel"
            name="numero_whatsapp"
            value={form.numero_whatsapp}
            onChange={handleNumero}
            placeholder="5511999998888"
            maxLength={15}
            className="w-full bg-[#0F0F1A] border border-[#2A2A3E] text-white rounded-lg pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:border-violet-500 transition-colors placeholder:text-slate-600"
            required
          />
        </div>
        <p className="text-slate-500 text-xs mt-1">DDI + DDD + número (sem espaços ou traços)</p>
      </div>

      {/* Nome identificador */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Nome Identificador <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="nome_identificador"
          value={form.nome_identificador}
          onChange={handleChange}
          placeholder="Ex: Vendas SP, Suporte, Recepção"
          maxLength={60}
          className="w-full bg-[#0F0F1A] border border-[#2A2A3E] text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500 transition-colors placeholder:text-slate-600"
          required
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-violet-800 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Conectando…
          </>
        ) : (
          <>📱 Conectar e Gerar QR Code</>
        )}
      </button>
    </form>
  );
}
