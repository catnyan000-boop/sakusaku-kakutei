import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ fontFamily: "'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', sans-serif", color: '#1a1a1a' }}>
      {/* Hero */}
      <section
        style={{
          background: 'linear-gradient(180deg, #f0fdfa 0%, #ffffff 100%)',
          padding: '80px 24px 64px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              margin: '0 0 16px',
              color: '#0f766e',
            }}
          >
            サクサク確定申告
          </h1>
          <p
            style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
              color: '#475569',
              lineHeight: 1.7,
              margin: '0 0 40px',
            }}
          >
            フリーランスのための、いちばんシンプルな青色申告ソフト
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/signup"
              style={{
                display: 'inline-block',
                background: '#0d9488',
                color: '#ffffff',
                fontSize: '1.05rem',
                fontWeight: 600,
                padding: '14px 36px',
                borderRadius: 8,
                textDecoration: 'none',
                transition: 'background 0.2s',
              }}
            >
              無料ではじめる
            </Link>
            <Link
              href="/login"
              style={{
                display: 'inline-block',
                color: '#0d9488',
                fontSize: '1rem',
                fontWeight: 500,
                padding: '14px 20px',
                textDecoration: 'none',
              }}
            >
              ログイン
            </Link>
          </div>
        </div>
      </section>

      <main>
        {/* Features */}
        <section style={{ padding: '64px 24px', maxWidth: 960, margin: '0 auto' }}>
          <h2
            style={{
              textAlign: 'center',
              fontSize: 'clamp(1.4rem, 3vw, 1.75rem)',
              fontWeight: 700,
              margin: '0 0 48px',
              color: '#0f766e',
            }}
          >
            選ばれる3つの理由
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 32,
            }}
          >
            {/* Feature 1 */}
            <div
              style={{
                background: '#f0fdfa',
                borderRadius: 12,
                padding: '36px 28px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: 16, color: '#0d9488' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 12px', color: '#134e4a' }}>
                ずっと無料
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: 1.7, margin: 0 }}>
                機能制限なし、期間制限なし。個人のフリーランスに必要な機能をすべて無料で使えます。
              </p>
            </div>

            {/* Feature 2 */}
            <div
              style={{
                background: '#f0fdfa',
                borderRadius: 12,
                padding: '36px 28px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: 16, color: '#0d9488' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 12px', color: '#134e4a' }}>
                簿記の知識不要
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: 1.7, margin: 0 }}>
                複式簿記は裏側で自動処理。かんたんな入力だけで帳簿が完成します。
              </p>
            </div>

            {/* Feature 3 */}
            <div
              style={{
                background: '#f0fdfa',
                borderRadius: 12,
                padding: '36px 28px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: 16, color: '#0d9488' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 12px', color: '#134e4a' }}>
                青色申告決算書を自動作成
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: 1.7, margin: 0 }}>
                入力データから青色申告決算書をPDF出力。e-Taxでそのまま提出できます。
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section style={{ padding: '64px 24px', background: '#f8fafc' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <h2
              style={{
                textAlign: 'center',
                fontSize: 'clamp(1.4rem, 3vw, 1.75rem)',
                fontWeight: 700,
                margin: '0 0 48px',
                color: '#0f766e',
              }}
            >
              かんたん3ステップ
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
              {/* Step 1 */}
              <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                <div
                  style={{
                    flexShrink: 0,
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: '#0d9488',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                  }}
                >
                  1
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px', color: '#1a1a1a' }}>
                    日々の取引を入力
                  </h3>
                  <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: 1.7, margin: 0 }}>
                    収入・支出をフォームから入力。CSV取込にも対応しているので、まとめて登録もできます。
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                <div
                  style={{
                    flexShrink: 0,
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: '#0d9488',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                  }}
                >
                  2
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px', color: '#1a1a1a' }}>
                    家事按分を設定
                  </h3>
                  <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: 1.7, margin: 0 }}>
                    自宅兼事務所の経費を事業用と個人用に按分。スライダーで割合を設定するだけです。
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                <div
                  style={{
                    flexShrink: 0,
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: '#0d9488',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                  }}
                >
                  3
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px', color: '#1a1a1a' }}>
                    決算書をPDF出力
                  </h3>
                  <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: 1.7, margin: 0 }}>
                    青色申告決算書をワンクリックでPDF生成。e-Taxで提出すれば確定申告完了です。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '80px 24px', textAlign: 'center' }}>
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <h2
              style={{
                fontSize: 'clamp(1.4rem, 3vw, 1.75rem)',
                fontWeight: 700,
                margin: '0 0 16px',
                color: '#0f766e',
              }}
            >
              確定申告をもっとシンプルに
            </h2>
            <p style={{ fontSize: '1rem', color: '#64748b', lineHeight: 1.7, margin: '0 0 32px' }}>
              アカウント登録は30秒。今すぐ始められます。
            </p>
            <Link
              href="/signup"
              style={{
                display: 'inline-block',
                background: '#0d9488',
                color: '#ffffff',
                fontSize: '1.05rem',
                fontWeight: 600,
                padding: '14px 36px',
                borderRadius: 8,
                textDecoration: 'none',
              }}
            >
              無料ではじめる
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: '24px',
          textAlign: 'center',
          borderTop: '1px solid #e2e8f0',
          color: '#94a3b8',
          fontSize: '0.85rem',
        }}
      >
        &copy; 2026 サクサク確定申告
      </footer>
    </div>
  );
}
