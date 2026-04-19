import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Building2,
  BarChart3,
  Shield,
  RotateCcw,
  Wallet,
  ToggleLeft,
  ToggleRight,
  Activity,
  Receipt,
  FolderLock,
  LineChart,
  MessageSquare,
} from 'lucide-react';
import NotificationCenter from './NotificationCenter';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { state, setCurrentView, setAdminMode, resetToDemo, toggleDemoMode } = useApp();
  const [notifOpen, setNotifOpen] = useState(false);

  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'activity' as const, label: 'Activity', icon: Activity },
    { id: 'escrow' as const, label: 'Escrow Ledger', icon: Receipt },
    { id: 'documents' as const, label: 'Documents', icon: FolderLock },
    { id: 'credit' as const, label: 'Credit Health', icon: LineChart },
    { id: 'simulator' as const, label: 'Impact Simulator', icon: BarChart3 },
    { id: 'creditors' as const, label: 'Creditors', icon: Building2 },
    { id: 'messages' as const, label: 'Messages', icon: MessageSquare },
  ];

  const unreadMessages = state.messageThreads.reduce(
    (sum, t) => sum + t.messages.filter((m) => m.sender !== 'user' && !m.read).length,
    0
  );

  const viewTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'My Debt Settlement Dashboard', subtitle: 'Track settlements, escrow, and your path to freedom' },
    simulator: { title: 'Impact Simulator', subtitle: 'See how negotiation power affects your timeline' },
    creditors: { title: 'Creditor Negotiations', subtitle: 'Monitor negotiation status with each creditor' },
    admin: { title: 'Admin Controls', subtitle: 'Manage rates, fees, and platform settings' },
    activity: { title: 'Activity Timeline', subtitle: 'Every negotiation event across all creditors' },
    escrow: { title: 'Escrow Ledger', subtitle: 'Full statement of every dollar in and out' },
    documents: { title: 'Document Vault', subtitle: 'All program paperwork in one secure place' },
    credit: { title: 'Credit Health', subtitle: 'Track recovery and rebuild your score' },
    messages: { title: 'Secure Messages', subtitle: 'Message your negotiator directly' },
  };

  const currentMeta = viewTitles[state.currentView] ?? { title: '', subtitle: '' };

  return (
    <div className="min-h-screen bg-cream-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-navy-950 text-cream-50 flex flex-col fixed h-full z-10 border-r border-navy-900">
        <div className="p-6 border-b border-navy-900">
          <motion.div
            className="flex items-center gap-2.5"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-navy-950" />
            </div>
            <span className="text-lg font-bold tracking-tight">DebtOptimize</span>
          </motion.div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = state.currentView === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => {
                  setAdminMode(false);
                  setCurrentView(item.id);
                }}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gold-500 text-navy-950'
                    : 'text-navy-300 hover:bg-navy-900 hover:text-cream-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.id === 'messages' && unreadMessages > 0 && (
                  <span className="ml-auto text-[10px] font-bold bg-rose-500 text-white px-1.5 py-0.5 rounded-full">
                    {unreadMessages}
                  </span>
                )}
              </motion.button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-navy-900 space-y-2">
          <motion.button
            onClick={() => {
              setAdminMode(true);
              setCurrentView('admin');
            }}
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              state.currentView === 'admin'
                ? 'bg-gold-500 text-navy-950'
                : 'text-navy-300 hover:bg-navy-900 hover:text-cream-50'
            }`}
          >
            <Shield className="w-4 h-4" />
            Admin
          </motion.button>
          <motion.button
            onClick={resetToDemo}
            whileHover={{ x: 2 }}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-navy-400 hover:bg-navy-900 hover:text-cream-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Demo
          </motion.button>
          <div className="px-4 py-2 text-xs text-gold-400">
            {state.profile.firstName} {state.profile.lastName}
            <br />
            <span className="text-gold-500">{state.profile.email}</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {/* Top Bar */}
        <header className="bg-cream-50/80 backdrop-blur-xl border-b border-cream-300 px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-navy-900">{currentMeta.title}</h1>
              <p className="text-sm text-navy-400 mt-0.5">{currentMeta.subtitle}</p>
            </div>
            <div className="flex items-center gap-4">
              <motion.button
                onClick={toggleDemoMode}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-cream-200 hover:bg-cream-300 text-navy-700"
              >
                {state.demoMode ? (
                  <ToggleRight className="w-4 h-4 text-emerald-600" />
                ) : (
                  <ToggleLeft className="w-4 h-4 text-navy-400" />
                )}
                Demo Mode
              </motion.button>

              <div className="relative">
                <NotificationCenter isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
                <div
                  className="absolute inset-0 cursor-pointer"
                  onClick={() => setNotifOpen((v) => !v)}
                />
              </div>

              <div className="text-right">
                <p className="text-sm font-bold text-navy-900">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(state.escrowBalance)}
                </p>
                <p className="text-xs text-navy-400">Escrow Balance</p>
              </div>
              <div className="w-10 h-10 bg-gold-100 rounded-full flex items-center justify-center border border-gold-200">
                <span className="text-sm font-bold text-navy-800">
                  {state.profile.firstName?.charAt(0)}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">{children}</div>

        {/* Disclaimer Footer */}
        <footer className="px-8 py-5 border-t border-cream-300 bg-cream-50">
          <p className="text-xs text-navy-400 text-center">
            DebtOptimize is a debt settlement company. We do not provide loans or credit repair services. Results vary and are not guaranteed. Not available in all states.
            {' '}
            <a href="#" className="underline hover:text-navy-600">Privacy</a>
            {' · '}
            <a href="#" className="underline hover:text-navy-600">Terms</a>
          </p>
        </footer>
      </main>
    </div>
  );
}
