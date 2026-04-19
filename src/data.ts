import type { DebtCard, UserProfile, ComparisonResult, PayoffResult, MonthlyBreakdown, ActivityEvent, EscrowTransaction, VaultDocument, CreditSnapshot, CreditFactor, RebuildTask, Notification, MessageThread } from './types';

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

// ─── Activity Timeline Demo Events ───
export const DEFAULT_ACTIVITY_EVENTS: ActivityEvent[] = [
  {
    id: 'ae-001',
    creditorId: '2',
    type: 'settlement-approved',
    timestamp: '2026-04-17T09:30:00Z',
    title: 'Settlement Approved',
    description: 'Chase accepted a lump-sum settlement of $7,000 on your $10,000 balance. Payment scheduled from escrow.',
    amount: 7000,
  },
  {
    id: 'ae-002',
    creditorId: '1',
    type: 'counter-offer-received',
    timestamp: '2026-04-15T14:22:00Z',
    title: 'Counter-Offer Received from Amex',
    description: 'Amex responded with a counter-offer of $8,800 (down from $12,000). Our team is reviewing and will respond within 48 hours.',
    amount: 8800,
  },
  {
    id: 'ae-003',
    creditorId: '1',
    type: 'counter-offer-sent',
    timestamp: '2026-04-14T11:00:00Z',
    title: 'Counter-Offer Sent to Amex',
    description: 'We sent a revised settlement proposal of $8,000 citing hardship documentation and comparable settlement precedents.',
    amount: 8000,
  },
  {
    id: 'ae-004',
    creditorId: '3',
    type: 'call-logged',
    timestamp: '2026-04-12T16:45:00Z',
    title: 'Negotiation Call with Citi',
    description: 'Senior negotiator spoke with Citi recovery department for 34 minutes. They requested updated bank statements.',
    metadata: { negotiator: 'Sarah Chen', duration: '34 min' },
  },
  {
    id: 'ae-005',
    creditorId: '2',
    type: 'payment-sent',
    timestamp: '2026-04-10T08:15:00Z',
    title: 'Settlement Payment Sent',
    description: 'ACH transfer of $7,000 sent to Chase. Reference number provided. Account closure expected within 5 business days.',
    amount: -7000,
    reference: 'ACH-72841',
  },
  {
    id: 'ae-006',
    creditorId: '2',
    type: 'creditor-response',
    timestamp: '2026-04-08T13:20:00Z',
    title: 'Chase Sent Written Agreement',
    description: 'Chase mailed the signed settlement agreement to our office. We have uploaded it to your Document Vault for review.',
  },
  {
    id: 'ae-007',
    creditorId: '1',
    type: 'letter-received',
    timestamp: '2026-04-05T10:00:00Z',
    title: 'Formal Offer Letter from Amex',
    description: 'Amex sent a formal settlement offer letter valid through April 30. Terms include a single payment of $8,400.',
    amount: 8400,
  },
  {
    id: 'ae-008',
    creditorId: '3',
    type: 'outreach-sent',
    timestamp: '2026-04-02T09:00:00Z',
    title: 'Settlement Outreach Sent to Citi',
    description: 'Initial settlement proposal of $5,600 sent to Citi recovery team via certified mail and email.',
    amount: 5600,
  },
  {
    id: 'ae-009',
    creditorId: '2',
    type: 'counter-offer-received',
    timestamp: '2026-03-28T15:10:00Z',
    title: 'Chase Countered at $7,500',
    description: 'Chase rejected our initial $6,500 offer and countered at $7,500. We recommended acceptance and you approved.',
    amount: 7500,
  },
  {
    id: 'ae-010',
    creditorId: '1',
    type: 'lawsuit-filed',
    timestamp: '2026-03-20T08:00:00Z',
    title: 'Legal Notice: Amex Filed Suit',
    description: 'Amex filed a collections lawsuit in Travis County. Our legal team has been notified and will file a response.',
    metadata: { county: 'Travis County', caseType: 'Collections' },
  },
  {
    id: 'ae-011',
    creditorId: '2',
    type: 'call-logged',
    timestamp: '2026-03-18T11:30:00Z',
    title: 'Call with Chase Recovery',
    description: 'Negotiator discussed hardship affidavit and presented initial offer. Chase requested 5 business days to review.',
    metadata: { negotiator: 'Marcus Webb', duration: '22 min' },
  },
  {
    id: 'ae-012',
    creditorId: '1',
    type: 'counter-offer-sent',
    timestamp: '2026-03-15T09:45:00Z',
    title: 'Revised Offer Sent to Amex',
    description: 'We sent a revised offer of $8,400 after Amex rejected our first proposal. Medical hardship docs attached.',
    amount: 8400,
  },
  {
    id: 'ae-013',
    creditorId: '3',
    type: 'creditor-response',
    timestamp: '2026-03-10T14:00:00Z',
    title: 'Citi Acknowledged Outreach',
    description: 'Citi confirmed receipt of our hardship package and assigned a dedicated recovery specialist to the account.',
  },
  {
    id: 'ae-014',
    creditorId: '1',
    type: 'outreach-sent',
    timestamp: '2026-03-05T10:00:00Z',
    title: 'Initial Outreach to Amex',
    description: 'First settlement offer of $7,200 sent to American Express. Included hardship letter and financial worksheet.',
    amount: 7200,
  },
  {
    id: 'ae-015',
    creditorId: '2',
    type: 'outreach-sent',
    timestamp: '2026-03-01T09:30:00Z',
    title: 'Initial Outreach to Chase',
    description: 'Settlement proposal of $6,500 sent to Chase. Attached POA and client authorization forms.',
    amount: 6500,
  },
  {
    id: 'ae-016',
    creditorId: '1',
    type: 'lawsuit-resolved',
    timestamp: '2026-04-18T10:00:00Z',
    title: 'Amex Lawsuit Stayed',
    description: 'Our attorneys filed a stipulation to stay the proceedings pending settlement. Court granted a 60-day stay.',
    metadata: { attorney: 'Hoffman & Associates' },
  },
  {
    id: 'ae-017',
    creditorId: '2',
    type: 'account-closed',
    timestamp: '2026-04-16T14:00:00Z',
    title: 'Chase Account Closed',
    description: 'Chase confirmed the account is closed and reported as "settled in full" to the credit bureaus.',
  },
  {
    id: 'ae-018',
    creditorId: '3',
    type: 'letter-received',
    timestamp: '2026-04-01T09:00:00Z',
    title: 'Citi Sent Validation Letter',
    description: 'Citi provided debt validation documentation including original account agreement and charge-off statement.',
  },
  {
    id: 'ae-019',
    creditorId: '1',
    type: 'call-logged',
    timestamp: '2026-03-25T13:00:00Z',
    title: 'Call with Amex Legal Department',
    description: 'Attorney spoke with Amex counsel about pending litigation and mutual interest in settlement.',
    metadata: { negotiator: 'Hoffman Legal', duration: '18 min' },
  },
  {
    id: 'ae-020',
    creditorId: '2',
    type: 'settlement-approved',
    timestamp: '2026-04-09T11:00:00Z',
    title: 'You Approved Chase Settlement',
    description: 'You digitally signed the settlement approval form. We immediately initiated the escrow disbursement.',
    amount: 7000,
  },
];

