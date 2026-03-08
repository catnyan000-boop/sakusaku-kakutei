import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'サクサク確定申告',
  description: '個人事業主向けの青色申告会計ソフト',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
