'use client';
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  const id = props.id || (label ? label.replace(/\s+/g, '-').toLowerCase() : undefined);
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium mb-1" style={{ color: 'var(--color-label)' }}>
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:ring-2 ${
          error ? 'border-red-400 focus:ring-red-200' : 'border-gray-300 focus:border-teal-500 focus:ring-teal-200'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
