import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Reply,
  Handshake,
  CreditCard,
  CheckCircle2,
  Gavel,
  ShieldCheck,
  Phone,
  Mail,
  ChevronDown,
  Clock,
} from 'lucide-react';
import type { ActivityEventType } from '../types';

const EVENT_ICON: Record<ActivityEventType, React.ElementType> = {
  'outreach-sent': Send,
  'creditor-response': Reply,
  'counter-offer-received': Handshake,
  'counter-offer-sent': Handshake,
  'settlement-approved': CheckCircle2,
  'payment-sent': CreditCard,
  'account-closed': CheckCircle2,
  'lawsuit-filed': Gavel,
  'lawsuit-resolved': ShieldCheck,
  'call-logged': Phone,
  'letter-received': Mail,
};

const EVENT_COLOR: Record<ActivityEventType, string> = {
  'outreach-sent': 'text-blue-600 bg-blue-50 border-blue-200',
  'creditor-response': 'text-amber-600 bg-amber-50 border-amber-200',
  'counter-offer-received': 'text-gold-600 bg-gold-50 border-gold-200',
  'counter-offer-sent': 'text-gold-600 bg-gold-50 border-gold-200',
  'settlement-approved': 'text-emerald-600 bg-emerald-50 border-emerald-200',
  'payment-sent': 'text-navy-600 bg-navy-50 border-navy-200',
  'account-closed': 'text-emerald-600 bg-emerald-50 border-emerald-200',
  'lawsuit-filed': 'text-rose-600 bg-rose-50 border-rose-200',
  'lawsuit-resolved': 'text-emerald-600 bg-emerald-50 border-emerald-200',
  'call-logged': 'text-teal-600 bg-teal-50 border-teal-200',
  'letter-received': 'text-navy-600 bg-navy-50 border-navy-200',
};

const FILTER_GROUPS: { label: string; types: ActivityEventType[] }[] = [
  { label: 'All', types: [] },
  {
    label: 'Settlements',
    types: ['settlement-approved', 'payment-sent', 'account-closed', 'counter-offer-received', 'counter-offer-sent'],
  },
  { label: 'Legal', types: ['lawsuit-filed', 'lawsuit-resolved'] },
  { label: 'Communications', types: ['outreach-sent', 'creditor-response', 'call-logged', 'letter-received'] },
  { label: 'Payments', types: ['payment-sent'] },
];

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ActivityTimeline() {
  const { state } = useApp();
  const [filter, setFilter] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const events = useMemo(() => {
    const activeTypes = FILTER_GROUPS.find((f) => f.label === filter)?.types ?? [];
    const sorted = [...state.activityEvents].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    if (activeTypes.length === 0) return sorted;
    return sorted.filter((e) => activeTypes.includes(e.type));
  }, [state.activityEvents, filter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {FILTER_GROUPS.map((f) => (
          <button
            key={f.label}
            onClick={() => setFilter(f.label)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === f.label
                ? 'bg-navy-900 text-cream-50'
                : 'bg-cream-100 text-navy-600 hover:bg-cream-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-cream-300" />

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {events.map((event, i) => {
              const Icon = EVENT_ICON[event.type];
              const colorClass = EVENT_COLOR[event.type];
              const isOpen = expandedId === event.id;
              const creditor = state.cards.find((c) => c.id === event.creditorId);

              return (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: Math.min(i * 0.05, 0.4), duration: 0.4 }}
                  className="relative pl-12"
                >
                  {/* Dot */}
                  <div
                    className={`absolute left-0 top-1 w-10 h-10 rounded-full border flex items-center justify-center ${colorClass}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Card */}
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="bg-cream-50 rounded-2xl border border-cream-300 p-5 shadow-sm cursor-pointer"
                    onClick={() => setExpandedId(isOpen ? null : event.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {creditor && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-navy-100 text-navy-700">
                              {creditor.creditor}
                            </span>
                          )}
                          <span className="text-xs text-navy-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {relativeTime(event.timestamp)}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-navy-900">{event.title}</h4>
                        <p className="text-sm text-navy-500 mt-1 line-clamp-2">{event.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {event.amount !== undefined && (
                          <span
                            className={`text-sm font-bold whitespace-nowrap ${
                              event.amount < 0 ? 'text-rose-600' : 'text-emerald-600'
                            }`}
                          >
                            {event.amount < 0 ? '-' : '+'}
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                              maximumFractionDigits: 0,
                            }).format(Math.abs(event.amount))}
                          </span>
                        )}
                        <ChevronDown
                          className={`w-4 h-4 text-navy-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </div>
                    </div>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-3 mt-3 border-t border-cream-200 text-sm text-navy-500 space-y-1">
                            <p>{event.description}</p>
                            {event.metadata &&
                              Object.entries(event.metadata).map(([k, v]) => (
                                <p key={k} className="text-xs text-navy-400 capitalize">
                                  {k}: <span className="font-medium text-navy-600">{v}</span>
                                </p>
                              ))}
                            {event.reference && (
                              <p className="text-xs text-navy-400">
                                Ref: <span className="font-medium text-navy-600">{event.reference}</span>
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
