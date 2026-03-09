'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRepository } from '@/providers/RepositoryProvider';
import { Transaction, KateiAnbun, TaxSettings } from '@/lib/types';
import { generatePL } from '@/lib/services/report.service';
import { calculateTaxEstimate } from '@/lib/services/tax.service';
import { DEFAULT_BASIC_DEDUCTION, DEFAULT_BLUE_RETURN_DEDUCTION } from '@/lib/constants/tax';
import { formatCurrency } from '@/lib/utils/format';
import { generatePdfFromElement } from '@/lib/utils/pdf';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { YearSelector } from '@/components/reports/YearSelector';
import { DisclaimerText } from '@/components/reports/DisclaimerText';

function parseInputNumber(value: string): number {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? 0 : parsed;
}

export default function TaxEstimatePage() {
  const { transactionRepo, kateiAnbunRepo, taxSettingsRepo } = useRepository();

  const [year, setYear] = useState(new Date().getFullYear());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [kateiAnbunList, setKateiAnbunList] = useState<KateiAnbun[]>([]);
  const [taxSettings, setTaxSettings] = useState<TaxSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Deduction form values
  const [blueReturnDeduction, setBlueReturnDeduction] = useState(DEFAULT_BLUE_RETURN_DEDUCTION);
  const [basicDeduction, setBasicDeduction] = useState(DEFAULT_BASIC_DEDUCTION);
  const [socialInsurance, setSocialInsurance] = useState(0);
  const [lifeInsurance, setLifeInsurance] = useState(0);
  const [earthquakeInsurance, setEarthquakeInsurance] = useState(0);
  const [spouseDeduction, setSpouseDeduction] = useState(0);
  const [dependentsDeduction, setDependentsDeduction] = useState(0);
  const [otherDeduction, setOtherDeduction] = useState(0);

  const contentRef = useRef<HTMLDivElement>(null);

  // Load data from DB
  useEffect(() => {
    setLoading(true);
    Promise.all([
      transactionRepo.getAll(),
      kateiAnbunRepo.getAll(),
      taxSettingsRepo.get(),
    ]).then(([txData, anbunData, settingsData]) => {
      setTransactions(txData);
      setKateiAnbunList(anbunData);
      setTaxSettings(settingsData);
      setLoading(false);
    }).catch(() => {
      setToast({ message: 'データの読み込みに失敗しました', type: 'error' });
      setLoading(false);
    });
  }, [transactionRepo, kateiAnbunRepo, taxSettingsRepo]);

  // Populate form from DB settings when loaded
  useEffect(() => {
    if (taxSettings) {
      setBlueReturnDeduction(taxSettings.blueReturnDeduction);
      setBasicDeduction(taxSettings.basicDeduction);
      setSocialInsurance(taxSettings.socialInsurance);
      setLifeInsurance(taxSettings.lifeInsurance);
      setEarthquakeInsurance(taxSettings.earthquakeInsurance);
      setSpouseDeduction(taxSettings.spouseDeduction);
      setDependentsDeduction(taxSettings.dependentsDeduction);
      setOtherDeduction(taxSettings.otherDeduction);
    }
  }, [taxSettings]);

  // Filter transactions by year, build kateiAnbunMap, calculate PL and tax estimate
  const { pl, estimate } = useMemo(() => {
    const filtered = transactions.filter((tx) => tx.date.startsWith(String(year)));

    const kateiAnbunMap = new Map<string, number>();
    for (const item of kateiAnbunList) {
      kateiAnbunMap.set(item.accountId, item.businessRatio);
    }

    const plResult = generatePL(filtered, kateiAnbunMap);

    const expenseAfterAnbun = plResult.totalCost + plResult.totalExpense;
    const estimateResult = calculateTaxEstimate(
      plResult.totalRevenue,
      expenseAfterAnbun,
      blueReturnDeduction,
      {
        basicDeduction,
        socialInsurance,
        lifeInsurance,
        earthquakeInsurance,
        spouseDeduction,
        dependentsDeduction,
        otherDeduction,
      },
    );

    return { pl: plResult, estimate: estimateResult };
  }, [
    transactions, year, kateiAnbunList,
    blueReturnDeduction, basicDeduction, socialInsurance, lifeInsurance,
    earthquakeInsurance, spouseDeduction, dependentsDeduction, otherDeduction,
  ]);

  const deductionTotal = basicDeduction + socialInsurance + lifeInsurance +
    earthquakeInsurance + spouseDeduction + dependentsDeduction + otherDeduction;

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const saved = await taxSettingsRepo.upsert({
        blueReturnDeduction,
        basicDeduction,
        socialInsurance,
        lifeInsurance,
        earthquakeInsurance,
        spouseDeduction,
        dependentsDeduction,
        otherDeduction,
      });
      setTaxSettings(saved);
      setToast({ message: '控除設定を保存しました', type: 'success' });
    } catch {
      setToast({ message: '保存に失敗しました', type: 'error' });
    } finally {
      setSaving(false);
    }
  }, [
    taxSettingsRepo, blueReturnDeduction, basicDeduction, socialInsurance,
    lifeInsurance, earthquakeInsurance, spouseDeduction, dependentsDeduction, otherDeduction,
  ]);

  const handlePdf = useCallback(async () => {
    if (!contentRef.current) return;
    try {
      await generatePdfFromElement(contentRef.current, `税額シミュレーション_${year}.pdf`);
    } catch {
      setToast({ message: 'PDF出力に失敗しました', type: 'error' });
    }
  }, [year]);

  if (loading) {
    return <div className="text-center py-12 text-gray-400">読み込み中...</div>;
  }

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header with year selector and PDF button */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="w-48">
          <YearSelector value={year} onChange={setYear} />
        </div>
        <Button variant="secondary" onClick={handlePdf}>
          PDF出力
        </Button>
      </div>

      {/* PDF target area */}
      <div ref={contentRef} className="space-y-6">

        {/* Card 1: 事業所得 */}
        <Card title="事業所得">
          <div className="space-y-4">
            <DisplayRow label="売上高" value={formatCurrency(pl.totalRevenue)} />
            <DisplayRow label="経費合計（按分後）" value={formatCurrency(pl.totalCost + pl.totalExpense)} />
            <div>
              <Input
                label="青色申告特別控除"
                type="number"
                min={0}
                step={10000}
                value={blueReturnDeduction}
                onChange={(e) => setBlueReturnDeduction(parseInputNumber(e.target.value))}
              />
            </div>
            <div className="pt-2 border-t border-gray-200">
              <DisplayRow
                label="事業所得"
                value={formatCurrency(estimate.taxableBusinessIncome)}
                bold
              />
            </div>
          </div>
        </Card>

        {/* Card 2: 所得控除 */}
        <Card title="所得控除">
          <div className="space-y-4">
            <Input
              label="基礎控除"
              type="number"
              min={0}
              step={10000}
              value={basicDeduction}
              onChange={(e) => setBasicDeduction(parseInputNumber(e.target.value))}
            />
            <Input
              label="社会保険料控除"
              type="number"
              min={0}
              step={1000}
              value={socialInsurance}
              onChange={(e) => setSocialInsurance(parseInputNumber(e.target.value))}
            />
            <Input
              label="生命保険料控除"
              type="number"
              min={0}
              step={1000}
              value={lifeInsurance}
              onChange={(e) => setLifeInsurance(parseInputNumber(e.target.value))}
            />
            <Input
              label="地震保険料控除"
              type="number"
              min={0}
              step={1000}
              value={earthquakeInsurance}
              onChange={(e) => setEarthquakeInsurance(parseInputNumber(e.target.value))}
            />
            <Input
              label="配偶者控除"
              type="number"
              min={0}
              step={10000}
              value={spouseDeduction}
              onChange={(e) => setSpouseDeduction(parseInputNumber(e.target.value))}
            />
            <Input
              label="扶養控除"
              type="number"
              min={0}
              step={10000}
              value={dependentsDeduction}
              onChange={(e) => setDependentsDeduction(parseInputNumber(e.target.value))}
            />
            <Input
              label="その他の控除"
              type="number"
              min={0}
              step={1000}
              value={otherDeduction}
              onChange={(e) => setOtherDeduction(parseInputNumber(e.target.value))}
            />

            <div className="pt-2 border-t border-gray-200">
              <DisplayRow label="控除合計" value={formatCurrency(deductionTotal)} bold />
            </div>

            <div className="pt-2">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? '保存中...' : '保存'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Card 3: 税額計算結果 */}
        <Card title="税額計算結果">
          <div className="space-y-3">
            <DisplayRow label="課税所得" value={formatCurrency(estimate.taxableIncome)} />
            <DisplayRow label="所得税" value={formatCurrency(estimate.incomeTax)} />
            <DisplayRow label="復興特別所得税" value={formatCurrency(estimate.reconstructionTax)} />
            <DisplayRow label="住民税" value={formatCurrency(estimate.residentTax)} />
            <DisplayRow label="個人事業税" value={formatCurrency(estimate.businessTax)} />

            <div className="border-t border-gray-200 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold" style={{ color: 'var(--color-heading)' }}>
                  合計納税見込額
                </span>
                <span
                  className="text-2xl font-bold"
                  style={{ color: 'var(--color-primary)' }}
                >
                  {formatCurrency(estimate.totalTax)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Disclaimer */}
        <DisclaimerText />
      </div>
    </div>
  );
}

/** Read-only display row for label + value */
function DisplayRow({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={`text-sm ${bold ? 'font-semibold' : ''}`}
        style={{ color: 'var(--color-label)' }}
      >
        {label}
      </span>
      <span
        className={`text-sm font-mono ${bold ? 'font-bold' : ''}`}
        style={{ color: 'var(--color-heading)' }}
      >
        {value}
      </span>
    </div>
  );
}
