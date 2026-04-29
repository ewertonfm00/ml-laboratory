'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const N8N_BASE = 'https://n8n-production-47d0.up.railway.app';

export default function OnboardingPage() {
  const params = useParams();
  const token = params.token as string;

  const [projeto, setProjeto] = useState<{
    nome: string;
    responsavel: string;
    onboarding_status: string;
    slug: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [apiKey, setApiKey] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/onboarding/${token}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => { if (data) setProjeto(data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [token]);

  const endpointUrl = projeto
    ? `${N8N_BASE}/webhook/ml/external/${projeto.slug}`
    : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(endpointUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/onboarding/conectar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, api_key: apiKey }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Erro ao ativar integração');
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

  if (projeto?.onboarding_status === 'conectado' || success) {
    return (
      <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <p className="text-5xl mb-4">🎉</p>
          <h1 className="text-white text-xl font-bold">Integração ativada!</h1>
          <p className="text-slate-400 mt-2 text-sm">
            <strong>{projeto?.nome}</strong> está conectada ao ML Laboratory.
            As mensagens começarão a ser analisadas automaticamente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <p className="text-4xl mb-3">🔗</p>
          <h1 className="text-white text-2xl font-bold">Conectar ao ML Laboratory</h1>
          <p className="text-slate-400 mt-2 text-sm">
            Olá, <strong>{projeto?.responsavel}</strong>! Configure a integração de <strong>{projeto?.nome}</strong> em 2 passos.
          </p>
        </div>

        {/* Passo 1 */}
        <div className="bg-[#1A1A2E] border border-[#2A2A3E] rounded-lg p-5 mb-4">
          <p className="text-slate-300 text-sm font-semibold mb-1">
            Passo 1 — Configure o webhook no seu sistema
          </p>
          <p className="text-slate-400 text-xs mb-3">
            Cadastre esta URL como destino dos eventos de mensagens no seu sistema:
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-[#0F0F1A] text-violet-300 text-xs px-3 py-2 rounded-lg break-all">
              {endpointUrl}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 bg-violet-600 hover:bg-violet-700 text-white text-xs px-3 py-2 rounded-lg transition-colors"
            >
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>

        {/* Passo 2 */}
        <div className="bg-[#1A1A2E] border border-[#2A2A3E] rounded-lg p-5">
          <p className="text-slate-300 text-sm font-semibold mb-1">
            Passo 2 — Cole a API Key gerada pelo seu sistema
          </p>
          <p className="text-slate-400 text-xs mb-3">
            Após configurar o webhook, seu sistema irá gerar uma API Key. Cole ela abaixo para ativar a integração:
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
              className="w-full bg-[#0F0F1A] border border-[#2A2A3E] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500"
              placeholder="sk_..."
            />

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !apiKey.trim()}
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              {submitting ? 'Ativando...' : 'Ativar integração'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
