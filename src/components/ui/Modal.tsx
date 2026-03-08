'use client';
import React, { useEffect } from 'react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onConfirm?: () => void;
  confirmLabel?: string;
  confirmVariant?: 'primary' | 'danger';
}

export function Modal({ isOpen, onClose, title, children, onConfirm, confirmLabel = '確認', confirmVariant = 'primary' }: ModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl mx-4">
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-heading)' }}>{title}</h3>
        <div className="mb-6">{children}</div>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={onClose}>キャンセル</Button>
          {onConfirm && (
            <Button variant={confirmVariant} size="sm" onClick={onConfirm}>{confirmLabel}</Button>
          )}
        </div>
      </div>
    </div>
  );
}
