'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRepository } from '@/providers/RepositoryProvider';
import { Template } from '@/lib/types';
import { ACCOUNTS, getAccountById } from '@/lib/constants/accounts';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';

function stripCommas(s: string): string {
  return s.replace(/,/g, '');
}

function addCommas(s: string): string {
  const num = parseInt(stripCommas(s), 10);
  if (isNaN(num)) return s;
  return num.toLocaleString('ja-JP');
}

export default function TemplatesPage() {
  const { templateRepo } = useRepository();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [debitAccountId, setDebitAccountId] = useState('');
  const [creditAccountId, setCreditAccountId] = useState('');
  const [amountDisplay, setAmountDisplay] = useState('');
  const [taxIncluded, setTaxIncluded] = useState(true);
  const [description, setDescription] = useState('');

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null);

  const accountOptions = ACCOUNTS.map((a) => ({
    value: a.id,
    label: a.name,
  }));

  const loadTemplates = useCallback(async () => {
    try {
      const data = await templateRepo.getAll();
      setTemplates(data);
    } catch {
      setToast({ message: 'テンプレートの読み込みに失敗しました', type: 'error' });
    }
  }, [templateRepo]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDebitAccountId('');
    setCreditAccountId('');
    setAmountDisplay('');
    setTaxIncluded(true);
    setDescription('');
  };

  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, '');
    setAmountDisplay(raw ? addCommas(raw) : '');
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      setToast({ message: 'テンプレート名を入力してください', type: 'error' });
      return;
    }
    if (!debitAccountId) {
      setToast({ message: '借方科目を選択してください', type: 'error' });
      return;
    }
    if (!creditAccountId) {
      setToast({ message: '貸方科目を選択してください', type: 'error' });
      return;
    }

    const rawAmount = stripCommas(amountDisplay);
    const amount = rawAmount ? parseInt(rawAmount, 10) : null;

    setLoading(true);
    try {
      const input = {
        name: name.trim(),
        debitAccountId,
        creditAccountId,
        amount: amount && !isNaN(amount) ? amount : null,
        taxIncluded,
        description,
      };

      if (editingId) {
        await templateRepo.update(editingId, input);
        setToast({ message: 'テンプレートを更新しました', type: 'success' });
      } else {
        await templateRepo.create(input);
        setToast({ message: 'テンプレートを登録しました', type: 'success' });
      }
      resetForm();
      await loadTemplates();
    } catch {
      setToast({ message: '保存に失敗しました', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template: Template) => {
    setEditingId(template.id);
    setName(template.name);
    setDebitAccountId(template.debitAccountId);
    setCreditAccountId(template.creditAccountId);
    setAmountDisplay(template.amount ? template.amount.toLocaleString('ja-JP') : '');
    setTaxIncluded(template.taxIncluded);
    setDescription(template.description);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      await templateRepo.delete(deleteTarget.id);
      setToast({ message: 'テンプレートを削除しました', type: 'success' });
      setDeleteTarget(null);
      await loadTemplates();
    } catch {
      setToast({ message: '削除に失敗しました', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <Card title={editingId ? 'テンプレートを編集' : 'テンプレートを追加'}>
        <div className="space-y-4">
          <Input
            label="テンプレート名"
            placeholder="例: 通信費（携帯電話）"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="借方科目"
              options={accountOptions}
              placeholder="-- 選択 --"
              value={debitAccountId}
              onChange={(e) => setDebitAccountId(e.target.value)}
            />
            <Select
              label="貸方科目"
              options={accountOptions}
              placeholder="-- 選択 --"
              value={creditAccountId}
              onChange={(e) => setCreditAccountId(e.target.value)}
            />
          </div>

          <Input
            label="金額（任意）"
            value={amountDisplay}
            onChange={handleAmountChange}
            placeholder="例: 10,000"
          />

          <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-label)' }}>
            <input
              type="checkbox"
              checked={taxIncluded}
              onChange={(e) => setTaxIncluded(e.target.checked)}
              className="rounded"
            />
            税込
          </label>

          <Input
            label="摘要"
            placeholder="取引の内容を入力"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={loading || !name.trim()}>
              {loading ? '保存中...' : editingId ? '更新' : '追加'}
            </Button>
            {editingId && (
              <Button variant="secondary" onClick={handleCancel}>
                キャンセル
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Card title="登録済みテンプレート">
        {templates.length === 0 ? (
          <p className="text-sm text-gray-500 py-8 text-center">
            テンプレートはまだありません。
          </p>
        ) : (
          <div className="-mx-6 sm:mx-0 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">テンプレート名</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">借方</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">貸方</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">金額</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">摘要</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {templates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm font-medium">
                      {template.name}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {getAccountById(template.debitAccountId)?.name || template.debitAccountId}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {getAccountById(template.creditAccountId)?.name || template.creditAccountId}
                    </td>
                    <td className="px-4 py-2 text-sm text-right font-mono">
                      {template.amount ? template.amount.toLocaleString('ja-JP') : '-'}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500 max-w-xs truncate">
                      {template.description || '-'}
                    </td>
                    <td className="px-4 py-2 text-sm text-center">
                      <div className="flex justify-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(template)}>
                          編集
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(template)}>
                          <span style={{ color: 'var(--color-danger)' }}>削除</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="テンプレートの削除"
        onConfirm={handleDelete}
        confirmLabel="削除する"
        confirmVariant="danger"
      >
        <p className="text-sm text-gray-600">
          テンプレート「{deleteTarget?.name || ''}」を削除しますか？
        </p>
      </Modal>
    </div>
  );
}
