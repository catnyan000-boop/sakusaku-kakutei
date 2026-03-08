'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'ダッシュボード' },
  { href: '/transactions', label: '仕訳' },
  { href: '/search', label: '検索' },
  { href: '/ledger', label: '元帳' },
  { href: '/import', label: 'インポート' },
  { href: '/katei-anbun', label: '家事按分' },
  { href: '/reports', label: 'レポート' },
  { href: '/settings', label: '設定' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 rounded-lg bg-white p-2 shadow-md lg:hidden"
        aria-label="メニュー"
      >
        <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-full w-64 border-r transition-transform lg:translate-x-0 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: 'var(--color-sidebar-bg)', borderColor: 'var(--color-sidebar-border)' }}
      >
        <div className="flex h-16 items-center border-b px-6" style={{ borderColor: 'var(--color-sidebar-border)' }}>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--color-sidebar-title)' }}>
            サクサク確定申告
          </h1>
        </div>
        <nav className="mt-6 flex-1 space-y-1 px-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`block rounded-lg py-2.5 pl-4 pr-4 text-sm font-medium transition-all ${
                isActive(item.href) ? 'border-l-4' : 'border-l-4 border-transparent hover:bg-white/50'
              }`}
              style={
                isActive(item.href)
                  ? {
                      borderLeftColor: 'var(--color-sidebar-active-text)',
                      backgroundColor: 'var(--color-sidebar-active-bg)',
                      color: 'var(--color-sidebar-active-text)',
                    }
                  : { color: 'var(--color-sidebar-text)' }
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t" style={{ borderColor: 'var(--color-sidebar-border)' }}>
          <button
            onClick={handleLogout}
            className="w-full rounded-lg py-2.5 pl-4 pr-4 text-sm font-medium text-left border-l-4 border-transparent hover:bg-white/50 transition-all"
            style={{ color: 'var(--color-sidebar-text)' }}
          >
            ログアウト
          </button>
        </div>
      </aside>
    </>
  );
}
