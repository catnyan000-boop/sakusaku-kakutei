export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--color-page-bg)' }}>
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-8" style={{ color: 'var(--color-sidebar-title)' }}>
          サクサク確定申告
        </h1>
        {children}
      </div>
    </div>
  );
}
