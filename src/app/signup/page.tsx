'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }
    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください');
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    router.push('/setup');
    router.refresh();
  };

  return (
    <AuthLayout>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-semibold text-center" style={{ color: 'var(--color-heading)' }}>新規登録</h2>
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          <Input label="メールアドレス" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="パスワード" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Input label="パスワード（確認）" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? '登録中...' : '登録する'}
          </Button>
          <p className="text-sm text-center text-gray-500">
            アカウントをお持ちの方は <Link href="/login" className="font-medium" style={{ color: 'var(--color-primary)' }}>ログイン</Link>
          </p>
        </form>
      </Card>
    </AuthLayout>
  );
}
