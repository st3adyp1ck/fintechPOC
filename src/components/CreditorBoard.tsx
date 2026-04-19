import { useApp } from '../context/AppContext';
import { STATUS_LABELS, formatCurrency } from '../data';
import { motion } from 'framer-motion';
import { Building2, Mail, Clock, CheckCircle, XCircle, Zap, Gavel, Handshake } from 'lucide-react';

const statusIcons: Record<string, React.ElementType> = {
  eligible: Zap, 'outreach-sent': Mail, pending: Clock, approved: CheckCircle, active: Handshake, declined: XCircle,
};

export default function CreditorBoard() {
  const { state, updateCard } = useApp();

  const statusFlow: Array<{ id: string; label: string }> = [
    { id: 'eligible', label: 'Eligible' },
    { id: 'outreach-sent', label: 'Outreach' },
    { id: 'pending', label: 'Pending' },
    { id: 'approved', label: 'Approved' },
    { id: 'active', label: 'Settled' },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-cream-50 rounded-2xl border border-cream-300 p-6 shadow-sm">
        <h3 className="text-base font-bold text-navy-900 mb-5">Negotiation Pipeline</h3>
        <div className="flex items-center justify-between">
          {statusFlow.map((status, idx) => {
            const count = state.cards.filter((c) => c.status === status.id).length;
            const Icon = statusIcons[status.id];
            return (
              <div key={status.id} className="flex items-center">
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${count > 0 ? 'bg-gold-100 text-gold-700' : 'bg-cream-200 text-navy-300'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-navy-600">{status.label}</p>
                  <p className="text-xs text-navy-400">{count} cards</p>
                </div>
                {idx < statusFlow.length - 1 && <div className="w-12 h-px bg-cream-300 mx-2" />}
              </div>
            );
          })}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-2xl p-6 text-cream-50 border border-navy-700">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-gold-500/20 rounded-xl flex items-center justify-center shrink-0">
            <Gavel className="w-5 h-5 text-gold-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-1">Legal Protection Plan</h3>
            <p className="text-sm text-navy-300 mb-4">If any creditor files a lawsuit during negotiation, our attorneys defend you at no additional cost.</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-lg font-bold">0</p>
                <p className="text-xs text-navy-400">Active Lawsuits</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-lg font-bold">$0</p>
                <p className="text-xs text-navy-400">Legal Fees</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-lg font-bold text-emerald-400">Protected</p>
                <p className="text-xs text-navy-400">Coverage Status</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-cream-50 rounded-2xl border border-cream-300 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-200">
          <h3 className="text-base font-bold text-navy-900">Creditor Negotiation Board</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-cream-100">
                <th className="text-left text-xs font-bold text-navy-500 uppercase tracking-wider px-6 py-3">Creditor</th>
                <th className="text-right text-xs font-bold text-navy-500 uppercase tracking-wider px-6 py-3">Balance</th>
                <th className="text-right text-xs font-bold text-navy-500 uppercase tracking-wider px-6 py-3">Settlement Offer</th>
                <th className="text-right text-xs font-bold text-navy-500 uppercase tracking-wider px-6 py-3">You Save</th>
                <th className="text-center text-xs font-bold text-navy-500 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-center text-xs font-bold text-navy-500 uppercase tracking-wider px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {state.cards.map((card) => {
                const status = STATUS_LABELS[card.status];
                const offer = card.settlementOffer ?? card.balance * 0.52;
                const saved = card.balance - offer;
                return (
                  <tr key={card.id} className="hover:bg-cream-100/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-cream-200 rounded-lg flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-navy-400" />
                        </div>
                        <span className="text-sm font-bold text-navy-900">{card.creditor}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-navy-600">{formatCurrency(card.balance)}</td>
                    <td className="px-6 py-4 text-right text-sm text-emerald-600 font-bold">{formatCurrency(offer)}</td>
                    <td className="px-6 py-4 text-right text-sm text-gold-600 font-bold">{formatCurrency(saved)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${status.bg} ${status.color}`}>{status.label}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <select value={card.status} onChange={(e) => updateCard(card.id, { status: e.target.value as typeof card.status })} className="text-xs border border-cream-300 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-gold-500 bg-white">
                        {Object.entries(STATUS_LABELS).map(([key, val]) => (
                          <option key={key} value={key}>{val.label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-cream-50 rounded-2xl border border-cream-300 p-6 shadow-sm">
        <h3 className="text-base font-bold text-navy-900 mb-4">Monthly Escrow Deposit Breakdown</h3>
        <p className="text-sm text-navy-400 mb-5">Your ${state.totalMonthlyPayment.toLocaleString()} monthly deposit is distributed as follows:</p>
        <div className="space-y-5">
          {state.cards.map((card) => {
            const monthlyInterest = (card.balance * (card.negotiatedApr ?? card.currentApr)) / 100 / 12;
            const principal = state.totalMonthlyPayment / state.cards.length - monthlyInterest - state.platformFee / state.cards.length;
            const platformFeePerCard = state.platformFee / state.cards.length;
            return (
              <div key={card.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-navy-700">{card.creditor}</span>
                  <span className="text-xs text-navy-400">${state.totalMonthlyPayment.toLocaleString()} / {state.cards.length} cards</span>
                </div>
                <div className="flex h-8 rounded-xl overflow-hidden">
                  <div className="bg-rose-400 flex items-center justify-center text-xs text-white font-bold" style={{ width: `${(monthlyInterest / (state.totalMonthlyPayment / state.cards.length)) * 100}%` }}>
                    {monthlyInterest > 15 && `Interest $${monthlyInterest.toFixed(0)}`}
                  </div>
                  <div className="bg-navy-400 flex items-center justify-center text-xs text-white font-bold" style={{ width: `${(platformFeePerCard / (state.totalMonthlyPayment / state.cards.length)) * 100}%` }}>
                    {platformFeePerCard > 15 && `Fee $${platformFeePerCard.toFixed(0)}`}
                  </div>
                  <div className="bg-emerald-400 flex items-center justify-center text-xs text-white font-bold" style={{ width: `${Math.max(0, (principal / (state.totalMonthlyPayment / state.cards.length)) * 100)}%` }}>
                    {principal > 15 && `Escrow $${principal.toFixed(0)}`}
                  </div>
                </div>
                <div className="flex gap-5 text-xs">
                  <span className="text-rose-500 font-medium">Interest: ${monthlyInterest.toFixed(2)}</span>
                  <span className="text-navy-500 font-medium">Platform Fee: ${platformFeePerCard.toFixed(2)}</span>
                  <span className="text-emerald-600 font-medium">To Escrow: ${Math.max(0, principal).toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
