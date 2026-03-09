'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRepository } from '@/providers/RepositoryProvider';
import { Transaction } from '@/lib/types';
import { generateMonthlyTable } from '@/lib/services/report.service';
import { formatCurrency } from '@/lib/utils/format';
import { generatePdfFromElement } from '@/lib/utils/pdf';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { YearSelector } from '@/components/reports/YearSelector';
import { DisclaimerText } from '@/components/reports/DisclaimerText';

export default function MonthlyReportPage() {
  const { transactionRepo } = useRepository();
  const [year, setYear] = useState(new Date().getFullYear());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    transactionRepo.getAll().then((data) => {
      setTransactions(data);
      setLoading(false);
    });
  }, [transactionRepo]);

  const rows = useMemo(
    () => generateMonthlyTable(transactions, year),
    [transactions, year],
  );

  const totals = useMemo(() => {
    let revenue = 0;
    let cost = 0;
    let expense = 0;
    let profit = 0;
    for (const row of rows) {
      revenue += row.revenue;
      cost += row.cost;
      expense += row.expense;
      profit += row.profit;
    }
    return { revenue, cost, expense, profit };
  }, [rows]);

  const handlePdf = async () => {
    if (!reportRef.current) return;
    await generatePdfFromElement(reportRef.current, `monthly_${year}.pdf`);
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">読み込み中...</div>;
  }

  return (
    <div className="space-y-6">
      <Card
        title="月別集計表"
        headerRight={
          <Button size="sm" variant="secondary" onClick={handlePdf}>
            PDF出力
          </Button>
        }
      >
        <div className="mb-4 max-w-xs">
          <YearSelector value={year} onChange={setYear} />
        </div>

        <div ref={reportRef}>
          <div className="-mx-6 sm:mx-0 overflow-x-auto sm:rounded-xl border border-gray-100 shadow-md">
            <table className="min-w-[600px] w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    月
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    売上高
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    仕入高
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    経費
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    差引利益
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rows.map((row, i) => (
                  <tr key={row.month} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm">{i + 1}月</td>
                    <td className="px-4 py-2 text-sm text-right font-mono">
                      {formatCurrency(row.revenue)}
                    </td>
                    <td className="px-4 py-2 text-sm text-right font-mono">
                      {formatCurrency(row.cost)}
                    </td>
                    <td className="px-4 py-2 text-sm text-right font-mono">
                      {formatCurrency(row.expense)}
                    </td>
                    <td
                      className="px-4 py-2 text-sm text-right font-mono"
                      style={{
                        color: row.profit >= 0 ? 'var(--color-accent)' : 'var(--color-danger)',
                      }}
                    >
                      {formatCurrency(row.profit)}
                    </td>
                  </tr>
                ))}

                {/* 合計行 */}
                <tr className="font-bold" style={{ backgroundColor: 'var(--color-card-border)' }}>
                  <td className="px-4 py-3 text-sm">合計</td>
                  <td className="px-4 py-3 text-sm text-right font-mono">
                    {formatCurrency(totals.revenue)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-mono">
                    {formatCurrency(totals.cost)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-mono">
                    {formatCurrency(totals.expense)}
                  </td>
                  <td
                    className="px-4 py-3 text-sm text-right font-mono"
                    style={{
                      color: totals.profit >= 0 ? 'var(--color-accent)' : 'var(--color-danger)',
                    }}
                  >
                    {formatCurrency(totals.profit)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <DisclaimerText />
    </div>
  );
}
