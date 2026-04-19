import type { DebtCard, UserProfile, ComparisonResult, PayoffResult, MonthlyBreakdown } from './types';

export const DEFAULT_PROFILE: UserProfile = {
  firstName: 'Alex',
  lastName: 'Mitchell',
  email: 'alex.mitchell@example.com',
  phone: '(555) 234-8901',
  dob: '1988-03-15',
  ssnLast4: '7284',
  address: '4821 Oakwood Drive',
  city: 'Austin',
  state: 'TX',
  zip: '78731',
  creditScore: 'fair',
  annualIncome: 72000,
  monthlyExpenses: 4200,
};

export const DEFAULT_CARDS: DebtCard[] = [
  {
    id: '1',
    creditor: 'Amex',
    balance: 12000,
    currentApr: 28.0,
    negotiatedApr: 12.0,
    minPayment: 360,
    status: 'active',
    settlementOffer: 8400,
    monthsBehind: 0,
  },
  {
    id: '2',
    creditor: 'Chase',
    balance: 10000,
    currentApr: 24.0,
    negotiatedApr: 10.0,
    minPayment: 300,
    status: 'active',
    settlementOffer: 7000,
    monthsBehind: 0,
  },
  {
    id: '3',
    creditor: 'Citi',
    balance: 8000,
    currentApr: 26.0,
    negotiatedApr: 11.0,
    minPayment: 240,
    status: 'active',
    settlementOffer: 5600,
    monthsBehind: 0,
  },
];

export const CREDIT_SCORE_LABELS: Record<string, string> = {
  poor: 'Poor (300-579)',
  fair: 'Fair (580-669)',
  good: 'Good (670-739)',
  'very-good': 'Very Good (740-799)',
  excellent: 'Excellent (800-850)',
};

export const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  eligible: { label: 'Eligible', color: 'text-slate-600', bg: 'bg-slate-100' },
  'outreach-sent': { label: 'Outreach Sent', color: 'text-amber-600', bg: 'bg-amber-50' },
  pending: { label: 'Pending', color: 'text-blue-600', bg: 'bg-blue-50' },
  approved: { label: 'Approved', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  active: { label: 'Active', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  declined: { label: 'Declined', color: 'text-rose-600', bg: 'bg-rose-50' },
};

// Differentiators for landing page
export const DIFFERENTIATORS = [
  {
    title: 'No Upfront Fees',
    description: 'We only get paid when we successfully reduce your debt. No hidden charges, no setup costs, no monthly retainers.',
    icon: 'Shield',
  },
  {
    title: 'Legal Protection Included',
    description: 'Our network of attorneys protects you from creditor harassment, lawsuits, and wage garnishment while we negotiate.',
    icon: 'Scale',
  },
  {
    title: 'FDIC-Insured Escrow',
    description: 'Your monthly deposits are held in a secure, FDIC-insured escrow account. You control it. You can withdraw anytime.',
    icon: 'Lock',
  },
  {
    title: 'Real-Time Negotiations',
    description: 'Watch our negotiators work in real-time. See every offer, counter-offer, and settlement as it happens.',
    icon: 'Activity',
  },
  {
    title: 'Credit Rebuilding Program',
    description: 'Debt relief is just the start. Our free credit rebuilding program helps you recover to 700+ within 24 months.',
    icon: 'TrendingUp',
  },
  {
    title: 'Average 52% Reduction',
    description: 'Our clients settle for an average of 48 cents on the dollar. That is $14,400 saved on a $30,000 debt load.',
    icon: 'Percent',
  },
];

// How it works steps
export const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Free Eligibility Check',
    description: 'Answer a few questions. We run a soft credit pull and verify your identity. No impact on your credit score.',
  },
  {
    step: '02',
    title: 'Build Your Escrow',
    description: 'Stop paying creditors. Deposit an affordable monthly amount into your FDIC-insured escrow account instead.',
  },
  {
    step: '03',
    title: 'We Negotiate Hard',
    description: 'Our expert negotiators contact your creditors and fight for the lowest possible settlement on your behalf.',
  },
  {
    step: '04',
    title: 'Settle & Rebuild',
    description: 'Pay the settlement from escrow. Get debt-free faster. Then join our free credit rebuilding program.',
  },
];

function calculatePayoff(
  balance: number,
  apr: number,
  monthlyPayment: number,
  platformFee: number = 0
): PayoffResult {
  let remaining = balance;
  let totalInterest = 0;
  let months = 0;
  const monthlyBreakdown: MonthlyBreakdown[] = [];
  const monthlyRate = apr / 100 / 12;
  const effectivePayment = Math.max(0, monthlyPayment - platformFee);

  while (remaining > 0.01 && months < 600) {
    months++;
    const interest = remaining * monthlyRate;
    const principal = Math.min(effectivePayment - interest, remaining);
    
    if (principal <= 0) {
      remaining += interest - effectivePayment;
      totalInterest += interest;
      monthlyBreakdown.push({
        month: months,
        balance: remaining,
        interestPaid: interest,
        principalPaid: effectivePayment - interest,
        platformFee,
      });
      if (months > 480) break;
      continue;
    }

    remaining -= principal;
    totalInterest += interest;
    monthlyBreakdown.push({
      month: months,
      balance: Math.max(0, remaining),
      interestPaid: interest,
      principalPaid: principal,
      platformFee,
    });
  }

  return {
    months,
    totalInterest,
    totalPaid: balance + totalInterest,
    monthlyBreakdown,
  };
}

export function calculateComparison(
  cards: DebtCard[],
  totalMonthlyPayment: number,
  platformFee: number
): ComparisonResult {
  const totalBalance = cards.reduce((sum, c) => sum + c.balance, 0);
  if (totalBalance === 0) {
    return {
      statusQuo: { months: 0, totalInterest: 0, totalPaid: 0, monthlyBreakdown: [] },
      platformPath: { months: 0, totalInterest: 0, totalPaid: 0, monthlyBreakdown: [] },
      interestSaved: 0,
      monthsSaved: 0,
    };
  }

  const weightedCurrentApr =
    cards.reduce((sum, c) => sum + c.balance * c.currentApr, 0) / totalBalance;
  const weightedNegotiatedApr =
    cards.reduce((sum, c) => sum + c.balance * (c.negotiatedApr ?? c.currentApr), 0) / totalBalance;

  const statusQuo = calculatePayoff(totalBalance, weightedCurrentApr, totalMonthlyPayment, 0);
  const platformPath = calculatePayoff(totalBalance, weightedNegotiatedApr, totalMonthlyPayment, platformFee);

  return {
    statusQuo,
    platformPath,
    interestSaved: statusQuo.totalInterest - platformPath.totalInterest,
    monthsSaved: statusQuo.months - platformPath.months,
  };
}

export function calculateSettlementSavings(cards: DebtCard[]): {
  totalDebt: number;
  estimatedSettlement: number;
  savings: number;
  savingsPercent: number;
} {
  const totalDebt = cards.reduce((s, c) => s + c.balance, 0);
  const estimatedSettlement = cards.reduce(
    (s, c) => s + (c.settlementOffer ?? c.balance * 0.52),
    0
  );
  const savings = totalDebt - estimatedSettlement;
  return {
    totalDebt,
    estimatedSettlement,
    savings,
    savingsPercent: totalDebt > 0 ? (savings / totalDebt) * 100 : 0,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
