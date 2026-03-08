'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useRepository } from '@/providers/RepositoryProvider';
import { Transaction } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Toast } from '@/components/ui/Toast';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { TransactionFormData } from '@/lib/schemas/transaction.schema';

export default function EditTransactionPage() {
  const router = useRouter();
  const params = useParams();
  const { transactionRepo } = useRepository();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const load = async () => {
      const tx = await transactionRepo.getById(params.id as string);
      if (tx) setTransaction(tx);
    };
    load();
  }, [params.id]);

  const handleSubmit = async (data: TransactionFormData) => {
    setLoading(true);
    try {
      await transactionRepo.update(params.id as string, data);
      setToast({ message: '仕訳を更新しました', type: 'success' });
      setTimeout(() => router.push('/transactions'), 1000);
    } catch {
      setToast({ message: '更新に失敗しました', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!transaction) return <div className="text-center py-8 text-gray-500">読み込み中...</div>;

  return (
    <div className="max-w-2xl">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <Card title="仕訳編集">
        <TransactionForm onSubmit={handleSubmit} initialData={transaction} isLoading={loading} />
      </Card>
    </div>
  );
}