// ─── Escrow Ledger Demo Transactions ───
// Worked backwards from $2,847 ending balance.
export const DEFAULT_ESCROW_TRANSACTIONS: EscrowTransaction[] = [
  { id: 'et-001', date: '2024-10-01', type: 'deposit', amount: 400, runningBalance: 400, description: 'Monthly escrow deposit', reference: 'ACH-10001' },
  { id: 'et-002', date: '2024-10-01', type: 'platform-fee', amount: -49, runningBalance: 351, description: 'Platform fee', reference: 'FEE-10001' },
  { id: 'et-003', date: '2024-11-01', type: 'deposit', amount: 400, runningBalance: 751, description: 'Monthly escrow deposit', reference: 'ACH-10002' },
  { id: 'et-004', date: '2024-11-01', type: 'platform-fee', amount: -49, runningBalance: 702, description: 'Platform fee', reference: 'FEE-10002' },
  { id: 'et-005', date: '2024-12-01', type: 'deposit', amount: 400, runningBalance: 1102, description: 'Monthly escrow deposit', reference: 'ACH-10003' },
  { id: 'et-006', date: '2024-12-01', type: 'platform-fee', amount: -49, runningBalance: 1053, description: 'Platform fee', reference: 'FEE-10003' },
  { id: 'et-007', date: '2025-01-01', type: 'deposit', amount: 400, runningBalance: 1453, description: 'Monthly escrow deposit', reference: 'ACH-10004' },
  { id: 'et-008', date: '2025-01-01', type: 'platform-fee', amount: -49, runningBalance: 1404, description: 'Platform fee', reference: 'FEE-10004' },
  { id: 'et-009', date: '2025-02-01', type: 'deposit', amount: 400, runningBalance: 1804, description: 'Monthly escrow deposit', reference: 'ACH-10005' },
  { id: 'et-010', date: '2025-02-01', type: 'platform-fee', amount: -49, runningBalance: 1755, description: 'Platform fee', reference: 'FEE-10005' },
  { id: 'et-011', date: '2025-03-01', type: 'deposit', amount: 400, runningBalance: 2155, description: 'Monthly escrow deposit', reference: 'ACH-10006' },
  { id: 'et-012', date: '2025-03-01', type: 'platform-fee', amount: -49, runningBalance: 2106, description: 'Platform fee', reference: 'FEE-10006' },
  { id: 'et-013', date: '2025-04-01', type: 'deposit', amount: 400, runningBalance: 2506, description: 'Monthly escrow deposit', reference: 'ACH-10007' },
  { id: 'et-014', date: '2025-04-01', type: 'platform-fee', amount: -49, runningBalance: 2457, description: 'Platform fee', reference: 'FEE-10007' },
  { id: 'et-015', date: '2025-05-01', type: 'deposit', amount: 400, runningBalance: 2857, description: 'Monthly escrow deposit', reference: 'ACH-10008' },
  { id: 'et-016', date: '2025-05-01', type: 'platform-fee', amount: -49, runningBalance: 2808, description: 'Platform fee', reference: 'FEE-10008' },
  { id: 'et-017', date: '2025-06-01', type: 'deposit', amount: 400, runningBalance: 3208, description: 'Monthly escrow deposit', reference: 'ACH-10009' },
  { id: 'et-018', date: '2025-06-01', type: 'platform-fee', amount: -49, runningBalance: 3159, description: 'Platform fee', reference: 'FEE-10009' },
  { id: 'et-019', date: '2025-07-01', type: 'deposit', amount: 400, runningBalance: 3559, description: 'Monthly escrow deposit', reference: 'ACH-10010' },
  { id: 'et-020', date: '2025-07-01', type: 'platform-fee', amount: -49, runningBalance: 3510, description: 'Platform fee', reference: 'FEE-10010' },
  { id: 'et-021', date: '2025-08-01', type: 'deposit', amount: 400, runningBalance: 3910, description: 'Monthly escrow deposit', reference: 'ACH-10011' },
  { id: 'et-022', date: '2025-08-01', type: 'platform-fee', amount: -49, runningBalance: 3861, description: 'Platform fee', reference: 'FEE-10011' },
  { id: 'et-023', date: '2025-09-01', type: 'deposit', amount: 400, runningBalance: 4261, description: 'Monthly escrow deposit', reference: 'ACH-10012' },
  { id: 'et-024', date: '2025-09-01', type: 'platform-fee', amount: -49, runningBalance: 4212, description: 'Platform fee', reference: 'FEE-10012' },
  { id: 'et-025', date: '2025-10-01', type: 'deposit', amount: 400, runningBalance: 4612, description: 'Monthly escrow deposit', reference: 'ACH-10013' },
  { id: 'et-026', date: '2025-10-01', type: 'platform-fee', amount: -49, runningBalance: 4563, description: 'Platform fee', reference: 'FEE-10013' },
  { id: 'et-027', date: '2025-11-01', type: 'deposit', amount: 400, runningBalance: 4963, description: 'Monthly escrow deposit', reference: 'ACH-10014' },
  { id: 'et-028', date: '2025-11-01', type: 'platform-fee', amount: -49, runningBalance: 4914, description: 'Platform fee', reference: 'FEE-10014' },
  { id: 'et-029', date: '2025-12-01', type: 'deposit', amount: 400, runningBalance: 5314, description: 'Monthly escrow deposit', reference: 'ACH-10015' },
  { id: 'et-030', date: '2025-12-01', type: 'platform-fee', amount: -49, runningBalance: 5265, description: 'Platform fee', reference: 'FEE-10015' },
  { id: 'et-031', date: '2025-12-15', type: 'interest-earned', amount: 12, runningBalance: 5277, description: 'Escrow interest credit (annual)', reference: 'INT-2025' },
  { id: 'et-032', date: '2026-01-01', type: 'deposit', amount: 400, runningBalance: 5677, description: 'Monthly escrow deposit', reference: 'ACH-10016' },
  { id: 'et-033', date: '2026-01-01', type: 'platform-fee', amount: -49, runningBalance: 5628, description: 'Platform fee', reference: 'FEE-10016' },
  { id: 'et-034', date: '2026-02-01', type: 'deposit', amount: 400, runningBalance: 6028, description: 'Monthly escrow deposit', reference: 'ACH-10017' },
  { id: 'et-035', date: '2026-02-01', type: 'platform-fee', amount: -49, runningBalance: 5979, description: 'Platform fee', reference: 'FEE-10017' },
  { id: 'et-036', date: '2026-03-01', type: 'deposit', amount: 400, runningBalance: 6379, description: 'Monthly escrow deposit', reference: 'ACH-10018' },
  { id: 'et-037', date: '2026-03-01', type: 'platform-fee', amount: -49, runningBalance: 6330, description: 'Platform fee', reference: 'FEE-10018' },
  { id: 'et-038', date: '2026-03-15', type: 'settlement-payout', amount: -3500, runningBalance: 2830, description: 'Settlement payment to Chase', creditorId: '2', reference: 'ACH-72841' },
  { id: 'et-039', date: '2026-04-01', type: 'deposit', amount: 400, runningBalance: 3230, description: 'Monthly escrow deposit', reference: 'ACH-10019' },
  { id: 'et-040', date: '2026-04-01', type: 'platform-fee', amount: -49, runningBalance: 3181, description: 'Platform fee', reference: 'FEE-10019' },
  { id: 'et-041', date: '2026-04-10', type: 'settlement-payout', amount: -700, runningBalance: 2481, description: 'Partial settlement payment to Citi', creditorId: '3', reference: 'ACH-72901' },
  { id: 'et-042', date: '2026-04-15', type: 'adjustment', amount: -19, runningBalance: 2462, description: 'NSF fee reversal', reference: 'ADJ-001' },
  { id: 'et-043', date: '2026-04-18', type: 'interest-earned', amount: 5, runningBalance: 2467, description: 'Escrow interest credit (Q1)', reference: 'INT-2026-Q1' },
  { id: 'et-044', date: '2026-04-19', type: 'deposit', amount: 400, runningBalance: 2867, description: 'Monthly escrow deposit', reference: 'ACH-10020' },
  { id: 'et-045', date: '2026-04-19', type: 'platform-fee', amount: -49, runningBalance: 2818, description: 'Platform fee', reference: 'FEE-10020' },
  { id: 'et-046', date: '2026-04-19', type: 'adjustment', amount: 29, runningBalance: 2847, description: 'Promotional deposit match', reference: 'ADJ-002' },
];

