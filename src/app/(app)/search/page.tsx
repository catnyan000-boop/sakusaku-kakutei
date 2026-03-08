'use client';

import { useState } from 'react';
import { useRepository } from '@/providers/RepositoryProvider';
import { Transaction } from '@/lib/types';
import { ACCOUNTS, getAccountById } from '@/lib/constants/accounts';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

export default function SearchPage() {
  const { transactionRepo } = useRepository();
  const [keyword, setKeyword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [accountId, setAccountId] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [results, setResults] = useState<Transaction[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const accountOptions = ACCOUNTS.map((a) => ({ value: a.id, label: a.name }));

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await transactionRepo.search({
        keyword: keyword || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        accountId: accountId || undefined,
        minAmount: minAmount ? parseInt(minAmount, 10) : undefined,
        maxAmount: maxAmount ? parseInt(maxAmount, 10) : undefined,
      });
      setResults(data);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = results.reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="space-y-6">
      <Card title="検索条件">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input label="キーワード" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="摘要を検索" />
          <Input label="開始日" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input label="終了日" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <Select label="勘定科目" options={accountOptions} placeholder="すべて" value={accountId} onChange={(e) => setAccountId(e.target.value)} />
          <Input label="最低金額" type="number" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} placeholder="0" />
          <Input label="最高金額" type="number" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} placeholder="上限なし" />
        </div>
        <div className="mt-4">
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? '検索中...' : '検索'}
          </Button>
        </div>
      </Card>

      {searched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm" style={{ color: 'var(--color-label)' }}>
            <span>{results.length}件の結果</span>
            <span>合計: <strong>{formatCurrency(totalAmount)}</strong></span>
          </div>

          <div className="-mx-6 sm:mx-0 overflow-x-auto sm:rounded-xl border border-gray-100 shadow-md">
            <table className="min-w-[700px] w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">日付</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">借方</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">貸方</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">金額</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">摘要</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{formatDate(tx.date)}</td>
                    <td className="px-4 py-3 text-sm">{getAccountById(tx.debitAccountId)?.name}</td>
                    <td className="px-4 py-3 text-sm">{getAccountById(tx.creditAccountId)?.name}</td>
                    <td className="px-4 py-3 text-sm text-right font-mono">{formatCurrency(tx.amount)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate">{tx.description}</td>
                  </tr>
                ))}
                {results.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">該当する仕訳がありません</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
