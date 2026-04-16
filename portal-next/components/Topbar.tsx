'use client';

import Link from 'next/link';

export default function Topbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#0F0F1A] border-b border-[#2A2A3E] flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold text-xs">
          ML
        </div>
        <Link href="/" className="text-white font-semibold text-sm tracking-wide">
          ML Laboratory
        </Link>
      </div>
      <div className="flex items-center gap-3 text-sm text-slate-400">
        <span className="hidden sm:inline">ML Laboratory</span>
        <div className="w-8 h-8 rounded-full bg-violet-700 flex items-center justify-center text-white text-xs font-medium">
          OL
        </div>
      </div>
    </header>
  );
}