// ─── Document Vault Demo Data ───
export const DEFAULT_DOCUMENTS: VaultDocument[] = [
  {
    id: 'doc-001',
    name: 'DebtOptimize Enrollment Agreement',
    category: 'Enrollment',
    uploadedDate: '2024-10-01',
    fileSize: '248 KB',
    status: 'signed',
  },
  {
    id: 'doc-002',
    name: 'Limited Power of Attorney',
    category: 'Enrollment',
    uploadedDate: '2024-10-01',
    fileSize: '112 KB',
    status: 'signed',
  },
  {
    id: 'doc-003',
    name: 'Amex Settlement Agreement',
    category: 'Settlement Agreements',
    uploadedDate: '2026-04-15',
    fileSize: '320 KB',
    creditorId: '1',
    status: 'pending',
    dueDate: '2026-04-30',
  },
  {
    id: 'doc-004',
    name: 'Chase Settlement Agreement',
    category: 'Settlement Agreements',
    uploadedDate: '2026-04-08',
    fileSize: '295 KB',
    creditorId: '2',
    status: 'signed',
  },
  {
    id: 'doc-005',
    name: 'Citi Settlement Agreement',
    category: 'Settlement Agreements',
    uploadedDate: '2026-04-12',
    fileSize: '310 KB',
    creditorId: '3',
    status: 'pending',
    dueDate: '2026-04-28',
  },
  {
    id: 'doc-006',
    name: 'January 2025 Escrow Statement',
    category: 'Statements',
    uploadedDate: '2025-02-05',
    fileSize: '180 KB',
    status: 'signed',
  },
  {
    id: 'doc-007',
    name: 'February 2025 Escrow Statement',
    category: 'Statements',
    uploadedDate: '2025-03-05',
    fileSize: '182 KB',
    status: 'signed',
  },
  {
    id: 'doc-008',
    name: 'March 2025 Escrow Statement',
    category: 'Statements',
    uploadedDate: '2025-04-05',
    fileSize: '179 KB',
    status: 'signed',
  },
  {
    id: 'doc-009',
    name: 'April 2025 Escrow Statement',
    category: 'Statements',
    uploadedDate: '2025-05-05',
    fileSize: '181 KB',
    status: 'signed',
  },
  {
    id: 'doc-010',
    name: 'May 2025 Escrow Statement',
    category: 'Statements',
    uploadedDate: '2025-06-05',
    fileSize: '183 KB',
    status: 'signed',
  },
  {
    id: 'doc-011',
    name: 'June 2025 Escrow Statement',
    category: 'Statements',
    uploadedDate: '2025-07-05',
    fileSize: '178 KB',
    status: 'signed',
  },
  {
    id: 'doc-012',
    name: 'Form 1099-C (2025)',
    category: 'Tax Forms',
    uploadedDate: '2026-01-31',
    fileSize: '95 KB',
    status: 'signed',
  },
  {
    id: 'doc-013',
    name: 'Legal Protection Plan Attestation',
    category: 'Legal',
    uploadedDate: '2024-10-01',
    fileSize: '134 KB',
    status: 'signed',
  },
  {
    id: 'doc-014',
    name: 'Creditor Correspondence - Amex',
    category: 'Correspondence',
    uploadedDate: '2026-04-05',
    fileSize: '156 KB',
    creditorId: '1',
    status: 'pending',
  },
];

