# Architecture Documentation

## System Overview

DebtOptimize is a single-page application (SPA) built with React 19, TypeScript, and Vite. All state is managed client-side for the POC — no backend services are required.

```
┌─────────────────────────────────────────────────────────────┐
│                         BROWSER                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 React Component Tree                 │   │
│  │                                                      │   │
│  │   ┌─────────────┐    ┌─────────────┐    ┌─────────┐ │   │
│  │   │  Landing    │───▶│ Onboarding  │───▶│Dashboard│ │   │
│  │   │   Page      │    │    Flow     │    │  Suite  │ │   │
│  │   └─────────────┘    └─────────────┘    └────┬────┘ │   │
│  │                                               │      │   │
│  │   ┌─────────────┐    ┌─────────────┐        │      │   │
│  │   │  AuthModal  │    │  Custom     │        │      │   │
│  │   │(OAuth+Magic)│    │  Cursor     │        │      │   │
│  │   └─────────────┘    └─────────────┘        │      │   │
│  │                                               │      │   │
│  │                    ┌──────────────────────────┘      │   │
│  │                    │                                  │   │
│  │         ┌─────────┴──────────┬─────────────┐         │   │
│  │         │                    │             │         │   │
│  │    ┌────┴────┐         ┌────┴────┐  ┌────┴────┐    │   │
│  │    │  Admin  │         │Creditor │  │ Impact  │    │   │
│  │    │  Panel  │         │  Board  │  │Simulator│    │   │
│  │    └─────────┘         └─────────┘  └─────────┘    │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                  │
│              ┌────────────┴────────────┐                    │
│              │      AppContext         │                    │
│              │   (React Context API)   │                    │
│              └────────────┬────────────┘                    │
│                           │                                  │
│              ┌────────────┴────────────┐                    │
│              │      Calculation        │                    │
│              │        Engine           │                    │
│              │      (src/data.ts)      │                    │
│              └─────────────────────────┘                    │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  React 19 · TypeScript · Vite · Tailwind CSS v4            │
│  Framer Motion · Recharts · Lucide React                   │
└─────────────────────────────────────────────────────────────┘
```

---

## State Management

### AppContext (React Context)

The application uses a single React Context provider for global state. This is intentional for the POC — it avoids the complexity of Redux/Zustand while providing full type safety.

```typescript
interface AppState {
  profile: UserProfile;              // User's personal information
  cards: DebtCard[];                 // Array of credit card debts
  totalMonthlyPayment: number;       // Total monthly escrow deposit
  platformFee: number;               // Monthly platform fee
  escrowBalance: number;             // Current escrow account balance
  adminMode: boolean;                // Admin panel visibility
  demoMode: boolean;                 // Demo data toggle
  onboardingStep: OnboardingStep;    // Current onboarding phase
  currentView: AppView;              // Active screen
  eligibilityStatus: 'pending' | 'approved' | 'declined';
  idVerified: boolean;               // Identity verification complete
  creditChecked: boolean;            // Soft credit pull complete
}
```

### State Flow

```
User Action
    │
    ▼
┌─────────────┐
│  Component  │───▶ setState via useApp()
│  (onClick,  │
│   onChange) │
└─────────────┘
    │
    ▼
┌─────────────┐
│ AppContext  │───▶ Updates central state
│  Provider   │
└─────────────┘
    │
    ▼
┌─────────────┐
│ Subscribed  │───▶ Re-render with new data
│ Components  │
└─────────────┘
    │
    ▼
┌─────────────┐
│  Recharts   │───▶ Charts recalculate
│   Charts    │
└─────────────┘
```

---

## Component Architecture

### LandingPage
**Purpose:** Conversion-focused entry point
**Key Features:**
- Parallax hero section with `useScroll` + `useTransform`
- Animated counter components (`AnimatedCounter`) triggered by IntersectionObserver
- Interactive savings calculator with real-time settlement math
- FAQ accordion with `AnimatePresence` for smooth open/close
- Mobile-responsive navigation with hamburger menu

### Onboarding (5-Step Flow)
**Purpose:** Eligibility verification and debt assessment
**State Machine:**
```
Basic Info ──▶ Identity Verify ──▶ Credit Check ──▶ Debt Assessment ──▶ Eligibility
    │               │                  │                  │                  │
    │               │                  │                  │                  ▼
    │               │                  │                  │            [Approved/Declined]
    │               │                  │                  │                  │
    └───────────────┴──────────────────┴──────────────────┴──────────────────┘
                                    (gated: cannot skip steps)
```

**Step Transitions:** Framer Motion `AnimatePresence` with directional slide animations

