'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';

interface Procedimento {
  id: string;
  nome: string;
  finalidade: string | null;
  regiao: string | null;
  qtd_sessoes: number | null;
  duracao_sessao: number | null;
  intervalo_sessoes: number | null;
  valor_avulso: string | null;
  valor_sessao_pacote: string | null;
  valor_pacote: string | null;
  descricao: string | null;
  beneficios: string | null;
  contraindicacoes: string | null;
  resultados_esperados: string | null;
  cuidados_pre: string | null;
  cuidados_pos: string | null;
  status: string;
  observacoes: string | null;
  sugestoes_respostas: string | null;
  ordem: number;
}

const emptyProc: Omit<Procedimento, 'id' | 'ordem'> = {
  nome: '', finalidade: null, regiao: null, qtd_sessoes: null,
  duracao_sessao: null, intervalo_sessoes: null, valor_avulso: null,
  valor_sessao_pacote: null, valor_pacote: null, descricao: null,
  beneficios: null, contraindicacoes: null, resultados_esperados: null,
  cuidados_pre: null, cuidados_pos: null, status: 'ativo',
  observacoes: null, sugestoes_respostas: null,
};

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

function ProcModal({
  proc,
  onClose,
  onSave,
}: {
  proc: Partial<Procedimento> | null;
  onClose: () => void;
  onSave: (data: Partial<Procedimento>) => Promise<void>;
}) {
  const [form, setForm] = useState<Partial<Procedimento>>(proc ?? { ...emptyProc });
  const [saving, setSaving] = useState(false);

  const set = (field: keyof Procedimento, value: string | null) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 overflow-y-auto py-8 px-4">
      <div className="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] w-full max-w-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2A3E]">
          <h2 className="text-white font-semibold">
            {proc?.id ? 'Editar Procedimento' : 'Novo Procedimento'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-lg">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field label="Nome *">
                <input className={inputCls} value={form.nome ?? ''} onChange={e => set('nome', e.target.value)} required placeholder="Nome do procedimento" />
              </Field>
            </div>
            <Field label="Finalidade">
              <input className={inputCls} value={form.finalidade ?? ''} onChange={e => set('finalidade', e.target.value || null)} placeholder="Ex: Rejuvenescimento facial" />
            </Field>
            <Field label="Região">
              <input className={inputCls} value={form.regiao ?? ''} onChange={e => set('regiao', e.target.value || null)} placeholder="Ex: Rosto, Corpo" />
            </Field>
            <Field label="Qtd. sessões">
              <input type="number" className={inputCls} value={form.qtd_sessoes ?? ''} onChange={e => set('qtd_sessoes', e.target.value || null)} placeholder="4" />
            </Field>
            <Field label="Duração/sessão (min)">
              <input type="number" className={inputCls} value={form.duracao_sessao ?? ''} onChange={e => set('duracao_sessao', e.target.value || null)} placeholder="60" />
            </Field>
            <Field label="Intervalo entre sessões (dias)">
              <input type="number" className={inputCls} value={form.intervalo_sessoes ?? ''} onChange={e => set('intervalo_sessoes', e.target.value || null)} placeholder="30" />
            </Field>
            <Field label="Status">
              <select
                className={inputCls}
                value={form.status ?? 'ativo'}
                onChange={e => set('status', e.target.value)}
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </Field>
            <Field label="Valor avulso (R$)">
              <input type="number" step="0.01" className={inputCls} value={form.valor_avulso ?? ''} onChange={e => set('valor_avulso', e.target.value || null)} placeholder="350.00" />
            </Field>
            <Field label="Valor por sessão (pacote) (R$)">
              <input type="number" step="0.01" className={inputCls} value={form.valor_sessao_pacote ?? ''} onChange={e => set('valor_sessao_pacote', e.target.value || null)} placeholder="280.00" />
            </Field>
            <Field label="Valor do pacote completo (R$)">
              <input type="number" step="0.01" className={inputCls} value={form.valor_pacote ?? ''} onChange={e => set('valor_pacote', e.target.value || null)} placeholder="1.120.00" />
            </Field>
          </div>

          <Field label="Descrição">
            <textarea className={textareaCls} value={form.descricao ?? ''} onChange={e => set('descricao', e.target.value || null)} placeholder="Descrição do procedimento..." />
          </Field>
          <Field label="Benefícios">
            <textarea className={textareaCls} value={form.beneficios ?? ''} onChange={e => set('beneficios', e.target.value || null)} placeholder="Principais benefícios..." />
          </Field>
          <Field label="Contra-indicações">
            <textarea className={textareaCls} value={form.contraindicacoes ?? ''} onChange={e => set('contraindicacoes', e.target.value || null)} placeholder="Quem não pode fazer..." />
          </Field>
          <Field label="Resultados esperados">
            <textarea className={textareaCls} value={form.resultados_esperados ?? ''} onChange={e => set('resultados_esperados', e.target.value || null)} placeholder="O que o paciente pode esperar..." />
          </Field>
          <Field label="Cuidados pré-procedimento">
            <textarea className={textareaCls} value={form.cuidados_pre ?? ''} onChange={e => set('cuidados_pre', e.target.value || null)} placeholder="O que fazer antes..." />
          </Field>
          <Field label="Cuidados pós-procedimento">
            <textarea className={textareaCls} value={form.cuidados_pos ?? ''} onChange={e => set('cuidados_pos', e.target.value || null)} placeholder="O que fazer depois..." />
          </Field>
          <Field label="Sugestões de respostas (perguntas frequentes sobre este procedimento)">
            <textarea
              className={`${textareaCls} min-h-[120px]`}
              value={form.sugestoes_respostas ?? ''}
              onChange={e => set('sugestoes_respostas', e.target.value || null)}
              placeholder={"Ex: 'Qual a diferença do microagulhamento com PDRN?' → 'O PDRN potencializa a regeneração celular e intensifica os resultados do microagulhamento convencional...'"}
            />
          </Field>
          <Field label="Observações internas">
            <textarea className={textareaCls} value={form.observacoes ?? ''} onChange={e => set('observacoes', e.target.value || null)} placeholder="Notas internas para o agente..." />
          </Field>

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

export default function ProcedimentosPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? '';

  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalProc, setModalProc] = useState<Partial<Procedimento> | null | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/clinica/${slug}/procedimentos`);
      if (!res.ok) return;
      const data = await res.json();
      setProcedimentos(data.procedimentos ?? []);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data: Partial<Procedimento>) => {
    const isEdit = !!data.id;
    const url = isEdit
      ? `/api/clinica/${slug}/procedimentos/${data.id}`
      : `/api/clinica/${slug}/procedimentos`;
    const res = await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setModalProc(undefined);
      await load();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este procedimento?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/clinica/${slug}/procedimentos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProcedimentos(prev => prev.filter(p => p.id !== id));
      }
    } finally {
      setDeletingId(null);
    }
  };

  const formatCurrency = (val: string | null) => {
    if (!val) return null;
    const n = parseFloat(val);
    if (isNaN(n)) return null;
    return `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
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
          <h1 className="text-xl font-bold text-white">Procedimentos</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {procedimentos.length} procedimento{procedimentos.length !== 1 ? 's' : ''} cadastrado{procedimentos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setModalProc(null)}
          className="bg-violet-600 hover:bg-violet-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
        >
          + Novo Procedimento
        </button>
      </div>

      {procedimentos.length === 0 ? (
        <div className="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-12 text-center">
          <p className="text-4xl mb-4">💆</p>
          <p className="text-slate-300 font-medium">Nenhum procedimento cadastrado</p>
          <p className="text-slate-500 text-sm mt-1">Adicione os procedimentos oferecidos pela clínica</p>
        </div>
      ) : (
        <div className="space-y-3">
          {procedimentos.map((proc) => (
            <div key={proc.id} className="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-5 hover:border-violet-500/30 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-white font-medium truncate">{proc.nome}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                      proc.status === 'ativo'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-slate-700/50 text-slate-400 border border-slate-700'
                    }`}>
                      {proc.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                    {proc.regiao && <span>{proc.regiao}</span>}
                    {proc.qtd_sessoes && (
                      <span>
                        {proc.qtd_sessoes} sessão{proc.qtd_sessoes > 1 ? 'ões' : ''}
                        {proc.duracao_sessao ? ` × ${proc.duracao_sessao}min` : ''}
                      </span>
                    )}
                    {formatCurrency(proc.valor_avulso) && (
                      <span className="text-slate-300">
                        Avulso: {formatCurrency(proc.valor_avulso)}
                      </span>
                    )}
                    {formatCurrency(proc.valor_pacote) && (
                      <span className="text-violet-400 font-medium">
                        Pacote: {formatCurrency(proc.valor_pacote)}
                      </span>
                    )}
                  </div>

                  {proc.finalidade && (
                    <p className="text-slate-500 text-xs mt-1 truncate">{proc.finalidade}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setModalProc(proc)}
                    className="text-slate-400 hover:text-violet-400 text-sm px-3 py-1.5 rounded-lg hover:bg-violet-500/10 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(proc.id)}
                    disabled={deletingId === proc.id}
                    className="text-slate-500 hover:text-red-400 text-sm px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50"
                  >
                    {deletingId === proc.id ? '...' : 'Remover'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalProc !== undefined && (
        <ProcModal
          proc={modalProc}
          onClose={() => setModalProc(undefined)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
