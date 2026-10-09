import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function BottomSheet({ isOpen, onClose, title, subtitle, children, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Sheet Content */}
      <div
        className={`relative w-full ${maxWidth} bg-white dark:bg-stone-900 rounded-t-[28px] sm:rounded-[28px] shadow-2xl border border-stone-200 dark:border-stone-800 z-10 max-h-[92vh] flex flex-col transition-transform duration-300 animate-in slide-in-from-bottom`}
      >
        {/* Drag handle for mobile */}
        <div className="w-12 h-1.5 bg-stone-300 dark:bg-stone-700 rounded-full mx-auto mt-3 mb-1 sm:hidden" />

        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-stone-100 dark:border-stone-800 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 font-heading">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="p-6 overflow-y-auto no-scrollbar space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}
