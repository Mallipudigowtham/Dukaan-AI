import React from 'react';
import { NavLink } from 'react-router-dom';
import { Mic, Users, Package, LayoutDashboard } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function BottomNav() {
  const { t } = useTranslation();

  const navItems = [
    { to: '/entry', label: t('nav.entry'), icon: Mic },
    { to: '/credit', label: t('nav.credit'), icon: Users },
    { to: '/stock', label: t('nav.stock'), icon: Package },
    { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
  ];

  return (
    <nav className="fixed bottom-3 inset-x-0 z-40 max-w-md mx-auto px-4 pointer-events-none">
      <div className="glass rounded-full shadow-lg border border-stone-200/90 dark:border-stone-800 p-1.5 flex items-center justify-around pointer-events-auto transition-all">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-2 px-3 rounded-full text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md transform -translate-y-0.5'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[11px] tracking-tight">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
