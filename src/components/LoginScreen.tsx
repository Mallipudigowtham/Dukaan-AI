import React, { useState } from 'react';
import {
  Store,
  User,
  Phone,
  Globe,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { ShopProfile, LanguageCode } from '../types';
import { SUPPORTED_LANGUAGES } from '../data/initialData';
import { UI_STRINGS } from '../utils/i18n';

interface LoginScreenProps {
  currentProfile: ShopProfile;
  onLoginSubmit: (profile: ShopProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  currentProfile,
  onLoginSubmit,
}) => {
  const [loginName, setLoginName] = useState(currentProfile.loginName || 'Gowtham Mallipudi');
  const [phoneNumber, setPhoneNumber] = useState(currentProfile.phoneNumber || '+91 98765 43210');
  const [storeName, setStoreName] = useState(currentProfile.storeName || 'Sri Balaji Kirana & General Stores');
  const [preferredLanguage, setPreferredLanguage] = useState<LanguageCode>(currentProfile.preferredLanguage || 'te');

  const t = UI_STRINGS[preferredLanguage] || UI_STRINGS.en;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginName.trim() || !storeName.trim()) return;

    onLoginSubmit({
      loginName: loginName.trim(),
      phoneNumber: phoneNumber.trim(),
      storeName: storeName.trim(),
      preferredLanguage,
      isLoggedIn: true,
    });
  };

  // Quick 1-click presets for evaluators
  const handleQuickPreset = (preset: {
    name: string;
    phone: string;
    store: string;
    lang: LanguageCode;
  }) => {
    setLoginName(preset.name);
    setPhoneNumber(preset.phone);
    setStoreName(preset.store);
    setPreferredLanguage(preset.lang);

    onLoginSubmit({
      loginName: preset.name,
      phoneNumber: preset.phone,
      storeName: preset.store,
      preferredLanguage: preset.lang,
      isLoggedIn: true,
    });
  };

  return (
    <div className="min-h-screen bg-stone-100/80 flex items-center justify-center p-4 py-8">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
              <Store className="w-7 h-7" />
            </div>
            <span className="text-[11px] font-bold bg-white/20 border border-white/30 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Anti-Fake Kirana Ledger
            </span>
          </div>

          <h1 className="text-2xl font-black tracking-tight mt-4">
            {t.appTitle}
          </h1>
          <p className="text-xs text-emerald-100 font-medium mt-1">
            {t.loginSubtitle}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          
          {/* Shopkeeper Name */}
          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t.loginNameLabel}</span>
            </label>
            <input
              type="text"
              required
              value={loginName}
              onChange={(e) => setLoginName(e.target.value)}
              placeholder={t.loginNamePlaceholder}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-sm text-stone-900 outline-none focus:border-emerald-600 focus:bg-white font-semibold transition-all"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t.phoneLabel}</span>
            </label>
            <input
              type="tel"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder={t.phonePlaceholder}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-sm text-stone-900 outline-none focus:border-emerald-600 focus:bg-white font-medium transition-all"
            />
          </div>

          {/* Store Name */}
          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t.storeNameLabel}</span>
            </label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder={t.storeNamePlaceholder}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-sm text-stone-900 outline-none focus:border-emerald-600 focus:bg-white font-bold transition-all"
            />
          </div>

          {/* Preferred Language Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t.preferredLangLabel}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  type="button"
                  key={lang.code}
                  onClick={() => setPreferredLanguage(lang.code)}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                    preferredLanguage === lang.code
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-emerald-300'
                  }`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.nativeName}</span>
                  <span className="text-[10px] text-stone-400 font-normal">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 px-6 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-md transition-all transform active:scale-98"
          >
            <span>{t.loginBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* 1-Tap Quick Setup Presets for Evaluator */}
          <div className="pt-4 border-t border-stone-200/80">
            <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              1-Tap Evaluator Demos (Multilingual):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              
              <button
                type="button"
                onClick={() =>
                  handleQuickPreset({
                    name: 'రమేష్ చంద్ర (Ramesh)',
                    phone: '+91 98480 12345',
                    store: 'శ్రీ లక్ష్మి కిరాణా స్టోర్ (Sri Lakshmi Kirana)',
                    lang: 'te',
                  })
                }
                className="p-2 bg-stone-50 hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 rounded-xl text-left transition-colors"
              >
                <div className="font-bold text-stone-800">తెలుగు కిరాణా (Telugu Demo)</div>
                <div className="text-[11px] text-stone-500 truncate">రమేష్ · శ్రీ లక్ష్మి కిరాణా</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickPreset({
                    name: 'ராஜேஷ் செல்வம் (Rajesh)',
                    phone: '+91 97001 23456',
                    store: 'பாலாஜி மளிகை கடை (Balaji Maligai)',
                    lang: 'ta',
                  })
                }
                className="p-2 bg-stone-50 hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 rounded-xl text-left transition-colors"
              >
                <div className="font-bold text-stone-800">தமிழ் மளிகை (Tamil Demo)</div>
                <div className="text-[11px] text-stone-500 truncate">ராஜேஷ் · பாலாஜி கடை</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickPreset({
                    name: 'राजेश शर्मा (Rajesh Sharma)',
                    phone: '+91 98112 34567',
                    store: 'श्री बालाजी किराना भंडार (Balaji Kirana)',
                    lang: 'hi',
                  })
                }
                className="p-2 bg-stone-50 hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 rounded-xl text-left transition-colors"
              >
                <div className="font-bold text-stone-800">हिन्दी किराना (Hindi Demo)</div>
                <div className="text-[11px] text-stone-500 truncate">राजेश · श्री बालाजी भंडार</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickPreset({
                    name: 'Gowtham Mallipudi',
                    phone: '+91 98765 43210',
                    store: 'Sri Balaji Kirana & General Stores',
                    lang: 'en',
                  })
                }
                className="p-2 bg-stone-50 hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 rounded-xl text-left transition-colors"
              >
                <div className="font-bold text-stone-800">English Kirana (English Demo)</div>
                <div className="text-[11px] text-stone-500 truncate">Gowtham · Sri Balaji Kirana</div>
              </button>

            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