### Dashboard
**Purpose:** Primary user interface post-approval
**Sub-components:**
- **Metrics Grid** — 4 key cards with staggered entrance animations
- **Settlement Progress Bar** — Animated escrow accumulation tracker
- **Creditor Table** — Sortable settlement status per card
- **Comparison Cards** — Side-by-side "Without Settlement" vs "With DebtOptimize"
- **AreaChart** — Debt balance over time with gradient fills

### AuthModal
**Purpose:** Authentication gateway
**Flows:**
1. **Google OAuth (Simulated)** — 4-step animation: Connecting → Verifying → Fetching → Redirecting
2. **Email Magic Link** — Input validation → Loading state → "Check your inbox" confirmation

---

## Calculation Engine

### Core Functions (`src/data.ts`)

```typescript
// Calculates payoff timeline given balance, APR, and monthly payment
function calculatePayoff(balance, apr, monthlyPayment, platformFee)
  → PayoffResult { months, totalInterest, totalPaid, monthlyBreakdown[] }

// Compares status quo vs. platform path
function calculateComparison(cards, totalMonthlyPayment, platformFee)
  → ComparisonResult { statusQuo, platformPath, interestSaved, monthsSaved }

// Calculates settlement-based savings
function calculateSettlementSavings(cards)
  → { totalDebt, estimatedSettlement, savings, savingsPercent }
```

### Weighted APR Calculation

```
weightedAPR = Σ(balance_i × apr_i) / Σ(balance_i)
```

This provides a single representative APR for comparison purposes while maintaining per-card granularity in the UI.

---

## Animation Architecture

### Philosophy
Every animation serves a purpose:
- **Entrance animations** guide the eye and create narrative flow
- **Hover states** provide tactile feedback
- **Loading states** manage perceived performance
- **Transitions** maintain spatial context between views

### Animation Stack

| Library | Use Case | Easing |
|---------|----------|--------|
| Framer Motion | Component animations, gestures, layout transitions | Spring physics (`stiffness: 400, damping: 30`) |
| CSS Keyframes | Shimmer loading, continuous loops | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` |
| Custom Cursor | Mouse-following dot with hover expansion | Linear (position lerp at 0.15 factor) |

### Custom Cursor Implementation

```
Mouse Event
    │
    ▼
Target Position (instant)
    │
    ▼
Lerp Interpolation (0.15 factor per frame)
    │
    ▼
Rendered Position (smooth follow)
    │
    ▼
Hover Detection (on <a>, <button>, .cursor-hover)
    │
    ▼
Cursor State Change (8px → 48px dot)
```

---

## Design Token System

All design tokens are defined in `src/index.css` using Tailwind CSS v4's `@theme` directive:

```css
@theme {
  --color-cream-50: #fdfcfa;
  --color-cream-100: #faf8f5;
  --color-cream-200: #f5f0e8;
  --color-navy-900: #12162b;
  --color-navy-950: #0a0e1f;
  --color-gold-400: #edc45a;
  --color-teal-500: #14b8a6;
}
```

See [`DESIGN.md`](./DESIGN.md) for the complete design system.

---

## Data Flow Diagram

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   User Input  │────▶│  AppContext  │────▶│  Components   │
│  (Forms,     │     │  (State)     │     │  (Re-render) │
│   Sliders)   │     └──────────────┘     └──────┬───────┘
└──────────────┘              │                    │
                              │                    ▼
                              │           ┌──────────────┐
                              │           │  Calculation │
                              │           │   Engine     │
                              │           └──────┬───────┘
                              │                    │
                              │                    ▼
                              │           ┌──────────────┐
                              └──────────▶│   Charts     │
                                          │  (Recharts)  │
                                          └──────────────┘
```

---

## Performance Considerations

1. **No external API calls** — All data is client-side, eliminating network latency
2. **Memoized calculations** — `useMemo` on all chart data and comparison results
3. **Lazy animation triggers** — `IntersectionObserver` for scroll-into-view animations
4. **Custom scrollbar** — Slim 6px scrollbar to maximize content area
5. **Noise texture via SVG** — Single inline SVG, no external image assets

---

## Future Architecture (Post-POC)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   React SPA   │────▶│   API Layer   │────▶│   Database   │
│              │     │  (Node.js)    │     │  (PostgreSQL)│
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
        ┌─────────┐  ┌─────────┐  ┌─────────┐
        │ Identity│  │  Credit │  │ Payment │
        │ Verify  │  │  Bureau │  │ Gateway │
        │ (Socure)│  │ (Experian)│  │(Stripe) │
        └─────────┘  └─────────┘  └─────────┘
```
