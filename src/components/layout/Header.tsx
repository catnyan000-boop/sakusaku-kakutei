'use client';

import { usePathname } from 'next/navigation';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'ダッシュボード',
  '/transactions': '仕訳一覧',
  '/transactions/new': '仕訳登録',
  '/templates': 'テンプレート',
  '/search': '仕訳検索',
  '/ledger': '総勘定元帳',
  '/import': 'CSVインポート',
  '/katei-anbun': '家事按分',
  '/reports': 'レポート',
  '/reports/pl': '損益計算書',
  '/reports/bs': '貸借対照表',
  '/reports/monthly': '月別集計表',
  '/reports/tax': '税額シミュレーション',
  '/settings': '設定',
};

export function Header() {
  const pathname = usePathname();

  let title = PAGE_TITLES[pathname];
  if (!title && pathname.includes('/edit')) {
    title = '仕訳編集';
  }
  if (!title) {
    title = 'サクサク確定申告';
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center border-b border-gray-200 bg-white/80 backdrop-blur-sm px-6 lg:px-8">
      <div className="lg:hidden w-10" />
      <h2 className="text-lg font-bold" style={{ color: 'var(--color-heading)' }}>
        {title}
      </h2>
    </header>
  );
}
