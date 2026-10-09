import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useSpeech } from '../hooks/useSpeech';
import { LANGUAGES, getLanguage } from '../languages';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { ThemeToggle } from '../components/ThemeToggle';
import { Mic, MicOff, ArrowRight, ArrowLeft, Store, Check } from 'lucide-react';

export function Register() {
  const { register } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    owner_name: '',
    phone: '',
    password: '',
    preferred_language: i18n.language || 'en',
    shop_name: '',
    shop_type: 'kirana',
    city: '',
    district: '',
    state: 'Tamil Nadu',
    pincode: '',
    address_line: '',
    gstin: '',
    logo_emoji: '🏪',
  });

  const indianStates = [
    'Andhra Pradesh',
    'Telangana',
    'Tamil Nadu',
    'Karnataka',
    'Kerala',
    'Maharashtra',
    'Gujarat',
    'Uttar Pradesh',
    'Madhya Pradesh',
    'Rajasthan',
    'Delhi',
    'Punjab',
    'West Bengal',
    'Bihar',
    'Odisha',
  ];

  const emojiOptions = ['🏪', '🏬', '🛒', '🛍️', '🌾', '☕', '🥛', '🍪', '🌶️', '🍛'];

  // Speech helper for owner name / shop name dictation
  const currentLangObj = getLanguage(formData.preferred_language);
  const {
    isListening: isOwnerListening,
    startListening: startOwnerSpeech,
    stopListening: stopOwnerSpeech,
    transcript: ownerTranscript,
  } = useSpeech(currentLangObj.speechLangCode);

  const {
    isListening: isShopListening,
    startListening: startShopSpeech,
    stopListening: stopShopSpeech,
    transcript: shopTranscript,
  } = useSpeech(currentLangObj.speechLangCode);

  // Sync speech transcripts into form
  React.useEffect(() => {
    if (ownerTranscript) {
      setFormData((prev) => ({ ...prev, owner_name: ownerTranscript }));
    }
  }, [ownerTranscript]);

  React.useEffect(() => {
    if (shopTranscript) {
      setFormData((prev) => ({ ...prev, shop_name: shopTranscript }));
    }
  }, [shopTranscript]);

  const handleStep1Next = (e) => {
    e.preventDefault();
    setError('');

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10 || !['6', '7', '8', '9'].includes(cleanPhone[0])) {
      setError('Please enter a valid 10-digit mobile number starting with 6-9');
      return;
    }
    if (!formData.owner_name.trim()) {
      setError('Owner name is required');
      return;
    }
    if (!formData.password || formData.password.length < 4) {
      setError('Password/PIN must be at least 4 characters');
      return;
    }

    setStep(2);
  };

  const handleFinish = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.shop_name.trim()) {
      setError('Shop name is required');
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = formData.phone.replace(/\D/g, '');
      const createdShop = await register({
        ...formData,
        phone: cleanPhone,
      });
      navigate('/welcome', { state: { shop: createdShop } });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to create shop. Mobile number may already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-stone-50 dark:bg-stone-950 transition-colors">
      {/* Top Bar */}
      <div className="max-w-md w-full mx-auto p-4 flex items-center justify-between">
        <Link to="/login" className="flex items-center gap-2">
          <span className="text-xl">🏪</span>
          <span className="font-extrabold font-heading text-stone-900 dark:text-stone-100">
            {t('brand.name')}
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher variant="segmented" />
          <ThemeToggle />
        </div>
      </div>

      {/* Main Wizard */}
      <div className="max-w-md w-full mx-auto px-4 py-4 flex-1 flex flex-col justify-center">
        <div className="bg-white dark:bg-stone-900 rounded-[28px] shadow-xl border border-stone-200/90 dark:border-stone-800 overflow-hidden">
          {/* Header with Step Progress */}
          <div
            className="p-6 text-white text-center space-y-2"
            style={{ background: 'var(--hero-grad)' }}
          >
            <h1 className="text-2xl font-black font-heading tracking-tight">
              {t('auth.registerTitle')}
            </h1>
            <p className="text-xs font-semibold text-white/90">
              {step === 1 ? t('auth.registerStep1') : t('auth.registerStep2')}
            </p>

            {/* Step progress pills */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <span
                className={`h-2 rounded-full transition-all ${
                  step === 1 ? 'w-8 bg-white' : 'w-4 bg-white/50'
                }`}
              />
              <span
                className={`h-2 rounded-full transition-all ${
                  step === 2 ? 'w-8 bg-white' : 'w-4 bg-white/50'
                }`}
              />
            </div>
          </div>

          {error && (
            <div className="m-6 mb-0 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 rounded-2xl text-xs font-bold">
              {error}
            </div>
          )}

          {/* STEP 1: ABOUT YOU */}
          {step === 1 && (
            <form onSubmit={handleStep1Next} className="p-6 space-y-4">
              {/* Owner Name with Speech Dictation */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                  {t('auth.ownerNameLabel')}
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    placeholder={t('auth.ownerNamePlaceholder')}
                    value={formData.owner_name}
                    onChange={(e) =>
                      setFormData({ ...formData, owner_name: e.target.value })
                    }
                    className="w-full pl-4 pr-11 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-2xl text-sm font-semibold outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={isOwnerListening ? stopOwnerSpeech : startOwnerSpeech}
                    className={`absolute right-2.5 p-2 rounded-xl transition-all ${
                      isOwnerListening
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-stone-200/60 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:text-amber-500'
                    }`}
                    title="Dictate name"
                  >
                    {isOwnerListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Mobile number */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                  {t('auth.phoneLabel')}
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs font-bold text-stone-400 select-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    required
                    placeholder={t('auth.phonePlaceholder')}
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })
                    }
                    className="w-full pl-12 pr-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-2xl text-sm font-bold outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Password / PIN */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                  {t('auth.passwordLabel')}
                </label>
                <input
                  type="password"
                  required
                  placeholder={t('auth.passwordPlaceholder')}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full p-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-2xl text-sm font-semibold outline-none focus:border-amber-500"
                />
              </div>

              {/* Preferred Language */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                  {t('auth.preferredLanguageLabel')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, preferred_language: l.code });
                        i18n.changeLanguage(l.code);
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                        formData.preferred_language === l.code
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-800 dark:text-amber-200'
                          : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <span>{l.flag}</span>
                      <span>{l.nativeLabel}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Next button */}
              <button
                type="submit"
                className="w-full touch-target py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-full font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-97"
              >
                <span>{t('auth.nextButton')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-1">
                <span className="text-xs text-stone-500">{t('auth.alreadyHaveAccount')} </span>
                <Link to="/login" className="text-xs font-bold text-amber-600 underline">
                  {t('auth.loginLink')}
                </Link>
              </div>
            </form>
          )}

          {/* STEP 2: ABOUT YOUR SHOP */}
          {step === 2 && (
            <form onSubmit={handleFinish} className="p-6 space-y-4">
              {/* Logo Emoji */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                  {t('auth.logoEmojiLabel')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData({ ...formData, logo_emoji: emoji })}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition-all ${
                        formData.logo_emoji === emoji
                          ? 'bg-amber-100 border-amber-500 scale-110 shadow-xs'
                          : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shop Name with Speech Dictation */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                  {t('auth.shopNameLabel')}
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    placeholder={t('auth.shopNamePlaceholder')}
                    value={formData.shop_name}
                    onChange={(e) =>
                      setFormData({ ...formData, shop_name: e.target.value })
                    }
                    className="w-full pl-4 pr-11 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-2xl text-sm font-bold outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={isShopListening ? stopShopSpeech : startShopSpeech}
                    className={`absolute right-2.5 p-2 rounded-xl transition-all ${
                      isShopListening
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-stone-200/60 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:text-amber-500'
                    }`}
                    title="Dictate shop name"
                  >
                    {isShopListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Shop Type Chips */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                  {t('auth.shopTypeLabel')}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { key: 'kirana', label: t('auth.shopTypeKirana') },
                    { key: 'general store', label: t('auth.shopTypeGeneral') },
                    { key: 'provision store', label: t('auth.shopTypeProvision') },
                    { key: 'other', label: t('auth.shopTypeOther') },
                  ].map((st) => (
                    <button
                      key={st.key}
                      type="button"
                      onClick={() => setFormData({ ...formData, shop_type: st.key })}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                        formData.shop_type === st.key
                          ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                          : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* City & State */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {t('auth.cityLabel')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('auth.cityPlaceholder')}
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {t('auth.stateLabel')}
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-medium"
                  >
                    {indianStates.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* District & Pincode */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {t('auth.districtLabel')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('auth.districtPlaceholder')}
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {t('auth.pincodeLabel')}
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder={t('auth.pincodePlaceholder')}
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Address (Optional) & GSTIN */}
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {t('auth.addressLabel')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('auth.addressPlaceholder')}
                    value={formData.address_line}
                    onChange={(e) => setFormData({ ...formData, address_line: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    {t('auth.gstinLabel')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('auth.gstinPlaceholder')}
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="py-3 px-4 border border-stone-300 dark:border-stone-700 rounded-full text-xs font-bold text-stone-600 dark:text-stone-300 flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t('auth.backButton')}</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 touch-target py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-full font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-97 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{loading ? 'Creating...' : t('auth.finishButton')}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <footer className="p-4 text-center text-xs text-stone-400">
        DukaanAI · SDG 9: Industry, Innovation and Infrastructure
      </footer>
    </div>
  );
}
