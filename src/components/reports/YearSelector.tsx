'use client';

import { Select } from '@/components/ui/Select';

interface YearSelectorProps {
  value: number;
  onChange: (year: number) => void;
}

export function YearSelector({ value, onChange }: YearSelectorProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const options = years.map((y) => ({ value: String(y), label: `${y}年度` }));

  return (
    <Select
      label="対象年度"
      options={options}
      value={String(value)}
      onChange={(e) => onChange(parseInt(e.target.value, 10))}
    />
  );
}
