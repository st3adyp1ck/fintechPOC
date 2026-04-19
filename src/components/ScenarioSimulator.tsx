import { useState, useMemo, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { calculateSettlementSavings, formatCurrency } from '../data';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Sliders, TrendingDown, Clock, DollarSign, RefreshCcw } from 'lucide-react';

export default function ScenarioSimulator() {
  const { state } = useApp();
  const [selectedCardId, setSelectedCardId] = useState(state.cards[0]?.id ?? '');
  const [simulatedSettlements, setSimulatedSettlements] = useState<Record<string, number>>({});

  const selectedCard = state.cards.find((c) => c.id === selectedCardId);

  const getSimulatedSettlement = useCallback(
    (cardId: string) => simulatedSettlements[cardId] ?? state.cards.find((c) => c.id === cardId)?.settlementOffer ?? state.cards.find((c) => c.id === cardId)?.balance ?? 0,
    [simulatedSettlements, state.cards]
  );

  const simulatedCards = useMemo(
    () => state.cards.map((c) => ({ ...c, settlementOffer: getSimulatedSettlement(c.id) })),
    [state.cards, getSimulatedSettlement]
  );

  const baselineSettlement = useMemo(() => calculateSettlementSavings(state.cards), [state.cards]);
  const simulatedSettlement = useMemo(() => calculateSettlementSavings(simulatedCards), [simulatedCards]);

  const handleSliderChange = (cardId: string, value: number) => {
    setSimulatedSettlements((prev) => ({ ...prev, [cardId]: value }));
  };

  const resetSimulation = () => setSimulatedSettlements({});

  const chartData = useMemo(() => {
    const totalDebt = state.cards.reduce((s, c) => s + c.balance, 0);
    const simTotal = simulatedCards.reduce((s, c) => s + (c.settlementOffer ?? c.balance), 0);
    const monthsWithout = 42;
    const monthsWith = 30;
    return Array.from({ length: monthsWithout }, (_, i) => {
      const month = i + 1;
      const withoutSettlement = Math.max(0, totalDebt - (totalDebt / monthsWithout) * month);
      const withSettlement = month <= monthsWith ? Math.max(0, totalDebt - ((totalDebt - simTotal) / monthsWith) * month) : null;
      return { month, withoutSettlement, withSettlement };
    });
  }, [state.cards, simulatedCards]);

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-2xl p-8 text-cream-50 border border-navy-700">
        <div className="flex items-center gap-3 mb-3">
          <Sliders className="w-6 h-6 text-gold-400" />
          <h2 className="text-xl font-bold">Settlement Impact Simulator</h2>
        </div>
        <p className="text-navy-300 text-sm max-w-xl">Drag the slider to see how different settlement percentages affect your total savings and payoff timeline.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-cream-50 rounded-2xl border border-cream-300 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold text-navy-900">Negotiation Simulator</h3>
          <motion.button onClick={resetSimulation} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-3 py-1.5 text-sm text-navy-400 hover:text-navy-700 hover:bg-cream-200 rounded-lg transition-colors">
            <RefreshCcw className="w-4 h-4" />
            Reset
          </motion.button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-navy-700 mb-2">Select Card to Simulate</label>
          <div className="flex gap-2">
            {state.cards.map((card) => (
              <motion.button
                key={card.id}
                onClick={() => setSelectedCardId(card.id)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                  selectedCardId === card.id ? 'bg-navy-900 text-cream-50' : 'bg-cream-200 text-navy-600 hover:bg-cream-300'
                }`}
              >
                {card.creditor}
              </motion.button>
            ))}
          </div>
        </div>

        {selectedCard && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-navy-400">Full Balance</p>
                <p className="text-lg font-bold text-rose-600">{formatCurrency(selectedCard.balance)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-navy-400">Simulated Settlement</p>
                <p className="text-2xl font-bold text-navy-900">{formatCurrency(getSimulatedSettlement(selectedCard.id))}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-navy-400">Platform Target</p>
                <p className="text-lg font-bold text-emerald-600">{formatCurrency(selectedCard.settlementOffer ?? selectedCard.balance * 0.48)}</p>
              </div>
            </div>

            <div>
              <input type="range" min={selectedCard.balance * 0.2} max={selectedCard.balance} step={100} value={getSimulatedSettlement(selectedCard.id)} onChange={(e) => handleSliderChange(selectedCard.id, Number(e.target.value))} className="w-full" />
              <div className="flex justify-between mt-2 text-xs text-navy-400">
                <span>{formatCurrency(selectedCard.balance * 0.2)} (20%)</span>
                <span>{formatCurrency(selectedCard.balance * 0.6)} (60%)</span>
                <span>{formatCurrency(selectedCard.balance)} (100%)</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {state.cards.map((card) => {
                const settlement = getSimulatedSettlement(card.id);
                const percent = (settlement / card.balance) * 100;
                return (
                  <motion.div key={card.id} whileHover={{ y: -2 }} className={`p-3 rounded-xl border ${card.id === selectedCardId ? 'border-gold-400 bg-gold-50' : 'border-cream-300 bg-cream-100'}`}>
                    <p className="text-xs font-medium text-navy-500">{card.creditor}</p>
                    <p className={`text-sm font-bold ${card.id === selectedCardId ? 'text-navy-900' : 'text-navy-500'}`}>{formatCurrency(settlement)}</p>
                    <p className="text-xs text-navy-400">{percent.toFixed(0)}% of balance</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: TrendingDown, label: 'Additional Savings', value: formatCurrency(Math.max(0, simulatedSettlement.savings - baselineSettlement.savings)), sub: `vs. ${formatCurrency(baselineSettlement.savings)} baseline`, color: 'text-emerald-700', bg: 'bg-emerald-100' },
          { icon: Clock, label: 'Settlement %', value: `${simulatedSettlement.estimatedSettlement > 0 ? ((simulatedSettlement.estimatedSettlement / simulatedSettlement.totalDebt) * 100).toFixed(0) : 0}%`, sub: 'of enrolled debt', color: 'text-navy-800', bg: 'bg-navy-100' },
          { icon: DollarSign, label: 'Total Settlement Cost', value: formatCurrency(simulatedSettlement.estimatedSettlement), sub: `on ${formatCurrency(simulatedSettlement.totalDebt)} debt`, color: 'text-gold-700', bg: 'bg-gold-100' },
        ].map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }} whileHover={{ y: -4 }} className="bg-cream-50 rounded-2xl border border-cream-300 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-9 h-9 ${item.bg} rounded-lg flex items-center justify-center`}>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <span className="text-sm text-navy-400 font-medium">{item.label}</span>
            </div>
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
            <p className="text-xs text-navy-400 mt-1">{item.sub}</p>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-cream-50 rounded-2xl border border-cream-300 p-6 shadow-sm">
        <h3 className="text-base font-bold text-navy-900 mb-6">Debt Payoff: Full Balance vs. Settlement Path</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSim" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1e243d" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#1e243d" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#b3b9d1" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#b3b9d1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ebe4d6" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#b3b9d1' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#b3b9d1' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tickLine={false} axisLine={false} domain={[0, 'auto']} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} labelFormatter={(label) => `Month ${label}`} contentStyle={{ borderRadius: 12, border: '1px solid #ebe4d6', boxShadow: '0 8px 30px -10px rgba(18,22,43,0.15)', background: '#faf8f5' }} />
              <ReferenceLine x={30} stroke="#1e243d" strokeDasharray="5 5" label={{ value: 'Simulated Payoff', position: 'insideTopLeft', fill: '#1e243d', fontSize: 12 }} />
              <ReferenceLine x={42} stroke="#f43f5e" strokeDasharray="5 5" label={{ value: 'Status Quo', position: 'insideTopRight', fill: '#f43f5e', fontSize: 12 }} />
              <Area type="monotone" dataKey="withoutSettlement" name="Pay Full Balance + Interest" stroke="#b3b9d1" strokeWidth={2} fill="url(#colorBase)" connectNulls={false} />
              <Area type="monotone" dataKey="withSettlement" name="Settlement Path (Negotiated)" stroke="#1e243d" strokeWidth={2} fill="url(#colorSim)" connectNulls={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
