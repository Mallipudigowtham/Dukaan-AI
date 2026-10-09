import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BottomSheet } from './BottomSheet';
import { Chip } from './Chip';
import { AlertTriangle, Trash2, Check, IndianRupee } from 'lucide-react';

export function ConfirmSheet({
  isOpen,
  onClose,
  candidate,
  candidatesList = [],
  onConfirmSingle,
  onConfirmBatch,
  items = [],
  customers = [],
}) {
  const { t } = useTranslation();

  // If candidate is a single item
  const [form, setForm] = useState({
    type: 'sale',
    item: '',
    quantity: 1,
    unit: 'kg',
    unit_price: 60,
    amount: 60,
    customer: '',
    notes: '',
  });

  // If candidate is a batch list (from photo import)
  const [batchList, setBatchList] = useState([]);

  useEffect(() => {
    if (candidate) {
      const initialPrice = candidate.unit_price || 60;
      const initialQty = candidate.quantity || 1;
      const initialAmount = candidate.amount || initialPrice * initialQty;

      setForm({
        type: candidate.type || 'sale',
        item: candidate.item || '',
        quantity: initialQty,
        unit: candidate.unit || 'kg',
        unit_price: initialPrice,
        amount: initialAmount,
        customer: candidate.customer || '',
        notes: candidate.notes || '',
      });
    }
  }, [candidate]);

  useEffect(() => {
    if (candidatesList && candidatesList.length > 0) {
      setBatchList(
        candidatesList.map((c, i) => ({
          id: `batch-${i}`,
          type: c.type || 'sale',
          item: c.item || '',
          quantity: c.quantity || 1,
          unit: c.unit || 'kg',
          unit_price: c.unit_price || 50,
          amount: c.amount || (c.quantity || 1) * (c.unit_price || 50),
          customer: c.customer || '',
        }))
      );
    } else {
      setBatchList([]);
    }
  }, [candidatesList]);

  // Recalculate amount if item or qty changes
  const handleItemSelect = (itemName) => {
    const matched = items.find((it) => it.name.toLowerCase() === itemName.toLowerCase());
    const price = matched ? matched.unit_price : form.unit_price;
    const unit = matched ? matched.unit : form.unit;
    const amt = form.quantity * price;

    setForm((prev) => ({
      ...prev,
      item: itemName,
      unit_price: price,
      unit: unit,
      amount: amt,
    }));
  };

  const handleQtyChange = (qty) => {
    const val = parseFloat(qty) || 0;
    const amt = Math.round(val * (form.unit_price || 0));
    setForm((prev) => ({
      ...prev,
      quantity: val,
      amount: amt,
    }));
  };

  // Warnings check
  const matchedItem = items.find(
    (it) => it.name.toLowerCase() === (form.item || '').toLowerCase()
  );
  const stockWillBeZeroOrClamped =
    (form.type === 'sale' || form.type === 'credit') &&
    matchedItem &&
    matchedItem.current_stock < form.quantity;

  const matchedCustomer = customers.find(
    (c) => c.name.toLowerCase() === (form.customer || '').toLowerCase()
  );
  const isOverpayment =
    form.type === 'payment' &&
    matchedCustomer &&
    form.amount > (matchedCustomer.pending_balance || 0);

  const missingCreditCustomer =
    form.type === 'credit' && (!form.customer || form.customer.trim() === '');

  const isBatch = batchList.length > 0;

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={isBatch ? t('confirm.titleBatch', { count: batchList.length }) : t('confirm.title')}
      subtitle={isBatch ? 'Review and edit scanned ledger rows' : 'Edit details before saving'}
    >
      {/* BATCH MODE (From photo scan) */}
      {isBatch ? (
        <div className="space-y-4">
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {batchList.map((row, index) => (
              <div
                key={row.id}
                className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {['sale', 'credit', 'payment', 'restock'].map((tp) => (
                      <Chip
                        key={tp}
                        type={tp}
                        size="sm"
                        label={t(`types.${tp}`)}
                        active={row.type === tp}
                        onClick={() => {
                          const updated = [...batchList];
                          updated[index].type = tp;
                          setBatchList(updated);
                        }}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setBatchList(batchList.filter((_, i) => i !== index));
                    }}
                    className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-stone-400 font-bold block mb-1">
                      {t('confirm.itemLabel')}
                    </label>
                    <input
                      type="text"
                      value={row.item}
                      onChange={(e) => {
                        const updated = [...batchList];
                        updated[index].item = e.target.value;
                        setBatchList(updated);
                      }}
                      className="w-full p-2 bg-white dark:bg-stone-900 border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-400 font-bold block mb-1">
                      {t('confirm.quantityLabel')}
                    </label>
                    <input
                      type="number"
                      value={row.quantity}
                      onChange={(e) => {
                        const updated = [...batchList];
                        updated[index].quantity = parseFloat(e.target.value) || 1;
                        setBatchList(updated);
                      }}
                      className="w-full p-2 bg-white dark:bg-stone-900 border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-400 font-bold block mb-1">
                      {t('confirm.customerLabel')}
                    </label>
                    <input
                      type="text"
                      value={row.customer}
                      onChange={(e) => {
                        const updated = [...batchList];
                        updated[index].customer = e.target.value;
                        setBatchList(updated);
                      }}
                      className="w-full p-2 bg-white dark:bg-stone-900 border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-stone-400 font-bold block mb-1">
                      {t('confirm.amountLabel')}
                    </label>
                    <input
                      type="number"
                      value={row.amount}
                      onChange={(e) => {
                        const updated = [...batchList];
                        updated[index].amount = parseFloat(e.target.value) || 0;
                        setBatchList(updated);
                      }}
                      className="w-full p-2 bg-white dark:bg-stone-900 border rounded-xl font-bold"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-stone-300 dark:border-stone-700 rounded-full text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-100"
            >
              {t('confirm.cancelButton')}
            </button>
            <button
              type="button"
              onClick={() => onConfirmBatch(batchList)}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold shadow-md flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{t('confirm.confirmAllButton')}</span>
            </button>
          </div>
        </div>
      ) : (
        /* SINGLE ENTRY MODE */
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onConfirmSingle(form);
          }}
          className="space-y-4"
        >
          {/* Transaction Type Chips */}
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
              {t('confirm.typeLabel')}
            </label>
            <div className="flex flex-wrap gap-2">
              {['sale', 'credit', 'payment', 'restock'].map((tp) => (
                <Chip
                  key={tp}
                  type={tp}
                  label={t(`types.${tp}`)}
                  active={form.type === tp}
                  onClick={() => setForm({ ...form, type: tp })}
                />
              ))}
            </div>
          </div>

          {/* Warnings Banner */}
          {stockWillBeZeroOrClamped && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 rounded-2xl flex items-center gap-2 text-xs text-amber-900 dark:text-amber-200">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                {t('confirm.warningStockZero', {
                  stock: matchedItem.current_stock,
                  unit: matchedItem.unit,
                })}
              </span>
            </div>
          )}

          {isOverpayment && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 rounded-2xl flex items-center gap-2 text-xs text-rose-900 dark:text-rose-200">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{t('confirm.warningOverpayment', { amount: form.amount })}</span>
            </div>
          )}

          {missingCreditCustomer && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 rounded-2xl flex items-center gap-2 text-xs text-rose-900 dark:text-rose-200">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{t('confirm.warningMissingCustomer')}</span>
            </div>
          )}

          {/* Authenticity Audit Card (Anti-Fake Evaluation) */}
          {candidate?.authenticity && (
            <div className="p-3.5 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-2xl space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-800 dark:text-emerald-200">
                  <span className="p-1 rounded-lg bg-emerald-200/60 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                    🛡️
                  </span>
                  <span>
                    {candidate.authenticity.verdictVernacular || 'Verified Genuine (అసలైన రికార్డు)'}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white">
                  {candidate.authenticity.score}% Authentic
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
                {candidate.authenticity.checks?.[0]?.note || 'Market price benchmark verified with local kirana rates.'}
              </p>
            </div>
          )}

          {/* Product Item Selection */}
          {form.type !== 'payment' && (
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                {t('confirm.itemLabel')}
              </label>
              <input
                type="text"
                required
                value={form.item}
                onChange={(e) => handleItemSelect(e.target.value)}
                placeholder="e.g. Sona Masoori Rice"
                className="w-full p-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-2xl text-sm font-semibold outline-none focus:border-amber-500"
              />
            </div>
          )}

          {/* Qty & Unit */}
          {form.type !== 'payment' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  {t('confirm.quantityLabel')}
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  required
                  value={form.quantity}
                  onChange={(e) => handleQtyChange(e.target.value)}
                  className="w-full p-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-2xl text-sm font-bold outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  {t('confirm.unitLabel')}
                </label>
                <select
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="w-full p-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-2xl text-sm font-bold outline-none focus:border-amber-500"
                >
                  <option value="kg">{t('units.kg')}</option>
                  <option value="L">{t('units.L')}</option>
                  <option value="packet">{t('units.packet')}</option>
                </select>
              </div>
            </div>
          )}

          {/* Customer (Khata) */}
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              {t('confirm.customerLabel')}
            </label>
            <input
              type="text"
              required={form.type === 'credit'}
              value={form.customer}
              onChange={(e) => setForm({ ...form, customer: e.target.value })}
              placeholder={form.type === 'credit' ? 'e.g. Ramesh Sharma' : 'Walk-in customer (optional)'}
              className="w-full p-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-2xl text-sm font-semibold outline-none focus:border-amber-500"
            />
          </div>

          {/* Total Amount */}
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              {t('confirm.amountLabel')}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold">
                ₹
              </span>
              <input
                type="number"
                step="any"
                required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                className="w-full pl-8 pr-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-2xl text-lg font-black text-stone-900 dark:text-stone-100 outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 border border-stone-300 dark:border-stone-700 rounded-full text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-100"
            >
              {t('confirm.cancelButton')}
            </button>
            <button
              type="submit"
              disabled={missingCreditCustomer}
              className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-full text-xs font-bold shadow-md flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{t('confirm.confirmButton')}</span>
            </button>
          </div>
        </form>
      )}
    </BottomSheet>
  );
}
