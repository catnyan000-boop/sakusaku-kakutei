'use client';
import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
      type === 'success' ? 'bg-teal-600' : 'bg-red-600'
    }`}>
      {message}
    </div>
  );
}
