import { query } from '@/lib/db';
import { Projeto } from '@/lib/types';
import ConectarNumeroForm from '@/components/ConectarNumeroForm';
import Link from 'next/link';

async function getProjetos(): Promise<Projeto[]> {
  try {
    return await query<Projeto>(
      `SELECT id, nome, slug, ativo FROM _plataforma.projetos WHERE ativo = true ORDER BY nome`
    );
  } catch (e) {
    console.error('Erro ao buscar projetos:', e);
    return [];
  }
}

export default async function ConectarNumeroPage() {
  const projetos = await getProjetos();

  return (
    <div className="p-6 md:p-8 max-w-lg mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:text-white transition-colors">Dashboard</Link>
        <span>›</span>
        <span className="text-slate-300">Conectar Número</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-white">Conectar Número WhatsApp</h1>
        <p className="text-slate-400 text-sm mt-1">
          Preencha os dados abaixo para criar uma instância e gerar o QR Code
        </p>
      </div>

      {/* Form card */}
      <div className="bg-[#1A1A2E] rounded-xl border border-[#2A2A3E] p-6">
        {projetos.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400">Nenhum projeto ativo encontrado.</p>
            <p className="text-slate-500 text-sm mt-1">
              Crie um projeto antes de conectar um número.
            </p>
          </div>
        ) : (
          <ConectarNumeroForm projetos={projetos} />
        )}
      </div>
    </div>
  );
}
