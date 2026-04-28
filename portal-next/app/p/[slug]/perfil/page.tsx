import { query } from '@/lib/db';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

interface ProjetoCompleto {
  id: string;
  nome: string;
  slug: string;
  responsavel: string | null;
  email: string | null;
  telefone: string | null;
  setor: string | null;
  onboarding_status: string;
  onboarding_token: string;
}

interface InstanciaEvolution {
  id: string;
  instance_name: string;
  api_url: string;
  api_key_ref: string;
  webhook_path: string;
  status: string;
}

async function getProjeto(slug: string): Promise<ProjetoCompleto | null> {
  try {
    const rows = await query<ProjetoCompleto>(
      `SELECT id, nome, slug, responsavel, email, telefone, setor, onboarding_status, onboarding_token
       FROM _plataforma.projetos WHERE slug = $1`,
      [slug]
    );
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

async function getInstancia(projetoId: string): Promise<InstanciaEvolution | null> {
  try {
    const rows = await query<InstanciaEvolution>(
      `SELECT id, instance_name, api_url, api_key_ref, webhook_path, status
       FROM _plataforma.instancias_evolution WHERE projeto_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [projetoId]
    );
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

function maskApiKey(key: string): string {
  if (key.length <= 8) return '****';
  return key.substring(0, 4) + '****' + key.substring(key.length - 4);
}

export default async function PerfilPage({ params }: Props) {
  const { slug } = await params;
  const projeto = await getProjeto(slug);

  if (!projeto) {
    notFound();
  }

  const instancia = await getInstancia(projeto.id);
  const portalUrl = process.env.PORTAL_URL ?? 'http://localhost:3000';
  const onboardingLink = `${portalUrl}/onboarding/${projeto.onboarding_token}`;

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Perfil do Parceiro</h1>
        <p className="text-slate-400 mt-1 text-sm">Dados cadastrais e status de conexão</p>
      </div>

      <div className="space-y-6">
        <div className="bg-[#1A1A2E] border border-[#2A2A3E] rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            🏢 Dados do Parceiro
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-slate-500 text-xs mb-1">Empresa</dt>
              <dd className="text-white text-sm">{projeto.nome}</dd>
            </div>
            <div>
              <dt className="text-slate-500 text-xs mb-1">Responsável</dt>
              <dd className="text-white text-sm">{projeto.responsavel ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500 text-xs mb-1">E-mail</dt>
              <dd className="text-white text-sm">{projeto.email ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500 text-xs mb-1">WhatsApp</dt>
              <dd className="text-white text-sm">{projeto.telefone ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500 text-xs mb-1">Setor</dt>
              <dd className="text-white text-sm">{projeto.setor ?? '—'}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-[#1A1A2E] border border-[#2A2A3E] rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            ⚡ Conexão Evolution
          </h2>

          <div className="flex items-center gap-3 mb-4">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              projeto.onboarding_status === 'conectado'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {projeto.onboarding_status === 'conectado' ? '● Conectado' : '● Pendente'}
            </span>
          </div>

          {instancia ? (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-slate-500 text-xs mb-1">Instância</dt>
                <dd className="text-white text-sm font-mono">{instancia.instance_name}</dd>
              </div>
              <div>
                <dt className="text-slate-500 text-xs mb-1">URL da Evolution</dt>
                <dd className="text-white text-sm truncate">{instancia.api_url}</dd>
              </div>
              <div>
                <dt className="text-slate-500 text-xs mb-1">API Key</dt>
                <dd className="text-slate-400 text-sm font-mono">{maskApiKey(instancia.api_key_ref)}</dd>
              </div>
              <div>
                <dt className="text-slate-500 text-xs mb-1">Webhook Path</dt>
                <dd className="text-slate-400 text-sm font-mono">{instancia.webhook_path}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-slate-500 text-sm">Nenhuma instância configurada ainda.</p>
          )}

          {projeto.onboarding_status === 'pendente' && (
            <div className="mt-4 pt-4 border-t border-[#2A2A3E]">
              <p className="text-slate-400 text-xs mb-2">Link de onboarding</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-[#0F0F1A] border border-[#2A2A3E] rounded px-3 py-2 text-violet-300 text-xs break-all">
                  {onboardingLink}
                </code>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
