'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ACCOUNTS } from '@/lib/constants/accounts';
import { transactionSchema, TransactionFormData } from '@/lib/schemas/transaction.schema';

interface TransactionFormProps {
  onSubmit: (data: TransactionFormData) => void;
  initialData?: Partial<TransactionFormData>;
  isLoading?: boolean;
  resetAfterSubmit?: boolean;
}

function stripCommas(s: string): string {
  return s.replace(/,/g, '');
}

function addCommas(s: string): string {
  const num = parseInt(stripCommas(s), 10);
  if (isNaN(num)) return s;
  return num.toLocaleString('ja-JP');
}

export function TransactionForm({ onSubmit, initialData, isLoading, resetAfterSubmit }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    date: initialData?.date || new Date().toISOString().split('T')[0],
    debitAccountId: initialData?.debitAccountId || '',
    creditAccountId: initialData?.creditAccountId || '',
    amountDisplay: initialData?.amount ? initialData.amount.toLocaleString('ja-JP') : '',
    taxIncluded: initialData?.taxIncluded ?? true,
    description: initialData?.description || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const accountOptions = ACCOUNTS.map((a) => ({
    value: a.id,
    label: a.name,
  }));

  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, '');
    setFormData((prev) => ({ ...prev, amountDisplay: raw ? addCommas(raw) : '' }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const amount = parseInt(stripCommas(formData.amountDisplay), 10);
    const data = {
      date: formData.date,
      debitAccountId: formData.debitAccountId,
      creditAccountId: formData.creditAccountId,
      amount: isNaN(amount) ? 0 : amount,
      taxIncluded: formData.taxIncluded,
      description: formData.description,
    };

    const result = transactionSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as string;
        if (!fieldErrors[field]) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    onSubmit(result.data);

    if (resetAfterSubmit) {
      setFormData({
        date: formData.date,
        debitAccountId: '',
        creditAccountId: '',
        amountDisplay: '',
        taxIncluded: true,
        description: '',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="日付"
        type="date"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        error={errors.date}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="借方科目"
          options={accountOptions}
          placeholder="-- 選択 --"
          value={formData.debitAccountId}
          onChange={(e) => setFormData({ ...formData, debitAccountId: e.target.value })}
          error={errors.debitAccountId}
        />
        <Select
          label="貸方科目"
          options={accountOptions}
          placeholder="-- 選択 --"
          value={formData.creditAccountId}
          onChange={(e) => setFormData({ ...formData, creditAccountId: e.target.value })}
          error={errors.creditAccountId}
        />
      </div>
      <Input
        label="金額"
        value={formData.amountDisplay}
        onChange={handleAmountChange}
        placeholder="例: 10,000"
        error={errors.amount}
      />
      <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-label)' }}>
        <input
          type="checkbox"
          checked={formData.taxIncluded}
          onChange={(e) => setFormData({ ...formData, taxIncluded: e.target.checked })}
          className="rounded"
        />
        税込
      </label>
      <Input
        label="摘要"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="取引の内容を入力"
        error={errors.description}
      />
      <div className="pt-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? '保存中...' : '保存'}
        </Button>
      </div>
    </form>
  );
}
