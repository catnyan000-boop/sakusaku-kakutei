'use client';
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({ label, error, options, placeholder, className = '', ...props }: SelectProps) {
  const id = props.id || (label ? label.replace(/\s+/g, '-').toLowerCase() : undefined);
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium mb-1" style={{ color: 'var(--color-label)' }}>
          {label}
        </label>
      )}
      <select
        id={id}
        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 ${
          error ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:border-teal-500 focus:ring-teal-200'
        } ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
