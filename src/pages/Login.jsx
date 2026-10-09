import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { ThemeToggle } from '../components/ThemeToggle';
import { LANGUAGES } from '../languages';
import {
  Store,
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Globe,
} from 'lucide-react';

const QUICK_PRESETS = [
  {
    storeName: 'Sri Lakshmi Kirana Store',
    ownerName: 'Ramesh Kumar',
    phone: '9876543210',
    lang: 'en',
    badge: 'English',
    emoji: '🏪',
  },
  {
    storeName: 'శ్రీ లక్ష్మి కిరాణా స్టోర్',
    ownerName: 'రమేష్ కుమార్',
    phone: '9848012345',
    lang: 'te',
    badge: 'తెలుగు (Telugu)',
    emoji: '🌾',
  },
  {
    storeName: 'ஸ்ரீ கிருஷ்ணா மளிகை கடை',
    ownerName: 'கார்த்திக் ராஜா',
    phone: '9700123456',
    lang: 'ta',
    badge: 'தமிழ் (Tamil)',
    emoji: '🛒',
  },
  {
    storeName: 'श्री गणेश किराना भंडार',
    ownerName: 'सुरेश कुमार',
    phone: '9912345678',
    lang: 'hi',
    badge: 'हिन्दी (Hindi)',
    emoji: '🏬',
  },
];

