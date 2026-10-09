import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { itemsAPI, transactionsAPI, shopAPI } from '../api';
import { BottomSheet } from '../components/BottomSheet';
import { Toast } from '../components/Toast';
import { EmptyState } from '../components/EmptyState';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Edit2,
  Trash2,
  Check,
  TrendingUp,
} from 'lucide-react';

export function Stock() {
  const { t } = useTranslation();

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Restock modal state
  const [restockItem, setRestockItem] = useState(null);
  const [restockQty, setRestockQty] = useState('20');

  // Add / Edit item modal
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemForm, setItemForm] = useState({
    name: '',
    unit: 'kg',
    unit_price: 60,
    current_stock: 20,
    low_stock_threshold: 10,
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(false);
    try {
      const res = await itemsAPI.getAll();
      setItems(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLoadSamples = async () => {
    try {
      await shopAPI.loadSamples();
      setToast({ type: 'success', message: t('toasts.samplesLoaded') });
      loadItems();
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Could not load sample items' });
    }
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    if (!restockItem) return;
    const qty = parseFloat(restockQty);
    if (!qty || qty <= 0) return;

    try {
      await transactionsAPI.create({
        type: 'restock',
        item_id: restockItem.id,
        item: restockItem.name,
        quantity: qty,
        unit: restockItem.unit,
        amount: qty * restockItem.unit_price,
      });
      setToast({
        type: 'success',
        message: t('toasts.restocked', {
          item: restockItem.name,
          stock: restockItem.current_stock + qty,
          unit: restockItem.unit,
        }),
      });
      setRestockItem(null);
      loadItems();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setItemForm({
      name: '',
      unit: 'kg',
      unit_price: 60,
      current_stock: 20,
      low_stock_threshold: 10,
    });
    setIsItemModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      unit: item.unit,
      unit_price: item.unit_price,
      current_stock: item.current_stock,
      low_stock_threshold: item.low_stock_threshold,
    });
    setIsItemModalOpen(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await itemsAPI.update(editingItem.id, itemForm);
        setToast({ type: 'success', message: 'Product updated successfully' });
      } else {
        await itemsAPI.create(itemForm);
        setToast({ type: 'success', message: t('toasts.itemAdded') });
      }
      setIsItemModalOpen(false);
      loadItems();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await itemsAPI.delete(id);
      loadItems();
      setToast({ type: 'info', message: 'Item removed from inventory' });
    } catch (err) {
      console.error(err);
    }
  };

  const [stockTab, setStockTab] = useState('all'); // 'all' | 'low' | 'unsold'

  const unsoldItems = [
    {
      id: 'unsold-1',
      name: 'Everest Turmeric Powder',
      unit: 'packet',
      unit_price: 42,
      current_stock: 22,
      days_without_sale: 24,
      tied_up_capital: 924,
      recommendation: 'Place near billing counter or offer a bundle discount with Toor Dal.',
    },
    {
      id: 'unsold-2',
      name: 'Mysore Sandal Soap',
      unit: 'packet',
      unit_price: 45,
      current_stock: 18,
      days_without_sale: 19,
      tied_up_capital: 810,
      recommendation: 'Position at eye-level front rack to drive quick impulse purchases.',
    },
  ];

  const filteredItems = items.filter((it) => {
    const matches = it.name.toLowerCase().includes(search.toLowerCase());
    if (!matches) return false;
    if (stockTab === 'low') return it.current_stock <= it.low_stock_threshold;
    return true;
  });

  const lowStockCount = items.filter((it) => it.current_stock <= it.low_stock_threshold).length;

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-200">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black font-heading text-stone-900 dark:text-stone-100 tracking-tight">
            {t('stock.title')}
          </h2>
          <p className="text-xs text-stone-500 font-medium">
            {items.length} products · {lowStockCount} low stock alerts
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('stock.addItem')}</span>
        </button>
      </div>

      {/* Segmented Filter Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl">
        <button
          type="button"
          onClick={() => setStockTab('all')}
          className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all ${
            stockTab === 'all'
              ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          All Items ({items.length})
        </button>
        <button
          type="button"
          onClick={() => setStockTab('low')}
          className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
            stockTab === 'low'
              ? 'bg-rose-500 text-white shadow-xs'
              : 'text-rose-600 dark:text-rose-400'
          }`}
        >
          <span>⚠️ Low Stock</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100">
            {lowStockCount}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setStockTab('unsold')}
          className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
            stockTab === 'unsold'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-amber-700 dark:text-amber-400'
          }`}
        >
          <span>⏳ Unsold Stock</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100">
            {unsoldItems.length}
          </span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('stock.searchPlaceholder')}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-full text-xs font-medium outline-none focus:border-amber-500 shadow-2xs"
        />
      </div>

      {/* Unsold items special view */}
      {stockTab === 'unsold' ? (
        <div className="space-y-3">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              These items have had zero movement in over 15 days. Use the strategies below to clear tied-up capital.
            </span>
          </div>

          {unsoldItems.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-stone-900 rounded-[24px] p-4 border border-rose-200 dark:border-rose-900 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-base font-bold text-stone-900 dark:text-stone-100 font-heading">
                    {item.name}
                  </h4>
                  <p className="text-xs text-stone-500 font-semibold mt-0.5">
                    ₹{item.unit_price} / {item.unit} · {item.days_without_sale} days without sale
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 block">
                    Tied Up Capital
                  </span>
                  <span className="text-lg font-black font-heading text-rose-600">
                    ₹{item.tied_up_capital}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 font-medium">
                💡 Clearance Recommendation: {item.recommendation}
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          emoji="📦"
          title="No Products in Stock"
          description={t('stock.noItems')}
          actionText={t('stock.loadSamples')}
          onAction={handleLoadSamples}
        />
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const isLow = item.current_stock <= item.low_stock_threshold;
            const progressPct = Math.min(
              100,
              Math.round((item.current_stock / (item.low_stock_threshold * 2.5 || 1)) * 100)
            );

            return (
              <div
                key={item.id}
                className={`bg-white dark:bg-stone-900 rounded-[24px] p-4 border transition-all space-y-3 ${
                  isLow
                    ? 'border-rose-300 dark:border-rose-900 shadow-rose-100 dark:shadow-none'
                    : 'border-stone-200/90 dark:border-stone-800 shadow-xs'
                }`}
              >
                {/* Top Info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-stone-900 dark:text-stone-100 font-heading">
                        {item.name}
                      </h4>
                      {isLow ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 flex items-center gap-1 animate-pulse">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>{t('stock.lowStockBadge')}</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                          {t('stock.healthyStock')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 font-semibold mt-0.5">
                      ₹{item.unit_price} / {item.unit}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                      {t('stock.currentStock')}
                    </span>
                    <span
                      className={`text-xl font-black font-heading ${
                        isLow ? 'text-rose-600 dark:text-rose-400' : 'text-stone-900 dark:text-stone-100'
                      }`}
                    >
                      {item.current_stock} {item.unit}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isLow
                          ? 'bg-rose-500'
                          : progressPct < 60
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-semibold text-stone-400">
                    <span>Threshold: {item.low_stock_threshold} {item.unit}</span>
                    <span>Buffer safety</span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setRestockItem(item);
                      setRestockQty('20');
                    }}
                    className="py-1.5 px-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-bold flex items-center gap-1 shadow-xs transition-transform active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('stock.restockButton')}</span>
                  </button>

                  <div className="flex items-center gap-1 text-stone-400">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 hover:text-stone-800 dark:hover:text-stone-200 rounded-lg"
                      title="Edit item"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 hover:text-rose-600 rounded-lg"
                      title="Delete item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RESTOCK SHEET */}
      <BottomSheet
        isOpen={!!restockItem}
        onClose={() => setRestockItem(null)}
        title={t('stock.restockButton')}
        subtitle={`${restockItem?.name} (Current: ${restockItem?.current_stock} ${restockItem?.unit})`}
      >
        <form onSubmit={handleRestockSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              Quantity Received ({restockItem?.unit})
            </label>
            <input
              type="number"
              step="any"
              min="0.5"
              required
              value={restockQty}
              onChange={(e) => setRestockQty(e.target.value)}
              className="w-full p-3 bg-stone-50 dark:bg-stone-800 border rounded-2xl text-lg font-black outline-none focus:border-amber-500"
            />
          </div>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl text-xs text-emerald-900 dark:text-emerald-200 font-semibold">
            ✓ New stock will be: {(restockItem?.current_stock || 0) + (parseFloat(restockQty) || 0)} {restockItem?.unit}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-xs shadow-md"
          >
            Confirm Restock
          </button>
        </form>
      </BottomSheet>

      {/* ADD / EDIT ITEM SHEET */}
      <BottomSheet
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        title={editingItem ? 'Edit Product' : t('stock.addItem')}
      >
        <form onSubmit={handleSaveItem} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
              {t('stock.itemName')}
            </label>
            <input
              type="text"
              required
              value={itemForm.name}
              onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
              placeholder="e.g. Fortune Sunflower Oil"
              className="w-full p-3 bg-stone-50 dark:bg-stone-800 border rounded-2xl text-xs font-bold outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                {t('confirm.unitLabel')}
              </label>
              <select
                value={itemForm.unit}
                onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                className="w-full p-3 bg-stone-50 dark:bg-stone-800 border rounded-2xl text-xs font-bold outline-none"
              >
                <option value="kg">kg</option>
                <option value="L">L</option>
                <option value="packet">packet</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                {t('stock.unitPrice')} (₹)
              </label>
              <input
                type="number"
                step="any"
                required
                value={itemForm.unit_price}
                onChange={(e) =>
                  setItemForm({ ...itemForm, unit_price: parseFloat(e.target.value) || 0 })
                }
                className="w-full p-3 bg-stone-50 dark:bg-stone-800 border rounded-2xl text-xs font-bold outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                {t('stock.currentStock')}
              </label>
              <input
                type="number"
                step="any"
                required
                value={itemForm.current_stock}
                onChange={(e) =>
                  setItemForm({ ...itemForm, current_stock: parseFloat(e.target.value) || 0 })
                }
                className="w-full p-3 bg-stone-50 dark:bg-stone-800 border rounded-2xl text-xs font-bold outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                {t('stock.threshold')}
              </label>
              <input
                type="number"
                step="any"
                required
                value={itemForm.low_stock_threshold}
                onChange={(e) =>
                  setItemForm({ ...itemForm, low_stock_threshold: parseFloat(e.target.value) || 0 })
                }
                className="w-full p-3 bg-stone-50 dark:bg-stone-800 border rounded-2xl text-xs font-bold outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-bold text-xs shadow-md"
          >
            {t('stock.saveItem')}
          </button>
        </form>
      </BottomSheet>
    </div>
  );
}
