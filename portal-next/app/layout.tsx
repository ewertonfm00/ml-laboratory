import type { Metadata } from 'next';
import './globals.css';
import Topbar from '@/components/Topbar';

export const metadata: Metadata = {
  title: 'ML Laboratory',
  description: 'Portal de gestão do ML Laboratory',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <Topbar />
        <main className="pt-14 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
