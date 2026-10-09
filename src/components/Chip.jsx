import React from 'react';

export function Chip({
  label,
  type,
  active = false,
  onClick,
  className = '',
  size = 'md',
}) {
  const typeMap = {
    sale: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    credit: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    payment: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    restock: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  };

  const styleClass = type ? typeMap[type] : active
    ? 'bg-amber-500 text-white border-amber-500'
    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-200';

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1.5 text-xs';

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1 font-bold rounded-full border transition-all ${
        onClick ? 'cursor-pointer select-none active:scale-95' : ''
      } ${styleClass} ${sizeClass} ${className}`}
    >
      {label}
    </span>
  );
}
