import { useState, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  CheckCircle2,
  Circle,
  Loader2,
} from 'lucide-react';
import type { CreditBureau } from '../types';

const BUREAUS: CreditBureau[] = ['Experian', 'TransUnion', 'Equifax'];

function bureauDelta(history: { date: string; score: number }[]): number {
  if (history.length < 2) return 0;
  return history[history.length - 1].score - history[history.length - 2].score;
}

function factorLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Excellent', color: 'text-emerald-600 bg-emerald-50' };
  if (score >= 60) return { label: 'Good', color: 'text-teal-600 bg-teal-50' };
  if (score >= 40) return { label: 'Fair', color: 'text-amber-600 bg-amber-50' };
  return { label: 'Poor', color: 'text-rose-600 bg-rose-50' };
}

function factorWidth(score: number): string {
  return `${score}%`;
}

export default function CreditHealth() {
  const { state, toggleRebuildTask } = useApp();
  const [activeBureau, setActiveBureau] = useState<CreditBureau>('Experian');
  const [floater, setFloater] = useState<{ text: string; id: string } | null>(null);

  // Simulate bureau-specific data by offsetting the base history slightly
  const history = useMemo(() => {
    const offset = activeBureau === 'Experian' ? 0 : activeBureau === 'TransUnion' ? -8 : 5;
    return state.creditHistory.map((h) => ({
      date: h.date,
      score: h.score + offset,
      label: new Date(h.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    }));
  }, [state.creditHistory, activeBureau]);

  const currentScore = history[history.length - 1]?.score ?? 620;
  const delta = bureauDelta(history);

  const milestones = [
    { date: '2024-10-01', label: 'Program started' },
    { date: '2025-06-01', label: 'First settlement' },
    { date: '2026-04-10', label: 'Last settlement' },
  ];

  const floaterCounter = useRef(0);
  const handleToggleTask = (taskId: string) => {
    const task = state.rebuildTasks.find((t) => t.id === taskId);
    if (!task) return;
    const wasComplete = task.status === 'complete';
    toggleRebuildTask(taskId);
    if (!wasComplete && task.impact === 'high') {
      const id = `${++floaterCounter.current}`;
      setFloater({ text: '+8 pts', id });
      setTimeout(() => setFloater((f) => (f?.id === id ? null : f)), 2000);
    } else if (!wasComplete) {
      const id = `${++floaterCounter.current}`;
      setFloater({ text: '+3 pts', id });
      setTimeout(() => setFloater((f) => (f?.id === id ? null : f)), 2000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-cream-50 rounded-2xl border border-cream-300 p-8 shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-xs font-bold text-navy-400 uppercase tracking-wider mb-2">Credit Score ({activeBureau})</p>
            <div className="flex items-end gap-3">
              <p className="text-5xl font-bold text-navy-900">{currentScore}</p>
              <div className="flex items-center gap-1 mb-2">
                {delta > 0 ? (
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                ) : delta < 0 ? (
                  <TrendingDown className="w-5 h-5 text-rose-600" />
                ) : (
                  <Minus className="w-5 h-5 text-navy-400" />
                )}
                <span className={`text-sm font-bold ${delta > 0 ? 'text-emerald-600' : delta < 0 ? 'text-rose-600' : 'text-navy-400'}`}>
                  {delta > 0 ? '+' : ''}
                  {delta} this month
                </span>
              </div>
            </div>
            <p className="text-sm text-navy-500 mt-1">
              Starting from 620, your score has followed a typical dip-then-recovery curve.
            </p>
          </div>
          <div className="flex gap-2">
            {BUREAUS.map((b) => (
              <button
                key={b}
                onClick={() => setActiveBureau(b)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeBureau === b ? 'bg-navy-900 text-cream-50' : 'bg-cream-100 text-navy-600 hover:bg-cream-200'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Floating point animation */}
        <AnimatePresence>
          {floater && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: -20, scale: 1 }}
              exit={{ opacity: 0, y: -40 }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            >
              <span className="text-2xl font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 shadow-lg">
                {floater.text}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-cream-50 rounded-2xl border border-cream-300 p-6 shadow-sm"
      >
        <h3 className="text-base font-bold text-navy-900 mb-6">Score History</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ebe4d6" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#b3b9d1' }} tickLine={false} axisLine={false} />
              <YAxis domain={[500, 750]} tick={{ fontSize: 12, fill: '#b3b9d1' }} tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(value) => [value as number, 'Score']}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #ebe4d6',
                  boxShadow: '0 8px 30px -10px rgba(18,22,43,0.15)',
                  background: '#faf8f5',
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#d4a843"
                strokeWidth={3}
                dot={{ r: 3, fill: '#d4a843', strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#d4a843', stroke: '#fff', strokeWidth: 2 }}
              />
              {milestones.map((m) => {
                const idx = history.findIndex((h) => h.date === m.date);
                if (idx === -1) return null;
                return (
                  <ReferenceLine
                    key={m.label}
                    x={history[idx].label}
                    stroke="#b3b9d1"
                    strokeDasharray="4 4"
                    label={{ value: m.label, position: 'top', fill: '#4a5585', fontSize: 11, fontWeight: 600 }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Credit Factors */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-cream-50 rounded-2xl border border-cream-300 p-6 shadow-sm"
      >
        <h3 className="text-base font-bold text-navy-900 mb-5">Credit Factors</h3>
        <div className="space-y-4">
          {state.creditFactors.map((factor) => {
            const { label, color } = factorLabel(factor.score);
            return (
              <div key={factor.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-navy-700">{factor.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${color}`}>{label}</span>
                    <span className="text-sm font-bold text-navy-800 w-8 text-right">{factor.score}</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-cream-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: factorWidth(factor.score) }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full rounded-full ${
                      factor.score >= 80
                        ? 'bg-emerald-500'
                        : factor.score >= 60
                        ? 'bg-teal-500'
                        : factor.score >= 40
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Rebuilding Checklist */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-cream-50 rounded-2xl border border-cream-300 p-6 shadow-sm"
      >
        <h3 className="text-base font-bold text-navy-900 mb-5">Credit Rebuilding Checklist</h3>
        <div className="space-y-3">
          {state.rebuildTasks.map((task) => (
            <motion.div
              key={task.id}
              whileHover={{ x: 2 }}
              onClick={() => handleToggleTask(task.id)}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-cream-100 transition-colors cursor-pointer"
            >
              <div className="mt-0.5 shrink-0">
                {task.status === 'complete' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : task.status === 'in-progress' ? (
                  <Loader2 className="w-5 h-5 text-gold-500 animate-spin" />
                ) : (
                  <Circle className="w-5 h-5 text-navy-300" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${task.status === 'complete' ? 'text-navy-400 line-through' : 'text-navy-800'}`}>
                    {task.title}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      task.impact === 'high'
                        ? 'bg-emerald-50 text-emerald-700'
                        : task.impact === 'medium'
                        ? 'bg-gold-50 text-gold-700'
                        : 'bg-navy-50 text-navy-500'
                    }`}
                  >
                    {task.impact}
                  </span>
                </div>
                <p className="text-xs text-navy-500 mt-0.5">{task.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Educational Callout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-3"
      >
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-blue-800">Why does my score dip during settlement?</p>
          <p className="text-sm text-blue-700 mt-1">
            It is completely normal. Stopping payments to creditors causes temporary negative marks. Once settlements are complete and you begin the rebuilding steps above, most clients recover to their pre-program score within 12-18 months and reach 700+ within 24 months. These are estimates based on historical client data.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
