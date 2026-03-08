'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRepository } from '@/providers/RepositoryProvider';
import { Transaction } from '@/lib/types';
import { getAccountById } from '@/lib/constants/accounts';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';

export default function TransactionsPage() {
  const { transactionRepo } = useRepository();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await transactionRepo.getAll();
      setTransactions(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await transactionRepo.delete(deleteId);
      setToast({ message: '仕訳を削除しました', type: 'success' });
      setDeleteId(null);
      load();
    } catch {
      setToast({ message: '削除に失敗しました', type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--color-label)' }}>
          {loading ? '読み込み中...' : `${transactions.length}件`}
        </p>
        <Link href="/transactions/new">
          <Button size="sm">新規登録</Button>
        </Link>
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
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{formatDate(tx.date)}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{getAccountById(tx.debitAccountId)?.name || tx.debitAccountId}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{getAccountById(tx.creditAccountId)?.name || tx.creditAccountId}</td>
                <td className="px-4 py-3 text-sm text-right font-mono text-gray-900">{formatCurrency(tx.amount)}</td>
                <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate">{tx.description}</td>
                <td className="px-4 py-3 text-sm text-center whitespace-nowrap">
                  <Link href={`/transactions/${tx.id}/edit`} className="text-teal-600 hover:underline mr-3">
                    編集
                  </Link>
                  <button onClick={() => setDeleteId(tx.id)} className="text-red-600 hover:underline">
                    削除
                  </button>
                </td>
              </tr>
            ))}
            {!loading && transactions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">
                  仕訳データがありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="仕訳の削除"
        onConfirm={handleDelete}
        confirmLabel="削除する"
        confirmVariant="danger"
      >
        <p className="text-sm text-gray-600">この仕訳を削除してもよろしいですか？</p>
      </Modal>
    </div>
  );
}
