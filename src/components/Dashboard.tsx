import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { calculateComparison, calculateSettlementSavings, formatCurrency } from '../data';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  TrendingDown,
  Calendar,
  DollarSign,
  Target,
  ArrowDownRight,
  Shield,
  PiggyBank,
  Landmark,
  Activity,
  AlertCircle,
  LineChart,
  ChevronRight,
} from 'lucide-react';

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

export default function Dashboard() {
  const { state, setCurrentView } = useApp();
  const comparison = useMemo(
    () => calculateComparison(state.cards, state.totalMonthlyPayment, state.platformFee),
    [state.cards, state.totalMonthlyPayment, state.platformFee]
  );
  const settlement = useMemo(() => calculateSettlementSavings(state.cards), [state.cards]);

  const totalBalance = state.cards.reduce((s, c) => s + c.balance, 0);
  const progressPercent = Math.min(100, (state.escrowBalance / settlement.estimatedSettlement) * 100);

  const chartData = useMemo(() => {
    const maxMonths = Math.max(
      comparison.statusQuo.monthlyBreakdown.length,
      comparison.platformPath.monthlyBreakdown.length
    );
    return Array.from({ length: maxMonths }, (_, i) => {
      const sq = comparison.statusQuo.monthlyBreakdown[i];
      const pp = comparison.platformPath.monthlyBreakdown[i];
      return {
        month: i + 1,
        statusQuo: sq ? sq.balance : null,
        platformPath: pp ? pp.balance : null,
      };
    });
  }, [comparison]);

  const projectedDate = new Date();
  projectedDate.setMonth(projectedDate.getMonth() + comparison.platformPath.months);

  const metrics = [
    { label: 'Total Enrolled Debt', value: formatCurrency(totalBalance), icon: DollarSign, color: 'text-navy-800', bg: 'bg-cream-200' },
    { label: 'Est. Settlement Savings', value: formatCurrency(settlement.savings), icon: TrendingDown, color: 'text-emerald-700', bg: 'bg-emerald-100' },
    { label: 'Escrow Balance', value: formatCurrency(state.escrowBalance), icon: PiggyBank, color: 'text-navy-800', bg: 'bg-gold-100', onClick: () => setCurrentView('escrow') },
    { label: 'Projected Freedom', value: projectedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), icon: Calendar, color: 'text-navy-800', bg: 'bg-navy-100' },
  ];

  const recentEvents = useMemo(
    () =>
      [...state.activityEvents]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 3),
    [state.activityEvents]
  );

  const actionRequiredCount =
    state.notifications.filter((n) => n.type === 'action-required' && !n.read).length +
    state.documents.filter((d) => d.status === 'unsigned').length;

  const currentScore = state.creditHistory[state.creditHistory.length - 1]?.score ?? 620;
  const prevScore = state.creditHistory[state.creditHistory.length - 2]?.score ?? 620;
  const scoreDelta = currentScore - prevScore;

  return (
    <div className="space-y-8">
      {/* Compact Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-cream-50 rounded-2xl border border-cream-300 p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-gold-600" />
              <h3 className="text-sm font-bold text-navy-900">Recent Activity</h3>
            </div>
            <button
              onClick={() => setCurrentView('activity')}
              className="text-xs font-bold text-gold-600 hover:text-gold-700 flex items-center gap-0.5"
            >
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {recentEvents.map((event) => {
              const creditor = state.cards.find((c) => c.id === event.creditorId);
              return (
                <div key={event.id} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold-500 mt-1.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-navy-800 truncate">{event.title}</p>
                    <p className="text-[11px] text-navy-400">
                      {creditor?.creditor} • {relativeTime(event.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Action Required */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-cream-50 rounded-2xl border border-cream-300 p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-navy-900">Action Required</h3>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-bold text-navy-900">{actionRequiredCount}</p>
            <p className="text-xs text-navy-500 mb-1">items need your attention</p>
          </div>
          <div className="mt-3 space-y-1.5">
            {state.notifications.filter((n) => n.type === 'action-required' && !n.read).length > 0 && (
              <button
                onClick={() => setCurrentView('messages')}
                className="block text-xs text-navy-500 hover:text-navy-700"
              >
                • {state.notifications.filter((n) => n.type === 'action-required' && !n.read).length} unread notification
                {state.notifications.filter((n) => n.type === 'action-required' && !n.read).length === 1 ? '' : 's'}
              </button>
            )}
            {state.documents.filter((d) => d.status === 'unsigned').length > 0 && (
              <button
                onClick={() => setCurrentView('documents')}
                className="block text-xs text-navy-500 hover:text-navy-700"
              >
                • {state.documents.filter((d) => d.status === 'unsigned').length} document
                {state.documents.filter((d) => d.status === 'unsigned').length === 1 ? '' : 's'} awaiting signature
              </button>
            )}
          </div>
        </motion.div>

        {/* Credit Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-cream-50 rounded-2xl border border-cream-300 p-5 shadow-sm cursor-pointer"
          onClick={() => setCurrentView('credit')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <LineChart className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-navy-900">Credit Score</h3>
            </div>
            <ChevronRight className="w-4 h-4 text-navy-300" />
          </div>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-bold text-navy-900">{currentScore}</p>
            <div className="flex items-center gap-1 mb-1">
              {scoreDelta > 0 ? (
                <TrendingDown className="w-4 h-4 text-emerald-600 rotate-180" />
              ) : scoreDelta < 0 ? (
                <TrendingDown className="w-4 h-4 text-rose-600" />
              ) : null}
              <span
                className={`text-xs font-bold ${
                  scoreDelta > 0 ? 'text-emerald-600' : scoreDelta < 0 ? 'text-rose-600' : 'text-navy-400'
                }`}
              >
                {scoreDelta > 0 ? '+' : ''}
                {scoreDelta} this month
              </span>
            </div>
          </div>
          <p className="text-xs text-navy-400 mt-2">Experian estimate. Recovering to 700+ projected.</p>
        </motion.div>
      </div>

      {/* Legal Protection Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-2xl p-6 text-cream-50 flex items-center justify-between border border-navy-700"
      >
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-gold-500/20 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-gold-400" />
          </div>
          <div>
            <p className="font-bold text-sm">Legal Protection Plan Active</p>
            <p className="text-navy-300 text-xs">If any creditor files suit, our attorneys respond at no extra cost.</p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs text-navy-400">Status</p>
          <p className="text-sm font-bold text-emerald-400">Protected</p>
        </div>
      </motion.div>

      {/* Hero Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={m.label}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              onClick={m.onClick}
              className={`bg-cream-50 rounded-2xl border border-cream-300 p-6 shadow-sm hover:shadow-lg transition-shadow ${m.onClick ? 'cursor-pointer' : ''}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 ${m.bg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${m.color}`} />
                </div>
                <span className="text-sm text-navy-400 font-medium">{m.label}</span>
              </div>
              <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-cream-50 rounded-2xl border border-cream-300 p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-gold-600" />
            <h3 className="text-base font-bold text-navy-900">Settlement Fund Progress</h3>
          </div>
          <span className="text-sm font-bold text-navy-700">
            {progressPercent.toFixed(1)}% of Target
          </span>
        </div>
        <div className="w-full h-3 bg-cream-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-gold-500 to-emerald-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, progressPercent)}%` }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </div>
        <div className="flex justify-between mt-3 text-xs text-navy-400">
          <span>Escrow: {formatCurrency(state.escrowBalance)}</span>
          <span>Target: {formatCurrency(settlement.estimatedSettlement)}</span>
        </div>
      </motion.div>

      {/* Settlement Offers Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-cream-50 rounded-2xl border border-cream-300 p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-5">
          <Landmark className="w-5 h-5 text-gold-600" />
          <h3 className="text-base font-bold text-navy-900">Creditor Settlement Status</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-cream-100">
                <th className="text-left text-xs font-bold text-navy-500 uppercase tracking-wider px-5 py-3 rounded-l-lg">Creditor</th>
                <th className="text-right text-xs font-bold text-navy-500 uppercase tracking-wider px-5 py-3">Balance</th>
                <th className="text-right text-xs font-bold text-navy-500 uppercase tracking-wider px-5 py-3">Settlement Offer</th>
                <th className="text-right text-xs font-bold text-navy-500 uppercase tracking-wider px-5 py-3">You Save</th>
                <th className="text-center text-xs font-bold text-navy-500 uppercase tracking-wider px-5 py-3 rounded-r-lg">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {state.cards.map((card) => {
                const offer = card.settlementOffer ?? card.balance * 0.52;
                const saved = card.balance - offer;
                return (
                  <tr key={card.id} className="hover:bg-cream-100/50 transition-colors">
                    <td className="px-5 py-4 text-sm font-bold text-navy-900">{card.creditor}</td>
                    <td className="px-5 py-4 text-right text-sm text-navy-600">{formatCurrency(card.balance)}</td>
                    <td className="px-5 py-4 text-right text-sm font-bold text-emerald-600">{formatCurrency(offer)}</td>
                    <td className="px-5 py-4 text-right text-sm font-bold text-gold-600">{formatCurrency(saved)}</td>
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-navy-100 text-navy-700">
                        Negotiating
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Side-by-Side Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-cream-50 rounded-2xl border border-cream-300 p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-5">
            <ArrowDownRight className="w-5 h-5 text-rose-500" />
            <h3 className="text-base font-bold text-navy-900">Without Settlement</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-cream-200">
              <span className="text-sm text-navy-400">Months to Payoff</span>
              <span className="text-sm font-bold text-navy-800">{comparison.statusQuo.months.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-cream-200">
              <span className="text-sm text-navy-400">Total Interest Paid</span>
              <span className="text-sm font-bold text-rose-600">{formatCurrency(comparison.statusQuo.totalInterest)}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-sm text-navy-400">Total Paid</span>
              <span className="text-sm font-bold text-navy-800">{formatCurrency(comparison.statusQuo.totalPaid)}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-cream-50 rounded-2xl border border-cream-300 p-6 shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-5">
              <TrendingDown className="w-5 h-5 text-emerald-500" />
              <h3 className="text-base font-bold text-navy-900">With DebtOptimize</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-cream-200">
                <span className="text-sm text-navy-400">Est. Settlement Amount</span>
                <span className="text-sm font-bold text-emerald-700">{formatCurrency(settlement.estimatedSettlement)}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-cream-200">
                <span className="text-sm text-navy-400">Total Savings</span>
                <span className="text-sm font-bold text-emerald-600">{formatCurrency(settlement.savings)}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-sm text-navy-400">Program Duration</span>
                <span className="text-sm font-bold text-navy-800">24-36 months</span>
              </div>
            </div>
            <div className="mt-5 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <p className="text-xs text-emerald-800 font-bold text-center">
                You save {formatCurrency(settlement.savings)} ({settlement.savingsPercent.toFixed(0)}% reduction) and avoid {comparison.statusQuo.months - 24} months of payments
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Balance Over Time Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-cream-50 rounded-2xl border border-cream-300 p-6 shadow-sm"
      >
        <h3 className="text-base font-bold text-navy-900 mb-6">
          Debt Balance: Status Quo vs. Settlement Path
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSq" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ebe4d6" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#b3b9d1' }} tickLine={false} axisLine={false} label={{ value: 'Months', position: 'insideBottom', offset: -5, style: { fill: '#b3b9d1', fontSize: 12 } }} />
              <YAxis tick={{ fontSize: 12, fill: '#b3b9d1' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tickLine={false} axisLine={false} domain={[0, 'auto']} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} labelFormatter={(label) => `Month ${label}`} contentStyle={{ borderRadius: 12, border: '1px solid #ebe4d6', boxShadow: '0 8px 30px -10px rgba(18,22,43,0.15)', background: '#faf8f5' }} />
              <Legend wrapperStyle={{ paddingTop: 20 }} formatter={(value) => <span style={{ color: '#4a5585', fontSize: 13, fontWeight: 600 }}>{value}</span>} />
              <Area type="monotone" dataKey="statusQuo" name="Without Settlement (Full Balance + Interest)" stroke="#f43f5e" strokeWidth={2} fill="url(#colorSq)" connectNulls={false} />
              <Area type="monotone" dataKey="platformPath" name="With DebtOptimize (Negotiated Settlement)" stroke="#14b8a6" strokeWidth={2} fill="url(#colorPp)" connectNulls={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
