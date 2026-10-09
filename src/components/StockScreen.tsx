import React, { useState } from 'react';
import {
  Package,
  AlertTriangle,
  Clock,
  TrendingDown,
  TrendingUp,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  X,
  IndianRupee,
  ShoppingBag,
  Tag,
} from 'lucide-react';
import { InventoryItem, LanguageCode } from '../types';
import { UI_STRINGS } from '../utils/i18n';

interface StockScreenProps {
  currentLanguage: LanguageCode;
  inventory: InventoryItem[];
  onRestockItem: (itemId: string, restockQty: number, unitCost: number) => void;
  onAddNewItem: (item: Omit<InventoryItem, 'id' | 'daysWithoutSale' | 'monthlySalesVelocity'>) => void;
  onUpdateItemStock: (itemId: string, newStock: number) => void;
}

export const StockScreen: React.FC<StockScreenProps> = ({
  currentLanguage,
  inventory,
  onRestockItem,
  onAddNewItem,
  onUpdateItemStock,
}) => {
  const t = UI_STRINGS[currentLanguage] || UI_STRINGS.en;

  // Active filter tab: 'all' | 'low_stock' | 'unsold'
  const [filterTab, setFilterTab] = useState<'all' | 'low_stock' | 'unsold'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Quick Restock Modal
  const [restockModalItem, setRestockModalItem] = useState<InventoryItem | null>(null);
  const [restockQty, setRestockQty] = useState<string>('25');
  const [restockCost, setRestockCost] = useState<string>('');

  // Add Item Modal
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<InventoryItem['category']>('Grains & Pulses');
  const [newItemUnit, setNewItemUnit] = useState('kg');
  const [newItemPrice, setNewItemPrice] = useState('60');
  const [newItemCost, setNewItemCost] = useState('50');
  const [newItemStock, setNewItemStock] = useState('20');
  const [newItemThreshold, setNewItemThreshold] = useState('10');

  // Low stock products (stock <= threshold)
  const lowStockItems = inventory.filter((item) => item.currentStock <= item.lowStockThreshold);

  // Unsold products (no sales for >= 14 days)
  const unsoldItems = inventory.filter((item) => item.daysWithoutSale >= 14);

  // Tied-up capital in unsold items
  const totalUnsoldLockedCapital = unsoldItems.reduce(
    (sum, item) => sum + item.currentStock * item.unitPrice,
    0
  );

  // Filtered inventory list
  const filteredItems = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

    if (!matchesSearch || !matchesCategory) return false;

    if (filterTab === 'low_stock') {
      return item.currentStock <= item.lowStockThreshold;
    }
    if (filterTab === 'unsold') {
      return item.daysWithoutSale >= 14;
    }
    return true;
  });

  const categories = [
    'All',
    'Grains & Pulses',
    'Oils & Ghee',
    'Dairy & Beverages',
    'Spices & Essentials',
    'Snacks & Packaged',
  ];

  const handleConfirmRestock = () => {
    if (!restockModalItem) return;
    const qty = parseFloat(restockQty);
    const cost = parseFloat(restockCost) || restockModalItem.costPrice;
    if (!qty || qty <= 0) return;

    onRestockItem(restockModalItem.id, qty, cost);
    setRestockModalItem(null);
    setRestockQty('25');
  };

  const handleCreateItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    onAddNewItem({
      name: newItemName.trim(),
      category: newItemCategory,
      unit: newItemUnit,
      unitPrice: parseFloat(newItemPrice) || 50,
      costPrice: parseFloat(newItemCost) || 40,
      currentStock: parseFloat(newItemStock) || 10,
      lowStockThreshold: parseFloat(newItemThreshold) || 5,
      reorderUnitQty: 25,
      lastRestockedDate: new Date().toISOString().split('T')[0],
      lastSoldDate: new Date().toISOString().split('T')[0],
    });

    setNewItemName('');
    setShowAddItemModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Low Stock & Unsold Stock Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Banner 1: STOCK IS GOING TO COMPLETE (Low-Stock Hints) */}
        <div className="bg-gradient-to-br from-rose-50 to-amber-50/60 rounded-2xl p-5 border border-rose-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                {t.reorderHint}
              </span>
              <h3 className="text-base font-bold text-stone-900">
                {lowStockItems.length} Products Almost Out of Stock
              </h3>
              <p className="text-xs text-stone-600">
                Stock is at or below safe buffer threshold. Reorder before weekend rush.
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-700 flex items-center justify-center font-bold text-lg">
              {lowStockItems.length}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-rose-200/50 flex flex-wrap gap-2">
            {lowStockItems.slice(0, 3).map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setRestockModalItem(item);
                  setRestockQty(item.reorderUnitQty.toString());
                  setRestockCost(item.costPrice.toString());
                }}
                className="bg-white hover:bg-rose-50 border border-rose-200 text-stone-800 text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition-colors"
              >
                <span>{item.name}:</span>
                <span className="font-bold text-rose-600">
                  {item.currentStock} {item.unit} left
                </span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1 rounded">
                  +Restock
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Banner 2: ALREADY UNSOLD STOCK OF PRODUCTS (Dead Stock Tracker) */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50/60 rounded-2xl p-5 border border-indigo-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <Clock className="w-3 h-3 text-indigo-600" />
                {t.unsoldStockAlerts}
              </span>
              <h3 className="text-base font-bold text-stone-900">
                ₹{totalUnsoldLockedCapital.toLocaleString('en-IN')} Working Capital Locked
              </h3>
              <p className="text-xs text-stone-600">
                {unsoldItems.length} products with no movement in over 14–35 days.
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-700 flex items-center justify-center font-bold text-lg">
              {unsoldItems.length}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-indigo-200/50 flex flex-wrap gap-2">
            {unsoldItems.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="bg-white border border-indigo-200 text-stone-800 text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5"
              >
                <span className="font-medium">{item.name}:</span>
                <span className="font-bold text-indigo-600">
                  {item.daysWithoutSale} days idle
                </span>
                <span className="text-[10px] text-stone-400">
                  (₹{item.currentStock * item.unitPrice})
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Filter Tabs & Search Strip */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Filter Tabs */}
        <div className="inline-flex p-1 bg-stone-100 rounded-xl border border-stone-200 self-start sm:self-auto">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterTab === 'all'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All Items ({inventory.length})
          </button>
          <button
            onClick={() => setFilterTab('low_stock')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              filterTab === 'low_stock'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock ({lowStockItems.length})</span>
          </button>
          <button
            onClick={() => setFilterTab('unsold')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              filterTab === 'unsold'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-indigo-700 hover:bg-indigo-50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Unsold / Dead Stock ({unsoldItems.length})</span>
          </button>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2 flex-1 sm:justify-end">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product..."
              className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 outline-none focus:border-emerald-500 focus:bg-white"
            />
          </div>

          <button
            onClick={() => setShowAddItemModal(true)}
            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl flex items-center gap-1 transition-colors shrink-0 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Item</span>
          </button>
        </div>

      </div>

      {/* FORMATTED RECORDS: INVENTORY & STOCK TABLE */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Item &amp; Category</th>
                <th className="py-3 px-3">Current Stock</th>
                <th className="py-3 px-3">Status / Alerts</th>
                <th className="py-3 px-3">Retail Price</th>
                <th className="py-3 px-3">Cost Price</th>
                <th className="py-3 px-3">Movement / Idle Days</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredItems.map((item) => {
                const isLow = item.currentStock <= item.lowStockThreshold;
                const isDead = item.daysWithoutSale >= 14;
                const percentOfThreshold = Math.min(
                  100,
                  Math.round((item.currentStock / item.lowStockThreshold) * 50)
                );

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-stone-50/70 transition-colors ${
                      isLow ? 'bg-rose-50/20' : isDead ? 'bg-indigo-50/20' : ''
                    }`}
                  >
                    {/* Item Name */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-stone-900">{item.name}</div>
                      <div className="text-[11px] text-stone-400">{item.category}</div>
                    </td>

                    {/* Current Stock */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-extrabold text-sm ${
                            isLow ? 'text-rose-600' : 'text-stone-900'
                          }`}
                        >
                          {item.currentStock} {item.unit}
                        </span>
                      </div>
                      <div className="w-24 bg-stone-200 h-1.5 rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full rounded-full ${
                            isLow ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, (item.currentStock / (item.lowStockThreshold * 2)) * 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-[10px] text-stone-400 mt-0.5">
                        Buffer limit: {item.lowStockThreshold} {item.unit}
                      </div>
                    </td>

                    {/* Status Alerts */}
                    <td className="py-3 px-3">
                      {isLow ? (
                        <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1 text-[10px]">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          Stock Completing Soon!
                        </span>
                      ) : isDead ? (
                        <span className="bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1 text-[10px]">
                          <Clock className="w-3 h-3 text-indigo-600" />
                          Unsold ({item.daysWithoutSale}d idle)
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-md text-[10px]">
                          Healthy Stock
                        </span>
                      )}
                    </td>

                    {/* Retail Price */}
                    <td className="py-3 px-3 font-semibold text-stone-800">
                      ₹{item.unitPrice}/{item.unit}
                    </td>

                    {/* Cost Price */}
                    <td className="py-3 px-3 text-stone-500">
                      ₹{item.costPrice}/{item.unit}
                    </td>

                    {/* Movement / Idle Days */}
                    <td className="py-3 px-3">
                      {isDead ? (
                        <div>
                          <span className="font-bold text-indigo-700">
                            {item.daysWithoutSale} days without sale
                          </span>
                          <p className="text-[10px] text-stone-500">
                            ₹{item.currentStock * item.unitPrice} tied capital
                          </p>
                        </div>
                      ) : (
                        <div>
                          <span className="text-emerald-700 font-medium">
                            ~{item.monthlySalesVelocity} units / mo
                          </span>
                          <p className="text-[10px] text-stone-400">
                            Last sold: {item.daysWithoutSale === 0 ? 'Today' : `${item.daysWithoutSale}d ago`}
                          </p>
                        </div>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Quick Restock Button (FR-9, UC-5) */}
                        <button
                          onClick={() => {
                            setRestockModalItem(item);
                            setRestockQty(item.reorderUnitQty.toString());
                            setRestockCost(item.costPrice.toString());
                          }}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Restock</span>
                        </button>

                        {/* If unsold, show Liquidation Tip */}
                        {isDead && (
                          <button
                            onClick={() => {
                              alert(
                                `💡 Liquidation Hint for ${item.name}:\n\n` +
                                `• Tied capital: ₹${item.currentStock * item.unitPrice}\n` +
                                `• Strategy: Offer a 10% bundle discount with fast-moving grains or place directly on the front checkout counter.\n` +
                                `• Wholesale return: Wholesaler return window may expire soon.`
                              );
                            }}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold px-2 py-1 rounded-lg border border-indigo-200 transition-colors text-[10px]"
                            title="View AI Liquidation Advice"
                          >
                            <Sparkles className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RESTOCK MODAL (UC-5: Restock purchase decreases low stock flag) */}
      {restockModalItem && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  Record Restock Inflow (UC-5)
                </h3>
                <p className="text-xs text-stone-500">
                  Product: <strong>{restockModalItem.name}</strong> · Current:{' '}
                  {restockModalItem.currentStock} {restockModalItem.unit}
                </p>
              </div>
              <button
                onClick={() => setRestockModalItem(null)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Quantity Received ({restockModalItem.unit})
                </label>
                <input
                  type="number"
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm font-bold text-stone-900 outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Wholesale Cost Price Per Unit (₹)
                </label>
                <input
                  type="number"
                  value={restockCost}
                  onChange={(e) => setRestockCost(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 outline-none focus:border-emerald-600"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                <span className="font-bold">Projected New Stock: </span>
                {restockModalItem.currentStock} + {parseFloat(restockQty) || 0} ={' '}
                <strong>
                  {restockModalItem.currentStock + (parseFloat(restockQty) || 0)}{' '}
                  {restockModalItem.unit}
                </strong>
                <p className="text-[11px] text-emerald-700 mt-1">
                  This will automatically clear the low-stock alert flag!
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                onClick={() => setRestockModalItem(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRestock}
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Restock</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD ITEM MODAL */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateItemSubmit}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-bold text-stone-900">
                Add New Inventory Product
              </h3>
              <button
                type="button"
                onClick={() => setShowAddItemModal(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. Saffola Gold Oil (1L)"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as any)}
                    className="w-full px-2 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 outline-none"
                  >
                    <option value="Grains & Pulses">Grains &amp; Pulses</option>
                    <option value="Oils & Ghee">Oils &amp; Ghee</option>
                    <option value="Dairy & Beverages">Dairy &amp; Beverages</option>
                    <option value="Spices & Essentials">Spices &amp; Essentials</option>
                    <option value="Snacks & Packaged">Snacks &amp; Packaged</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Unit
                  </label>
                  <select
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    className="w-full px-2 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 outline-none"
                  >
                    <option value="kg">kg</option>
                    <option value="L">L</option>
                    <option value="packet">packet</option>
                    <option value="pcs">pcs</option>
                    <option value="box">box</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Retail Price (₹)
                  </label>
                  <input
                    type="number"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Wholesale Cost (₹)
                  </label>
                  <input
                    type="number"
                    value={newItemCost}
                    onChange={(e) => setNewItemCost(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    value={newItemStock}
                    onChange={(e) => setNewItemStock(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    value={newItemThreshold}
                    onChange={(e) => setNewItemThreshold(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowAddItemModal(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm"
              >
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
