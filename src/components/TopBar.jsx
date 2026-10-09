import React from 'react';
import { Store, WifiOff, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';

export function TopBar({ onOpenProfile, pendingSyncCount = 0, isOnline = true }) {
  const { shop } = useAuth();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-30 glass border-b border-stone-200/80 dark:border-stone-800 transition-colors">
      <div className="max-w-xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Shop logo & name */}
        <div
          onClick={onOpenProfile}
          className="flex items-center gap-2.5 cursor-pointer group"
          role="button"
          tabIndex={0}
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-lg font-bold shadow-xs transition-transform group-hover:scale-105">
            {shop?.logo_emoji || '🏪'}
          </div>
          <div className="text-left">
            <h1 className="text-base font-bold text-stone-900 dark:text-stone-100 tracking-tight leading-tight line-clamp-1 group-hover:text-amber-600 transition-colors">
              {shop?.shop_name || 'DukaanAI'}
            </h1>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
              {shop?.owner_name ? `${shop.owner_name} (Owner)` : t('brand.tagline')}
            </p>
          </div>
        </div>

        {/* Right actions: Offline badge, Lang, Theme */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {!isOnline && (
            <span
              title={t('topbar.offlineBadge')}
              className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
            >
              <WifiOff className="w-3 h-3 text-amber-700" />
              <span className="hidden sm:inline">Offline</span>
            </span>
          )}

          {pendingSyncCount > 0 && (
            <span
              title={t('topbar.pendingSync')}
              className="bg-blue-100 text-blue-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse"
            >
              <RefreshCw className="w-3 h-3 text-blue-700 animate-spin" />
              <span>{pendingSyncCount}</span>
            </span>
          )}

          <LanguageSwitcher variant="segmented" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
