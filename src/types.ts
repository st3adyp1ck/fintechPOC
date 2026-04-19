export type CreditScore = 'poor' | 'fair' | 'good' | 'very-good' | 'excellent';

export type CreditorStatus = 'eligible' | 'outreach-sent' | 'pending' | 'approved' | 'active' | 'declined';

export type OnboardingStep = 
  | 'basic-info'
  | 'identity-verify'
  | 'credit-check'
  | 'debt-assessment'
  | 'eligibility'
  | 'complete';

export type AppView = 'landing' | 'onboarding' | 'dashboard' | 'admin' | 'simulator' | 'creditors';

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
