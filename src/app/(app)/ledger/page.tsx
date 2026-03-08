'use client';

import { useState, useMemo } from 'react';
import { useRepository } from '@/providers/RepositoryProvider';
import { Transaction } from '@/lib/types';
import { ACCOUNTS, getAccountById } from '@/lib/constants/accounts';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LedgerPage() {
  const { transactionRepo } = useRepository();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accountId, setAccountId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const accountOptions = ACCOUNTS.map((a) => ({ value: a.id, label: a.name }));

  const handleSearch = async () => {
    if (!accountId) return;
    setLoading(true);
    try {
      const all = await transactionRepo.getAll();
      const filtered = all.filter((tx) => {
        const matchAccount = tx.debitAccountId === accountId || tx.creditAccountId === accountId;
        if (!matchAccount) return false;
        if (startDate && tx.date < startDate) return false;
        if (endDate && tx.date > endDate) return false;
        return true;
      });
      filtered.sort((a, b) => a.date.localeCompare(b.date));
      setTransactions(filtered);
    } finally {
      setLoading(false);
    }
  };

  const account = getAccountById(accountId);
  const isDebitNormal = account && (account.type === 'asset' || account.type === 'expense');

  const ledgerRows = useMemo(() => {
    let balance = 0;
    return transactions.map((tx) => {
      const isDebit = tx.debitAccountId === accountId;
      const debit = isDebit ? tx.amount : 0;
      const credit = isDebit ? 0 : tx.amount;
      if (isDebitNormal) {
        balance += debit - credit;
      } else {
        balance += credit - debit;
      }
      return { tx, debit, credit, balance };
    });
  }, [transactions, accountId, isDebitNormal]);

  const totals = useMemo(() => {
    let totalDebit = 0;
    let totalCredit = 0;
    for (const row of ledgerRows) {
      totalDebit += row.debit;
      totalCredit += row.credit;
    }
    return { totalDebit, totalCredit, balance: ledgerRows.length > 0 ? ledgerRows[ledgerRows.length - 1].balance : 0 };
  }, [ledgerRows]);

  const handleCsvExport = () => {
    if (ledgerRows.length === 0) return;
    const bom = '\uFEFF';
    const header = '日付,摘要,相手科目,借方,貸方,残高\n';
    const rows = ledgerRows.map((r) => {
      const counterpart = r.tx.debitAccountId === accountId
        ? getAccountById(r.tx.creditAccountId)?.name || ''
        : getAccountById(r.tx.debitAccountId)?.name || '';
      return `${r.tx.date},"${r.tx.description}","${counterpart}",${r.debit},${r.credit},${r.balance}`;
    }).join('\n');
    const blob = new Blob([bom + header + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledger_${account?.name || accountId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card title="条件指定">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Select label="勘定科目 *" options={accountOptions} placeholder="-- 選択 --" value={accountId} onChange={(e) => setAccountId(e.target.value)} />
          <Input label="開始日" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input label="終了日" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div className="mt-4 flex gap-2">
          <Button onClick={handleSearch} disabled={!accountId || loading}>
            {loading ? '読込中...' : '表示'}
          </Button>
          {ledgerRows.length > 0 && (
            <Button variant="secondary" onClick={handleCsvExport}>CSV出力</Button>
          )}
        </div>
      </Card>

      {ledgerRows.length > 0 && (
        <div className="-mx-6 sm:mx-0 overflow-x-auto sm:rounded-xl border border-gray-100 shadow-md">
          <table className="min-w-[700px] w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">日付</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">摘要</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">相手科目</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">借方</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">貸方</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">残高</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ledgerRows.map((row, i) => {
                const counterpart = row.tx.debitAccountId === accountId
                  ? getAccountById(row.tx.creditAccountId)?.name
                  : getAccountById(row.tx.debitAccountId)?.name;
                return (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm">{formatDate(row.tx.date)}</td>
                    <td className="px-4 py-2 text-sm text-gray-500 max-w-[160px] truncate">{row.tx.description}</td>
                    <td className="px-4 py-2 text-sm">{counterpart}</td>
                    <td className="px-4 py-2 text-sm text-right font-mono">{row.debit > 0 ? formatCurrency(row.debit) : ''}</td>
                    <td className="px-4 py-2 text-sm text-right font-mono">{row.credit > 0 ? formatCurrency(row.credit) : ''}</td>
                    <td className="px-4 py-2 text-sm text-right font-mono font-semibold">{formatCurrency(row.balance)}</td>
                  </tr>
                );
              })}
              <tr className="bg-gray-50 font-semibold">
                <td colSpan={3} className="px-4 py-2 text-sm text-right">合計</td>
                <td className="px-4 py-2 text-sm text-right font-mono">{formatCurrency(totals.totalDebit)}</td>
                <td className="px-4 py-2 text-sm text-right font-mono">{formatCurrency(totals.totalCredit)}</td>
                <td className="px-4 py-2 text-sm text-right font-mono">{formatCurrency(totals.balance)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
