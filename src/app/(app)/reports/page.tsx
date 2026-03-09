'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';

const REPORT_CARDS = [
  {
    href: '/reports/pl',
    icon: '\u{1F4CA}',
    title: '損益計算書',
    description: '売上・経費・利益を一覧表示',
  },
  {
    href: '/reports/bs',
    icon: '\u2696\uFE0F',
    title: '貸借対照表',
    description: '資産・負債・資本の状況',
  },
  {
    href: '/reports/monthly',
    icon: '\u{1F4C5}',
    title: '月別集計表',
    description: '月ごとの売上・仕入を表示',
  },
  {
    href: '/reports/tax',
    icon: '\u{1F9EE}',
    title: '税額シミュレーション',
    description: '所得税・住民税・事業税の概算',
  },
] as const;

export default function ReportsPage() {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-heading)' }}>
        レポート
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {REPORT_CARDS.map((card) => (
          <Link key={card.href} href={card.href} className="block no-underline">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <div className="flex items-start gap-3">
                <span className="text-2xl leading-none">{card.icon}</span>
                <div>
                  <h3 className="text-base font-semibold" style={{ color: 'var(--color-heading)' }}>
                    {card.title}
                  </h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--color-label)' }}>
                    {card.description}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
