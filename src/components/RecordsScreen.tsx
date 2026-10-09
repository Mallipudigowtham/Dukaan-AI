import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Printer,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  Mic,
  Camera,
  Edit3,
  Calendar,
  IndianRupee,
  Eye,
  X,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Transaction, LanguageCode, TransactionType } from '../types';
import { UI_STRINGS } from '../utils/i18n';

interface RecordsScreenProps {
  currentLanguage: LanguageCode;
  transactions: Transaction[];
}

export const RecordsScreen: React.FC<RecordsScreenProps> = ({
  currentLanguage,
  transactions,
}) => {
  const t = UI_STRINGS[currentLanguage] || UI_STRINGS.en;

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [verdictFilter, setVerdictFilter] = useState<'all' | 'VERIFIED' | 'REQUIRES_CAUTION' | 'SUSPICIOUS_FAKE'>('all');
  const [inspectedTx, setInspectedTx] = useState<Transaction | null>(null);

  // Filters
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.notes || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    const matchesVerdict = verdictFilter === 'all' || tx.evaluation.verdict === verdictFilter;

    return matchesSearch && matchesType && matchesVerdict;
  });

  // Calculate totals
  const totalSalesRevenue = transactions
    .filter((tx) => tx.type === 'sale')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalCreditIssued = transactions
    .filter((tx) => tx.type === 'credit')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalPaymentsCollected = transactions
    .filter((tx) => tx.type === 'payment')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const verifiedCount = transactions.filter((tx) => tx.evaluation.verdict === 'VERIFIED').length;
  const flaggedCount = transactions.filter((tx) => tx.evaluation.verdict !== 'VERIFIED').length;

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Timestamp',
      'Type',
      'Item',
      'Quantity',
      'Unit',
      'UnitPrice',
      'Amount',
      'Customer',
      'Source',
      'AuthenticityScore',
      'Verdict',
      'Notes',
    ];

    const rows = filteredTransactions.map((tx) => [
      tx.id,
      new Date(tx.timestamp).toLocaleString('en-IN'),
      tx.type,
      `"${tx.item.replace(/"/g, '""')}"`,
      tx.quantity,
      tx.unit,
      tx.unitPrice,
      tx.amount,
      `"${tx.customer.replace(/"/g, '""')}"`,
      tx.source,
      tx.evaluation.authenticityScore,
      tx.evaluation.verdict,
      `"${(tx.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DukaanAI_Ledger_Records_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Card */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <span>{t.tabRecords}</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
              {transactions.length} Total Entries
            </span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Systematic audit trail of sales, credit udhaar, payments, and restocks with anti-fake trust records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors border border-stone-200"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Ledger</span>
          </button>
        </div>
      </div>

      {/* Financial Health Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
          <p className="text-[11px] font-bold text-stone-500 uppercase">Cash Sales</p>
          <p className="text-lg font-extrabold text-emerald-700 mt-1">
            ₹{totalSalesRevenue.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-stone-400 mt-0.5">Counter receipts</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
          <p className="text-[11px] font-bold text-stone-500 uppercase">Credit (Udhaar) Given</p>
          <p className="text-lg font-extrabold text-amber-700 mt-1">
            ₹{totalCreditIssued.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-stone-400 mt-0.5">Booked receivables</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
          <p className="text-[11px] font-bold text-stone-500 uppercase">Vasool (Recovered)</p>
          <p className="text-lg font-extrabold text-blue-700 mt-1">
            ₹{totalPaymentsCollected.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-stone-400 mt-0.5">Cleared balances</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
          <p className="text-[11px] font-bold text-stone-500 uppercase">Anti-Fake Audit Score</p>
          <p className="text-lg font-extrabold text-stone-900 mt-1 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600 inline" />
            <span>{Math.round((verifiedCount / (transactions.length || 1)) * 100)}%</span>
          </p>
          <p className="text-[10px] text-stone-400 mt-0.5">
            {flaggedCount === 0 ? 'Zero fraud flags' : `${flaggedCount} caution flags`}
          </p>
        </div>

      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchRecords}
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 outline-none focus:border-emerald-500 focus:bg-white"
          />
        </div>

        {/* Filter Selects */}
        <div className="flex flex-wrap items-center gap-2">
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-stone-800 outline-none"
          >
            <option value="all">All Types</option>
            <option value="sale">Sales (Cash)</option>
            <option value="credit">Credit (Udhaar)</option>
            <option value="payment">Payment (Vasool)</option>
            <option value="restock">Restock</option>
          </select>

          <select
            value={verdictFilter}
            onChange={(e) => setVerdictFilter(e.target.value as any)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-stone-800 outline-none"
          >
            <option value="all">All Audits</option>
            <option value="VERIFIED">Verified Authentic</option>
            <option value="REQUIRES_CAUTION">Requires Caution</option>
            <option value="SUSPICIOUS_FAKE">Suspicious / Fake</option>
          </select>

        </div>
      </div>

      {/* FORMATTED RECORDS TABLE */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Time &amp; Source</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Product / Details</th>
                <th className="py-3 px-3">Customer / Party</th>
                <th className="py-3 px-3 text-right">Amount (₹)</th>
                <th className="py-3 px-4 text-center">Anti-Fake Audit</th>
                <th className="py-3 px-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredTransactions.map((tx) => {
                const dateObj = new Date(tx.timestamp);
                const timeStr = dateObj.toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const dateStr = dateObj.toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <tr key={tx.id} className="hover:bg-stone-50/70 transition-colors">
                    
                    {/* Time & Source */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-stone-800">{timeStr}</div>
                      <div className="text-[10px] text-stone-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{dateStr}</span>
                        <span>·</span>
                        <span className="capitalize font-medium text-stone-500">{tx.source}</span>
                      </div>
                    </td>

                    {/* Transaction Type */}
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                          tx.type === 'sale'
                            ? 'bg-emerald-100 text-emerald-800'
                            : tx.type === 'credit'
                            ? 'bg-amber-100 text-amber-800'
                            : tx.type === 'payment'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>

                    {/* Product & Quantity */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-stone-900">{tx.item}</div>
                      <div className="text-[11px] text-stone-500">
                        {tx.quantity} {tx.unit} @ ₹{tx.unitPrice}/{tx.unit}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-stone-800">{tx.customer}</div>
                      {tx.notes && (
                        <div className="text-[10px] text-stone-400 italic truncate max-w-xs">
                          {tx.notes}
                        </div>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-3 text-right">
                      <span className="font-extrabold text-stone-900 text-sm">
                        ₹{tx.amount.toLocaleString('en-IN')}
                      </span>
                    </td>

                    {/* Anti-Fake Audit Status */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          tx.evaluation.verdict === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : tx.evaluation.verdict === 'REQUIRES_CAUTION'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800 animate-pulse'
                        }`}
                      >
                        {tx.evaluation.verdict === 'VERIFIED' && <ShieldCheck className="w-3 h-3 text-emerald-600" />}
                        {tx.evaluation.verdict === 'REQUIRES_CAUTION' && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                        {tx.evaluation.verdict === 'SUSPICIOUS_FAKE' && <ShieldAlert className="w-3 h-3 text-rose-600" />}
                        <span>{tx.evaluation.authenticityScore}% Trust</span>
                      </span>
                    </td>

                    {/* Inspect Button */}
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setInspectedTx(tx)}
                        className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-500 hover:text-stone-900 transition-colors"
                        title="Inspect Anti-Fraud Audit Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECTION MODAL: ANTI-FRAUD AUDIT DETAILS */}
      {inspectedTx && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Authenticity Audit Breakdown
                </h3>
                <p className="text-xs text-stone-400">Record ID: {inspectedTx.id}</p>
              </div>
              <button
                onClick={() => setInspectedTx(null)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              
              <div className="p-3 bg-stone-50 rounded-xl space-y-1">
                <div className="flex justify-between font-bold text-stone-800">
                  <span>{inspectedTx.item} ({inspectedTx.quantity} {inspectedTx.unit})</span>
                  <span className="text-sm font-extrabold">₹{inspectedTx.amount}</span>
                </div>
                <p className="text-stone-500">Party: {inspectedTx.customer} · Type: {inspectedTx.type}</p>
                <p className="text-[11px] text-stone-400 italic">"{inspectedTx.notes}"</p>
              </div>

              <div
                className={`p-3.5 rounded-xl border space-y-1.5 ${
                  inspectedTx.evaluation.verdict === 'VERIFIED'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : inspectedTx.evaluation.verdict === 'REQUIRES_CAUTION'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>Verdict: {inspectedTx.evaluation.verdict}</span>
                  <span className="font-mono">{inspectedTx.evaluation.authenticityScore}/100 Trust</span>
                </div>
                <p className="leading-relaxed font-medium">
                  {inspectedTx.evaluation.explanation}
                </p>

                {inspectedTx.evaluation.anomalyFlags.length > 0 && (
                  <div className="pt-2 border-t border-stone-200/40 space-y-1">
                    <p className="font-bold uppercase tracking-wider text-[10px]">
                      Triggered Flags:
                    </p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {inspectedTx.evaluation.anomalyFlags.map((flag, idx) => (
                        <li key={idx}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-500 bg-stone-50 p-2.5 rounded-xl">
                <div>
                  <span className="font-semibold text-stone-700">Capture Source:</span> {inspectedTx.source}
                </div>
                <div>
                  <span className="font-semibold text-stone-700">Confidence:</span> {inspectedTx.evaluation.confidence}
                </div>
              </div>

            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setInspectedTx(null)}
                className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold px-4 py-2 rounded-xl"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
