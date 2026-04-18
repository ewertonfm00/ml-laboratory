'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';

interface FaqItem {
  id?: string;
  pergunta: string;
  resposta: string;
}

interface DepoimentoItem {
  id?: string;
  nome_paciente: string;
  depoimento: string;
}

interface PerfilForm {
  // Seção 1
  nome_clinica: string;
  nome_responsavel: string;
  cargo_formacao: string;
  mini_curriculum: string;
  registro_profissional: string;
  cnpj: string;
  instagram: string;
  site: string;
  // Seção 2
  whatsapp: string;
  whatsapp_exclusivo: boolean;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  ponto_referencia: string;
  // Seção 3
  dias_atendimento: string;
  horario_seg_sex: string;
  horario_sabado: string;
  pausa_almoco: string;
  capacidade_dia: string;
  tempo_entre_atendimentos: string;
  tolerancia_atraso: string;
  antecedencia_cancelamento: string;
  politica_agendamento: string;
  avaliacao_gratuita: string;
  // Seção 4
  formas_pagamento: string;
  aceita_parcelamento: boolean;
  regras_parcelamento: string;
  desconto_vista: string;
  politica_entrada: string;
  politica_reembolso: string;
  beneficios_fidelidade: string;
  // Seção 5
  apresentacao_agente: string;
  tom_comunicacao: string;
  frases_proibidas: string;
  objecoes_comuns: string;
  argumentos_persuasao: string;
  procedimentos_prioritarios: string;
  regras_limitacoes: string;
  regras_internas: string;
  // Seção 8
  contraindicacoes_gerais: string;
  restricoes_saude: string;
  outras_restricoes: string;
  // Seção 9
  autoriza_whatsapp: boolean;
  autoriza_acesso_conversas: boolean;
}

const emptyForm: PerfilForm = {
  nome_clinica: '', nome_responsavel: '', cargo_formacao: '', mini_curriculum: '',
  registro_profissional: '', cnpj: '', instagram: '', site: '',
  whatsapp: '', whatsapp_exclusivo: true,
  rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '', ponto_referencia: '',
  dias_atendimento: '', horario_seg_sex: '', horario_sabado: '', pausa_almoco: '',
  capacidade_dia: '', tempo_entre_atendimentos: '', tolerancia_atraso: '',
  antecedencia_cancelamento: '', politica_agendamento: '', avaliacao_gratuita: '',
  formas_pagamento: '', aceita_parcelamento: true, regras_parcelamento: '',
  desconto_vista: '', politica_entrada: '', politica_reembolso: '', beneficios_fidelidade: '',
  apresentacao_agente: '', tom_comunicacao: '', frases_proibidas: '', objecoes_comuns: '',
  argumentos_persuasao: '', procedimentos_prioritarios: '', regras_limitacoes: '', regras_internas: '',
  contraindicacoes_gerais: '', restricoes_saude: '', outras_restricoes: '',
  autoriza_whatsapp: true, autoriza_acesso_conversas: true,
};

