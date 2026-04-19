import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { AppState, DebtCard, UserProfile, OnboardingStep, AppView, ActivityEvent, EscrowTransaction, VaultDocument, CreditSnapshot, CreditFactor, Message } from '../types';
import {
  DEFAULT_PROFILE,
  DEFAULT_CARDS,
  DEFAULT_ACTIVITY_EVENTS,
  DEFAULT_ESCROW_TRANSACTIONS,
  DEFAULT_DOCUMENTS,
  DEFAULT_CREDIT_HISTORY,
  DEFAULT_CREDIT_FACTORS,
  DEFAULT_REBUILD_TASKS,
  DEFAULT_NOTIFICATIONS,
  DEFAULT_MESSAGE_THREADS,
} from '../data';

const initialState: AppState = {
  profile: DEFAULT_PROFILE,
  cards: DEFAULT_CARDS,
  totalMonthlyPayment: DEFAULT_CARDS.reduce((sum, c) => sum + c.minPayment, 0) + 200,
  platformFee: 49,
  escrowBalance: 2847,
  adminMode: false,
  demoMode: true,
  onboardingStep: 'basic-info',
  currentView: 'landing',
  eligibilityStatus: 'approved',
  idVerified: true,
  creditChecked: true,
  activityEvents: DEFAULT_ACTIVITY_EVENTS,
  escrowTransactions: DEFAULT_ESCROW_TRANSACTIONS,
  documents: DEFAULT_DOCUMENTS,
  creditHistory: DEFAULT_CREDIT_HISTORY,
  creditFactors: DEFAULT_CREDIT_FACTORS,
  rebuildTasks: DEFAULT_REBUILD_TASKS,
  notifications: DEFAULT_NOTIFICATIONS,
  messageThreads: DEFAULT_MESSAGE_THREADS,
};

