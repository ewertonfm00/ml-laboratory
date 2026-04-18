'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface SidebarProps {
  slug?: string;
  projetoNome?: string;
  pendentesValidacao?: number;
}

const menuItems = (slug: string) => [
  {
    href: `/p/${slug}`,
    label: 'Visão Geral',
    icon: '📊',
    exact: true,
  },
  {
    href: `/p/${slug}/numeros`,
    label: 'Números',
    icon: '📱',
  },
  {
    href: `/p/${slug}/validacao/fila`,
    label: 'Validação',
    icon: '✅',
    badge: true,
  },
  {
    href: `/p/${slug}/agente`,
    label: 'Perfil do Agente',
    icon: '🧠',
  },
  {
    href: `/p/${slug}/skills`,
    label: 'Skills',
    icon: '📋',
  },
  {
    href: `/p/${slug}/clinica`,
    label: 'Dados da Clínica',
    icon: '🏥',
  },
  {
    href: `/p/${slug}/procedimentos`,
    label: 'Procedimentos',
    icon: '💆',
  },
];

export default function Sidebar({ slug, projetoNome, pendentesValidacao = 0 }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const items = slug ? menuItems(slug) : [];

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-lg text-xl"
        aria-label="Toggle menu"
      >
        {mobileOpen ? '✕' : '☰'}
      </button>

      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-14 left-0 bottom-0 z-40 w-60 bg-[#1A1A2E] border-r border-[#2A2A3E] flex flex-col transition-transform duration-200
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Project header */}
        <div className="px-4 py-4 border-b border-[#2A2A3E]">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white text-xs mb-3 transition-colors">
            ← Todos os projetos
          </Link>
          {projetoNome && (
            <p className="text-white font-medium text-sm truncate">{projetoNome}</p>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto">
          {slug ? (
            <ul className="space-y-1">
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                      ${isActive(item.href, item.exact)
                        ? 'bg-violet-600/20 text-violet-300 font-medium'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && pendentesValidacao > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                        {pendentesValidacao}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-slate-500 text-xs px-3 py-2">
              Selecione um projeto
            </div>
          )}
        </nav>

        {/* Bottom links */}
        <div className="px-3 py-3 border-t border-[#2A2A3E]">
          <Link
            href="/numeros/conectar"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-violet-400 hover:text-violet-300 hover:bg-violet-600/10 transition-colors"
          >
            <span>➕</span>
            <span>Conectar Número</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
