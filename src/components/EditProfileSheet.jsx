import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BottomSheet } from './BottomSheet';
import { useAuth } from '../context/AuthContext';
import { shopAPI } from '../api';
import { LANGUAGES } from '../languages';
import { LogOut, KeyRound, Check, Store } from 'lucide-react';

export function EditProfileSheet({ isOpen, onClose, onUpdated }) {
  const { shop, updateProfileState, logout } = useAuth();
  const { t, i18n } = useTranslation();

  const [form, setForm] = useState({
    shop_name: shop?.shop_name || '',
    owner_name: shop?.owner_name || '',
    phone: shop?.phone || '',
    shop_type: shop?.shop_type || 'kirana',
    city: shop?.city || '',
    district: shop?.district || '',
    state: shop?.state || '',
    pincode: shop?.pincode || '',
    address_line: shop?.address_line || '',
    gstin: shop?.gstin || '',
    opening_hours: shop?.opening_hours || '7:00 AM - 10:00 PM',
    logo_emoji: shop?.logo_emoji || '🏪',
    preferred_language: shop?.preferred_language || 'en',
  });

  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const emojiOptions = ['🏪', '🏬', '🛒', '🛍️', '🌾', '☕', '🥛', '🍪', '🌶️', '🍛'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await shopAPI.updateProfile(form);
      updateProfileState(res.data);
      if (form.preferred_language && form.preferred_language !== i18n.language) {
        i18n.changeLanguage(form.preferred_language);
      }
      if (onUpdated) onUpdated(res.data);
      onClose();
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await shopAPI.changePassword(oldPassword, newPassword);
      setPasswordMsg({ type: 'success', text: t('toasts.passwordChanged') });
      setOldPassword('');
      setNewPassword('');
      setTimeout(() => setShowPasswordSection(false), 1500);
    } catch (err) {
      setPasswordMsg({ type: 'error', text: 'Incorrect old password or invalid PIN' });
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={t('profile.title')}
      subtitle={shop?.phone ? `+91 ${shop.phone}` : ''}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Shop Emoji Picker */}
        <div>
          <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5">
            {t('auth.logoEmojiLabel')}
          </label>
          <div className="flex flex-wrap gap-2">
            {emojiOptions.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setForm({ ...form, logo_emoji: emoji })}
                className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-all ${
                  form.logo_emoji === emoji
                    ? 'bg-amber-100 border-amber-500 scale-110 shadow-xs'
                    : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Shop Name & Owner Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              {t('auth.shopNameLabel')}
            </label>
            <input
              type="text"
              required
              value={form.shop_name}
              onChange={(e) => setForm({ ...form, shop_name: e.target.value })}
              className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-bold outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              {t('auth.ownerNameLabel')}
            </label>
            <input
              type="text"
              required
              value={form.owner_name}
              onChange={(e) => setForm({ ...form, owner_name: e.target.value })}
              className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-semibold outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Language & Shop Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              {t('auth.preferredLanguageLabel')}
            </label>
            <select
              value={form.preferred_language}
              onChange={(e) => setForm({ ...form, preferred_language: e.target.value })}
              className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-bold outline-none focus:border-amber-500"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.nativeLabel} ({l.label})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              {t('auth.shopTypeLabel')}
            </label>
            <select
              value={form.shop_type}
              onChange={(e) => setForm({ ...form, shop_type: e.target.value })}
              className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-bold outline-none focus:border-amber-500"
            >
              <option value="kirana">{t('auth.shopTypeKirana')}</option>
              <option value="general store">{t('auth.shopTypeGeneral')}</option>
              <option value="provision store">{t('auth.shopTypeProvision')}</option>
              <option value="other">{t('auth.shopTypeOther')}</option>
            </select>
          </div>
        </div>

        {/* City, State, Pincode */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
              {t('auth.cityLabel')}
            </label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
              {t('auth.stateLabel')}
            </label>
            <input
              type="text"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
              {t('auth.pincodeLabel')}
            </label>
            <input
              type="text"
              value={form.pincode}
              onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs"
            />
          </div>
        </div>

        {/* GSTIN & Hours */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              {t('auth.gstinLabel')}
            </label>
            <input
              type="text"
              value={form.gstin}
              onChange={(e) => setForm({ ...form, gstin: e.target.value })}
              placeholder="e.g. 33AAAAA0000A1Z5"
              className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Opening Hours
            </label>
            <input
              type="text"
              value={form.opening_hours}
              onChange={(e) => setForm({ ...form, opening_hours: e.target.value })}
              placeholder="e.g. 7 AM - 10 PM"
              className="w-full p-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs"
            />
          </div>
        </div>

        {/* Save button */}
        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-full text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
        >
          <Check className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : t('profile.saveChanges')}</span>
        </button>
      </form>

      {/* Change Password Dropdown */}
      <div className="pt-3 border-t border-stone-100 dark:border-stone-800 space-y-2">
        <button
          type="button"
          onClick={() => setShowPasswordSection(!showPasswordSection)}
          className="text-xs font-bold text-stone-700 dark:text-stone-300 hover:text-amber-500 flex items-center gap-1.5"
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>{t('profile.changePassword')}</span>
        </button>

        {showPasswordSection && (
          <form onSubmit={handleChangePassword} className="p-3 bg-stone-50 dark:bg-stone-800 rounded-2xl space-y-2">
            <input
              type="password"
              required
              placeholder={t('profile.oldPassword')}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full p-2 bg-white dark:bg-stone-900 border rounded-xl text-xs"
            />
            <input
              type="password"
              required
              placeholder={t('profile.newPassword')}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 bg-white dark:bg-stone-900 border rounded-xl text-xs"
            />
            {passwordMsg && (
              <p
                className={`text-[11px] font-bold ${
                  passwordMsg.type === 'success' ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {passwordMsg.text}
              </p>
            )}
            <button
              type="submit"
              className="px-4 py-1.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full text-xs font-bold"
            >
              Update Password
            </button>
          </form>
        )}
      </div>

      {/* Logout button */}
      <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex justify-end">
        <button
          type="button"
          onClick={() => {
            onClose();
            logout();
          }}
          className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 py-2 px-3 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-full transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{t('profile.logout')}</span>
        </button>
      </div>
    </BottomSheet>
  );
}
