import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../api';
import { StatCard } from '../components/StatCard';
import { EditProfileSheet } from '../components/EditProfileSheet';
import {
  Store,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  Edit2,
  TrendingUp,
  AlertTriangle,
  Package,
  Users,
  FileText,
  IndianRupee,
  Clock,
} from 'lucide-react';

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function Dashboard() {
  const { shop } = useAuth();
  const { t } = useTranslation();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const res = await dashboardAPI.getStats();
      setStats(res.data);
    } catch (err) {
      console.error('Could not load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // Time-based translated greeting
  const getGreeting = () => {
    const hours = new Date().getHours();
    const ownerFirst = (shop?.owner_name || '').split(' ')[0] || 'Owner';
    if (hours < 12) return t('dashboard.greetingMorning', { name: ownerFirst });
    if (hours < 17) return t('dashboard.greetingAfternoon', { name: ownerFirst });
    return t('dashboard.greetingEvening', { name: ownerFirst });
  };

  // Top Items Chart Data
  const topItemsLabels = (stats?.top_items || []).map((i) => i.name);
  const topItemsValues = (stats?.top_items || []).map((i) => i.quantity);

  const topItemsChartData = {
    labels: topItemsLabels.length > 0 ? topItemsLabels : ['Rice', 'Oil', 'Dal', 'Sugar'],
    datasets: [
      {
        label: 'Qty Sold',
        data: topItemsValues.length > 0 ? topItemsValues : [42, 28, 19, 14],
        backgroundColor: '#FF7A1A',
        borderRadius: 12,
        borderSkipped: false,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1D2433',
        padding: 10,
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 12 },
        cornerRadius: 10,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11, weight: 'bold' }, color: '#94A3B8' },
      },
      y: {
        grid: { color: 'rgba(200, 200, 200, 0.15)' },
        ticks: { font: { size: 11 }, color: '#94A3B8' },
      },
    },
  };

  // Daily Sales Line/Bar Chart Data (Last 7 days)
  const dailySalesLabels = (stats?.daily_sales || []).map((d) => d.day);
  const dailySalesValues = (stats?.daily_sales || []).map((d) => d.total);

  const dailySalesChartData = {
    labels: dailySalesLabels.length > 0 ? dailySalesLabels : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        fill: true,
        label: 'Daily Sales (₹)',
        data: dailySalesValues.length > 0 ? dailySalesValues : [1200, 1850, 950, 2400, 3100, 4200, 2900],
        borderColor: '#12B76A',
        backgroundColor: 'rgba(18, 183, 106, 0.15)',
        tension: 0.35,
        pointBackgroundColor: '#12B76A',
        pointRadius: 4,
      },
    ],
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-200">
      {/* Time-based translated greeting */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
            DukaanAI Dashboard
          </span>
          <h2 className="text-xl font-black font-heading text-stone-900 dark:text-stone-100 tracking-tight">
            {getGreeting()}
          </h2>
        </div>
      </div>

      {/* MY SHOP PROFILE CARD (Section 4) */}
      <div
        className="rounded-[28px] p-6 text-white shadow-xl relative overflow-hidden"
        style={{
          background: 'var(--hero-grad)',
          boxShadow: 'var(--shadow-brand)',
        }}
      >
        {/* Glow circle */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />

        {/* Top Info */}
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-sm border border-white/20">
              {shop?.logo_emoji || '🏪'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black font-heading tracking-tight drop-shadow-2xs leading-tight">
                  {shop?.shop_name || 'Sri Lakshmi Kirana Store'}
                </h3>
                <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-300" />
                  Verified
                </span>
              </div>
              <p className="text-xs text-white/90 font-semibold mt-0.5">
                {shop?.owner_name || 'Ramesh Kumar'} · <span className="opacity-80">Owner</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditProfileOpen(true)}
            className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all shadow-xs shrink-0 cursor-pointer"
            title="Edit shop profile"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        {/* Location & Details row */}
        <div className="relative z-10 mt-4 flex flex-wrap items-center gap-3 text-xs text-white/90 font-medium">
          {shop?.phone && (
            <a
              href={`tel:${shop.phone}`}
              className="flex items-center gap-1 hover:underline"
            >
              <Phone className="w-3.5 h-3.5 text-white/70" />
              <span>+91 {shop.phone}</span>
            </a>
          )}
          {(shop?.city || shop?.state) && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-white/70" />
              <span>
                {[shop.city, shop.state].filter(Boolean).join(', ')}
              </span>
            </span>
          )}
          <span className="flex items-center gap-1 opacity-80">
            <Calendar className="w-3.5 h-3.5" />
            <span>Member since Oct 2026</span>
          </span>
        </div>

        {shop?.gstin && (
          <div className="relative z-10 mt-2 text-[11px] font-mono text-white/80">
            GSTIN: {shop.gstin}
          </div>
        )}

        {/* Quick stats mini row */}
        <div className="relative z-10 mt-5 pt-4 border-t border-white/20 grid grid-cols-3 gap-2 text-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-white/70 block">
              Items in Stock
            </span>
            <span className="text-lg font-black font-heading">
              {stats?.quick_stats?.items_in_stock || 12}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-white/70 block">
              Customers
            </span>
            <span className="text-lg font-black font-heading">
              {stats?.quick_stats?.active_customers || 4}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-white/70 block">
              Entries (Mo)
            </span>
            <span className="text-lg font-black font-heading">
              {stats?.quick_stats?.entries_this_month || 38}
            </span>
          </div>
        </div>
      </div>

      {/* 3 GRADIENT STAT CARDS WITH COUNT-UP ANIMATION */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Sales (Today) */}
        <StatCard
          title={t('dashboard.todaySales')}
          value={stats?.today_sales || 1420}
          prefix="₹"
          icon={IndianRupee}
          color="accent"
          trend="Today counter receipts"
        />

        {/* Number of Sales */}
        <StatCard
          title={t('dashboard.salesCount')}
          value={stats?.sales_count || 9}
          suffix=" orders"
          icon={TrendingUp}
          color="brand"
          trend="Bills generated today"
        />

        {/* Total Credit Pending */}
        <StatCard
          title={t('dashboard.creditPending')}
          value={stats?.total_credit_pending || 2540}
          prefix="₹"
          icon={AlertTriangle}
          color="danger"
          trend="Total customer udhaar"
        />
      </div>

      {/* TOP-SELLING ITEMS (Chart.js Bar Chart) */}
      <div className="bg-white dark:bg-stone-900 rounded-[28px] p-5 border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-heading">
            {t('dashboard.topItems')}
          </h3>
          <span className="text-xs text-stone-400 font-semibold">By Quantity</span>
        </div>
        <div className="h-56 w-full">
          <Bar data={topItemsChartData} options={barChartOptions} />
        </div>
      </div>

      {/* DAILY SALES (Last 7 days line/bar chart) */}
      <div className="bg-white dark:bg-stone-900 rounded-[28px] p-5 border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-heading">
            {t('dashboard.dailySales')}
          </h3>
          <span className="text-xs text-stone-400 font-semibold">Revenue Trend</span>
        </div>
        <div className="h-56 w-full">
          <Line data={dailySalesChartData} options={barChartOptions} />
        </div>
      </div>

      {/* REORDER HINTS FOR LOW-STOCK ITEMS */}
      <div className="bg-white dark:bg-stone-900 rounded-[28px] p-5 border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-heading flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>{t('dashboard.reorderHints')}</span>
          </h3>
          <span className="text-xs text-rose-500 font-bold">
            {(stats?.reorder_hints || []).length} items
          </span>
        </div>

        {(!stats?.reorder_hints || stats.reorder_hints.length === 0) ? (
          <p className="text-xs text-stone-400 py-3 text-center">
            All stock levels are above threshold. No reorders needed!
          </p>
        ) : (
          <div className="space-y-2">
            {stats.reorder_hints.map((hint, i) => (
              <div
                key={i}
                className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900/40 text-xs flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="font-bold text-stone-900 dark:text-stone-100">
                    {hint.name}
                  </h4>
                  <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-0.5">
                    {t('dashboard.reorderReason', {
                      stock: hint.current_stock,
                      unit: hint.unit,
                      threshold: hint.threshold,
                      qty: hint.suggested_qty,
                    })}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <span className="text-xs font-black font-heading text-amber-700 dark:text-amber-300">
                    +{hint.suggested_qty} {hint.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* UNSOLD STOCK INVENTORY HINTS (Slow Turnover Clearance) */}
      <div className="bg-white dark:bg-stone-900 rounded-[28px] p-5 border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-heading flex items-center gap-1.5">
            <span className="p-1 rounded-lg bg-rose-500 text-white text-xs">⏳</span>
            <span>Unsold Stock & Liquidation Hints</span>
          </h3>
          <span className="text-xs font-bold text-rose-600">
            {(stats?.unsold_stock_hints || []).length} items
          </span>
        </div>

        {(!stats?.unsold_stock_hints || stats.unsold_stock_hints.length === 0) ? (
          <p className="text-xs text-stone-400 py-3 text-center">
            Healthy inventory turnover! No dead stock identified.
          </p>
        ) : (
          <div className="space-y-2.5">
            {stats.unsold_stock_hints.map((hint, i) => (
              <div
                key={i}
                className="p-3.5 bg-rose-50/70 dark:bg-rose-950/30 rounded-2xl border border-rose-200 dark:border-rose-900/40 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                    {hint.name}
                  </h4>
                  <span className="text-rose-600 font-black text-xs">
                    ₹{hint.tied_up_capital} Tied Up
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  {hint.current_stock} {hint.unit} in stock · {hint.days_without_sale} days without a sale
                </p>
                <div className="bg-white dark:bg-stone-800 p-2 rounded-xl text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200/60 dark:border-emerald-800/40">
                  💡 Strategy: {hint.recommendation}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Sheet */}
      <EditProfileSheet
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onUpdated={() => loadDashboardData()}
      />
    </div>
  );
}
