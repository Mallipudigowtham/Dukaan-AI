import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight } from 'lucide-react';

export function Welcome() {
  const { shop: authShop } = useAuth();
  const { state } = useLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const shop = state?.shop || authShop;
  const owner = shop?.owner_name || 'Dukaan Owner';
  const shopName = shop?.shop_name || 'Your Dukaan';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-stone-50 dark:bg-stone-950">
      <div className="max-w-md w-full bg-white dark:bg-stone-900 rounded-[28px] p-8 text-center shadow-xl border border-stone-200 dark:border-stone-800 space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-4xl mx-auto shadow-xs border border-amber-500/20">
          {shop?.logo_emoji || '🏪'}
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Setup Complete</span>
          </div>
          <h1 className="text-2xl font-black font-heading text-stone-900 dark:text-stone-100 tracking-tight">
            {t('auth.welcomeTitle', { owner })}
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 font-medium">
            {t('auth.welcomeSubtitle', { shop: shopName })}
          </p>
        </div>

        <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-100 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-300 space-y-1 text-left">
          <div className="font-bold text-stone-800 dark:text-stone-200">
            ✓ Quick Start Tip:
          </div>
          <p>
            You can tap <strong>Speak it</strong> to record credit in Telugu, Tamil, Hindi or English, or snap a photo of any handwritten khata notebook page.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/entry')}
          className="w-full touch-target py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-full font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-97 cursor-pointer"
        >
          <span>{t('auth.startRecordingButton')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
