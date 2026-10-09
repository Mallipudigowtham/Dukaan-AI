import React from 'react';

export function Skeleton({ className = '', variant = 'text', width, height }) {
  const baseClasses = 'shimmer-loading rounded-xl';

  return (
    <div
      className={`${baseClasses} ${className}`}
      style={{
        width: width,
        height: height,
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-stone-900 rounded-[20px] p-4 border border-stone-200 dark:border-stone-800 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-7 w-36" />
      <Skeleton className="h-3 w-48" />
    </div>
  );
}
