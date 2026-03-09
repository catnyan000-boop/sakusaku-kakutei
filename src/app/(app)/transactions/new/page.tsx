'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRepository } from '@/providers/RepositoryProvider';
import { Template } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Toast } from '@/components/ui/Toast';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { TransactionFormData } from '@/lib/schemas/transaction.schema';

export default function NewTransactionPage() {
  const router = useRouter();
  const { transactionRepo, templateRepo } = useRepository();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  useEffect(() => {
    templateRepo.getAll().then(setTemplates).catch(() => {});
  }, [templateRepo]);

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

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
  };

  const handleTemplateClear = () => {
    setSelectedTemplate(null);
  };

  const initialData = selectedTemplate
    ? {
        debitAccountId: selectedTemplate.debitAccountId,
        creditAccountId: selectedTemplate.creditAccountId,
        amount: selectedTemplate.amount ?? undefined,
        taxIncluded: selectedTemplate.taxIncluded,
        description: selectedTemplate.description,
      }
    : undefined;

  return (
    <div className="max-w-2xl">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {templates.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-label)' }}>
            テンプレートから入力
          </p>
          <div className="flex flex-wrap gap-2">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium border transition-colors ${
                  selectedTemplate?.id === template.id
                    ? 'text-white'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                style={
                  selectedTemplate?.id === template.id
                    ? {
                        backgroundColor: 'var(--color-primary)',
                        borderColor: 'var(--color-primary)',
                      }
                    : undefined
                }
              >
                {template.name}
              </button>
            ))}
            {selectedTemplate && (
              <button
                onClick={handleTemplateClear}
                className="rounded-full px-3 py-1.5 text-sm font-medium text-gray-500 border border-dashed border-gray-300 hover:bg-gray-50 transition-colors"
              >
                クリア
              </button>
            )}
          </div>
        </div>
      )}

      <Card title="仕訳登録">
        <TransactionForm
          key={selectedTemplate?.id || 'new'}
          onSubmit={handleSubmit}
          isLoading={loading}
          initialData={initialData}
        />
      </Card>
    </div>
  );
}
