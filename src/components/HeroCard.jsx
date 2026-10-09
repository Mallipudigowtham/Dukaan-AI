import React from 'react';
import { useTranslation } from 'react-i18next';

export function HeroCard({ children, title, subtitle, className = '' }) {
  const { t } = useTranslation();

  return (
    <div
      className={`relative overflow-hidden rounded-[28px] p-6 text-white shadow-xl bg-gradient-to-br from-orange-500 via-amber-500 to-amber-400 ${className}`}
      style={{
        background: 'var(--hero-grad)',
        boxShadow: 'var(--shadow-brand)',
      }}
    >
      {/* Decorative background glow circles */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-black/5 blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-2">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading leading-tight drop-shadow-xs">
          {title || t('brand.tagline')}
        </h2>
        <p className="text-sm sm:text-base text-white/95 font-medium max-w-md drop-shadow-2xs">
          {subtitle || t('brand.subtitle')}
        </p>
      </div>

      {children && <div className="relative z-10 mt-5">{children}</div>}
    </div>
  );
}
