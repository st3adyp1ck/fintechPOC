import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { AppState, DebtCard, UserProfile, OnboardingStep, AppView } from '../types';
import { DEFAULT_PROFILE, DEFAULT_CARDS } from '../data';

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
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
