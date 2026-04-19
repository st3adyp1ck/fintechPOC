import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { UserProfile, DebtCard, CreditScore } from '../types';
import { CREDIT_SCORE_LABELS } from '../data';
import { motion, AnimatePresence } from 'framer-motion';
import AuthModal from './AuthModal';
import {
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  CreditCard,
  CheckCircle2,
  Shield,
  Loader2,

  User,
  FileText,
  Camera,
  Banknote,
  Lock,
  Sparkles,
} from 'lucide-react';

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 60 : -60,
    opacity: 0,
  }),
};

export default function Onboarding() {
  const { state, setProfile, setCards, setTotalMonthlyPayment, setOnboardingStep, setCurrentView, setEligibilityStatus, setIdVerified, setCreditChecked } = useApp();
  const [[step, direction], setStep] = useState([0, 1]);
  const [profile, setLocalProfile] = useState<UserProfile>(state.profile);
  const [cards, setLocalCards] = useState<DebtCard[]>(state.cards);
  const [idUploading, setIdUploading] = useState(false);
  const [idUploaded, setIdUploaded] = useState(false);
  const [creditChecking, setCreditChecking] = useState(false);
  const [creditCheckedLocal, setCreditCheckedLocal] = useState(false);
  const [creditScore] = useState<CreditScore>('fair');
  const [estimatedSavings, setEstimatedSavings] = useState(0);
  const [authOpen, setAuthOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 1 && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [step]);

  const paginate = (newStep: number) => {
    setStep([newStep, newStep > step ? 1 : -1]);
  };

  const addCard = () => {
    setLocalCards([
      ...cards,
      { id: Date.now().toString(), creditor: '', balance: 0, currentApr: 24.99, negotiatedApr: null, minPayment: 0, status: 'eligible' },
    ]);
  };

  const removeCard = (id: string) => {
    if (cards.length <= 1) return;
    setLocalCards(cards.filter((c) => c.id !== id));
  };

  const updateCard = (id: string, field: keyof DebtCard, value: string | number) => {
    setLocalCards(cards.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const simulateIdUpload = () => {
    setIdUploading(true);
    setTimeout(() => {
      setIdUploading(false);
      setIdUploaded(true);
      setIdVerified(true);
    }, 2500);
  };

  const simulateCreditCheck = () => {
    setCreditChecking(true);
    setTimeout(() => {
      setCreditChecking(false);
      setCreditCheckedLocal(true);
      setCreditChecked(true);
      const totalDebt = cards.reduce((s, c) => s + c.balance, 0);
      setEstimatedSavings(Math.round(totalDebt * 0.52));
    }, 3000);
  };

  const handleComplete = () => {
    setProfile({ ...profile, creditScore });
    setCards(cards);
    const totalMin = cards.reduce((s, c) => s + c.minPayment, 0);
    setTotalMonthlyPayment(totalMin + 200);
    setEligibilityStatus('approved');
    setOnboardingStep('complete');
    setCurrentView('dashboard');
  };

  const handleAuthSuccess = () => {
    setAuthOpen(false);
    setOnboardingStep('basic-info');
    setCurrentView('onboarding');
  };

  const steps = [
    { id: 'basic-info', label: 'Basic Info', icon: User },
    { id: 'identity-verify', label: 'Verify ID', icon: Shield },
    { id: 'credit-check', label: 'Credit Check', icon: FileText },
    { id: 'debt-assessment', label: 'Your Debt', icon: CreditCard },
    { id: 'eligibility', label: 'Eligibility', icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen bg-cream-50 py-8 px-4">
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} onSuccess={handleAuthSuccess} />

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <motion.div
            className="flex items-center justify-center gap-2.5 mb-5"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-9 h-9 bg-navy-900 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-gold-400" />
            </div>
            <span className="text-xl font-bold text-navy-900">DebtOptimize</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-navy-900">Check Your Eligibility</h1>
          <p className="text-sm text-navy-400 mt-2">Free. No credit impact. Takes about 3 minutes.</p>
        </motion.div>

        {/* Progress */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const isActive = i <= step;
              const isCurrent = i === step;
              return (
                <motion.div key={s.id} className="flex items-center gap-2" initial={false}>
                  <motion.div
                    animate={{
                      backgroundColor: isCurrent ? '#12162b' : isActive ? '#14b8a6' : '#ebe4d6',
                      scale: isCurrent ? 1.1 : 1,
                    }}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold"
                  >
                    {isActive && !isCurrent ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-navy-400'}`} />
                    )}
                  </motion.div>
                  <span className={`hidden sm:block text-xs font-medium ${isActive ? 'text-navy-700' : 'text-navy-300'}`}>
                    {s.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
          <div className="w-full h-2 bg-cream-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-navy-900 rounded-full"
              initial={false}
              animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Step 1: Basic Info */}
            {step === 0 && (
              <div className="bg-cream-50 rounded-2xl border border-cream-300 p-8 shadow-sm">
                <h2 className="text-xl font-bold text-navy-900 mb-2">Let's get to know you</h2>
                <p className="text-sm text-navy-400 mb-8">We need basic info to verify your identity and check your eligibility.</p>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-1.5">First Name</label>
                      <input type="text" value={profile.firstName} onChange={(e) => setLocalProfile({ ...profile, firstName: e.target.value })} className="w-full px-4 py-3 bg-white border border-cream-300 rounded-xl text-sm text-navy-900 focus:border-gold-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-1.5">Last Name</label>
                      <input type="text" value={profile.lastName} onChange={(e) => setLocalProfile({ ...profile, lastName: e.target.value })} className="w-full px-4 py-3 bg-white border border-cream-300 rounded-xl text-sm text-navy-900 focus:border-gold-500 outline-none transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1.5">Email</label>
                    <input type="email" value={profile.email} onChange={(e) => setLocalProfile({ ...profile, email: e.target.value })} className="w-full px-4 py-3 bg-white border border-cream-300 rounded-xl text-sm text-navy-900 focus:border-gold-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1.5">Phone</label>
                    <input type="tel" value={profile.phone} onChange={(e) => setLocalProfile({ ...profile, phone: e.target.value })} className="w-full px-4 py-3 bg-white border border-cream-300 rounded-xl text-sm text-navy-900 focus:border-gold-500 outline-none transition-all" placeholder="(555) 000-0000" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-1.5">Date of Birth</label>
                      <input type="date" value={profile.dob} onChange={(e) => setLocalProfile({ ...profile, dob: e.target.value })} className="w-full px-4 py-3 bg-white border border-cream-300 rounded-xl text-sm text-navy-900 focus:border-gold-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-1.5">SSN Last 4</label>
                      <input type="password" maxLength={4} value={profile.ssnLast4} onChange={(e) => setLocalProfile({ ...profile, ssnLast4: e.target.value })} className="w-full px-4 py-3 bg-white border border-cream-300 rounded-xl text-sm text-navy-900 focus:border-gold-500 outline-none transition-all" placeholder="7284" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1.5">Street Address</label>
                    <input type="text" value={profile.address} onChange={(e) => setLocalProfile({ ...profile, address: e.target.value })} className="w-full px-4 py-3 bg-white border border-cream-300 rounded-xl text-sm text-navy-900 focus:border-gold-500 outline-none transition-all" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-1.5">City</label>
                      <input type="text" value={profile.city} onChange={(e) => setLocalProfile({ ...profile, city: e.target.value })} className="w-full px-4 py-3 bg-white border border-cream-300 rounded-xl text-sm text-navy-900 focus:border-gold-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-1.5">State</label>
                      <input type="text" value={profile.state} onChange={(e) => setLocalProfile({ ...profile, state: e.target.value })} className="w-full px-4 py-3 bg-white border border-cream-300 rounded-xl text-sm text-navy-900 focus:border-gold-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-1.5">ZIP</label>
                      <input type="text" value={profile.zip} onChange={(e) => setLocalProfile({ ...profile, zip: e.target.value })} className="w-full px-4 py-3 bg-white border border-cream-300 rounded-xl text-sm text-navy-900 focus:border-gold-500 outline-none transition-all" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Identity Verification */}
            {step === 1 && (
              <div className="bg-cream-50 rounded-2xl border border-cream-300 p-8 shadow-sm">
                <h2 className="text-xl font-bold text-navy-900 mb-2">Verify Your Identity</h2>
                <p className="text-sm text-navy-400 mb-8">Federal law requires us to verify your identity. This is a soft check — it will not affect your credit score.</p>
                {!idUploaded ? (
                  <div className="space-y-6">
                    <motion.div
                      onClick={simulateIdUpload}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors ${
                        idUploading ? 'border-gold-400 bg-gold-50/50' : 'border-cream-400 hover:border-navy-400 hover:bg-cream-100'
                      }`}
                    >
                      {idUploading ? (
                        <div className="flex flex-col items-center">
                          <Loader2 className="w-10 h-10 text-navy-600 animate-spin mb-3" />
                          <p className="text-sm font-medium text-navy-700">Verifying your identity...</p>
                          <p className="text-xs text-navy-400 mt-1">Running against government databases</p>
                        </div>
                      ) : (
                        <>
                          <Camera className="w-10 h-10 text-navy-300 mx-auto mb-3" />
                          <p className="text-sm font-medium text-navy-700 mb-1">Click to simulate ID upload</p>
                          <p className="text-xs text-navy-400">Driver's license or passport front & back</p>
                        </>
                      )}
                    </motion.div>
                    <div className="flex items-start gap-3 p-4 bg-navy-50 rounded-xl border border-navy-100">
                      <Lock className="w-5 h-5 text-navy-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-navy-800">Your data is secure</p>
                        <p className="text-xs text-navy-500 mt-1">256-bit encryption. ID documents are not stored on our servers. Verified by our SOC-2 compliant partner.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }} className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </motion.div>
                    <h3 className="text-lg font-bold text-navy-900 mb-2">Identity Verified</h3>
                    <p className="text-sm text-navy-600 mb-1">{profile.firstName} {profile.lastName}</p>
                    <p className="text-xs text-navy-400">SSN ending in {profile.ssnLast4} confirmed</p>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6 p-4 bg-cream-100 rounded-xl text-left">
                      <p className="text-xs font-medium text-navy-700 mb-2">Verification Details:</p>
                      <div className="space-y-1 text-xs text-navy-500">
                        <p>Document Type: Driver's License</p>
                        <p>Issuing State: {profile.state}</p>
                        <p>Match Confidence: 99.7%</p>
                        <p>Fraud Check: Passed</p>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Step 3: Credit Check */}
            {step === 2 && (
              <div className="bg-cream-50 rounded-2xl border border-cream-300 p-8 shadow-sm">
                <h2 className="text-xl font-bold text-navy-900 mb-2">Soft Credit Check</h2>
                <p className="text-sm text-navy-400 mb-8">We run a soft inquiry to understand your credit profile. No impact on your score.</p>
                {!creditCheckedLocal ? (
                  <div className="space-y-6">
                    <motion.button
                      onClick={simulateCreditCheck}
                      disabled={creditChecking}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full py-4 bg-navy-900 text-cream-50 font-semibold rounded-xl hover:bg-navy-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {creditChecking ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Running soft credit pull...
                        </>
                      ) : (
                        <>
                          <FileText className="w-5 h-5" />
                          Run Soft Credit Check
                        </>
                      )}
                    </motion.button>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 bg-cream-100 rounded-xl text-center">
                        <p className="text-xs text-navy-400 mb-1 uppercase tracking-wider">Credit Score Range</p>
                        <p className="text-xl font-bold text-navy-300">---</p>
                      </div>
                      <div className="p-5 bg-cream-100 rounded-xl text-center">
                        <p className="text-xs text-navy-400 mb-1 uppercase tracking-wider">Estimated Savings</p>
                        <p className="text-xl font-bold text-navy-300">---</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                      </motion.div>
                      <h3 className="text-lg font-bold text-navy-900 mb-1">Credit Check Complete</h3>
                      <p className="text-xs text-navy-400">Soft inquiry performed. No impact to your score.</p>
                    </motion.div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 bg-navy-50 rounded-xl text-center border border-navy-100">
                        <p className="text-xs text-navy-500 mb-1 uppercase tracking-wider">Credit Score Range</p>
                        <p className="text-lg font-bold text-navy-700">{CREDIT_SCORE_LABELS[creditScore]}</p>
                      </div>
                      <div className="p-5 bg-emerald-50 rounded-xl text-center border border-emerald-100">
                        <p className="text-xs text-emerald-600 mb-1 uppercase tracking-wider">Est. Settlement Savings</p>
                        <p className="text-lg font-bold text-emerald-700">${estimatedSavings.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="p-5 bg-cream-100 rounded-xl">
                      <p className="text-xs font-medium text-navy-700 mb-2">Credit Profile Summary:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs text-navy-500">
                        <p>Total Accounts: {cards.length + 1}</p>
                        <p>Delinquent: 0</p>
                        <p>Utilization: 78%</p>
                        <p>History: 8 years</p>
                      </div>
                    </div>
                    <div className="p-4 bg-gold-50 rounded-xl border border-gold-200 flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-gold-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-navy-800">Your credit score does not disqualify you</p>
                        <p className="text-xs text-navy-500 mt-1">Debt settlement is designed for people who cannot qualify for consolidation loans. We use this data to build your personalized negotiation strategy.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Debt Assessment */}
            {step === 3 && (
              <div className="bg-cream-50 rounded-2xl border border-cream-300 p-8 shadow-sm">
                <h2 className="text-xl font-bold text-navy-900 mb-2">Your Debt Profile</h2>
                <p className="text-sm text-navy-400 mb-8">List all your unsecured debts. Be honest — this helps us build an accurate savings estimate.</p>
                <div className="space-y-4">
                  <AnimatePresence>
                    {cards.map((card, idx) => (
                      <motion.div
                        key={card.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-5 border border-cream-300 rounded-xl bg-white"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-navy-400" />
                            <span className="text-sm font-medium text-navy-700">Debt {idx + 1}</span>
                          </div>
                          {cards.length > 1 && (
                            <motion.button onClick={() => removeCard(card.id)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="text-rose-400 hover:text-rose-600">
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input type="text" value={card.creditor} onChange={(e) => updateCard(card.id, 'creditor', e.target.value)} className="px-3 py-2.5 bg-cream-50 border border-cream-300 rounded-lg text-sm text-navy-900 focus:border-gold-500 outline-none transition-all" placeholder="Creditor (e.g. Chase)" />
                          <input type="number" value={card.balance || ''} onChange={(e) => updateCard(card.id, 'balance', Number(e.target.value))} className="px-3 py-2.5 bg-cream-50 border border-cream-300 rounded-lg text-sm text-navy-900 focus:border-gold-500 outline-none transition-all" placeholder="Balance" />
                          <input type="number" step="0.01" value={card.currentApr || ''} onChange={(e) => updateCard(card.id, 'currentApr', Number(e.target.value))} className="px-3 py-2.5 bg-cream-50 border border-cream-300 rounded-lg text-sm text-navy-900 focus:border-gold-500 outline-none transition-all" placeholder="APR %" />
                          <input type="number" value={card.minPayment || ''} onChange={(e) => updateCard(card.id, 'minPayment', Number(e.target.value))} className="px-3 py-2.5 bg-cream-50 border border-cream-300 rounded-lg text-sm text-navy-900 focus:border-gold-500 outline-none transition-all" placeholder="Min Payment" />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <motion.button onClick={addCard} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="w-full py-3 border-2 border-dashed border-cream-400 rounded-xl text-sm font-medium text-navy-400 hover:border-navy-400 hover:text-navy-600 transition-colors flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Another Debt
                  </motion.button>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-1.5">Annual Income</label>
                      <div className="relative">
                        <Banknote className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
                        <input type="number" value={profile.annualIncome} onChange={(e) => setLocalProfile({ ...profile, annualIncome: Number(e.target.value) })} className="w-full pl-9 pr-3 py-3 bg-white border border-cream-300 rounded-xl text-sm text-navy-900 focus:border-gold-500 outline-none transition-all" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-1.5">Monthly Expenses</label>
                      <div className="relative">
                        <Banknote className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
                        <input type="number" value={profile.monthlyExpenses} onChange={(e) => setLocalProfile({ ...profile, monthlyExpenses: Number(e.target.value) })} className="w-full pl-9 pr-3 py-3 bg-white border border-cream-300 rounded-xl text-sm text-navy-900 focus:border-gold-500 outline-none transition-all" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Eligibility */}
            {step === 4 && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="bg-cream-50 rounded-2xl border border-cream-300 p-8 shadow-sm">
                <h2 className="text-xl font-bold text-navy-900 mb-2">Your Eligibility Results</h2>
                <p className="text-sm text-navy-400 mb-8">Based on your profile, here is what DebtOptimize can do for you.</p>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center py-8 mb-8">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.3 }} className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-200">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </motion.div>
                  <h3 className="text-3xl font-bold text-emerald-700 mb-1">You Are Approved</h3>
                  <p className="text-sm text-navy-500">Welcome to DebtOptimize, {profile.firstName}.</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    { label: 'Total Enrolled Debt', value: `$${cards.reduce((s, c) => s + c.balance, 0).toLocaleString()}`, bg: 'bg-cream-100' },
                    { label: 'Est. Settlement Amount', value: `$${Math.round(cards.reduce((s, c) => s + c.balance, 0) * 0.48).toLocaleString()}`, bg: 'bg-emerald-50 border border-emerald-200' },
                    { label: 'Your Total Savings', value: `$${Math.round(cards.reduce((s, c) => s + c.balance, 0) * 0.52).toLocaleString()}`, bg: 'bg-gold-50 border border-gold-200' },
                    { label: 'Program Duration', value: '24-36 mo', bg: 'bg-navy-50 border border-navy-200' },
                  ].map((item) => (
                    <div key={item.label} className={`p-5 rounded-xl text-center ${item.bg}`}>
                      <p className="text-xs text-navy-400 mb-1 uppercase tracking-wider">{item.label}</p>
                      <p className="text-xl font-bold text-navy-900">{item.value}</p>
                    </div>
                  ))}
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="p-6 bg-cream-100 rounded-xl mb-6">
                  <p className="text-sm font-bold text-navy-800 mb-4">What happens next:</p>
                  <div className="space-y-4">
                    {[
                      'Stop paying creditors. Deposit an affordable monthly amount into your FDIC-insured escrow account.',
                      'Our negotiators contact your creditors and fight for the lowest possible settlement.',
                      'Watch progress in real-time on your personal dashboard.',
                      'Settlements are paid from escrow. Get debt-free. Rebuild your credit.',
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="w-7 h-7 bg-navy-900 rounded-full flex items-center justify-center text-cream-50 text-xs font-bold shrink-0">
                          {i + 1}
                        </div>
                        <p className="text-sm text-navy-600">{item}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="p-5 bg-navy-50 rounded-xl border border-navy-200 mb-6">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-navy-700 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-navy-800">Legal Protection Plan Included</p>
                      <p className="text-xs text-navy-500 mt-1">If any creditor sues during the program, our attorneys defend you at no additional cost. Included with every membership.</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <motion.button
            onClick={() => {
              if (step === 0) {
                setCurrentView('landing');
              } else {
                paginate(step - 1);
              }
            }}
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-navy-500 hover:bg-cream-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 0 ? 'Back to Home' : 'Back'}
          </motion.button>
          {step < steps.length - 1 ? (
            <motion.button
              onClick={() => paginate(step + 1)}
              disabled={step === 1 && !idUploaded}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-8 py-3 bg-navy-900 text-cream-50 rounded-xl text-sm font-bold hover:bg-navy-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-navy-900/20"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          ) : (
            <motion.button
              onClick={handleComplete}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
            >
              Go to My Dashboard
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
