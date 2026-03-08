'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRepository } from '@/providers/RepositoryProvider';
import { Card } from '@/components/ui/Card';
import { Toast } from '@/components/ui/Toast';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { TransactionFormData } from '@/lib/schemas/transaction.schema';

export default function NewTransactionPage() {
  const router = useRouter();
  const { transactionRepo } = useRepository();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (data: TransactionFormData) => {
    setLoading(true);
    try {
      await transactionRepo.create(data);
      setToast({ message: '仕訳を登録しました', type: 'success' });
      setTimeout(() => router.push('/transactions'), 1000);
    } catch {
      setToast({ message: '登録に失敗しました', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <Card title="仕訳登録">
        <TransactionForm onSubmit={handleSubmit} isLoading={loading} />
      </Card>
    </div>
  );
}
