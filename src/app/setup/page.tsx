'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

export default function SetupPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    industry: '',
    taxReturnType: 'blue',
    consumptionTaxType: 'exempt',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.fullName.trim()) {
      setError('氏名を入力してください');
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('認証エラーが発生しました');
      setLoading(false);
      return;
    }
    const { error: dbError } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: formData.fullName.trim(),
      business_name: formData.businessName.trim(),
      industry: formData.industry.trim(),
      tax_return_type: formData.taxReturnType,
      consumption_tax_type: formData.consumptionTaxType,
    });
    if (dbError) {
      console.error('Profile save error:', dbError);
      setError(`プロフィールの保存に失敗しました: ${dbError.message}`);
      setLoading(false);
      return;
    }
    // 完全リロードでミドルウェアを再実行させる
    window.location.href = '/dashboard';
  };

  return (
    <AuthLayout>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-semibold text-center" style={{ color: 'var(--color-heading)' }}>初期設定</h2>
          <p className="text-sm text-gray-500 text-center">事業の基本情報を入力してください</p>
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          <Input label="氏名 *" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />
          <Input label="屋号" value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} />
          <Input label="業種" value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} placeholder="例：ITコンサルティング" />
          <Select
            label="申告方法"
            options={[
              { value: 'blue', label: '青色申告' },
              { value: 'white', label: '白色申告' },
            ]}
            value={formData.taxReturnType}
            onChange={(e) => setFormData({ ...formData, taxReturnType: e.target.value as 'blue' | 'white' })}
          />
          <Select
            label="消費税"
            options={[
              { value: 'exempt', label: '免税事業者' },
              { value: 'simplified', label: '簡易課税' },
              { value: 'standard', label: '本則課税' },
            ]}
            value={formData.consumptionTaxType}
            onChange={(e) => setFormData({ ...formData, consumptionTaxType: e.target.value as 'exempt' | 'simplified' | 'standard' })}
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? '保存中...' : '設定を保存して始める'}
          </Button>
        </form>
      </Card>
    </AuthLayout>
  );
}