// ─── Credit Health Demo Data ───
export const DEFAULT_CREDIT_HISTORY: CreditSnapshot[] = [
  { date: '2024-04-01', score: 620, bureau: 'Experian' },
  { date: '2024-05-01', score: 618, bureau: 'Experian' },
  { date: '2024-06-01', score: 615, bureau: 'Experian' },
  { date: '2024-07-01', score: 608, bureau: 'Experian' },
  { date: '2024-08-01', score: 602, bureau: 'Experian' },
  { date: '2024-09-01', score: 595, bureau: 'Experian' },
  { date: '2024-10-01', score: 590, bureau: 'Experian' },
  { date: '2024-11-01', score: 588, bureau: 'Experian' },
  { date: '2024-12-01', score: 585, bureau: 'Experian' },
  { date: '2025-01-01', score: 582, bureau: 'Experian' },
  { date: '2025-02-01', score: 580, bureau: 'Experian' },
  { date: '2025-03-01', score: 583, bureau: 'Experian' },
  { date: '2025-04-01', score: 586, bureau: 'Experian' },
  { date: '2025-05-01', score: 590, bureau: 'Experian' },
  { date: '2025-06-01', score: 595, bureau: 'Experian' },
  { date: '2025-07-01', score: 600, bureau: 'Experian' },
  { date: '2025-08-01', score: 608, bureau: 'Experian' },
  { date: '2025-09-01', score: 615, bureau: 'Experian' },
  { date: '2025-10-01', score: 622, bureau: 'Experian' },
  { date: '2025-11-01', score: 630, bureau: 'Experian' },
  { date: '2025-12-01', score: 638, bureau: 'Experian' },
  { date: '2026-01-01', score: 645, bureau: 'Experian' },
  { date: '2026-02-01', score: 652, bureau: 'Experian' },
  { date: '2026-03-01', score: 658, bureau: 'Experian' },
  { date: '2026-04-01', score: 662, bureau: 'Experian' },
];

