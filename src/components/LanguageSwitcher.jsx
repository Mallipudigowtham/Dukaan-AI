import React from 'react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../languages';
import { useAuth } from '../context/AuthContext';
import { shopAPI } from '../api';

export function LanguageSwitcher({ variant = 'segmented', className = '' }) {
  const { i18n } = useTranslation();
  const { shop, updateProfileState } = useAuth();
  const currentLang = i18n.language || 'en';

  const switchLanguage = (code) => {
    i18n.changeLanguage(code);
    if (shop) {
      updateProfileState({ preferred_language: code });
      shopAPI.updateProfile({ preferred_language: code }).catch(() => {});
    }
  };

  if (variant === 'pills') {
    return (
      <div className={`inline-flex items-center p-1 bg-stone-200/60 dark:bg-stone-800 rounded-full border border-stone-300/60 dark:border-stone-700/60 ${className}`}>
        {LANGUAGES.map((lang) => {
          const isActive = currentLang === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => switchLanguage(lang.code)}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                isActive
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-stone-700 dark:text-stone-300 hover:text-amber-600'
              }`}
            >
              {lang.shortLabel}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center p-1 bg-stone-100 dark:bg-stone-800/80 rounded-full border border-stone-200 dark:border-stone-700 ${className}`}>
      {LANGUAGES.map((lang) => {
        const isActive = currentLang === lang.code;
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => switchLanguage(lang.code)}
            title={lang.nativeLabel}
            className={`px-2.5 py-1 text-xs font-bold rounded-full transition-all ${
              isActive
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            {lang.shortLabel}
          </button>
        );
      })}
    </div>
  );
}