function Section({ title, open, onToggle, children }: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/5 transition-colors"
      >
        <span className="text-white font-medium">{title}</span>
        <span className="text-slate-400 text-lg">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-[#2A2A3E] pt-4 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-slate-400 text-xs mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls = 'w-full bg-[#0F0F1A] border border-[#2A2A3E] rounded-lg px-3 py-2 text-slate-200 text-sm placeholder:text-slate-600 focus:outline-none focus:border-violet-500 transition-colors';
const textareaCls = `${inputCls} resize-y min-h-[80px]`;

export default function ClinicaPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? '';

  const [form, setForm] = useState<PerfilForm>(emptyForm);
  const [faq, setFaq] = useState<FaqItem[]>([]);
  const [depoimentos, setDepoimentos] = useState<DepoimentoItem[]>([]);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ s1: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleSection = (key: string) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const set = (field: keyof PerfilForm, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/clinica/${slug}/perfil`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.perfil) {
        const p = data.perfil;
        setForm({
          nome_clinica: p.nome_clinica ?? '',
          nome_responsavel: p.nome_responsavel ?? '',
          cargo_formacao: p.cargo_formacao ?? '',
          mini_curriculum: p.mini_curriculum ?? '',
          registro_profissional: p.registro_profissional ?? '',
          cnpj: p.cnpj ?? '',
          instagram: p.instagram ?? '',
          site: p.site ?? '',
          whatsapp: p.whatsapp ?? '',
          whatsapp_exclusivo: p.whatsapp_exclusivo ?? true,
          rua: p.rua ?? '',
          numero: p.numero ?? '',
          complemento: p.complemento ?? '',
          bairro: p.bairro ?? '',
          cidade: p.cidade ?? '',
          estado: p.estado ?? '',
          cep: p.cep ?? '',
          ponto_referencia: p.ponto_referencia ?? '',
          dias_atendimento: p.dias_atendimento ?? '',
          horario_seg_sex: p.horario_seg_sex ?? '',
          horario_sabado: p.horario_sabado ?? '',
          pausa_almoco: p.pausa_almoco ?? '',
          capacidade_dia: p.capacidade_dia?.toString() ?? '',
          tempo_entre_atendimentos: p.tempo_entre_atendimentos?.toString() ?? '',
          tolerancia_atraso: p.tolerancia_atraso?.toString() ?? '',
          antecedencia_cancelamento: p.antecedencia_cancelamento?.toString() ?? '',
          politica_agendamento: p.politica_agendamento ?? '',
          avaliacao_gratuita: p.avaliacao_gratuita ?? '',
          formas_pagamento: p.formas_pagamento ?? '',
          aceita_parcelamento: p.aceita_parcelamento ?? true,
          regras_parcelamento: p.regras_parcelamento ?? '',
          desconto_vista: p.desconto_vista?.toString() ?? '',
          politica_entrada: p.politica_entrada ?? '',
          politica_reembolso: p.politica_reembolso ?? '',
          beneficios_fidelidade: p.beneficios_fidelidade ?? '',
          apresentacao_agente: p.apresentacao_agente ?? '',
          tom_comunicacao: p.tom_comunicacao ?? '',
          frases_proibidas: p.frases_proibidas ?? '',
          objecoes_comuns: p.objecoes_comuns ?? '',
          argumentos_persuasao: p.argumentos_persuasao ?? '',
          procedimentos_prioritarios: p.procedimentos_prioritarios ?? '',
          regras_limitacoes: p.regras_limitacoes ?? '',
          regras_internas: p.regras_internas ?? '',
          contraindicacoes_gerais: p.contraindicacoes_gerais ?? '',
          restricoes_saude: p.restricoes_saude ?? '',
          outras_restricoes: p.outras_restricoes ?? '',
          autoriza_whatsapp: p.autoriza_whatsapp ?? true,
          autoriza_acesso_conversas: p.autoriza_acesso_conversas ?? true,
        });
      }
      if (data.faq?.length) setFaq(data.faq);
      if (data.depoimentos?.length) setDepoimentos(data.depoimentos);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const payload = {
        ...form,
        capacidade_dia: form.capacidade_dia ? parseInt(form.capacidade_dia) : null,
        tempo_entre_atendimentos: form.tempo_entre_atendimentos ? parseInt(form.tempo_entre_atendimentos) : null,
        tolerancia_atraso: form.tolerancia_atraso ? parseInt(form.tolerancia_atraso) : null,
        antecedencia_cancelamento: form.antecedencia_cancelamento ? parseInt(form.antecedencia_cancelamento) : null,
        desconto_vista: form.desconto_vista ? parseInt(form.desconto_vista) : null,
        faq,
        depoimentos,
      };
      const res = await fetch(`/api/clinica/${slug}/perfil`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-[#1A1A2E] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-white">Dados da Clínica</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Informações que alimentam o agente de IA
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 max-w-3xl">

        {/* Seção 1 — Identidade */}
        <Section title="1. Identidade" open={!!openSections.s1} onToggle={() => toggleSection('s1')}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nome da clínica">
              <input className={inputCls} value={form.nome_clinica} onChange={e => set('nome_clinica', e.target.value)} placeholder="Ex: Studio Bella" />
            </Field>
            <Field label="Nome do responsável">
              <input className={inputCls} value={form.nome_responsavel} onChange={e => set('nome_responsavel', e.target.value)} placeholder="Dr(a). Nome" />
            </Field>
            <Field label="Cargo / Formação">
              <input className={inputCls} value={form.cargo_formacao} onChange={e => set('cargo_formacao', e.target.value)} placeholder="Ex: Biomédica esteta" />
            </Field>
            <Field label="Registro profissional">
              <input className={inputCls} value={form.registro_profissional} onChange={e => set('registro_profissional', e.target.value)} placeholder="CRM / CRBM / Conselho" />
            </Field>
            <Field label="CNPJ">
              <input className={inputCls} value={form.cnpj} onChange={e => set('cnpj', e.target.value)} placeholder="00.000.000/0001-00" />
            </Field>
            <Field label="Instagram">
              <input className={inputCls} value={form.instagram} onChange={e => set('instagram', e.target.value)} placeholder="@usuario" />
            </Field>
            <Field label="Site">
              <input className={inputCls} value={form.site} onChange={e => set('site', e.target.value)} placeholder="https://..." />
            </Field>
          </div>
          <Field label="Mini currículo">
            <textarea className={textareaCls} value={form.mini_curriculum} onChange={e => set('mini_curriculum', e.target.value)} placeholder="Breve apresentação profissional..." />
          </Field>
        </Section>

        {/* Seção 2 — Contato e Localização */}
        <Section title="2. Contato e Localização" open={!!openSections.s2} onToggle={() => toggleSection('s2')}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="WhatsApp">
              <input className={inputCls} value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="(11) 99999-9999" />
            </Field>
            <Field label="WhatsApp exclusivo para agendamentos?">
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input type="checkbox" checked={form.whatsapp_exclusivo} onChange={e => set('whatsapp_exclusivo', e.target.checked)} className="accent-violet-600 w-4 h-4" />
                <span className="text-slate-300 text-sm">Sim</span>
              </label>
            </Field>
            <Field label="Rua">
              <input className={inputCls} value={form.rua} onChange={e => set('rua', e.target.value)} placeholder="Rua/Av." />
            </Field>
            <Field label="Número">
              <input className={inputCls} value={form.numero} onChange={e => set('numero', e.target.value)} placeholder="123" />
            </Field>
            <Field label="Complemento">
              <input className={inputCls} value={form.complemento} onChange={e => set('complemento', e.target.value)} placeholder="Sala 2, Apto..." />
            </Field>
            <Field label="Bairro">
              <input className={inputCls} value={form.bairro} onChange={e => set('bairro', e.target.value)} />
            </Field>
            <Field label="Cidade">
              <input className={inputCls} value={form.cidade} onChange={e => set('cidade', e.target.value)} />
            </Field>
            <Field label="Estado">
              <input className={inputCls} value={form.estado} onChange={e => set('estado', e.target.value)} placeholder="SP" maxLength={2} />
            </Field>
            <Field label="CEP">
              <input className={inputCls} value={form.cep} onChange={e => set('cep', e.target.value)} placeholder="00000-000" />
            </Field>
          </div>
          <Field label="Ponto de referência">
            <input className={inputCls} value={form.ponto_referencia} onChange={e => set('ponto_referencia', e.target.value)} placeholder="Próximo ao shopping..." />
          </Field>
        </Section>

        {/* Seção 3 — Operação e Agendamento */}
        <Section title="3. Operação e Agendamento" open={!!openSections.s3} onToggle={() => toggleSection('s3')}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Dias de atendimento">
              <input className={inputCls} value={form.dias_atendimento} onChange={e => set('dias_atendimento', e.target.value)} placeholder="Seg a Sex, Sábado" />
            </Field>
            <Field label="Horário Seg–Sex">
              <input className={inputCls} value={form.horario_seg_sex} onChange={e => set('horario_seg_sex', e.target.value)} placeholder="09h às 19h" />
            </Field>
            <Field label="Horário Sábado">
              <input className={inputCls} value={form.horario_sabado} onChange={e => set('horario_sabado', e.target.value)} placeholder="09h às 14h" />
            </Field>
            <Field label="Pausa almoço">
              <input className={inputCls} value={form.pausa_almoco} onChange={e => set('pausa_almoco', e.target.value)} placeholder="12h às 13h" />
            </Field>
            <Field label="Capacidade/dia (atendimentos)">
              <input type="number" className={inputCls} value={form.capacidade_dia} onChange={e => set('capacidade_dia', e.target.value)} placeholder="8" />
            </Field>
            <Field label="Tempo entre atendimentos (min)">
              <input type="number" className={inputCls} value={form.tempo_entre_atendimentos} onChange={e => set('tempo_entre_atendimentos', e.target.value)} placeholder="15" />
            </Field>
            <Field label="Tolerância de atraso (min)">
              <input type="number" className={inputCls} value={form.tolerancia_atraso} onChange={e => set('tolerancia_atraso', e.target.value)} placeholder="10" />
            </Field>
            <Field label="Antecedência cancelamento (horas)">
              <input type="number" className={inputCls} value={form.antecedencia_cancelamento} onChange={e => set('antecedencia_cancelamento', e.target.value)} placeholder="24" />
            </Field>
          </div>
          <Field label="Política de agendamento">
            <textarea className={textareaCls} value={form.politica_agendamento} onChange={e => set('politica_agendamento', e.target.value)} placeholder="Descreva as regras de agendamento..." />
          </Field>
          <Field label="Avaliação gratuita">
            <textarea className={textareaCls} value={form.avaliacao_gratuita} onChange={e => set('avaliacao_gratuita', e.target.value)} placeholder="Detalhes sobre a avaliação inicial gratuita..." />
          </Field>
        </Section>

        {/* Seção 4 — Pagamento */}
        <Section title="4. Pagamento" open={!!openSections.s4} onToggle={() => toggleSection('s4')}>
          <Field label="Formas de pagamento">
            <input className={inputCls} value={form.formas_pagamento} onChange={e => set('formas_pagamento', e.target.value)} placeholder="Pix, Cartão de crédito, Dinheiro" />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Aceita parcelamento?">
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input type="checkbox" checked={form.aceita_parcelamento} onChange={e => set('aceita_parcelamento', e.target.checked)} className="accent-violet-600 w-4 h-4" />
                <span className="text-slate-300 text-sm">Sim</span>
              </label>
            </Field>
            <Field label="Desconto à vista (%)">
              <input type="number" className={inputCls} value={form.desconto_vista} onChange={e => set('desconto_vista', e.target.value)} placeholder="10" />
            </Field>
          </div>
          <Field label="Regras de parcelamento">
            <textarea className={textareaCls} value={form.regras_parcelamento} onChange={e => set('regras_parcelamento', e.target.value)} placeholder="Ex: até 12x no cartão sem juros" />
          </Field>
          <Field label="Política de entrada">
            <textarea className={textareaCls} value={form.politica_entrada} onChange={e => set('politica_entrada', e.target.value)} placeholder="Ex: 50% no ato do agendamento" />
          </Field>
          <Field label="Política de reembolso">
            <textarea className={textareaCls} value={form.politica_reembolso} onChange={e => set('politica_reembolso', e.target.value)} placeholder="Ex: reembolso em até 7 dias..." />
          </Field>
          <Field label="Benefícios de fidelidade">
            <textarea className={textareaCls} value={form.beneficios_fidelidade} onChange={e => set('beneficios_fidelidade', e.target.value)} placeholder="Ex: cartão fidelidade, desconto progressivo..." />
          </Field>
        </Section>

        {/* Seção 5 — Configuração do Agente */}
        <Section title="5. Configuração do Agente" open={!!openSections.s5} onToggle={() => toggleSection('s5')}>
          <Field label="Apresentação do agente">
            <textarea className={textareaCls} value={form.apresentacao_agente} onChange={e => set('apresentacao_agente', e.target.value)} placeholder="Como o agente deve se apresentar..." />
          </Field>
          <Field label="Tom de comunicação">
            <input className={inputCls} value={form.tom_comunicacao} onChange={e => set('tom_comunicacao', e.target.value)} placeholder="Ex: Profissional e acolhedor, sem gírias" />
          </Field>
          <Field label="Frases proibidas">
            <textarea className={textareaCls} value={form.frases_proibidas} onChange={e => set('frases_proibidas', e.target.value)} placeholder="Lista de frases que o agente não pode usar..." />
          </Field>
          <Field label="Objeções comuns e como tratar">
            <textarea className={`${textareaCls} min-h-[100px]`} value={form.objecoes_comuns} onChange={e => set('objecoes_comuns', e.target.value)} placeholder="Ex: 'É caro' → explicar custo-benefício e parcelamento..." />
          </Field>
          <Field label="Argumentos de persuasão">
            <textarea className={`${textareaCls} min-h-[100px]`} value={form.argumentos_persuasao} onChange={e => set('argumentos_persuasao', e.target.value)} placeholder="Principais diferenciais e argumentos de venda..." />
          </Field>
          <Field label="Procedimentos prioritários (focar vendas)">
            <input className={inputCls} value={form.procedimentos_prioritarios} onChange={e => set('procedimentos_prioritarios', e.target.value)} placeholder="Ex: Microagulhamento, Hidratação Labial" />
          </Field>
          <Field label="Regras e limitações do agente">
            <textarea className={textareaCls} value={form.regras_limitacoes} onChange={e => set('regras_limitacoes', e.target.value)} placeholder="O que o agente pode e não pode fazer..." />
          </Field>
          <Field label="Regras internas da clínica">
            <textarea className={textareaCls} value={form.regras_internas} onChange={e => set('regras_internas', e.target.value)} placeholder="Regras específicas do negócio..." />
          </Field>
        </Section>

        {/* Seção 6 — FAQ */}
        <Section title="6. Perguntas Frequentes (FAQ)" open={!!openSections.s6} onToggle={() => toggleSection('s6')}>
          <div className="space-y-3">
            {faq.map((item, i) => (
              <div key={i} className="bg-[#0F0F1A] rounded-lg p-3 border border-[#2A2A3E] space-y-2">
                <input
                  className={inputCls}
                  value={item.pergunta}
                  onChange={e => setFaq(prev => prev.map((f, idx) => idx === i ? { ...f, pergunta: e.target.value } : f))}
                  placeholder="Pergunta"
                />
                <textarea
                  className={textareaCls}
                  value={item.resposta}
                  onChange={e => setFaq(prev => prev.map((f, idx) => idx === i ? { ...f, resposta: e.target.value } : f))}
                  placeholder="Resposta"
                />
                <button
                  type="button"
                  onClick={() => setFaq(prev => prev.filter((_, idx) => idx !== i))}
                  className="text-red-400 text-xs hover:text-red-300 transition-colors"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setFaq(prev => [...prev, { pergunta: '', resposta: '' }])}
            className="mt-2 text-violet-400 text-sm hover:text-violet-300 transition-colors"
          >
            + Adicionar pergunta
          </button>
        </Section>

        {/* Seção 7 — Depoimentos */}
        <Section title="7. Depoimentos" open={!!openSections.s7} onToggle={() => toggleSection('s7')}>
          <div className="space-y-3">
            {depoimentos.map((item, i) => (
              <div key={i} className="bg-[#0F0F1A] rounded-lg p-3 border border-[#2A2A3E] space-y-2">
                <input
                  className={inputCls}
                  value={item.nome_paciente}
                  onChange={e => setDepoimentos(prev => prev.map((d, idx) => idx === i ? { ...d, nome_paciente: e.target.value } : d))}
                  placeholder="Nome do paciente"
                />
                <textarea
                  className={textareaCls}
                  value={item.depoimento}
                  onChange={e => setDepoimentos(prev => prev.map((d, idx) => idx === i ? { ...d, depoimento: e.target.value } : d))}
                  placeholder="Depoimento"
                />
                <button
                  type="button"
                  onClick={() => setDepoimentos(prev => prev.filter((_, idx) => idx !== i))}
                  className="text-red-400 text-xs hover:text-red-300 transition-colors"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setDepoimentos(prev => [...prev, { nome_paciente: '', depoimento: '' }])}
            className="mt-2 text-violet-400 text-sm hover:text-violet-300 transition-colors"
          >
            + Adicionar depoimento
          </button>
        </Section>

        {/* Seção 8 — Contra-indicações Gerais */}
        <Section title="8. Contra-indicações Gerais" open={!!openSections.s8} onToggle={() => toggleSection('s8')}>
          <Field label="Contra-indicações gerais">
            <textarea className={`${textareaCls} min-h-[100px]`} value={form.contraindicacoes_gerais} onChange={e => set('contraindicacoes_gerais', e.target.value)} placeholder="Liste as contra-indicações gerais da clínica..." />
          </Field>
          <Field label="Restrições de saúde">
            <textarea className={textareaCls} value={form.restricoes_saude} onChange={e => set('restricoes_saude', e.target.value)} placeholder="Condições de saúde que impedem atendimento..." />
          </Field>
          <Field label="Outras restrições">
            <textarea className={textareaCls} value={form.outras_restricoes} onChange={e => set('outras_restricoes', e.target.value)} placeholder="Outras restrições específicas..." />
          </Field>
        </Section>

        {/* Seção 9 — Autorizações */}
        <Section title="9. Autorizações" open={!!openSections.s9} onToggle={() => toggleSection('s9')}>
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.autoriza_whatsapp}
                onChange={e => set('autoriza_whatsapp', e.target.checked)}
                className="accent-violet-600 w-4 h-4 mt-0.5 flex-shrink-0"
              />
              <div>
                <p className="text-slate-200 text-sm font-medium">Autoriza uso do WhatsApp</p>
                <p className="text-slate-500 text-xs mt-0.5">Permite que o agente interaja com pacientes via WhatsApp</p>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.autoriza_acesso_conversas}
                onChange={e => set('autoriza_acesso_conversas', e.target.checked)}
                className="accent-violet-600 w-4 h-4 mt-0.5 flex-shrink-0"
              />
              <div>
                <p className="text-slate-200 text-sm font-medium">Autoriza acesso às conversas</p>
                <p className="text-slate-500 text-xs mt-0.5">Permite análise das conversas para melhoria do agente</p>
              </div>
            </label>
          </div>
        </Section>

        {/* Botão Salvar */}
        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
          {saved && (
            <span className="text-green-400 text-sm">Salvo com sucesso!</span>
          )}
        </div>
      </form>
    </div>
  );
}
