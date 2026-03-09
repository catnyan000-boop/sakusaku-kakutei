'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRepository } from '@/providers/RepositoryProvider';
import { KateiAnbun } from '@/lib/types';
import { EXPENSE_ACCOUNTS, getAccountById } from '@/lib/constants/accounts';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';

export default function KateiAnbunPage() {
  const { kateiAnbunRepo } = useRepository();

  const [records, setRecords] = useState<KateiAnbun[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [accountId, setAccountId] = useState('');
  const [businessRatio, setBusinessRatio] = useState(50);
  const [note, setNote] = useState('');

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<KateiAnbun | null>(null);

  const loadRecords = useCallback(async () => {
    try {
      const data = await kateiAnbunRepo.getAll();
      setRecords(data);
    } catch {
      setToast({ message: 'データの読み込みに失敗しました', type: 'error' });
    }
  }, [kateiAnbunRepo]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const resetForm = () => {
    setEditingId(null);
    setAccountId('');
    setBusinessRatio(50);
    setNote('');
  };

  const handleSave = async () => {
    if (!accountId) {
      setToast({ message: '勘定科目を選択してください', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      await kateiAnbunRepo.upsert({ accountId, businessRatio, note });
      setToast({ message: editingId ? '更新しました' : '登録しました', type: 'success' });
      resetForm();
      await loadRecords();
    } catch {
      setToast({ message: '保存に失敗しました', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: KateiAnbun) => {
    setEditingId(record.id);
    setAccountId(record.accountId);
    setBusinessRatio(record.businessRatio);
    setNote(record.note);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      await kateiAnbunRepo.delete(deleteTarget.id);
      setToast({ message: '削除しました', type: 'success' });
      setDeleteTarget(null);
      await loadRecords();
    } catch {
      setToast({ message: '削除に失敗しました', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
  };

  // Build account options: filter out accounts that already have a record (unless editing that record)
  const usedAccountIds = new Set(records.map((r) => r.accountId));
  const accountOptions = EXPENSE_ACCOUNTS
    .filter((a) => !usedAccountIds.has(a.id) || a.id === accountId)
    .map((a) => ({ value: a.id, label: a.name }));

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <Card title={editingId ? '家事按分を編集' : '家事按分を追加'}>
        <div className="space-y-4">
          <Select
            label="勘定科目"
            options={accountOptions}
            placeholder="-- 科目を選択 --"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            disabled={!!editingId}
          />

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-label)' }}>
              事業割合: {businessRatio}%
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={0}
                max={100}
                value={businessRatio}
                onChange={(e) => setBusinessRatio(Number(e.target.value))}
                className="flex-1"
                style={{ accentColor: 'var(--color-primary)' }}
              />
              <Input
                type="number"
                min={0}
                max={100}
                value={businessRatio}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (v >= 0 && v <= 100) setBusinessRatio(v);
                }}
                className="w-20 text-center"
              />
            </div>
          </div>

          <Input
            label="按分理由"
            placeholder="例: 自宅の30%を事務所として使用"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={loading || !accountId}>
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

      <Card title="登録済みの家事按分">
        {records.length === 0 ? (
          <p className="text-sm text-gray-500 py-8 text-center">
            家事按分の設定はまだありません。
          </p>
        ) : (
          <div className="-mx-6 sm:mx-0 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">勘定科目</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">事業割合</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">按分理由</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm">
                      {getAccountById(record.accountId)?.name || record.accountId}
                    </td>
                    <td className="px-4 py-2 text-sm text-right font-mono">
                      {record.businessRatio}%
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500 max-w-xs truncate">
                      {record.note || '-'}
                    </td>
                    <td className="px-4 py-2 text-sm text-center">
                      <div className="flex justify-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(record)}>
                          編集
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(record)}>
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
        title="家事按分の削除"
        onConfirm={handleDelete}
        confirmLabel="削除する"
        confirmVariant="danger"
      >
        <p className="text-sm text-gray-600">
          「{deleteTarget ? getAccountById(deleteTarget.accountId)?.name || deleteTarget.accountId : ''}」の家事按分設定を削除しますか？
        </p>
      </Modal>
    </div>
  );
}
