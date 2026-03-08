export function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString('ja-JP')}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export function formatYearMonth(ym: string): string {
  const [year, month] = ym.split('-');
  return `${year}年${parseInt(month, 10)}月`;
}