export const DEFAULT_CREDIT_FACTORS: CreditFactor[] = [
  { name: 'Payment History', score: 72, status: 'fair' },
  { name: 'Credit Utilization', score: 85, status: 'good' },
  { name: 'Credit Age', score: 60, status: 'fair' },
  { name: 'Credit Mix', score: 55, status: 'fair' },
  { name: 'New Inquiries', score: 90, status: 'excellent' },
];

export const DEFAULT_REBUILD_TASKS: RebuildTask[] = [
  {
    id: 'rt-001',
    title: 'Open a secured credit card',
    description: 'Deposit $200-$500 to establish a new positive tradeline. Use for small purchases and pay in full monthly.',
    status: 'complete',
    impact: 'high',
  },
  {
    id: 'rt-002',
    title: 'Set up rent reporting',
    description: 'Report your on-time rent payments to all three bureaus via a rent reporting service.',
    status: 'in-progress',
    impact: 'medium',
  },
  {
    id: 'rt-003',
    title: 'Become an authorized user',
    description: 'Ask a family member with excellent credit to add you as an authorized user on a long-standing account.',
    status: 'not-started',
    impact: 'medium',
  },
  {
    id: 'rt-004',
    title: 'Dispute outdated charge-offs',
    description: 'Review your credit reports and dispute any charge-offs older than 7 years or with inaccurate dates.',
    status: 'not-started',
    impact: 'high',
  },
  {
    id: 'rt-005',
    title: 'Build a 6-month payment streak',
    description: 'Make every payment on time for 6 consecutive months on all active accounts.',
    status: 'in-progress',
    impact: 'high',
  },
  {
    id: 'rt-006',
    title: 'Keep utilization below 30%',
    description: 'Never let your secured card balance exceed 30% of the credit limit. Ideally keep it under 10%.',
    status: 'complete',
    impact: 'medium',
  },
  {
    id: 'rt-007',
    title: 'Review credit reports quarterly',
    description: 'Pull your free reports from AnnualCreditReport.com every 4 months and monitor for errors.',
    status: 'not-started',
    impact: 'low',
  },
];

