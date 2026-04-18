'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';

interface Metodologia {
  id: string;
  nome: string;
  descricao: string | null;
  principios: string | null;
  tecnicas: string | null;
  quando_usar: string | null;
  ativo: boolean;
  created_at: string;
}

const inputCls = 'w-full bg-[#0F0F1A] border border-[#2A2A3E] rounded-lg px-3 py-2 text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:border-violet-500 transition-colors';
const textareaCls = `${inputCls} resize-y min-h-[80px]`;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-slate-400 text-xs mb-1">{label}</label>
      {children}
    </div>
  );
}

function MetodologiaModal({
  metodologia,
  onClose,
  onSave,
}: {
  metodologia: Partial<Metodologia> | null;
  onClose: () => void;
  onSave: (data: Partial<Metodologia>) => Promise<void>;
}) {
  const [form, setForm] = useState<Partial<Metodologia>>(
    metodologia ?? { nome: '', descricao: null, principios: null, tecnicas: null, quando_usar: null, ativo: true }
  );
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof Metodologia>(field: K, value: Metodologia[K] | null) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 overflow-y-auto py-8 px-4">
      <div className="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] w-full max-w-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2A3E]">
          <h2 className="text-white font-semibold">
            {metodologia?.id ? 'Editar Metodologia' : 'Nova Metodologia'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-lg">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Field label="Nome *">
            <input
              className={inputCls}
              value={form.nome ?? ''}
              onChange={e => set('nome', e.target.value)}
              required
              placeholder="Ex: SPIN Selling, Challenger Sale, MEDDIC"
            />
          </Field>

          <Field label="Descrição">
            <textarea
              className={textareaCls}
              value={form.descricao ?? ''}
              onChange={e => set('descricao', e.target.value || null)}
              placeholder="Breve descrição da metodologia..."
            />
          </Field>

          <Field label="Princípios fundamentais">
            <textarea
              className={`${textareaCls} min-h-[100px]`}
              value={form.principios ?? ''}
              onChange={e => set('principios', e.target.value || null)}
              placeholder="Liste os princípios fundamentais..."
            />
          </Field>

          <Field label="Técnicas específicas">
            <textarea
              className={`${textareaCls} min-h-[100px]`}
              value={form.tecnicas ?? ''}
              onChange={e => set('tecnicas', e.target.value || null)}
              placeholder="Descreva as técnicas e abordagens..."
            />
          </Field>

          <Field label="Quando usar">
            <textarea
              className={textareaCls}
              value={form.quando_usar ?? ''}
              onChange={e => set('quando_usar', e.target.value || null)}
              placeholder="Em quais situações aplicar esta metodologia..."
            />
          </Field>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="ativo-met"
              checked={form.ativo ?? true}
              onChange={e => set('ativo', e.target.checked)}
              className="accent-violet-600 w-4 h-4"
            />
            <label htmlFor="ativo-met" className="text-slate-300 text-sm cursor-pointer">Ativo</label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#2A2A3E]">
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-white text-sm px-4 py-2 transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-medium px-5 py-2 rounded-lg text-sm transition-colors"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MetodologiaCard({
  met,
  onEdit,
  onDelete,
  deleting,
}: {
  met: Metodologia;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasDetails = met.principios || met.tecnicas || met.quando_usar;

  return (
    <div className="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] overflow-hidden hover:border-violet-500/30 transition-colors">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="text-white font-semibold">{met.nome}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                met.ativo
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-slate-700/50 text-slate-400'
              }`}>
                {met.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            {met.descricao && (
              <p className="text-slate-400 text-sm leading-relaxed">{met.descricao}</p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {hasDetails && (
              <button
                onClick={() => setExpanded(v => !v)}
                className="text-slate-500 hover:text-slate-300 text-xs px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                {expanded ? '▲ Recolher' : '▼ Detalhes'}
              </button>
            )}
            <button
              onClick={onEdit}
              className="text-slate-400 hover:text-violet-400 text-sm px-3 py-1.5 rounded-lg hover:bg-violet-500/10 transition-colors"
            >
              Editar
            </button>
            <button
              onClick={onDelete}
              disabled={deleting}
              className="text-slate-500 hover:text-red-400 text-sm px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50"
            >
              {deleting ? '...' : 'Excluir'}
            </button>
          </div>
        </div>
      </div>

      {expanded && hasDetails && (
        <div className="border-t border-[#2A2A3E] px-5 pb-5 pt-4 space-y-3">
          {met.principios && (
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Princípios fundamentais</p>
              <p className="text-slate-300 text-sm whitespace-pre-wrap">{met.principios}</p>
            </div>
          )}
          {met.tecnicas && (
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Técnicas específicas</p>
              <p className="text-slate-300 text-sm whitespace-pre-wrap">{met.tecnicas}</p>
            </div>
          )}
          {met.quando_usar && (
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Quando usar</p>
              <p className="text-slate-300 text-sm whitespace-pre-wrap">{met.quando_usar}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MetodologiasPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? '';

  const [metodologias, setMetodologias] = useState<Metodologia[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Partial<Metodologia> | null | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/metodologias/${slug}`);
      if (!res.ok) return;
      const data = await res.json();
      setMetodologias(data.metodologias ?? []);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data: Partial<Metodologia>) => {
    const isEdit = !!data.id;
    const url = isEdit
      ? `/api/metodologias/${slug}/${data.id}`
      : `/api/metodologias/${slug}`;
    const res = await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setModal(undefined);
      await load();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover esta metodologia?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/metodologias/${slug}/${id}`, { method: 'DELETE' });
      if (res.ok) setMetodologias(prev => prev.filter(m => m.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-[#1A1A2E] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Metodologias</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {metodologias.length} metodologia{metodologias.length !== 1 ? 's' : ''} cadastrada{metodologias.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setModal(null)}
          className="bg-violet-600 hover:bg-violet-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
        >
          + Nova Metodologia
        </button>
      </div>

      {metodologias.length === 0 ? (
        <div className="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-12 text-center">
          <p className="text-4xl mb-4">🎯</p>
          <p className="text-slate-300 font-medium">Nenhuma metodologia cadastrada</p>
          <p className="text-slate-500 text-sm mt-1">
            Adicione metodologias de vendas para enriquecer as análises (SPIN Selling, Challenger Sale, MEDDIC, etc.).
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {metodologias.map(met => (
            <MetodologiaCard
              key={met.id}
              met={met}
              onEdit={() => setModal(met)}
              onDelete={() => handleDelete(met.id)}
              deleting={deletingId === met.id}
            />
          ))}
        </div>
      )}

      {modal !== undefined && (
        <MetodologiaModal
          metodologia={modal}
          onClose={() => setModal(undefined)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
