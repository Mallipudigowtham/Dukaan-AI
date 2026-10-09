import React from 'react';
import { Store, ShieldCheck, AlertTriangle, IndianRupee, Globe } from 'lucide-react';
import { LanguageCode, ShopProfile } from '../types';
import { SUPPORTED_LANGUAGES } from '../data/initialData';
import { UI_STRINGS } from '../utils/i18n';

interface HeaderProps {
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  shopProfile: ShopProfile;
  onSwitchProfile: () => void;
  todaySalesTotal: number;
  totalUdhaarPending: number;
  lowStockCount: number;
  unsoldStockCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  shopProfile,
  onSwitchProfile,
  todaySalesTotal,
  totalUdhaarPending,
  lowStockCount,
  unsoldStockCount,
}) => {
  const t = UI_STRINGS[currentLanguage] || UI_STRINGS.en;

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Logo & Shop Info */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-sm font-bold text-xl">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-stone-900 tracking-tight">
                  {shopProfile.storeName || t.appTitle}
                </h1>
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Anti-Fake Verified
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium">
                {shopProfile.loginName} · {shopProfile.phoneNumber} · <button onClick={onSwitchProfile} className="text-emerald-700 underline font-semibold hover:text-emerald-900">{t.switchProfile}</button>
              </p>
            </div>
          </div>

          {/* Quick Stats Pill Strip & Language Switcher */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* Sales Stat */}
            <div className="bg-emerald-50 border border-emerald-200/80 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <div>
                <span className="text-emerald-700 font-medium">{t.totalSales}:</span>
                <span className="font-bold text-emerald-900 ml-1">₹{todaySalesTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Udhaar Stat */}
            <div className="bg-amber-50 border border-amber-200/80 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs">
              <IndianRupee className="w-3.5 h-3.5 text-amber-600" />
              <div>
                <span className="text-amber-700 font-medium">{t.pendingUdhaar}:</span>
                <span className="font-bold text-amber-900 ml-1">₹{totalUdhaarPending.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Low Stock Counter */}
            {lowStockCount > 0 && (
              <div className="bg-rose-50 border border-rose-200/80 rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-xs text-rose-700">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span className="font-bold">{lowStockCount}</span>
                <span className="hidden sm:inline">Low Stock</span>
              </div>
            )}

            {/* Unsold Dead Stock Counter */}
            {unsoldStockCount > 0 && (
              <div className="bg-indigo-50 border border-indigo-200/80 rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-xs text-indigo-700">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span className="font-bold">{unsoldStockCount}</span>
                <span className="hidden sm:inline">Unsold items</span>
              </div>
            )}

            {/* Vernacular Language Selector */}
            <div className="flex items-center bg-stone-100 rounded-lg p-0.5 border border-stone-200">
              <Globe className="w-3.5 h-3.5 ml-2 text-stone-500" />
              <select
                aria-label="Language selection"
                value={currentLanguage}
                onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
                className="bg-transparent text-xs font-semibold text-stone-800 py-1 px-2 pr-6 outline-none cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};
