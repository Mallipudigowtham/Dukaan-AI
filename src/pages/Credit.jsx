import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { customersAPI, transactionsAPI, reminderAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { BottomSheet } from '../components/BottomSheet';
import { Toast } from '../components/Toast';
import { EmptyState } from '../components/EmptyState';
import {
  Users,
  Search,
  Plus,
  MessageCircle,
  Phone,
  IndianRupee,
  Clock,
  Send,
  History,
  Check,
  Edit2,
  X,
} from 'lucide-react';

export function Credit() {
  const { shop } = useAuth();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modals state
  const [historyCustomer, setHistoryCustomer] = useState(null);
  const [customerHistory, setCustomerHistory] = useState([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentCustomer, setPaymentCustomer] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');

  // Edit phone prompt
  const [editingPhoneCust, setEditingPhoneCust] = useState(null);
  const [editPhoneValue, setEditPhoneValue] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(false);
    try {
      const res = await customersAPI.getAll();
      setCustomers(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenHistory = async (customer) => {
    setHistoryCustomer(customer);
    try {
      const res = await customersAPI.getHistory(customer.id);
      setCustomerHistory(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenPayment = (customer) => {
    setPaymentCustomer(customer);
    setPaymentAmount(String(customer.pending_balance || ''));
    setIsPaymentModalOpen(true);
  };

  const handleRecordPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentCustomer) return;
    const amt = parseFloat(paymentAmount);
    if (!amt || amt <= 0) return;

    try {
      await transactionsAPI.create({
        type: 'payment',
        amount: amt,
        customer_id: paymentCustomer.id,
        customer: paymentCustomer.name,
      });
      setIsPaymentModalOpen(false);
      setToast({ type: 'success', message: t('toasts.paymentSaved') });
      loadCustomers();
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Could not record payment.' });
    }
  };

  const handleAddCustomerSubmit = async (e) => {
    e.preventDefault();
    if (!newCustName.trim()) return;

    try {
      await customersAPI.create({
        name: newCustName.trim(),
        phone: newCustPhone.trim() || null,
      });
      setIsAddCustomerOpen(false);
      setNewCustName('');
      setNewCustPhone('');
      setToast({ type: 'success', message: t('toasts.customerAdded') });
      loadCustomers();
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Failed to create customer.' });
    }
  };

  const handleSavePhone = async (e) => {
    e.preventDefault();
    if (!editingPhoneCust) return;
    try {
      await customersAPI.update(editingPhoneCust.id, {
        phone: editPhoneValue.trim() || null,
      });
      setEditingPhoneCust(null);
      loadCustomers();
      setToast({ type: 'success', message: 'Phone number updated' });
    } catch (err) {
      console.error(err);
    }
  };

  // WhatsApp reminder click-to-chat (FR-14)
  const handleRemindWhatsApp = async (customer) => {
    if (!customer.phone) {
      setEditingPhoneCust(customer);
      setEditPhoneValue('');
      setToast({ type: 'warning', message: 'Please add a phone number to send WhatsApp reminders' });
      return;
    }

    try {
      const res = await reminderAPI.getReminder(customer.id, currentLang);
      const url = res.data.whatsapp_url;
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      const cleanPhone = customer.phone.replace(/\D/g, '');
      const msg = t('reminder.whatsappText', {
        customer: customer.name,
        amount: customer.pending_balance,
        shop: shop?.shop_name || 'Sri Lakshmi Kirana',
        owner: shop?.owner_name || 'Owner',
      });
      window.open(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
    }
  };

  // Filter and sort by highest pending balance
  const filteredCustomers = customers
    .filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.phone && c.phone.includes(search))
    )
    .sort((a, b) => (b.pending_balance || 0) - (a.pending_balance || 0));

  const totalCredit = customers.reduce((sum, c) => sum + (c.pending_balance || 0), 0);
  const activeDebtorsCount = customers.filter((c) => (c.pending_balance || 0) > 0).length;

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-200">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black font-heading text-stone-900 dark:text-stone-100 tracking-tight">
            {t('credit.title')}
          </h2>
          <p className="text-xs text-stone-500 font-medium">
            {activeDebtorsCount} customers with pending balance
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddCustomerOpen(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('credit.addCustomer')}</span>
        </button>
      </div>

      {/* Total Pending Card */}
      <div className="bg-gradient-to-br from-rose-500 via-rose-600 to-amber-600 text-white rounded-[28px] p-5 shadow-lg flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-white/80">
            {t('credit.totalPending')}
          </span>
          <div className="text-3xl font-black font-heading mt-0.5">
            ₹{totalCredit.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-2xl">
          ₹
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('credit.searchPlaceholder')}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-full text-xs font-medium outline-none focus:border-amber-500 shadow-2xs"
        />
      </div>

      {/* Customer Cards List */}
      {filteredCustomers.length === 0 ? (
        <EmptyState
          emoji="🎉"
          title={t('credit.noCredit')}
          description="All customer udhaar accounts are cleared."
          actionText={t('credit.addCustomer')}
          onAction={() => setIsAddCustomerOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {filteredCustomers.map((c) => {
            const hasDebt = (c.pending_balance || 0) > 0;
            const initials = c.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();

            return (
              <div
                key={c.id}
                className="bg-white dark:bg-stone-900 rounded-[24px] p-4 border border-stone-200/90 dark:border-stone-800 shadow-xs hover:shadow-md transition-all space-y-3"
              >
                {/* Top Row: Avatar, Name, Phone & Pending Amount */}
                <div className="flex items-start justify-between gap-3">
                  <div
                    onClick={() => handleOpenHistory(c)}
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white font-extrabold text-sm flex items-center justify-center shadow-xs shrink-0">
                      {initials}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-heading">
                        {c.name}
                      </h4>
                      <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-stone-400" />
                        <span>{c.phone ? `+91 ${c.phone}` : 'No phone added'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Pending Amount */}
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                      Udhaar
                    </span>
                    <span
                      className={`text-lg font-black font-heading ${
                        hasDebt ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600'
                      }`}
                    >
                      ₹{Number(c.pending_balance || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Bottom Row Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
                  {hasDebt && (
                    <button
                      type="button"
                      onClick={() => handleRemindWhatsApp(c)}
                      className="flex-1 py-2 px-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] dark:text-[#25D366] font-bold rounded-full flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-current" />
                      <span>{t('credit.remindButton')}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleOpenPayment(c)}
                    className="py-2 px-3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 font-bold rounded-full flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t('credit.recordPayment')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenHistory(c)}
                    className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-full"
                    title="History"
                  >
                    <History className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RECORD PAYMENT BOTTOM SHEET */}
      <BottomSheet
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title={t('credit.recordPayment')}
        subtitle={paymentCustomer?.name}
      >
        <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Payment Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold">
                ₹
              </span>
              <input
                type="number"
                step="any"
                required
                min="1"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-3 bg-stone-50 dark:bg-stone-800 border rounded-2xl text-lg font-black outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPaymentAmount(String(paymentCustomer?.pending_balance || ''))}
              className="text-xs bg-stone-100 dark:bg-stone-800 px-3 py-1.5 rounded-full font-bold"
            >
              Full Amount (₹{paymentCustomer?.pending_balance || 0})
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-xs shadow-md flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Confirm Vasool Payment</span>
          </button>
        </form>
      </BottomSheet>

      {/* CUSTOMER HISTORY BOTTOM SHEET */}
      <BottomSheet
        isOpen={!!historyCustomer}
        onClose={() => setHistoryCustomer(null)}
        title={t('credit.historyTitle', { name: historyCustomer?.name })}
        subtitle={`Current balance: ₹${historyCustomer?.pending_balance || 0}`}
      >
        <div className="space-y-3">
          {customerHistory.length === 0 ? (
            <p className="text-xs text-stone-400 text-center py-6">
              {t('credit.noHistory')}
            </p>
          ) : (
            customerHistory.map((entry) => (
              <div
                key={entry.id}
                className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200/80 dark:border-stone-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                        entry.type === 'credit'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {entry.type === 'credit' ? 'Goods Taken (+)' : 'Payment (-)'}
                    </span>
                    <span className="text-stone-400 text-[10px]">
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-stone-800 dark:text-stone-200 font-semibold mt-1">
                    {entry.item ? `${entry.quantity || 1} ${entry.unit || ''} ${entry.item}` : 'Debt Repayment'}
                  </p>
                </div>
                <div className="text-right font-extrabold font-heading text-sm">
                  {entry.type === 'credit' ? '+' : '-'}₹{entry.amount}
                </div>
              </div>
            ))
          )}
        </div>
      </BottomSheet>

      {/* ADD CUSTOMER MODAL */}
      <BottomSheet
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        title={t('credit.addCustomer')}
      >
        <form onSubmit={handleAddCustomerSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              {t('credit.customerName')}
            </label>
            <input
              type="text"
              required
              value={newCustName}
              onChange={(e) => setNewCustName(e.target.value)}
              placeholder="e.g. Ramesh Sharma"
              className="w-full p-3 bg-stone-50 dark:bg-stone-800 border rounded-2xl text-xs font-bold outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              {t('credit.customerPhone')} (Optional)
            </label>
            <input
              type="tel"
              value={newCustPhone}
              onChange={(e) => setNewCustPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="10-digit mobile number"
              className="w-full p-3 bg-stone-50 dark:bg-stone-800 border rounded-2xl text-xs outline-none focus:border-amber-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-bold text-xs shadow-md"
          >
            {t('credit.saveCustomer')}
          </button>
        </form>
      </BottomSheet>

      {/* EDIT PHONE MODAL */}
      <BottomSheet
        isOpen={!!editingPhoneCust}
        onClose={() => setEditingPhoneCust(null)}
        title={`Add phone for ${editingPhoneCust?.name}`}
      >
        <form onSubmit={handleSavePhone} className="space-y-4">
          <input
            type="tel"
            maxLength={10}
            required
            value={editPhoneValue}
            onChange={(e) => setEditPhoneValue(e.target.value.replace(/\D/g, ''))}
            placeholder="10-digit mobile number"
            className="w-full p-3 bg-stone-50 dark:bg-stone-800 border rounded-2xl text-sm font-bold"
          />
          <button
            type="submit"
            className="w-full py-3 bg-amber-500 text-white rounded-full font-bold text-xs"
          >
            Save Phone Number
          </button>
        </form>
      </BottomSheet>
    </div>
  );
}
