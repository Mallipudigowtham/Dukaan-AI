import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function Toast({ message, type = 'success', onClose, duration = 3500 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertCircle,
    info: Info,
  };

  const colors = {
    success: 'bg-emerald-600 text-white shadow-emerald-200',
    error: 'bg-rose-600 text-white shadow-rose-200',
    warning: 'bg-amber-600 text-white shadow-amber-200',
    info: 'bg-stone-800 text-white shadow-stone-400',
  };

  const Icon = icons[type] || CheckCircle2;

  return (
    <div className="fixed top-5 inset-x-0 z-50 flex items-center justify-center px-4 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-200">
      <div
        className={`pointer-events-auto max-w-sm w-full rounded-2xl px-4 py-3 shadow-xl flex items-center justify-between gap-3 ${colors[type]}`}
      >
        <div className="flex items-center gap-2.5">
          <Icon className="w-5 h-5 shrink-0" />
          <p className="text-xs font-bold leading-snug">{message}</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg text-white/80 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
