import React from 'react';

export function EmptyState({
  icon: Icon,
  emoji = '✨',
  title,
  description,
  actionText,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center bg-white/60 dark:bg-stone-900/60 rounded-[28px] border border-dashed border-stone-300 dark:border-stone-800 ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center text-3xl mb-3 shadow-2xs">
        {Icon ? <Icon className="w-8 h-8 text-amber-500" /> : emoji}
      </div>
      <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 font-heading">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mt-1 leading-relaxed">
          {description}
        </p>
      )}
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full text-xs font-bold transition-all shadow-xs"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
