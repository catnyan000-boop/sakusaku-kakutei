'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRepository } from '@/providers/RepositoryProvider';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { ACCOUNTS } from '@/lib/constants/accounts';
import { formatCurrency } from '@/lib/utils/format';
import { TransactionInput } from '@/lib/types';
import {
  decodeFileBuffer,
  parseCsv,
  autoMapColumns,
  normalizeDate,
  parseAmount,
  buildSuggestionMap,
  suggestAccount,
  checkDuplicate,
  isZenginFormat,
  parseZenginRows,
  ColumnMapping,
  ZenginRow,
} from '@/lib/utils/csv-import';

type Step = 'upload' | 'mapping' | 'preview' | 'done';

interface ImportRow {
  date: string;
  description: string;
  amount: number;
  debitAccountId: string;
  creditAccountId: string;
  isRevenue: boolean;
  isDuplicate: boolean;
  selected: boolean;
  error: string | null;
}

const ACCOUNT_OPTIONS = [
  { value: '', label: '-- 科目を選択 --' },
  ...ACCOUNTS.map((a) => ({ value: a.id, label: a.name })),
];

export default function ImportPage() {
  const { transactionRepo } = useRepository();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('upload');
  const [headers, setHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [importedCount, setImportedCount] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  // Manual mapping state
  const [manualDate, setManualDate] = useState(-1);
  const [manualDesc, setManualDesc] = useState(-1);
  const [manualDeposit, setManualDeposit] = useState(-1);
  const [manualWithdrawal, setManualWithdrawal] = useState(-1);
  const [manualAmount, setManualAmount] = useState(-1);
  const [amountMode, setAmountMode] = useState<'split' | 'single'>('split');

  const headerOptions = useMemo(() => [
    { value: '-1', label: '(なし)' },
    ...headers.map((h, i) => ({ value: String(i), label: h })),
  ], [headers]);

  const buildImportRow = (date: string, desc: string, amount: number, isRevenue: boolean, suggMap: Map<string, Map<string, number>>, existingForDup: { date: string; amount: number; description: string }[]): ImportRow => {
    const suggestedDebit = isRevenue ? 'asset-ordinary-deposit' : (suggestAccount(desc, suggMap) || '');
    const suggestedCredit = isRevenue ? (suggestAccount(desc, suggMap) || 'revenue-sales') : 'asset-ordinary-deposit';
    const isDup = checkDuplicate(date, amount, desc, existingForDup);
    return {
      date,
      description: desc,
      amount,
      debitAccountId: isRevenue ? 'asset-ordinary-deposit' : suggestedDebit,
      creditAccountId: isRevenue ? suggestedCredit : 'asset-ordinary-deposit',
      isRevenue,
      isDuplicate: isDup,
      selected: !isDup,
      error: null,
    };
  };

  const buildPreview = useCallback(async (rows: string[][], m: ColumnMapping) => {
    setLoading(true);
    try {
      const allTx = await transactionRepo.getAll();
      const history = allTx.map((t) => ({ description: t.description, accountId: t.debitAccountId }));
      const suggMap = buildSuggestionMap(history);
      const existingForDup = allTx.map((t) => ({ date: t.date, amount: t.amount, description: t.description }));

      const parsed: ImportRow[] = [];
      for (const row of rows) {
        const rawDate = row[m.date] || '';
        const desc = (row[m.description] || '').trim();

        let rawAmount = 0;
        let isRevenue = false;

        if (m.deposit !== -1 && m.withdrawal !== -1) {
          const dep = parseAmount(row[m.deposit] || '');
          const wth = parseAmount(row[m.withdrawal] || '');
          if (dep && dep > 0) { rawAmount = dep; isRevenue = true; }
          else if (wth && wth > 0) { rawAmount = wth; isRevenue = false; }
          else { parsed.push({ date: '', description: desc, amount: 0, debitAccountId: '', creditAccountId: '', isRevenue: false, isDuplicate: false, selected: false, error: '金額が不正です' }); continue; }
        } else if (m.amount !== -1) {
          const amt = parseAmount(row[m.amount] || '');
          if (!amt) { parsed.push({ date: '', description: desc, amount: 0, debitAccountId: '', creditAccountId: '', isRevenue: false, isDuplicate: false, selected: false, error: '金額が不正です' }); continue; }
          rawAmount = amt;
          const rawStr = (row[m.amount] || '').trim().replace(/,/g, '');
          isRevenue = !rawStr.startsWith('-');
        }

        const date = normalizeDate(rawDate);
        if (!date) { parsed.push({ date: rawDate, description: desc, amount: rawAmount, debitAccountId: '', creditAccountId: '', isRevenue, isDuplicate: false, selected: false, error: '日付が不正です' }); continue; }
        if (rawAmount === 0) continue;

        parsed.push(buildImportRow(date, desc, rawAmount, isRevenue, suggMap, existingForDup));
      }

      setImportRows(parsed);
      setStep('preview');
    } finally {
      setLoading(false);
    }
  }, [transactionRepo]);

  const buildPreviewFromZengin = useCallback(async (zenginRows: ZenginRow[]) => {
    setLoading(true);
    try {
      const allTx = await transactionRepo.getAll();
      const history = allTx.map((t) => ({ description: t.description, accountId: t.debitAccountId }));
      const suggMap = buildSuggestionMap(history);
      const existingForDup = allTx.map((t) => ({ date: t.date, amount: t.amount, description: t.description }));

      const parsed: ImportRow[] = zenginRows.map((zr) =>
        buildImportRow(zr.date, zr.description, zr.amount, zr.isRevenue, suggMap, existingForDup)
      );
      setImportRows(parsed);
      setStep('preview');
    } finally {
      setLoading(false);
    }
  }, [transactionRepo]);

  const processFile = useCallback(async (file: File) => {
    const buffer = await file.arrayBuffer();
    const text = decodeFileBuffer(buffer);
    const { headers: h, rows: r } = parseCsv(text);
    if (h.length === 0) {
      setToast({ message: 'CSVの解析に失敗しました', type: 'error' });
      return;
    }

    const allRows = [h, ...r];
    if (isZenginFormat(allRows)) {
      const zenginRows = parseZenginRows(allRows);
      if (zenginRows.length === 0) {
        setToast({ message: '全銀フォーマットの取引データが見つかりませんでした', type: 'error' });
        return;
      }
      await buildPreviewFromZengin(zenginRows);
      return;
    }

    setHeaders(h);
    setCsvRows(r);
    const autoMapping = autoMapColumns(h);
    if (autoMapping) {
      await buildPreview(r, autoMapping);
    } else {
      setStep('mapping');
    }
  }, [buildPreview, buildPreviewFromZengin]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.csv')) processFile(file);
  };

  const handleMappingConfirm = () => {
    const m: ColumnMapping = {
      date: manualDate,
      description: manualDesc,
      deposit: amountMode === 'split' ? manualDeposit : -1,
      withdrawal: amountMode === 'split' ? manualWithdrawal : -1,
      amount: amountMode === 'single' ? manualAmount : -1,
    };
    if (m.date === -1 || m.description === -1) {
      setToast({ message: '日付と摘要は必須です', type: 'error' });
      return;
    }
    buildPreview(csvRows, m);
  };

  const toggleAll = (checked: boolean) => {
    setImportRows((prev) => prev.map((r) => (r.error ? r : { ...r, selected: checked })));
  };

  const toggleRow = (index: number) => {
    setImportRows((prev) => prev.map((r, i) => (i === index ? { ...r, selected: !r.selected } : r)));
  };

  const setRowDebit = (index: number, v: string) => {
    setImportRows((prev) => prev.map((r, i) => (i === index ? { ...r, debitAccountId: v } : r)));
  };

  const setRowCredit = (index: number, v: string) => {
    setImportRows((prev) => prev.map((r, i) => (i === index ? { ...r, creditAccountId: v } : r)));
  };

  const selectedRows = importRows.filter((r) => r.selected && !r.error);
  const validSelected = selectedRows.filter((r) => r.debitAccountId && r.creditAccountId);

  const handleImport = async () => {
    const toImport = importRows.filter((r) => r.selected && !r.error && r.debitAccountId && r.creditAccountId);
    if (toImport.length === 0) return;
    setLoading(true);
    try {
      const inputs: TransactionInput[] = toImport.map((r) => ({
        date: r.date,
        debitAccountId: r.debitAccountId,
        creditAccountId: r.creditAccountId,
        amount: r.amount,
        taxIncluded: true,
        description: r.description,
      }));
      await transactionRepo.bulkCreate(inputs);
      setImportedCount(inputs.length);
      setStep('done');
      setToast({ message: `${inputs.length}件のデータをインポートしました`, type: 'success' });
    } catch {
      setToast({ message: 'インポートに失敗しました', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {step === 'upload' && (
        <Card>
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${dragOver ? 'border-teal-400 bg-teal-50' : 'border-gray-300'}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <div>
                <p className="text-sm text-gray-600">CSVファイルをドラッグ＆ドロップ</p>
                <p className="text-xs text-gray-400 mt-1">または</p>
              </div>
              <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>ファイルを選択</Button>
              <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileInput} className="hidden" />
              <p className="text-xs text-gray-400">Shift-JIS / UTF-8 自動判別・全銀フォーマット対応</p>
            </div>
          </div>
        </Card>
      )}

      {step === 'mapping' && (
        <Card title="カラムマッピング">
          <p className="text-sm text-gray-500 mb-4">ヘッダーを自動判別できませんでした。各列を手動で割り当ててください。</p>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select label="日付列 *" options={headerOptions} value={String(manualDate)} onChange={(e) => setManualDate(Number(e.target.value))} />
              <Select label="摘要列 *" options={headerOptions} value={String(manualDesc)} onChange={(e) => setManualDesc(Number(e.target.value))} />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="amountMode" checked={amountMode === 'split'} onChange={() => setAmountMode('split')} />入金/出金 分離
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="amountMode" checked={amountMode === 'single'} onChange={() => setAmountMode('single')} />金額1列
              </label>
            </div>
            {amountMode === 'split' ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Select label="入金列" options={headerOptions} value={String(manualDeposit)} onChange={(e) => setManualDeposit(Number(e.target.value))} />
                <Select label="出金列" options={headerOptions} value={String(manualWithdrawal)} onChange={(e) => setManualWithdrawal(Number(e.target.value))} />
              </div>
            ) : (
              <Select label="金額列 *" options={headerOptions} value={String(manualAmount)} onChange={(e) => setManualAmount(Number(e.target.value))} />
            )}
            <div className="flex gap-3 mt-4">
              <Button onClick={handleMappingConfirm} disabled={loading}>{loading ? '処理中...' : '次へ'}</Button>
              <Button variant="secondary" onClick={() => { setStep('upload'); setHeaders([]); setCsvRows([]); }}>戻る</Button>
            </div>
          </div>
        </Card>
      )}

      {step === 'preview' && (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm" style={{ color: 'var(--color-label)' }}>
              <span>{importRows.filter((r) => !r.error).length}件中 </span>
              <span className="font-semibold">{selectedRows.length}件選択</span>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => { setStep('upload'); setHeaders([]); setCsvRows([]); setImportRows([]); }}>やり直す</Button>
              <Button size="sm" onClick={handleImport} disabled={loading || validSelected.length === 0}>
                {loading ? 'インポート中...' : `${validSelected.length}件をインポート`}
              </Button>
            </div>
          </div>

          <div className="-mx-6 sm:mx-0 overflow-x-auto sm:rounded-xl border border-gray-100 shadow-md">
            <table className="min-w-[900px] w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left"><input type="checkbox" checked={importRows.filter((r) => !r.error).every((r) => r.selected)} onChange={(e) => toggleAll(e.target.checked)} /></th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">日付</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">摘要</th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500">金額</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">借方</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">貸方</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">状態</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {importRows.map((row, i) => {
                  let bgClass = '';
                  if (row.error) bgClass = 'bg-red-50';
                  else if (row.isDuplicate) bgClass = 'bg-red-50';
                  return (
                    <tr key={i} className={bgClass}>
                      <td className="px-3 py-2">{!row.error && <input type="checkbox" checked={row.selected} onChange={() => toggleRow(i)} />}</td>
                      <td className="px-3 py-2 text-sm">{row.date || '-'}</td>
                      <td className="px-3 py-2 text-sm max-w-[160px] truncate">{row.description || '-'}</td>
                      <td className="px-3 py-2 text-sm text-right font-mono">{row.amount ? formatCurrency(row.amount) : '-'}</td>
                      <td className="px-3 py-2 text-sm">
                        {row.error ? <span className="text-red-600 text-xs">{row.error}</span> : (
                          <select className="text-xs border border-gray-300 rounded px-1 py-0.5 w-full max-w-[120px]" value={row.debitAccountId} onChange={(e) => setRowDebit(i, e.target.value)}>
                            {ACCOUNT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                        )}
                      </td>
                      <td className="px-3 py-2 text-sm">
                        {!row.error && (
                          <select className="text-xs border border-gray-300 rounded px-1 py-0.5 w-full max-w-[120px]" value={row.creditAccountId} onChange={(e) => setRowCredit(i, e.target.value)}>
                            {ACCOUNT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                        )}
                      </td>
                      <td className="px-3 py-2 text-sm">
                        {row.error && <span className="text-red-600 text-xs">エラー</span>}
                        {!row.error && row.isDuplicate && <span className="text-red-600 text-xs">重複の可能性</span>}
                        {!row.error && !row.isDuplicate && row.debitAccountId && row.creditAccountId && <span className="text-green-600 text-xs">OK</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {step === 'done' && (
        <Card>
          <div className="text-center py-8 space-y-4">
            <p className="text-lg font-semibold" style={{ color: 'var(--color-heading)' }}>{importedCount}件のデータをインポートしました</p>
            <div className="flex justify-center gap-3">
              <Link href="/transactions"><Button>仕訳一覧へ</Button></Link>
              <Button variant="secondary" onClick={() => { setStep('upload'); setHeaders([]); setCsvRows([]); setImportRows([]); setImportedCount(0); }}>続けてインポート</Button>
            </div>
          </div>
        </Card>
      )}

      {loading && step === 'upload' && <div className="text-center py-8 text-gray-500">ファイルを処理中...</div>}
    </div>
  );
}
