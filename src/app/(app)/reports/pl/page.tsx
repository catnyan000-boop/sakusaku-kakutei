'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRepository } from '@/providers/RepositoryProvider';
import { Transaction, KateiAnbun } from '@/lib/types';
import { generatePL } from '@/lib/services/report.service';
import { formatCurrency } from '@/lib/utils/format';
import { generatePdfFromElement } from '@/lib/utils/pdf';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { YearSelector } from '@/components/reports/YearSelector';
import { DisclaimerText } from '@/components/reports/DisclaimerText';

export default function PLReportPage() {
  const { transactionRepo, kateiAnbunRepo } = useRepository();
  const [year, setYear] = useState(new Date().getFullYear());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [kateiAnbunList, setKateiAnbunList] = useState<KateiAnbun[]>([]);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      transactionRepo.getAll(),
      kateiAnbunRepo.getAll(),
    ]).then(([txData, kaData]) => {
      setTransactions(txData);
      setKateiAnbunList(kaData);
      setLoading(false);
    });
  }, [transactionRepo, kateiAnbunRepo]);

  const report = useMemo(() => {
    const yearStr = String(year);
    const filtered = transactions.filter((tx) => tx.date.startsWith(yearStr));
    const kateiAnbunMap = new Map<string, number>();
    for (const ka of kateiAnbunList) {
      kateiAnbunMap.set(ka.accountId, ka.businessRatio);
    }
    return generatePL(filtered, kateiAnbunMap);
  }, [transactions, kateiAnbunList, year]);

  const handlePdf = async () => {
    if (!reportRef.current) return;
    await generatePdfFromElement(reportRef.current, `pl_${year}.pdf`);
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-400">読み込み中...</div>;
  }

  return (
    <div className="space-y-6">
      <Card
        title="損益計算書"
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
            <table className="min-w-[500px] w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    科目名
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    按分率
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    金額
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* 収入の部 */}
                <tr className="bg-gray-50">
                  <td
                    colSpan={3}
                    className="px-4 py-2 text-sm font-semibold"
                    style={{ color: 'var(--color-heading)' }}
                  >
                    収入の部
                  </td>
                </tr>
                {report.revenueRows.map((row) => (
                  <tr key={row.accountId} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm">{row.accountName}</td>
                    <td className="px-4 py-2 text-sm text-right font-mono text-gray-400">
                      {row.businessRatio < 100 ? `${row.businessRatio}%` : ''}
                    </td>
                    <td className="px-4 py-2 text-sm text-right font-mono">
                      {formatCurrency(row.adjustedAmount)}
                    </td>
                  </tr>
                ))}
                {report.revenueRows.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-sm text-gray-400 text-center">
                      データなし
                    </td>
                  </tr>
                )}
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-4 py-2 text-sm text-right" colSpan={2}>
                    収入合計
                  </td>
                  <td className="px-4 py-2 text-sm text-right font-mono">
                    {formatCurrency(report.totalRevenue)}
                  </td>
                </tr>

                {/* 売上原価 */}
                {report.costRow && (
                  <>
                    <tr className="bg-gray-50">
                      <td
                        colSpan={3}
                        className="px-4 py-2 text-sm font-semibold"
                        style={{ color: 'var(--color-heading)' }}
                      >
                        売上原価
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm">{report.costRow.accountName}</td>
                      <td className="px-4 py-2 text-sm text-right font-mono text-gray-400">
                        {report.costRow.businessRatio < 100
                          ? `${report.costRow.businessRatio}%`
                          : ''}
                      </td>
                      <td className="px-4 py-2 text-sm text-right font-mono">
                        {formatCurrency(report.costRow.adjustedAmount)}
                      </td>
                    </tr>
                  </>
                )}

                {/* 売上総利益 */}
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-4 py-2 text-sm text-right" colSpan={2}>
                    売上総利益
                  </td>
                  <td className="px-4 py-2 text-sm text-right font-mono">
                    {formatCurrency(report.grossProfit)}
                  </td>
                </tr>

                {/* 経費の部 */}
                <tr className="bg-gray-50">
                  <td
                    colSpan={3}
                    className="px-4 py-2 text-sm font-semibold"
                    style={{ color: 'var(--color-heading)' }}
                  >
                    経費の部
                  </td>
                </tr>
                {report.expenseRows.map((row) => (
                  <tr key={row.accountId} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm">{row.accountName}</td>
                    <td className="px-4 py-2 text-sm text-right font-mono text-gray-400">
                      {row.businessRatio < 100 ? `${row.businessRatio}%` : ''}
                    </td>
                    <td className="px-4 py-2 text-sm text-right font-mono">
                      {formatCurrency(row.adjustedAmount)}
                    </td>
                  </tr>
                ))}
                {report.expenseRows.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-sm text-gray-400 text-center">
                      データなし
                    </td>
                  </tr>
                )}
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-4 py-2 text-sm text-right" colSpan={2}>
                    経費合計
                  </td>
                  <td className="px-4 py-2 text-sm text-right font-mono">
                    {formatCurrency(report.totalExpense)}
                  </td>
                </tr>

                {/* 差引金額（利益） */}
                <tr className="font-bold" style={{ backgroundColor: 'var(--color-card-border)' }}>
                  <td className="px-4 py-3 text-sm text-right" colSpan={2}>
                    差引金額（利益）
                  </td>
                  <td
                    className="px-4 py-3 text-sm text-right font-mono"
                    style={{
                      color: report.profit >= 0 ? 'var(--color-accent)' : 'var(--color-danger)',
                    }}
                  >
                    {formatCurrency(report.profit)}
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
