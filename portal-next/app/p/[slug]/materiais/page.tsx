'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';

interface Numero {
  id: string;
  numero_whatsapp: string;
  nome_identificador: string | null;
}

interface Material {
  id: string;
  numero_id: string | null;
  titulo: string;
  tipo: string;
  conteudo: string;
  ativo: boolean;
  ordem: number;
  created_at: string;
  updated_at: string;
}

const inputCls = 'w-full bg-[#0F0F1A] border border-[#2A2A3E] rounded-lg px-3 py-2 text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:border-violet-500 transition-colors';
const textareaCls = `${inputCls} resize-y min-h-[80px]`;

const tipoBadge: Record<string, { bg: string; text: string }> = {
  produto:   { bg: 'bg-blue-500/20',   text: 'text-blue-400' },
  servico:   { bg: 'bg-green-500/20',  text: 'text-green-400' },
  politica:  { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  script:    { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  faq:       { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  geral:     { bg: 'bg-slate-500/20',  text: 'text-slate-400' },
};

const tipoLabels: Record<string, string> = {
  geral: 'Geral',
  produto: 'Produto',
  servico: 'Serviço',
  politica: 'Política',
  script: 'Script',
  faq: 'FAQ',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-slate-400 text-xs mb-1">{label}</label>
      {children}
    </div>
  );
}

function MaterialModal({
  material,
  numeros,
  onClose,
  onSave,
}: {
  material: Partial<Material> | null;
  numeros: Numero[];
  onClose: () => void;
  onSave: (data: Partial<Material>) => Promise<void>;
}) {
  const [form, setForm] = useState<Partial<Material>>(
    material ?? { titulo: '', tipo: 'geral', conteudo: '', ativo: true, ordem: 0 }
  );
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof Material>(field: K, value: Material[K]) =>
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
            {material?.id ? 'Editar Material' : 'Novo Material Técnico'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-lg">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Field label="Título *">
            <input
              className={inputCls}
              value={form.titulo ?? ''}
              onChange={e => set('titulo', e.target.value)}
              required
              placeholder="Nome do material"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Tipo">
              <select
                className={inputCls}
                value={form.tipo ?? 'geral'}
                onChange={e => set('tipo', e.target.value)}
              >
                {Object.entries(tipoLabels).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </Field>

            <Field label="Número vinculado (opcional)">
              <select
                className={inputCls}
                value={form.numero_id ?? ''}
                onChange={e => set('numero_id', e.target.value || null as unknown as string)}
              >
                <option value="">Todos os números</option>
                {numeros.map(n => (
                  <option key={n.id} value={n.id}>
                    {n.nome_identificador ?? n.numero_whatsapp}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Conteúdo *">
            <textarea
              className={`${textareaCls} min-h-[200px]`}
              value={form.conteudo ?? ''}
              onChange={e => set('conteudo', e.target.value)}
              required
              placeholder="Conteúdo do material técnico..."
            />
          </Field>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="ativo-mat"
              checked={form.ativo ?? true}
              onChange={e => set('ativo', e.target.checked)}
              className="accent-violet-600 w-4 h-4"
            />
            <label htmlFor="ativo-mat" className="text-slate-300 text-sm cursor-pointer">Ativo</label>
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

export default function MateriaisPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? '';

  const [materiais, setMateriais] = useState<Material[]>([]);
  const [numeros, setNumeros] = useState<Numero[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Partial<Material> | null | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/materiais/${slug}`);
      if (!res.ok) return;
      const data = await res.json();
      setMateriais(data.materiais ?? []);
      setNumeros(data.numeros ?? []);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data: Partial<Material>) => {
    const isEdit = !!data.id;
    const url = isEdit
      ? `/api/materiais/${slug}/${data.id}`
      : `/api/materiais/${slug}`;
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
    if (!confirm('Remover este material?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/materiais/${slug}/${id}`, { method: 'DELETE' });
      if (res.ok) setMateriais(prev => prev.filter(m => m.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const getNomeNumero = (numeroId: string | null) => {
    if (!numeroId) return 'Todos';
    const n = numeros.find(n => n.id === numeroId);
    return n?.nome_identificador ?? n?.numero_whatsapp ?? 'Todos';
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="animate-pulse space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-[#1A1A2E] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Materiais Técnicos</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {materiais.length} material{materiais.length !== 1 ? 'is' : ''} cadastrado{materiais.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setModal(null)}
          className="bg-violet-600 hover:bg-violet-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
        >
          + Novo Material
        </button>
      </div>

      {materiais.length === 0 ? (
        <div className="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-12 text-center">
          <p className="text-4xl mb-4">📚</p>
          <p className="text-slate-300 font-medium">Nenhum material técnico cadastrado</p>
          <p className="text-slate-500 text-sm mt-1">
            Adicione materiais para enriquecer as análises.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {materiais.map(mat => {
            const badge = tipoBadge[mat.tipo] ?? tipoBadge.geral;
            return (
              <div key={mat.id} className="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-5 hover:border-violet-500/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-white font-medium">{mat.titulo}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
                        {tipoLabels[mat.tipo] ?? mat.tipo}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        mat.ativo
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-slate-700/50 text-slate-400'
                      }`}>
                        {mat.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                      <span className="text-xs text-slate-500">
                        Número: {getNomeNumero(mat.numero_id)}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs line-clamp-2 mt-1">{mat.conteudo}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setModal(mat)}
                      className="text-slate-400 hover:text-violet-400 text-sm px-3 py-1.5 rounded-lg hover:bg-violet-500/10 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(mat.id)}
                      disabled={deletingId === mat.id}
                      className="text-slate-500 hover:text-red-400 text-sm px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    >
                      {deletingId === mat.id ? '...' : 'Excluir'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal !== undefined && (
        <MaterialModal
          material={modal}
          numeros={numeros}
          onClose={() => setModal(undefined)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
