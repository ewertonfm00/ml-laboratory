'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function OnboardingPage() {
  const params = useParams();
  const token = params.token as string;

  const [projeto, setProjeto] = useState<{ nome: string; responsavel: string; onboarding_status: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [form, setForm] = useState({
    evolution_url: '',
    api_key: '',
    instance_name: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/onboarding/${token}`)
      .then((r) => {
        if (r.status === 404) {
          setNotFound(true);
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) setProjeto(data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/onboarding/conectar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, ...form }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Erro ao configurar webhook');
        return;
      }

      setSuccess(true);
    } catch {
      setError('Erro de conexão');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center">
        <p className="text-slate-400">Carregando...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-5xl mb-4">❌</p>
          <h1 className="text-white text-xl font-bold">Link inválido</h1>
          <p className="text-slate-400 mt-2 text-sm">Este link de onboarding não existe ou expirou.</p>
        </div>
      </div>
    );
  }

  if (projeto?.onboarding_status === 'conectado') {
    return (
      <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-5xl mb-4">✅</p>
          <h1 className="text-white text-xl font-bold">Integração já configurada</h1>
          <p className="text-slate-400 mt-2 text-sm">
            O WhatsApp da <strong>{projeto.nome}</strong> já está conectado ao ML Laboratory.
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <p className="text-5xl mb-4">🎉</p>
          <h1 className="text-white text-xl font-bold">Webhook configurado com sucesso!</h1>
          <p className="text-slate-400 mt-2 text-sm">
            Peça ao seu time enviar uma mensagem de teste para validar a integração.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-4xl mb-3">🔗</p>
          <h1 className="text-white text-2xl font-bold">Conectar ao ML Laboratory</h1>
          <p className="text-slate-400 mt-2 text-sm">
            Olá, <strong>{projeto?.responsavel}</strong>! Configure as credenciais da Evolution API de <strong>{projeto?.nome}</strong>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1">URL da Evolution *</label>
            <input
              type="url"
              name="evolution_url"
              value={form.evolution_url}
              onChange={handleChange}
              required
              className="w-full bg-[#1A1A2E] border border-[#2A2A3E] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500"
              placeholder="https://evolution.suaempresa.com"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1">API Key *</label>
            <input
              type="text"
              name="api_key"
              value={form.api_key}
              onChange={handleChange}
              required
              className="w-full bg-[#1A1A2E] border border-[#2A2A3E] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500"
              placeholder="sua-api-key"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-1">Nome da instância *</label>
            <input
              type="text"
              name="instance_name"
              value={form.instance_name}
              onChange={handleChange}
              required
              className="w-full bg-[#1A1A2E] border border-[#2A2A3E] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500"
              placeholder="nome-da-instancia"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            {submitting ? 'Configurando webhook...' : 'Ativar integração'}
          </button>
        </form>
      </div>
    </div>
  );
}
