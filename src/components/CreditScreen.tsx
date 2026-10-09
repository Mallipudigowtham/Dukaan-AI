import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Send,
  MessageCircle,
  IndianRupee,
  Phone,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  X,
  CreditCard,
  ShieldAlert,
} from 'lucide-react';
import { CustomerCredit, LanguageCode } from '../types';
import { UI_STRINGS, getWhatsAppReminderMessage } from '../utils/i18n';

interface CreditScreenProps {
  currentLanguage: LanguageCode;
  customers: CustomerCredit[];
  onRecordPayment: (customerId: string, amount: number, notes?: string) => void;
  onAddCustomer: (customer: Omit<CustomerCredit, 'id' | 'history'>) => void;
}

export const CreditScreen: React.FC<CreditScreenProps> = ({
  currentLanguage,
  customers,
  onRecordPayment,
  onAddCustomer,
}) => {
  const t = UI_STRINGS[currentLanguage] || UI_STRINGS.en;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerCredit | null>(null);

  // Quick Payment Modal state
  const [paymentModalCustomer, setPaymentModalCustomer] = useState<CustomerCredit | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentNotes, setPaymentNotes] = useState<string>('Cash repayment at shop');

  // Add Customer Modal
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('+91 ');
  const [newCustLimit, setNewCustLimit] = useState('2000');
  const [newCustInitialBalance, setNewCustInitialBalance] = useState('0');

  // Filter customers
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const totalOutstanding = customers.reduce((sum, c) => sum + c.pendingBalance, 0);
  const customersWithDebt = customers.filter((c) => c.pendingBalance > 0);

  // Trigger WhatsApp Reminder link (FR-14 & UC-4)
  const handleSendWhatsAppReminder = (customer: CustomerCredit) => {
    const message = getWhatsAppReminderMessage(
      customer.name,
      customer.pendingBalance,
      currentLanguage
    );
    const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSendSmsReminder = (customer: CustomerCredit) => {
    const message = getWhatsAppReminderMessage(
      customer.name,
      customer.pendingBalance,
      currentLanguage
    );
    const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
    const url = `sms:${cleanPhone}?body=${encodeURIComponent(message)}`;
    window.location.href = url;
  };

  const handleConfirmPayment = () => {
    if (!paymentModalCustomer) return;
    const amt = parseFloat(paymentAmount);
    if (!amt || amt <= 0) return;

    onRecordPayment(paymentModalCustomer.id, amt, paymentNotes);
    setPaymentModalCustomer(null);
    setPaymentAmount('');
  };

  const handleCreateCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;

    onAddCustomer({
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      pendingBalance: parseFloat(newCustInitialBalance) || 0,
      creditLimit: parseFloat(newCustLimit) || 2000,
      lastTransactionDate: new Date().toISOString().split('T')[0],
    });

    setNewCustName('');
    setNewCustPhone('+91 ');
    setNewCustLimit('2000');
    setNewCustInitialBalance('0');
    setShowAddCustomerModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-600" />
            <span>{t.tabCredit}</span>
            <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
              {customersWithDebt.length} active khata
            </span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Track customer receivables, overdue balances, and 1-tap vernacular WhatsApp reminders
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-right">
            <p className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">
              Total Udhaar Pending
            </p>
            <p className="text-base font-extrabold text-amber-900">
              ₹{totalOutstanding.toLocaleString('en-IN')}
            </p>
          </div>

          <button
            onClick={() => setShowAddCustomerModal(true)}
            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Search & Summary Strip */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer by name or phone..."
            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 outline-none focus:border-amber-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((cust) => {
          const isOverLimit = cust.pendingBalance > cust.creditLimit;
          const isZeroBalance = cust.pendingBalance <= 0;

          return (
            <div
              key={cust.id}
              className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                isOverLimit
                  ? 'border-rose-300 ring-1 ring-rose-300'
                  : cust.pendingBalance > 1000
                  ? 'border-amber-200 hover:border-amber-300 shadow-xs'
                  : 'border-stone-200 hover:border-stone-300 shadow-xs'
              }`}
            >
              <div>
                {/* Customer Top Info */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">{cust.name}</h3>
                    <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-stone-400" />
                      <span>{cust.phone}</span>
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isOverLimit
                        ? 'bg-rose-100 text-rose-800 flex items-center gap-1'
                        : isZeroBalance
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isOverLimit && <ShieldAlert className="w-3 h-3" />}
                    {isOverLimit
                      ? 'Limit Exceeded'
                      : isZeroBalance
                      ? 'No Debt'
                      : 'Pending Udhaar'}
                  </span>
                </div>

                {/* Balance Display */}
                <div className="mt-4 p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-stone-500">
                      Current Udhaar
                    </p>
                    <p
                      className={`text-lg font-extrabold ${
                        isOverLimit
                          ? 'text-rose-600'
                          : isZeroBalance
                          ? 'text-emerald-700'
                          : 'text-stone-900'
                      }`}
                    >
                      ₹{cust.pendingBalance.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-stone-400">
                      Safety Limit
                    </p>
                    <p className="text-xs font-semibold text-stone-600">
                      ₹{cust.creditLimit.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Last transaction date */}
                <p className="text-[11px] text-stone-400 mt-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Last activity: {cust.lastTransactionDate}
                </p>
              </div>

              {/* Actions Strip (UC-4: Remind & Vasool) */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center gap-2">
                {cust.pendingBalance > 0 && (
                  <>
                    {/* 1-Tap WhatsApp Reminder (FR-14 & UC-4) */}
                    <button
                      onClick={() => handleSendWhatsAppReminder(cust)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      title="Send prefilled WhatsApp reminder in vernacular language"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp Remind</span>
                    </button>

                    {/* Quick SMS */}
                    <button
                      onClick={() => handleSendSmsReminder(cust)}
                      className="p-2 border border-stone-200 text-stone-600 hover:bg-stone-50 rounded-xl text-xs transition-colors"
                      title="Send SMS"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}

                {/* Record Vasool Payment */}
                <button
                  onClick={() => {
                    setPaymentModalCustomer(cust);
                    setPaymentAmount(cust.pendingBalance.toString());
                  }}
                  className="bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-bold px-3 py-2 rounded-xl flex items-center justify-center gap-1 transition-colors"
                >
                  <IndianRupee className="w-3 h-3" />
                  <span>Vasool</span>
                </button>

                {/* History button */}
                <button
                  onClick={() => setSelectedCustomer(cust)}
                  className="text-[11px] font-semibold text-stone-600 hover:text-stone-900 underline px-1 py-1"
                >
                  History
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: RECORD VASOOL PAYMENT (UC-2) */}
      {paymentModalCustomer && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  Record Payment Received (Vasool)
                </h3>
                <p className="text-xs text-stone-500">
                  Customer: <strong>{paymentModalCustomer.name}</strong> · Pending: ₹
                  {paymentModalCustomer.pendingBalance.toLocaleString('en-IN')}
                </p>
              </div>
              <button
                onClick={() => setPaymentModalCustomer(null)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Amount Received (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter payment amount..."
                    className="w-full pl-8 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-bold text-stone-900 outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Quick shortcut buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setPaymentAmount(paymentModalCustomer.pendingBalance.toString())
                  }
                  className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-1.5 rounded-lg font-semibold"
                >
                  Full Amount (₹{paymentModalCustomer.pendingBalance})
                </button>
                {paymentModalCustomer.pendingBalance > 500 && (
                  <button
                    type="button"
                    onClick={() => setPaymentAmount('500')}
                    className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-1.5 rounded-lg font-semibold"
                  >
                    ₹500 Part Payment
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Notes / Mode
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-800 outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                onClick={() => setPaymentModalCustomer(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPayment}
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm &amp; Reduce Balance</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CUSTOMER KHATA HISTORY */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  {selectedCustomer.name}'s Udhaar Ledger
                </h3>
                <p className="text-xs text-stone-500">
                  Phone: {selectedCustomer.phone} · Current Balance: ₹
                  {selectedCustomer.pendingBalance.toLocaleString('en-IN')}
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {selectedCustomer.history.length === 0 ? (
                <p className="text-xs text-stone-400 text-center py-6">
                  No previous ledger entries.
                </p>
              ) : (
                selectedCustomer.history.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold px-1.5 py-0.5 rounded text-[10px] uppercase ${
                            entry.type === 'credit'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {entry.type === 'credit' ? 'Goods Taken (+)' : 'Payment (-)'}
                        </span>
                        <span className="text-stone-500">{entry.date}</span>
                      </div>
                      <p className="text-stone-800 font-medium mt-1">{entry.description}</p>
                    </div>

                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          entry.type === 'credit' ? 'text-amber-800' : 'text-emerald-700'
                        }`}
                      >
                        {entry.type === 'credit' ? '+' : '-'}₹{entry.amount.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
              <button
                onClick={() => handleSendWhatsAppReminder(selectedCustomer)}
                className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <MessageCircle className="w-4 h-4" /> Send WhatsApp Reminder
              </button>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="bg-stone-900 text-white text-xs font-semibold px-4 py-2 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD NEW CUSTOMER */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateCustomerSubmit}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-bold text-stone-900">
                Create New Khata Account
              </h3>
              <button
                type="button"
                onClick={() => setShowAddCustomerModal(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Customer Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Anand Kumar"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Mobile Number (for WhatsApp/SMS)
                </label>
                <input
                  type="text"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Credit Limit (₹)
                  </label>
                  <input
                    type="number"
                    value={newCustLimit}
                    onChange={(e) => setNewCustLimit(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 outline-none focus:border-emerald-600 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Initial Balance (₹)
                  </label>
                  <input
                    type="number"
                    value={newCustInitialBalance}
                    onChange={(e) => setNewCustInitialBalance(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowAddCustomerModal(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm"
              >
                Save Account
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
