import React, { useState, useEffect } from 'react';

export function StatCard({
  title,
  value = 0,
  prefix = '',
  suffix = '',
  icon: Icon,
  trend,
  color = 'brand',
  className = '',
}) {
  const [displayValue, setDisplayValue] = useState(0);

  // Smooth Count-up animation
  useEffect(() => {
    let start = 0;
    const end = Number(value) || 0;
    if (start === end) {
      setDisplayValue(end);
      return;
    }

    const duration = 800;
    const stepTime = 16;
    const totalSteps = duration / stepTime;
    const increment = (end - start) / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if ((increment > 0 && start >= end) || (increment < 0 && start <= end)) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.round(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  const colorStyles = {
    brand: 'from-amber-500/15 to-orange-500/5 text-amber-700 dark:text-amber-400 border-amber-200/80 dark:border-amber-900/40',
    accent: 'from-emerald-500/15 to-teal-500/5 text-emerald-700 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-900/40',
    danger: 'from-rose-500/15 to-red-500/5 text-rose-700 dark:text-rose-400 border-rose-200/80 dark:border-rose-900/40',
    blue: 'from-blue-500/15 to-indigo-500/5 text-blue-700 dark:text-blue-400 border-blue-200/80 dark:border-blue-900/40',
  };

  return (
    <div
      className={`rounded-[20px] p-4.5 bg-gradient-to-br bg-white dark:bg-stone-900 border shadow-xs transition-all ${
        colorStyles[color] || colorStyles.brand
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
          {title}
        </span>
        {Icon && (
          <div className="w-8 h-8 rounded-xl bg-white/80 dark:bg-stone-800 flex items-center justify-center shadow-2xs">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-stone-900 dark:text-stone-100">
          {prefix}
          {displayValue.toLocaleString('en-IN')}
          {suffix}
        </span>
      </div>

      {trend && (
        <div className="mt-1 text-[11px] font-semibold text-stone-400">
          {trend}
        </div>
      )}
    </div>
  );
}
