'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRepository } from '@/providers/RepositoryProvider';
import { Transaction, BSRow } from '@/lib/types';
import { generateBS } from '@/lib/services/report.service';
import { formatCurrency } from '@/lib/utils/format';
import { generatePdfFromElement } from '@/lib/utils/pdf';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { YearSelector } from '@/components/reports/YearSelector';
import { DisclaimerText } from '@/components/reports/DisclaimerText';

export default function BSReportPage() {
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

  const report = useMemo(() => {
    const yearStr = String(year);
    const filtered = transactions.filter((tx) => tx.date.startsWith(yearStr));
    return generateBS(filtered);
  }, [transactions, year]);

  const handlePdf = async () => {
    if (!reportRef.current) return;
    await generatePdfFromElement(reportRef.current, `bs_${year}.pdf`);
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">読み込み中...</div>;
  }

  const renderSection = (title: string, rows: BSRow[], total: number, totalLabel: string) => (
    <div>
      <h4
        className="text-sm font-semibold mb-2 px-1"
        style={{ color: 'var(--color-heading)' }}
      >
        {title}
      </h4>
      <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-md">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                科目名
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                金額
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-2 text-sm text-gray-400 text-center">
                  データなし
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.accountId} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm">{row.accountName}</td>
                <td className="px-4 py-2 text-sm text-right font-mono">
                  {formatCurrency(row.amount)}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50 font-semibold">
              <td className="px-4 py-2 text-sm text-right">{totalLabel}</td>
              <td className="px-4 py-2 text-sm text-right font-mono">
                {formatCurrency(total)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card
        title="貸借対照表"
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* 左: 資産の部 */}
            {renderSection('資産の部', report.assetRows, report.totalAssets, '資産合計')}

            {/* 右: 負債・資本の部 */}
            <div className="space-y-6">
              {renderSection(
                '負債の部',
                report.liabilityRows,
                report.totalLiabilities,
                '負債合計',
              )}
              {renderSection('資本の部', report.equityRows, report.totalEquity, '資本合計')}

              <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-md">
                <table className="w-full">
                  <tbody>
                    <tr
                      className="font-bold"
                      style={{ backgroundColor: 'var(--color-card-border)' }}
                    >
                      <td className="px-4 py-3 text-sm text-right">負債・資本合計</td>
                      <td className="px-4 py-3 text-sm text-right font-mono">
                        {formatCurrency(report.totalLiabilities + report.totalEquity)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <DisclaimerText />
    </div>
  );
}
