export function DisclaimerText() {
  return (
    <div
      className="rounded-lg border px-4 py-3 text-xs"
      style={{ borderColor: '#FDE68A', backgroundColor: '#FFFBEB' }}
    >
      <p className="font-medium" style={{ color: '#92400E' }}>
        注意事項
      </p>
      <p className="mt-1" style={{ color: '#A16207' }}>
        本アプリの計算結果は概算です。正確な申告は税務署または税理士にご相談ください。
      </p>
    </div>
  );
}
