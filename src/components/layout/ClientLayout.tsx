'use client';

import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { RepositoryProvider } from '@/providers/RepositoryProvider';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <RepositoryProvider>
      <Sidebar />
      <div className="lg:ml-64 min-h-screen">
        <Header />
        <main className="px-6 py-6 lg:px-8">{children}</main>
      </div>
    </RepositoryProvider>
  );
}