interface AppContextType {
  state: AppState;
  setProfile: (profile: UserProfile) => void;
  setCards: (cards: DebtCard[]) => void;
  updateCard: (id: string, updates: Partial<DebtCard>) => void;
  setTotalMonthlyPayment: (amount: number) => void;
  setPlatformFee: (fee: number) => void;
  setEscrowBalance: (balance: number) => void;
  setAdminMode: (mode: boolean) => void;
  toggleDemoMode: () => void;
  setOnboardingStep: (step: OnboardingStep) => void;
  setCurrentView: (view: AppView) => void;
  setEligibilityStatus: (status: AppState['eligibilityStatus']) => void;
  setIdVerified: (v: boolean) => void;
  setCreditChecked: (v: boolean) => void;
  resetToDemo: () => void;
  addActivityEvent: (event: ActivityEvent) => void;
  setEscrowTransactions: (transactions: EscrowTransaction[]) => void;
  setDocuments: (documents: VaultDocument[]) => void;
  setCreditHistory: (history: CreditSnapshot[]) => void;
  setCreditFactors: (factors: CreditFactor[]) => void;
  toggleRebuildTask: (taskId: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  sendMessage: (threadId: string, body: string) => void;
  markThreadRead: (threadId: string) => void;
  addReplyToThread: (threadId: string, body: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);

  const setProfile = useCallback((profile: UserProfile) => {
    setState((s) => ({ ...s, profile }));
  }, []);

  const setCards = useCallback((cards: DebtCard[]) => {
    setState((s) => ({ ...s, cards }));
  }, []);

  const updateCard = useCallback((id: string, updates: Partial<DebtCard>) => {
    setState((s) => ({
      ...s,
      cards: s.cards.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  }, []);

  const setTotalMonthlyPayment = useCallback((amount: number) => {
    setState((s) => ({ ...s, totalMonthlyPayment: amount }));
  }, []);

  const setPlatformFee = useCallback((fee: number) => {
    setState((s) => ({ ...s, platformFee: fee }));
  }, []);

  const setEscrowBalance = useCallback((balance: number) => {
    setState((s) => ({ ...s, escrowBalance: balance }));
  }, []);

  const setAdminMode = useCallback((mode: boolean) => {
    setState((s) => ({ ...s, adminMode: mode }));
  }, []);

  const toggleDemoMode = useCallback(() => {
    setState((s) => ({ ...s, demoMode: !s.demoMode }));
  }, []);

  const setOnboardingStep = useCallback((step: OnboardingStep) => {
    setState((s) => ({ ...s, onboardingStep: step }));
  }, []);

  const setCurrentView = useCallback((view: AppView) => {
    setState((s) => ({ ...s, currentView: view }));
  }, []);

  const setEligibilityStatus = useCallback((status: AppState['eligibilityStatus']) => {
    setState((s) => ({ ...s, eligibilityStatus: status }));
  }, []);

  const setIdVerified = useCallback((v: boolean) => {
    setState((s) => ({ ...s, idVerified: v }));
  }, []);

  const setCreditChecked = useCallback((v: boolean) => {
    setState((s) => ({ ...s, creditChecked: v }));
  }, []);

  const resetToDemo = useCallback(() => {
    setState({
      ...initialState,
      onboardingStep: 'complete',
      currentView: 'dashboard',
      eligibilityStatus: 'approved',
      idVerified: true,
      creditChecked: true,
    });
  }, []);

  const addActivityEvent = useCallback((event: ActivityEvent) => {
    setState((s) => ({ ...s, activityEvents: [event, ...s.activityEvents] }));
  }, []);

  const setEscrowTransactions = useCallback((transactions: EscrowTransaction[]) => {
    setState((s) => ({ ...s, escrowTransactions: transactions }));
  }, []);

  const setDocuments = useCallback((documents: VaultDocument[]) => {
    setState((s) => ({ ...s, documents }));
  }, []);

  const setCreditHistory = useCallback((history: CreditSnapshot[]) => {
    setState((s) => ({ ...s, creditHistory: history }));
  }, []);

  const setCreditFactors = useCallback((factors: CreditFactor[]) => {
    setState((s) => ({ ...s, creditFactors: factors }));
  }, []);

  const toggleRebuildTask = useCallback((taskId: string) => {
    setState((s) => ({
      ...s,
      rebuildTasks: s.rebuildTasks.map((t) =>
        t.id === taskId
          ? { ...t, status: t.status === 'complete' ? 'not-started' : t.status === 'not-started' ? 'in-progress' : 'complete' as const }
          : t
      ),
    }));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    }));
  }, []);

  const sendMessage = useCallback((threadId: string, body: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      body,
      timestamp: new Date().toISOString(),
      read: true,
    };
    setState((s) => ({
      ...s,
      messageThreads: s.messageThreads.map((t) =>
        t.id === threadId ? { ...t, messages: [...t.messages, newMessage] } : t
      ),
    }));
  }, []);

  const markThreadRead = useCallback((threadId: string) => {
    setState((s) => ({
      ...s,
      messageThreads: s.messageThreads.map((t) =>
        t.id === threadId
          ? { ...t, messages: t.messages.map((m) => ({ ...m, read: true })) }
          : t
      ),
    }));
  }, []);

  const addReplyToThread = useCallback((threadId: string, body: string) => {
    const reply: Message = {
      id: `msg-${Date.now()}`,
      sender: 'negotiator',
      body,
      timestamp: new Date().toISOString(),
      read: true,
    };
    setState((s) => ({
      ...s,
      messageThreads: s.messageThreads.map((t) =>
        t.id === threadId ? { ...t, messages: [...t.messages, reply] } : t
      ),
    }));
  }, []);

  return (
    <AppContext.Provider
      value={{
        state,
        setProfile,
        setCards,
        updateCard,
        setTotalMonthlyPayment,
        setPlatformFee,
        setEscrowBalance,
        setAdminMode,
        toggleDemoMode,
        setOnboardingStep,
        setCurrentView,
        setEligibilityStatus,
        setIdVerified,
        setCreditChecked,
        resetToDemo,
        addActivityEvent,
        setEscrowTransactions,
        setDocuments,
        setCreditHistory,
        setCreditFactors,
        toggleRebuildTask,
        markNotificationRead,
        markAllNotificationsRead,
        sendMessage,
        markThreadRead,
        addReplyToThread,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
