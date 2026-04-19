import { useApp } from '../context/AppContext';
import { calculateSettlementSavings, formatCurrency, formatPercent } from '../data';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ToggleLeft, ToggleRight, DollarSign, Percent, BookOpen } from 'lucide-react';

export default function AdminPanel() {
  const { state, updateCard, setPlatformFee } = useApp();
  const settlement = useMemo(() => calculateSettlementSavings(state.cards), [state.cards]);

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-cream-50 rounded-2xl border border-cream-300 p-6 shadow-sm">
          <p className="text-sm text-navy-400 mb-1">Current Weighted APR</p>
          <p className="text-2xl font-bold text-rose-600">
            {formatPercent(state.cards.reduce((s, c) => s + c.balance * c.currentApr, 0) / state.cards.reduce((s, c) => s + c.balance, 0))}
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-cream-50 rounded-2xl border border-cream-300 p-6 shadow-sm">
          <p className="text-sm text-navy-400 mb-1">Est. Settlement %</p>
          <p className="text-2xl font-bold text-emerald-600">{formatPercent(48)}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-cream-50 rounded-2xl border border-cream-300 p-6 shadow-sm">
          <p className="text-sm text-navy-400 mb-1">Total Settlement Savings</p>
          <p className="text-2xl font-bold text-gold-600">{formatCurrency(settlement.savings)}</p>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-navy-950 rounded-2xl border border-navy-800 p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold-400/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-gold-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-cream-50">Documentation Package</h3>
            <p className="text-xs text-navy-500 mt-0.5">Full technical, product, and deployment guide.</p>
          </div>
          <a href="/docs/index.html" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-gold-400 hover:bg-gold-300 text-navy-950 text-sm font-bold rounded-xl transition-colors">
            Open Docs
          </a>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-cream-50 rounded-2xl border border-cream-300 p-6 shadow-sm">
        <h3 className="text-base font-bold text-navy-900 mb-4">Platform Fee Structure</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input type="range" min="0" max="200" step="5" value={state.platformFee} onChange={(e) => setPlatformFee(Number(e.target.value))} className="w-full" />
            <div className="flex justify-between mt-1 text-xs text-navy-400">
              <span>$0</span>
              <span>$200</span>
            </div>
          </div>
          <div className="w-32">
            <div className="relative">
              <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
              <input type="number" value={state.platformFee} onChange={(e) => setPlatformFee(Number(e.target.value))} className="w-full pl-9 pr-3 py-2 bg-white border border-cream-300 rounded-xl text-sm text-navy-900 focus:border-gold-500 outline-none transition-all" />
            </div>
          </div>
        </div>
        <p className="text-xs text-navy-400 mt-2">Monthly platform fee deducted from escrow deposit before settlements.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-cream-50 rounded-2xl border border-cream-300 p-6 shadow-sm">
        <h3 className="text-base font-bold text-navy-900 mb-4">Settlement Negotiation Controls</h3>
        <div className="space-y-4">
          {state.cards.map((card) => (
            <div key={card.id} className="p-5 border border-cream-300 rounded-xl bg-white">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-bold text-navy-900">{card.creditor}</h4>
                  <p className="text-xs text-navy-400">Balance: {formatCurrency(card.balance)}</p>
                </div>
                <button onClick={() => updateCard(card.id, { negotiatedApr: card.negotiatedApr === null ? card.currentApr * 0.5 : null })} className="flex items-center gap-2">
                  {card.negotiatedApr !== null ? <ToggleRight className="w-8 h-8 text-emerald-600" /> : <ToggleLeft className="w-8 h-8 text-navy-300" />}
                  <span className="text-sm text-navy-600">{card.negotiatedApr !== null ? 'Active' : 'Inactive'}</span>
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-navy-400 mb-1">Current APR</label>
                  <div className="relative">
                    <Percent className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-navy-400" />
                    <input type="number" step="0.01" value={card.currentApr} onChange={(e) => updateCard(card.id, { currentApr: Number(e.target.value) })} className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg text-sm text-navy-900 focus:border-gold-500 outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-navy-400 mb-1">Settlement Offer</label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
                    <input type="number" value={card.settlementOffer ?? ''} onChange={(e) => updateCard(card.id, { settlementOffer: Number(e.target.value) })} className="w-full pl-9 pr-3 py-2 bg-cream-50 border border-cream-300 rounded-lg text-sm text-navy-900 focus:border-gold-500 outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-navy-400 mb-1">Negotiated APR</label>
                  <div className="relative">
                    <Percent className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-navy-400" />
                    <input type="number" step="0.01" value={card.negotiatedApr ?? ''} disabled={card.negotiatedApr === null} onChange={(e) => updateCard(card.id, { negotiatedApr: Number(e.target.value) })} className={`w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-lg text-sm text-navy-900 focus:border-gold-500 outline-none transition-all ${card.negotiatedApr === null ? 'bg-cream-100 text-navy-300' : ''}`} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
