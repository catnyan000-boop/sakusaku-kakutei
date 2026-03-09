// Google OAuth ログインには以下の設定が必要です:
// 1. Google Cloud Console でプロジェクトを作成し、OAuth 2.0 クライアント ID を取得
// 2. 承認済みリダイレクト URI に Supabase の callback URL を追加:
//    https://<project-ref>.supabase.co/auth/v1/callback
// 3. Supabase ダッシュボード > Authentication > Providers > Google で
//    Client ID と Client Secret を設定
// 4. 環境変数 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY が設定済みであること

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

  const handleGoogleLogin = async () => {
    setError('');
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth/callback',
      },
    });
    if (authError) {
      setError('Googleログインに失敗しました');
    }
  };

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
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-center" style={{ color: 'var(--color-heading)' }}>ログイン</h2>
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          {/* Google ログインボタン */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.003 24.003 0 0 0 0 21.56l7.98-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            Googleでログイン
          </button>

          {/* セパレーター */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">または</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* メール・パスワードフォーム */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="メールアドレス" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="パスワード" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'ログイン中...' : 'ログイン'}
            </Button>
            <p className="text-sm text-center text-gray-500">
              アカウントをお持ちでない方は <Link href="/signup" className="font-medium" style={{ color: 'var(--color-primary)' }}>新規登録</Link>
            </p>
          </form>
        </div>
      </Card>
    </AuthLayout>
  );
}