export function Login() {
  const { login } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const currentLang = i18n.language || 'en';

  const [storeName, setStoreName] = useState('Sri Lakshmi Kirana Store');
  const [ownerName, setOwnerName] = useState('Ramesh Kumar');
  const [phone, setPhone] = useState('9876543210');
  const [password, setPassword] = useState('demo123');
  const [preferredLang, setPreferredLang] = useState(currentLang);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLanguageSelect = (langCode) => {
    setPreferredLang(langCode);
    i18n.changeLanguage(langCode);
  };

  const applyPreset = (preset) => {
    setStoreName(preset.storeName);
    setOwnerName(preset.ownerName);
    setPhone(preset.phone);
    setPassword('demo123');
    setPreferredLang(preset.lang);
    i18n.changeLanguage(preset.lang);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10 || !['6', '7', '8', '9'].includes(cleanPhone[0])) {
      setError('Please enter a valid 10-digit mobile number starting with 6, 7, 8 or 9');
      return;
    }

    if (!storeName.trim()) {
      setError('Please provide your Store / Dukaan Name');
      return;
    }

    if (!ownerName.trim()) {
      setError('Please provide your Login / Owner Name');
      return;
    }

    setLoading(true);
    try {
      await login(cleanPhone, password || 'demo123', {
        shop_name: storeName.trim(),
        owner_name: ownerName.trim(),
        preferred_language: preferredLang,
      });
      navigate('/entry');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-stone-50 dark:bg-stone-950 transition-colors pb-8">
      {/* Top utility row */}
      <div className="max-w-md w-full mx-auto p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏪</span>
          <div>
            <span className="font-extrabold font-heading text-stone-900 dark:text-stone-100 tracking-tight text-lg">
              {t('brand.name')}
            </span>
            <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 px-1.5 py-0.5 rounded-md">
              Kirana AI
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher variant="segmented" />
          <ThemeToggle />
        </div>
      </div>

      {/* Main card */}
      <div className="max-w-md w-full mx-auto px-4 py-3 flex-1 flex flex-col justify-center">
        <div className="bg-white dark:bg-stone-900 rounded-[28px] shadow-xl border border-stone-200/90 dark:border-stone-800 overflow-hidden">
          {/* Header Gradient */}
          <div
            className="p-6 text-white text-center space-y-1 relative"
            style={{ background: 'var(--hero-grad)' }}
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-3xl shadow-sm border border-white/20 mb-2">
              🏪
            </div>
            <h1 className="text-2xl font-black font-heading tracking-tight drop-shadow-2xs">
              {t('brand.tagline')}
            </h1>
            <p className="text-xs font-semibold text-white/90">
              {preferredLang === 'te'
                ? 'వాయిస్ & ఫోటో ద్వారా కిరాణా లెడ్జర్, స్టాక్ మరియు ఉధార్ నిర్వహణ'
                : preferredLang === 'ta'
                ? 'குரல் மற்றும் புகைப்படம் மூலம் மளிகை கடை கணக்கு & சரக்கு மேலாண்மை'
                : preferredLang === 'hi'
                ? 'बोलकर या फोटो खींचकर किराना खाता, स्टॉक और उधारी दर्ज करें'
                : 'Digital Kirana ledger with Voice, Photo OCR & Authenticity Audit'}
            </p>
          </div>

          {/* Quick presets */}
          <div className="px-6 pt-4 pb-1">
            <div className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>{preferredLang === 'te' ? 'త్వరిత డెమో దుకాణాలు (1-Tap Select)' : 'Quick Demo Profiles'}</span>
              <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5">
                <Sparkles className="w-3 h-3" /> Auto-fill
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                    phone === p.phone
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 dark:border-amber-500 font-bold'
                      : 'bg-stone-50 dark:bg-stone-800/50 border-stone-200 dark:border-stone-700 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-stone-800 dark:text-stone-100 truncate text-[11px]">
                    <span>{p.emoji}</span>
                    <span className="truncate">{p.storeName}</span>
                  </div>
                  <div className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 truncate">
                    {p.ownerName} · {p.badge}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 pt-3 space-y-3.5">
            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 rounded-2xl text-xs font-bold animate-in fade-in">
                {error}
              </div>
            )}

            {/* Preferred Language selector buttons */}
            <div>
              <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  {preferredLang === 'te'
                    ? 'ప్రాధాన్యత భాష (Preferred Language)'
                    : preferredLang === 'ta'
                    ? 'விருப்ப மொழி (Preferred Language)'
                    : preferredLang === 'hi'
                    ? 'पसंदीदा भाषा (Preferred Language)'
                    : 'Preferred Language'}
                </span>
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleLanguageSelect(lang.code)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all border ${
                      preferredLang === lang.code
                        ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                        : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <div>{lang.nativeLabel}</div>
                    <div className="text-[9px] opacity-80">{lang.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Store Name */}
            <div>
              <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Store className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  {preferredLang === 'te'
                    ? 'దుకాణం పేరు (Store Name)'
                    : preferredLang === 'ta'
                    ? 'கடையின் பெயர் (Store Name)'
                    : preferredLang === 'hi'
                    ? 'दुकान का नाम (Store Name)'
                    : 'Store / Shop Name'}
                </span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sri Lakshmi Kirana Store"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-2xl text-sm font-bold text-stone-900 dark:text-stone-100 outline-none focus:border-amber-500 focus:bg-white transition-all"
              />
            </div>

            {/* Login / Owner Name */}
            <div>
              <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  {preferredLang === 'te'
                    ? 'లాగిన్ యజమాని పేరు (Login / Owner Name)'
                    : preferredLang === 'ta'
                    ? 'உரிமையாளர் பெயர் (Login / Owner Name)'
                    : preferredLang === 'hi'
                    ? 'दुकानदार का नाम (Login / Owner Name)'
                    : 'Login / Owner Name'}
                </span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-2xl text-sm font-bold text-stone-900 dark:text-stone-100 outline-none focus:border-amber-500 focus:bg-white transition-all"
              />
            </div>

            {/* Mobile number */}
            <div>
              <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  {preferredLang === 'te'
                    ? 'మొబైల్ ఫోన్ నంబర్ (Phone Number)'
                    : preferredLang === 'ta'
                    ? 'மொபைல் எண் (Phone Number)'
                    : preferredLang === 'hi'
                    ? 'मोबाइल नंबर (Phone Number)'
                    : 'Mobile Phone Number'}
                </span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-xs font-bold text-stone-400 select-none">
                  +91
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                  required
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-12 pr-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-2xl text-sm font-bold text-stone-900 dark:text-stone-100 outline-none focus:border-amber-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Password / PIN */}
            <div>
              <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  <span>
                    {preferredLang === 'te'
                      ? 'పాస్‌వర్డ్ / పిన్ (Password / PIN)'
                      : preferredLang === 'ta'
                      ? 'கடவுச்சொல் / பின் (Password / PIN)'
                      : preferredLang === 'hi'
                      ? 'पासवर्ड / पिन (Password / PIN)'
                      : 'Password / PIN'}
                  </span>
                </span>
                <span className="text-[10px] text-stone-400 font-normal">Default: demo123</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="demo123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-3.5 pr-11 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-2xl text-sm font-bold text-stone-900 dark:text-stone-100 outline-none focus:border-amber-500 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full touch-target py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-full font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-97 disabled:opacity-50 mt-2"
            >
              <span>
                {loading
                  ? 'Logging in...'
                  : preferredLang === 'te'
                  ? 'దుకాణంలోకి ప్రవేశించండి (Enter Store)'
                  : preferredLang === 'ta'
                  ? 'கடைக்குள் நுழையவும் (Enter Store)'
                  : preferredLang === 'hi'
                  ? 'दुकान में प्रवेश करें (Enter Store)'
                  : 'Enter Store & Open Ledger'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-3 text-center text-xs text-stone-400">
        DukaanAI · SDG 9: Industry, Innovation and Infrastructure
      </footer>
    </div>
  );
}
