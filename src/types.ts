export type CreditScore = 'poor' | 'fair' | 'good' | 'very-good' | 'excellent';

export type CreditorStatus = 'eligible' | 'outreach-sent' | 'pending' | 'approved' | 'active' | 'declined';

export type OnboardingStep = 
  | 'basic-info'
  | 'identity-verify'
  | 'credit-check'
  | 'debt-assessment'
  | 'eligibility'
  | 'complete';

export type AppView = 'landing' | 'onboarding' | 'dashboard' | 'admin' | 'simulator' | 'creditors' | 'activity' | 'escrow' | 'documents' | 'credit' | 'messages';

export interface DebtCard {
  id: string;
  creditor: string;
  balance: number;
  currentApr: number;
  negotiatedApr: number | null;
  minPayment: number;
  status: CreditorStatus;
  settlementOffer?: number | null;
  monthsBehind?: number;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  ssnLast4: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  creditScore: CreditScore;
  annualIncome: number;
  monthlyExpenses: number;
}

export interface AppState {
  profile: UserProfile;
  cards: DebtCard[];
  totalMonthlyPayment: number;
  platformFee: number;
  escrowBalance: number;
  adminMode: boolean;
  demoMode: boolean;
  onboardingStep: OnboardingStep;
  currentView: AppView;
  eligibilityStatus: 'pending' | 'approved' | 'declined';
  idVerified: boolean;
  creditChecked: boolean;
  activityEvents: ActivityEvent[];
  escrowTransactions: EscrowTransaction[];
  documents: VaultDocument[];
  creditHistory: CreditSnapshot[];
  creditFactors: CreditFactor[];
  rebuildTasks: RebuildTask[];
  notifications: Notification[];
  messageThreads: MessageThread[];
}

export interface PayoffResult {
  months: number;
  totalInterest: number;
  totalPaid: number;
  monthlyBreakdown: MonthlyBreakdown[];
}

export interface MonthlyBreakdown {
  month: number;
  balance: number;
  interestPaid: number;
  principalPaid: number;
  platformFee: number;
}

export interface ComparisonResult {
  statusQuo: PayoffResult;
  platformPath: PayoffResult;
  interestSaved: number;
  monthsSaved: number;
}

// Activity Timeline
export type ActivityEventType =
  | 'outreach-sent'
  | 'creditor-response'
  | 'counter-offer-received'
  | 'counter-offer-sent'
  | 'settlement-approved'
  | 'payment-sent'
  | 'account-closed'
  | 'lawsuit-filed'
  | 'lawsuit-resolved'
  | 'call-logged'
  | 'letter-received';

export interface ActivityEvent {
  id: string;
  creditorId: string;
  type: ActivityEventType;
  timestamp: string; // ISO date
  title: string;
  description: string;
  amount?: number;
  metadata?: Record<string, string>;
  reference?: string;
}

// Escrow Ledger
export type EscrowTransactionType =
  | 'deposit'
  | 'platform-fee'
  | 'settlement-payout'
  | 'withdrawal'
  | 'adjustment'
  | 'interest-earned';

export interface EscrowTransaction {
  id: string;
  date: string; // ISO date
  type: EscrowTransactionType;
  amount: number; // positive = in, negative = out
  runningBalance: number;
  description: string;
  creditorId?: string;
  reference?: string;
}

// Document Vault
export type DocumentCategory =
  | 'Enrollment'
  | 'Settlement Agreements'
  | 'Legal'
  | 'Statements'
  | 'Tax Forms'
  | 'Correspondence';

export type DocumentStatus = 'signed' | 'unsigned' | 'pending';

export interface VaultDocument {
  id: string;
  name: string;
  category: DocumentCategory;
  uploadedDate: string; // ISO date
  fileSize: string;
  creditorId?: string;
  status: DocumentStatus;
  dueDate?: string; // ISO date
}

// Credit Health
export type CreditBureau = 'Experian' | 'TransUnion' | 'Equifax';

export interface CreditSnapshot {
  date: string; // ISO date
  score: number;
  bureau: CreditBureau;
}

export interface CreditFactor {
  name: string;
  score: number; // 0-100
  status: 'poor' | 'fair' | 'good' | 'excellent';
}

export type RebuildTaskStatus = 'not-started' | 'in-progress' | 'complete';
export type RebuildTaskImpact = 'low' | 'medium' | 'high';

export interface RebuildTask {
  id: string;
  title: string;
  description: string;
  status: RebuildTaskStatus;
  impact: RebuildTaskImpact;
}

// Notifications
export type NotificationType = 'settlement' | 'legal' | 'billing' | 'program' | 'action-required';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: string; // ISO date
  read: boolean;
  actionLabel?: string;
  actionView?: AppView;
}

// Secure Messages
export interface Message {
  id: string;
  sender: 'user' | 'negotiator' | 'support';
  body: string;
  timestamp: string; // ISO date
  read: boolean;
}

export interface MessageThread {
  id: string;
  subject: string;
  participants: string[];
  messages: Message[];
}
