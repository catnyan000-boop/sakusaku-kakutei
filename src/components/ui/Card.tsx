import React from 'react';

interface CardProps {
  title?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Card({ title, headerRight, children, className = '' }: CardProps) {
  return (
    <div
      className={`rounded-xl border bg-white p-6 shadow-sm ${className}`}
      style={{ borderColor: 'var(--color-card-border)' }}
    >
      {(title || headerRight) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="text-base font-semibold" style={{ color: 'var(--color-heading)' }}>{title}</h3>}
          {headerRight}
        </div>
      )}
      {children}
    </div>
  );
}