// ─── Notifications Demo Data ───
export const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-001',
    type: 'action-required',
    title: 'Sign Citi Settlement Agreement',
    body: 'Your settlement agreement with Citi is ready for signature. Please review and sign by April 28.',
    timestamp: '2026-04-18T08:00:00Z',
    read: false,
    actionLabel: 'Review',
    actionView: 'documents',
  },
  {
    id: 'notif-002',
    type: 'settlement',
    title: 'Chase Settlement Paid',
    body: 'We sent $7,000 to Chase from your escrow. The account will close within 5 business days.',
    timestamp: '2026-04-10T08:15:00Z',
    read: false,
    actionLabel: 'View Ledger',
    actionView: 'escrow',
  },
  {
    id: 'notif-003',
    type: 'legal',
    title: 'Amex Lawsuit Stayed',
    body: 'Our legal team obtained a 60-day stay on the Amex collections lawsuit pending settlement negotiations.',
    timestamp: '2026-04-18T10:00:00Z',
    read: false,
    actionLabel: 'View Activity',
    actionView: 'activity',
  },
  {
    id: 'notif-004',
    type: 'billing',
    title: 'Monthly Deposit Processed',
    body: 'Your April escrow deposit of $400 was received. Current escrow balance: $2,847.',
    timestamp: '2026-04-19T08:00:00Z',
    read: true,
  },
  {
    id: 'notif-005',
    type: 'program',
    title: 'Credit Rebuilding Tip',
    body: 'Your secured card payment posted. Keeping utilization under 10% this month added an estimated +4 points.',
    timestamp: '2026-04-15T12:00:00Z',
    read: true,
    actionLabel: 'Credit Health',
    actionView: 'credit',
  },
  {
    id: 'notif-006',
    type: 'settlement',
    title: 'Amex Counter-Offer Received',
    body: 'Amex countered at $8,800. Our team is preparing a response and will update you within 48 hours.',
    timestamp: '2026-04-15T14:22:00Z',
    read: false,
    actionLabel: 'View Activity',
    actionView: 'activity',
  },
  {
    id: 'notif-007',
    type: 'action-required',
    title: 'Update Bank Account Info',
    body: 'The ACH account on file expires next month. Please update your routing and account number to avoid missed deposits.',
    timestamp: '2026-04-12T09:00:00Z',
    read: false,
  },
  {
    id: 'notif-008',
    type: 'program',
    title: 'Welcome to Month 19',
    body: 'You are making great progress. 1 of 3 accounts settled. Estimated remaining timeline: 12-18 months.',
    timestamp: '2026-04-01T08:00:00Z',
    read: true,
  },
  {
    id: 'notif-009',
    type: 'legal',
    title: 'Legal Protection Plan Activated',
    body: 'Because a lawsuit was filed, our attorneys have been assigned at no extra cost. You are fully protected.',
    timestamp: '2026-03-20T08:00:00Z',
    read: true,
  },
];

