'use client';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };

  const variants: Record<string, string> = {
    primary: 'text-white shadow-sm',
    secondary: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
    danger: 'text-white shadow-sm',
    ghost: 'text-gray-600 hover:bg-gray-100',
  };

  // Use inline style for primary/danger colors (CSS variables)
  const style: React.CSSProperties = {};
  if (variant === 'primary') {
    style.backgroundColor = props.disabled ? undefined : 'var(--color-primary)';
  }
  if (variant === 'danger') {
    style.backgroundColor = props.disabled ? undefined : 'var(--color-danger)';
  }

  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} style={style} {...props}>
      {children}
    </button>
  );
}
