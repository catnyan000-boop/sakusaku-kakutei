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
  const [emailSent, setEmailSent] = useState(false);

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
    const { data, error: authError } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    // セッションがある = メール確認不要（Supabase設定で無効の場合）
    if (data.session) {
      router.push('/setup');
      router.refresh();
      return;
    }

    // セッションがない = メール確認が必要
    setEmailSent(true);
  };

  if (emailSent) {
    return (
      <AuthLayout>
        <Card>
          <div className="space-y-4 text-center">
            <div className="text-4xl">✉️</div>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--color-heading)' }}>確認メールを送信しました</h2>
            <p className="text-sm" style={{ color: 'var(--color-label)' }}>
              <strong>{email}</strong> に確認メールを送信しました。<br />
              メール内のリンクをクリックして登録を完了してください。
            </p>
            <p className="text-xs text-gray-400">
              メールが届かない場合は、迷惑メールフォルダを確認してください。
            </p>
            <Link
              href="/login"
              className="inline-block text-sm font-medium"
              style={{ color: 'var(--color-primary)' }}
            >
              ログインページへ戻る
            </Link>
          </div>
        </Card>
      </AuthLayout>
    );
  }

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