// ─── Secure Messages Demo Data ───
export const DEFAULT_MESSAGE_THREADS: MessageThread[] = [
  {
    id: 'thread-001',
    subject: 'Chase Settlement Approval',
    participants: ['Alex Mitchell', 'Marcus Webb'],
    messages: [
      {
        id: 'msg-001',
        sender: 'negotiator',
        body: 'Hi Alex, great news — Chase accepted our counter at $7,000. I have uploaded the agreement to your vault. Please review and let me know if you have any questions before we disburse.',
        timestamp: '2026-04-08T10:00:00Z',
        read: true,
      },
      {
        id: 'msg-002',
        sender: 'user',
        body: 'That is wonderful. Is there any flexibility on the payment date? I would prefer the 15th.',
        timestamp: '2026-04-08T14:30:00Z',
        read: true,
      },
      {
        id: 'msg-003',
        sender: 'negotiator',
        body: 'Absolutely. I will schedule the ACH for April 15th and confirm once it is sent. You will see it reflected in your escrow ledger immediately.',
        timestamp: '2026-04-08T15:00:00Z',
        read: true,
      },
      {
        id: 'msg-004',
        sender: 'user',
        body: 'Perfect, thank you Marcus!',
        timestamp: '2026-04-08T15:15:00Z',
        read: true,
      },
    ],
  },
  {
    id: 'thread-002',
    subject: 'Amex Legal Update',
    participants: ['Alex Mitchell', 'Hoffman Legal'],
    messages: [
      {
        id: 'msg-005',
        sender: 'negotiator',
        body: 'Alex, Amex filed suit in Travis County last week. Do not worry — this is standard collection pressure. We have already filed a motion to stay the proceedings while we finalize settlement. I will keep you posted.',
        timestamp: '2026-03-22T09:00:00Z',
        read: true,
      },
      {
        id: 'msg-006',
        sender: 'user',
        body: 'Should I be concerned about my wages being garnished?',
        timestamp: '2026-03-22T11:00:00Z',
        read: true,
      },
      {
        id: 'msg-007',
        sender: 'negotiator',
        body: 'No. In Texas, wage garnishment for consumer debt is extremely rare and requires multiple post-judgment steps. Our motion to stay prevents any default judgment while we negotiate. You are protected under your Legal Protection Plan.',
        timestamp: '2026-03-22T11:30:00Z',
        read: true,
      },
      {
        id: 'msg-008',
        sender: 'negotiator',
        body: 'Update: the court granted our 60-day stay. We are pushing Amex to finalize the $8,400 offer before the stay expires.',
        timestamp: '2026-04-18T10:30:00Z',
        read: false,
      },
    ],
  },
  {
    id: 'thread-003',
    subject: 'General Account Questions',
    participants: ['Alex Mitchell', 'Support Team'],
    messages: [
      {
        id: 'msg-009',
        sender: 'user',
        body: 'Can you explain how the credit rebuilding program works once my last settlement is done?',
        timestamp: '2026-04-14T16:00:00Z',
        read: true,
      },
      {
        id: 'msg-010',
        sender: 'support',
        body: 'Of course! Once your final settlement is paid, you will be enrolled in our free Credit Rebuilding Program. It includes a personalized action plan, secured card recommendations, rent reporting setup, and quarterly credit reviews. Most clients see a 60-80 point lift within the first 12 months.',
        timestamp: '2026-04-14T17:00:00Z',
        read: true,
      },
    ],
  },
];
