'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) {
      if (authError.message === 'Email not confirmed') {
        setError('メールアドレスが未確認です。確認メールのリンクをクリックしてください。');
      } else {
        setError('メールアドレスまたはパスワードが正しくありません');
      }
      return;
    }
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <AuthLayout>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-xl font-semibold text-center" style={{ color: 'var(--color-heading)' }}>ログイン</h2>
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          <Input label="メールアドレス" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="パスワード" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'ログイン中...' : 'ログイン'}
          </Button>
          <p className="text-sm text-center text-gray-500">
            アカウントをお持ちでない方は <Link href="/signup" className="font-medium" style={{ color: 'var(--color-primary)' }}>新規登録</Link>
          </p>
        </form>
      </Card>
    </AuthLayout>
  );
}
