'use client';

import { useState, useEffect, useRef } from 'react';
import { useRepository } from '@/providers/RepositoryProvider';
import { getAccountById, ACCOUNTS } from '@/lib/constants/accounts';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';

function formatDateForFile(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

function escCsv(s: string): string {
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function accountNameToId(name: string): string | null {
  const acc = ACCOUNTS.find((a) => a.name === name);
  return acc ? acc.id : null;
}

export default function SettingsPage() {
  const { transactionRepo, profileRepo } = useRepository();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState({
    fullName: '',
    businessName: '',
    industry: '',
    taxReturnType: 'blue' as 'blue' | 'white',
    consumptionTaxType: 'exempt' as 'exempt' | 'simplified' | 'standard',
  });

  useEffect(() => {
    (async () => {
      try {
        const p = await profileRepo.getProfile();
        if (p) {
          setProfile({
            fullName: p.fullName,
            businessName: p.businessName,
            industry: p.industry,
            taxReturnType: p.taxReturnType,
            consumptionTaxType: p.consumptionTaxType,
          });
        }
      } finally {
        setProfileLoading(false);
      }
    })();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.fullName.trim()) {
      setToast({ message: '氏名を入力してください', type: 'error' });
      return;
    }
    setSaving(true);
    try {
      await profileRepo.updateProfile(profile);
      setToast({ message: '設定を保存しました', type: 'success' });
    } catch {
      setToast({ message: '保存に失敗しました', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const all = await transactionRepo.getAll();
      if (all.length === 0) {
        setToast({ message: 'エクスポートする仕訳データがありません', type: 'error' });
        return;
      }
      all.sort((a, b) => a.date.localeCompare(b.date));

      const bom = '\uFEFF';
      const header = '日付,借方科目,貸方科目,金額,税込,摘要';
      const rows = all.map((tx) => {
        const debit = getAccountById(tx.debitAccountId)?.name || tx.debitAccountId;
        const credit = getAccountById(tx.creditAccountId)?.name || tx.creditAccountId;
        return [
          tx.date,
          escCsv(debit),
          escCsv(credit),
          String(tx.amount),
          tx.taxIncluded ? '税込' : '税抜',
          escCsv(tx.description),
        ].join(',');
      });

      const csv = bom + header + '\n' + rows.join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sakusaku_backup_${formatDateForFile(new Date())}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      setToast({ message: `${all.length}件の仕訳をエクスポートしました`, type: 'success' });
    } catch {
      setToast({ message: 'エクスポートに失敗しました', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const text = await file.text();
      const lines = text.replace(/^\uFEFF/, '').split('\n').filter((l) => l.trim());

      if (lines.length < 2) {
        setToast({ message: 'CSVにデータ行がありません', type: 'error' });
        return;
      }

      // ヘッダー検証
      const header = lines[0];
      if (!header.startsWith('日付,借方科目,貸方科目,金額')) {
        setToast({ message: 'CSVの形式が正しくありません。サクサク確定申告でエクスポートしたファイルを使用してください。', type: 'error' });
        return;
      }

      const errors: string[] = [];
      const inputs: { date: string; debitAccountId: string; creditAccountId: string; amount: number; taxIncluded: boolean; description: string }[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        // CSVパース（ダブルクォート対応）
        const cols: string[] = [];
        let current = '';
        let inQuote = false;
        for (let j = 0; j < line.length; j++) {
          const ch = line[j];
          if (inQuote) {
            if (ch === '"' && line[j + 1] === '"') {
              current += '"';
              j++;
            } else if (ch === '"') {
              inQuote = false;
            } else {
              current += ch;
            }
          } else {
            if (ch === '"') {
              inQuote = true;
            } else if (ch === ',') {
              cols.push(current);
              current = '';
            } else {
              current += ch;
            }
          }
        }
        cols.push(current);

        if (cols.length < 4) {
          errors.push(`${i + 1}行目: 列数が不足しています`);
          continue;
        }

        const date = cols[0].trim();
        const debitName = cols[1].trim();
        const creditName = cols[2].trim();
        const amount = parseInt(cols[3].trim(), 10);
        const taxCol = cols[4]?.trim() || '税込';
        const description = cols[5]?.trim() || '';

        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          errors.push(`${i + 1}行目: 日付の形式が不正です（${date}）`);
          continue;
        }

        const debitId = accountNameToId(debitName);
        if (!debitId) {
          errors.push(`${i + 1}行目: 借方科目「${debitName}」が見つかりません`);
          continue;
        }

        const creditId = accountNameToId(creditName);
        if (!creditId) {
          errors.push(`${i + 1}行目: 貸方科目「${creditName}」が見つかりません`);
          continue;
        }

        if (isNaN(amount) || amount <= 0) {
          errors.push(`${i + 1}行目: 金額が不正です（${cols[3]}）`);
          continue;
        }

        inputs.push({
          date,
          debitAccountId: debitId,
          creditAccountId: creditId,
          amount,
          taxIncluded: taxCol !== '税抜',
          description,
        });
      }

      if (errors.length > 0) {
        setToast({ message: `${errors.length}件のエラー: ${errors[0]}`, type: 'error' });
        return;
      }

      if (inputs.length === 0) {
        setToast({ message: 'インポートできるデータがありません', type: 'error' });
        return;
      }

      await transactionRepo.bulkCreate(inputs);
      setToast({ message: `${inputs.length}件の仕訳をインポートしました`, type: 'success' });
    } catch {
      setToast({ message: 'インポートに失敗しました', type: 'error' });
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <Card title="プロフィール">
        {profileLoading ? (
          <p className="text-sm text-gray-500 py-4 text-center">読み込み中...</p>
        ) : (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <Input
              label="氏名 *"
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              required
            />
            <Input
              label="屋号"
              value={profile.businessName}
              onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
            />
            <Input
              label="業種"
              value={profile.industry}
              onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
              placeholder="例：ITコンサルティング"
            />
            <Select
              label="申告方法"
              options={[
                { value: 'blue', label: '青色申告' },
                { value: 'white', label: '白色申告' },
              ]}
              value={profile.taxReturnType}
              onChange={(e) => setProfile({ ...profile, taxReturnType: e.target.value as 'blue' | 'white' })}
            />
            <Select
              label="消費税"
              options={[
                { value: 'exempt', label: '免税事業者' },
                { value: 'simplified', label: '簡易課税' },
                { value: 'standard', label: '本則課税' },
              ]}
              value={profile.consumptionTaxType}
              onChange={(e) => setProfile({ ...profile, consumptionTaxType: e.target.value as 'exempt' | 'simplified' | 'standard' })}
            />
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? '保存中...' : '設定を保存'}
            </Button>
          </form>
        )}
      </Card>

      <Card title="データバックアップ">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--color-heading)' }}>エクスポート</h3>
            <p className="text-xs mb-3" style={{ color: 'var(--color-label)' }}>
              全仕訳データをCSVファイルとしてダウンロードします。
            </p>
            <Button onClick={handleExport} disabled={loading}>
              {loading ? '処理中...' : 'データをエクスポート'}
            </Button>
          </div>

          <hr className="border-gray-200" />

          <div>
            <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--color-heading)' }}>インポート</h3>
            <p className="text-xs mb-3" style={{ color: 'var(--color-label)' }}>
              エクスポートしたCSVファイルを読み込んで仕訳データを復元します。
              <br />
              ※ 既存のデータは削除されません。重複にご注意ください。
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              onChange={handleImport}
              className="hidden"
              id="csv-import"
            />
            <Button
              variant="secondary"
              onClick={() => fileRef.current?.click()}
              disabled={loading}
            >
              {loading ? '処理中...' : 'データをインポート'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
