'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRepository } from '@/providers/RepositoryProvider';
import { Transaction } from '@/lib/types';
import { generateMonthlyData } from '@/lib/services/report.service';
import { getAccountById } from '@/lib/constants/accounts';
import { formatCurrency, formatYearMonth } from '@/lib/utils/format';
import { Card } from '@/components/ui/Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function DashboardPage() {
  const { transactionRepo } = useRepository();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    transactionRepo.getAll().then((data) => {
      setTransactions(data);
      setLoading(false);
    });
  }, []);

  const monthlyData = useMemo(() => generateMonthlyData(transactions), [transactions]);

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const thisMonth = useMemo(() => {
    let revenue = 0;
    let expense = 0;
    for (const tx of transactions) {
      if (!tx.date.startsWith(currentMonth)) continue;
      const credit = getAccountById(tx.creditAccountId);
      if (credit?.type === 'revenue') revenue += tx.amount;
      const debit = getAccountById(tx.debitAccountId);
      if (debit?.type === 'expense') expense += tx.amount;
    }
    return { revenue, expense, profit: revenue - expense };
  }, [transactions, currentMonth]);

  const chartData = useMemo(
    () =>
      monthlyData.map((d) => ({
        name: formatYearMonth(d.month),
        収入: d.revenue,
        支出: d.expense,
      })),
    [monthlyData],
  );

  if (loading) return <div className="text-center py-12 text-gray-400">読み込み中...</div>;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm" style={{ color: 'var(--color-label)' }}>今月の収入</p>
          <p className="text-2xl font-bold mt-1" style={{ color: 'var(--color-chart-revenue)' }}>
            {formatCurrency(thisMonth.revenue)}
          </p>
        </Card>
        <Card>
          <p className="text-sm" style={{ color: 'var(--color-label)' }}>今月の支出</p>
          <p className="text-2xl font-bold mt-1" style={{ color: 'var(--color-chart-expense)' }}>
            {formatCurrency(thisMonth.expense)}
          </p>
        </Card>
        <Card>
          <p className="text-sm" style={{ color: 'var(--color-label)' }}>差引</p>
          <p className="text-2xl font-bold mt-1" style={{ color: thisMonth.profit >= 0 ? 'var(--color-accent)' : 'var(--color-danger)' }}>
            {formatCurrency(thisMonth.profit)}
          </p>
        </Card>
      </div>

      {/* Monthly chart */}
      <Card title="月別収支">
        {chartData.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">データがありません</p>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `¥${(v / 10000).toFixed(0)}万`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="収入" fill="var(--color-chart-revenue)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="支出" fill="var(--color-chart-expense)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
}
