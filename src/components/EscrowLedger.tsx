import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import {
  Download,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  Filter,
  ArrowUpDown,
} from 'lucide-react';
import { formatCurrency } from '../data';
import type { EscrowTransactionType } from '../types';

const TYPE_BADGE: Record<EscrowTransactionType, string> = {
  deposit: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'platform-fee': 'bg-navy-50 text-navy-700 border-navy-200',
  'settlement-payout': 'bg-rose-50 text-rose-700 border-rose-200',
  withdrawal: 'bg-amber-50 text-amber-700 border-amber-200',
  adjustment: 'bg-gold-50 text-gold-700 border-gold-200',
  'interest-earned': 'bg-teal-50 text-teal-700 border-teal-200',
};

const TYPE_LABEL: Record<EscrowTransactionType, string> = {
  deposit: 'Deposit',
  'platform-fee': 'Platform Fee',
  'settlement-payout': 'Settlement',
  withdrawal: 'Withdrawal',
  adjustment: 'Adjustment',
  'interest-earned': 'Interest',
};

export default function EscrowLedger() {
  const { state } = useApp();
  const [typeFilter, setTypeFilter] = useState<EscrowTransactionType | 'all'>('all');
  const [rangeFilter, setRangeFilter] = useState<'all' | '30' | '90' | '180'>('all');

  const sorted = useMemo(
    () => [...state.escrowTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [state.escrowTransactions]
  );

  const filtered = sorted.filter((t) => {
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;
    if (rangeFilter !== 'all') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - Number(rangeFilter));
      if (new Date(t.date) < cutoff) return false;
    }
    return true;
  });

  const currentBalance = state.escrowBalance;
  const lastMonthTx = sorted.filter((t) => {
    const d = new Date(t.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const thisMonthDelta = lastMonthTx.reduce((s, t) => s + t.amount, 0);

  const nextDepositDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    d.setDate(1);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }, []);

  const handleDownload = () => {
    const headers = ['Date', 'Description', 'Type', 'Amount', 'Running Balance', 'Reference'];
    const rows = filtered.map((t) => [
      t.date,
      t.description,
      TYPE_LABEL[t.type],
      String(t.amount),
      String(t.runningBalance),
      t.reference || '',
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'escrow-ledger.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="bg-cream-50 rounded-2xl border border-cream-300 p-6 shadow-sm">
          <p className="text-xs font-bold text-navy-400 uppercase tracking-wider mb-1">Current Balance</p>
          <p className="text-3xl font-bold text-navy-900">{formatCurrency(currentBalance)}</p>
        </div>
        <div className="bg-cream-50 rounded-2xl border border-cream-300 p-6 shadow-sm">
          <p className="text-xs font-bold text-navy-400 uppercase tracking-wider mb-1">This Month</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-navy-900">{formatCurrency(thisMonthDelta)}</p>
            {thisMonthDelta >= 0 ? (
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-rose-600" />
            )}
          </div>
        </div>
        <div className="bg-cream-50 rounded-2xl border border-cream-300 p-6 shadow-sm">
          <p className="text-xs font-bold text-navy-400 uppercase tracking-wider mb-1">Next Deposit</p>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-gold-600" />
            <p className="text-lg font-bold text-navy-900">{nextDepositDate}</p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap items-center gap-3"
      >
        <div className="flex items-center gap-2 bg-cream-100 rounded-xl px-3 py-2">
          <Filter className="w-4 h-4 text-navy-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as EscrowTransactionType | 'all')}
            className="bg-transparent text-sm text-navy-700 font-medium outline-none cursor-pointer"
          >
            <option value="all">All Types</option>
            {Object.entries(TYPE_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 bg-cream-100 rounded-xl px-3 py-2">
          <ArrowUpDown className="w-4 h-4 text-navy-400" />
          <select
            value={rangeFilter}
            onChange={(e) => setRangeFilter(e.target.value as 'all' | '30' | '90' | '180')}
            className="bg-transparent text-sm text-navy-700 font-medium outline-none cursor-pointer"
          >
            <option value="all">All Time</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="180">Last 6 Months</option>
          </select>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleDownload}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-900 text-cream-50 text-sm font-medium hover:bg-navy-800 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download CSV
        </motion.button>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-cream-50 rounded-2xl border border-cream-300 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-cream-100 z-10">
              <tr>
                <th className="text-left text-xs font-bold text-navy-500 uppercase tracking-wider px-5 py-3">Date</th>
                <th className="text-left text-xs font-bold text-navy-500 uppercase tracking-wider px-5 py-3">Description</th>
                <th className="text-left text-xs font-bold text-navy-500 uppercase tracking-wider px-5 py-3">Type</th>
                <th className="text-right text-xs font-bold text-navy-500 uppercase tracking-wider px-5 py-3">Amount</th>
                <th className="text-right text-xs font-bold text-navy-500 uppercase tracking-wider px-5 py-3">Balance</th>
                <th className="text-left text-xs font-bold text-navy-500 uppercase tracking-wider px-5 py-3">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-cream-100/50 transition-colors">
                  <td className="px-5 py-3.5 text-navy-600 whitespace-nowrap">
                    {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3.5 text-navy-800 font-medium">
                    {t.description}
                    {t.creditorId && (
                      <span className="block text-[11px] text-navy-400">
                        {state.cards.find((c) => c.id === t.creditorId)?.creditor}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${TYPE_BADGE[t.type]}`}
                    >
                      {TYPE_LABEL[t.type]}
                    </span>
                  </td>
                  <td
                    className={`px-5 py-3.5 text-right font-bold whitespace-nowrap ${
                      t.amount < 0 ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {t.amount < 0 ? '' : '+'}
                    {formatCurrency(t.amount)}
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold text-navy-800 whitespace-nowrap">
                    {formatCurrency(t.runningBalance)}
                  </td>
                  <td className="px-5 py-3.5 text-navy-400 text-xs whitespace-nowrap">{t.reference || '—'}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-sm text-navy-400">
                    No transactions match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
