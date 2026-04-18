export interface Projeto {
  id: string;
  nome: string;
  slug: string;
  ativo: boolean;
  created_at: string;
}

export interface NumerosProjeto {
  id: string;
  projeto_id: string;
  numero_whatsapp: string;
  nome_identificador: string;
  setor: string;
  status: string;
  total_mensagens: number;
  ultima_mensagem_em: string | null;
}

export interface InstanciaEvolution {
  id: string;
  projeto_id: string;
  instance_name: string;
  api_url: string;
  api_key_ref: string;
  webhook_path: string;
  status: string;
}

export interface FilaValidacao {
  id: string;
  resposta_texto: string;
  contexto_conversa: string | null;
  produto_servico_detectado: string | null;
  confianca_deteccao: number | null;
  status: string;
  created_at: string;
}

export interface SkillCategoria {
  id: string;
  nome: string;
  tipo: string;
  subcategoria: string | null;
  ativa: boolean;
}

export interface Skill {
  id: string;
  categoria_id: string;
  nome: string;
  descricao: string | null;
  nivel_minimo: number;
  nivel_maximo: number;
  ativa: boolean;
}

export interface AgentePerfil {
  id: string;
  nome_agente: string;
  tipo_disc: string | null;
  perfil_resumo: string | null;
  estilo_comunicacao: string | null;
  updated_at: string;
}

export interface AgentePerformance {
  id: string;
  agente_id: string;
  metrica: string;
  valor: number;
  periodo: string;
}

export interface ClinicaPerfil {
  id: string;
  projeto_id: string;
  nome_clinica: string | null;
  nome_responsavel: string | null;
  cargo_formacao: string | null;
  mini_curriculum: string | null;
  registro_profissional: string | null;
  cnpj: string | null;
  instagram: string | null;
  site: string | null;
  whatsapp: string | null;
  whatsapp_exclusivo: boolean;
  rua: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  ponto_referencia: string | null;
  dias_atendimento: string | null;
  horario_seg_sex: string | null;
  horario_sabado: string | null;
  pausa_almoco: string | null;
  capacidade_dia: number | null;
  tempo_entre_atendimentos: number | null;
  tolerancia_atraso: number | null;
  antecedencia_cancelamento: number | null;
  politica_agendamento: string | null;
  avaliacao_gratuita: string | null;
  formas_pagamento: string | null;
  aceita_parcelamento: boolean;
  regras_parcelamento: string | null;
  desconto_vista: number | null;
  politica_entrada: string | null;
  politica_reembolso: string | null;
  beneficios_fidelidade: string | null;
  apresentacao_agente: string | null;
  tom_comunicacao: string | null;
  frases_proibidas: string | null;
  objecoes_comuns: string | null;
  argumentos_persuasao: string | null;
  procedimentos_prioritarios: string | null;
  regras_limitacoes: string | null;
  regras_internas: string | null;
  contraindicacoes_gerais: string | null;
  restricoes_saude: string | null;
  outras_restricoes: string | null;
  autoriza_whatsapp: boolean;
  autoriza_acesso_conversas: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClinicaFaq {
  id: string;
  projeto_id: string;
  pergunta: string;
  resposta: string;
  ordem: number;
  created_at: string;
}

export interface ClinicaDepoimento {
  id: string;
  projeto_id: string;
  nome_paciente: string;
  depoimento: string;
  ordem: number;
  created_at: string;
}

export interface ClinicaProcedimento {
  id: string;
  projeto_id: string;
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
  created_at: string;
  updated_at: string;
}

export interface ClinicaKnowledgeBase {
  id: string;
  projeto_id: string;
  conteudo: string;
  versao: number;
  updated_at: string;
}

export interface ConectarNumeroPayload {
  numero_whatsapp: string;
  projeto_id: string;
  setor: string;
  nome_identificador: string;
}

export interface ConectarNumeroResponse {
  success: boolean;
  instance_name?: string;
  qrcode?: string;
  status?: string;
  message?: string;
  error?: string;
}
