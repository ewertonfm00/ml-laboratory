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
