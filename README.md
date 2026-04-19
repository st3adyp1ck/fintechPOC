<div align="center">

<br />

<img src="https://raw.githubusercontent.com/your-org/debt-optimize/main/docs/assets/logo-dark.svg" width="64" height="64" alt="DebtOptimize Logo" />

# **DebtOptimize**

### *Same Payment. Faster Freedom.*

**A debt settlement platform built for the middle class.**

Negotiate your credit card debt down by an average of **52%** — with no upfront fees,
legal protection included, and a credit rebuilding program that actually works.

<br />

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&style=flat-square)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white&style=flat-square)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white&style=flat-square)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square)](https://tailwindcss.com)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-0055FF?logo=framer&logoColor=white&style=flat-square)](https://www.framer.com/motion)

<br />

[🚀 Live Demo](https://debtoptimize-demo.vercel.app) · [📖 Documentation](./docs) · [🎨 Design System](./docs/DESIGN.md)

</div>

---

<br />

## 🎬 What You're Looking At

This is a **high-fidelity functional prototype** built for live client demonstrations.
It demonstrates how reducing APR — without increasing monthly out-of-pocket cost —
dramatically shortens the debt lifecycle for middle-class Americans.

> **Target Audience:** Households earning $50K–$150K who cannot qualify for
> traditional debt consolidation loans but need structured relief from high-interest
> credit card debt.

<br />

## ✨ Why This Exists

The debt relief industry is broken. Companies hide fees, ignore calls, and leave
clients exposed to creditor lawsuits. **DebtOptimize was built differently:**

| The Old Way | DebtOptimize |
|------------|--------------|
| Upfront fees before any results | **$0 upfront** — we only get paid when we save you money |
| No legal protection | **Attorney network included** — if you're sued, we defend you |
| Opaque process | **Real-time dashboard** — watch every negotiation as it happens |
| One-size-fits-all | **Personalized strategy** — based on your actual credit profile |
| Credit score destroyed forever | **Free credit rebuilding** — back to 700+ in 24 months |

<br />

## 🏛️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      DebtOptimize SPA                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐│
│  │   Landing    │  │  Onboarding  │  │   Dashboard Suite  ││
│  │    Page      │  │    Flow      │  │ Activity · Escrow  ││
│  └──────────────┘  └──────────────┘  │ Documents · Credit ││
│         │                 │          │ Messages · Admin   ││
│         └─────────────────┼──────────┴────────────────────┘│
│                           │                                  │
│              ┌────────────┴────────────┐                    │
│              │     React Context        │                    │
│              │    (Global State)        │                    │
│              └────────────┬────────────┘                    │
│                           │                                  │
│  ┌──────────┬──────────┬─┴─┬──────────┬──────────┬────────┐│
│  │  Auth    │  Debt    │   │  Admin   │  Impact  │ Notif. ││
│  │  Modal   │ Engine   │   │  Panel   │ Simulator│Center  ││
│  └──────────┴──────────┴───┴──────────┴──────────┴────────┘│
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  React 19 · TypeScript · Vite · Tailwind CSS v4            │
│  Framer Motion · Recharts · Lucide React                   │
└─────────────────────────────────────────────────────────────┘
```

<br />

## 🎯 Core Features

### 1. Stunning Landing Page
- **Conversion-optimized hero** with parallax scroll effects and animated counters
- **Interactive savings calculator** — real-time settlement math as users drag the slider
- **Social proof section** with client testimonials and verified results
- **Differentiation grid** — 6 reasons DebtOptimize beats every competitor
- **FAQ accordion** with smooth height animations via Framer Motion

### 2. Multi-Step Eligibility Onboarding
A 5-step gated flow that builds trust before showing the dashboard:

| Step | Action | Trust Signal |
|------|--------|-------------|
| 1 | **Basic Info** | Collect name, email, DOB, SSN last-4 |
| 2 | **Identity Verification** | Simulated ID upload with 99.7% match confidence display |
| 3 | **Soft Credit Check** | Explicit "no impact on score" messaging with estimated savings preview |
| 4 | **Debt Assessment** | Dynamic creditor list with balance, APR, and minimum payment inputs |
| 5 | **Eligibility Decision** | Approval screen with total savings, timeline, and legal protection confirmation |

### 3. Auth System (Simulated)
Two production-grade authentication flows:

- **🔵 Google OAuth** — Full simulation with branded popup, multi-step verification animation, and auto-redirect
- **✉️ Email Magic Link** — Passwordless login with "Check your inbox" confirmation screen

### 4. Interactive Dashboard
- **Escrow balance tracking** with animated progress bar toward settlement target — *click to view full ledger*
- **Creditor settlement table** — balance, offer amount, savings per card, negotiation status
- **Side-by-side comparison** — "Without Settlement" vs "With DebtOptimize"
- **Balance-over-time chart** — Area chart comparing full-balance payoff vs. negotiated settlement path
- **Quick-action widgets** — Recent Activity feed, Action Required counter, Credit Score snapshot

### 5. Activity Timeline
A reverse-chronological negotiation feed that proves the platform is working:
- **11 event types** — outreach, counter-offers, settlements, payments, legal updates, calls, letters
- **Color-coded icons** per event type with creditor badges
- **Filter pills** — All, Settlements, Legal, Communications, Payments
- **Expandable cards** with relative timestamps and detailed metadata

### 6. Escrow Activity Ledger
Full FDIC-insured escrow transparency:
- **Every transaction** — deposits, platform fees, settlement payouts, interest, adjustments
- **Running balance** column showing account state after each entry
- **Type & date range filters** with sticky table header
- **CSV download** of visible rows for record-keeping

### 7. Document Vault
Secure document library for compliance and trust:
- **6 categories** — Enrollment, Settlement Agreements, Legal, Statements, Tax Forms, Correspondence
- **Grid / list toggle** with status badges (signed, unsigned, pending)
- **Preview modal** with simulated document facsimile
- **Action-required banner** when documents await signature

### 8. Credit Health & Rebuilding Tracker
Closes the loop on the landing page's "Credit Rebuilding Program" promise:
- **24-month score history** with realistic dip-then-recovery curve
- **Bureau selector** (Experian / TransUnion / Equifax)
- **Credit factors** — segmented progress bars for payment history, utilization, age, mix, inquiries
- **Rebuilding checklist** — 6–8 tasks with animated completion and point-floaters
- **Educational callout** explaining temporary score dips are normal

### 9. Notifications + Secure Messages
Makes the dashboard feel alive and two-way:
- **Notification center** — bell dropdown grouped by Today / This Week / Earlier with unread badges
- **Contextual actions** — click a notification to jump directly to the related view
- **Secure messaging** — two-pane thread layout with iMessage-style bubbles
- **Simulated negotiator replies** — contextual auto-responses with typing indicators

### 10. Impact Simulator (The "Wow" Feature)
- **Per-card settlement slider** — drag to simulate different negotiation outcomes
- **Real-time metrics update** — additional savings, settlement percentage, total cost
- **Reference-line chart** — visual payoff curve with "Simulated Payoff" and "Status Quo" markers

### 11. Admin Controls
- Toggle negotiated APRs per creditor
- Adjust platform fee with live impact calculation
- Overview cards showing weighted APRs and projected savings

<br />

## 🎨 Design Philosophy

> **"This does not look like it was built by AI."**

Every pixel was intentionally placed:

- **Custom color system** — Warm cream backgrounds (`#faf8f5`) feel premium and approachable. Deep navy (`#12162b`) conveys trust and authority. Gold accents (`#edc45a`) signal wealth and optimism.
- **Noise textures** — Subtle SVG grain overlays on dark sections add physical depth
- **Custom cursor** — Small dot that expands on hoverable elements with `mix-blend-mode: difference`
- **Spring physics** — All hover states use Framer Motion spring curves, not linear CSS transitions
- **Asymmetric layouts** — Hero section breaks the grid. Italic accent words create visual rhythm
- **Staggered reveals** — Elements cascade into view as you scroll, never all at once

See the full design system: [`docs/DESIGN.md`](./docs/DESIGN.md)

<br />

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/debt-optimize.git
cd debt-optimize

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Static files are output to the `/dist` directory, ready for deployment on Vercel, Netlify, or any static host.

### Preview Production Build

```bash
npm run preview
```

<br />

## 📁 Project Structure

```
debt-optimize/
├── docs/                          # Documentation package
│   ├── ARCHITECTURE.md            # System design & data flow
│   ├── DESIGN.md                  # Design system & tokens
│   ├── DEPLOYMENT.md              # Deployment guides
│   ├── ONBOARDING.md              # User flow documentation
│   └── PRODUCT.md                 # Product requirements & positioning
│
├── src/
│   ├── components/
│   │   ├── LandingPage.tsx        # Public landing page
│   │   ├── Onboarding.tsx         # 5-step eligibility flow
│   │   ├── Dashboard.tsx          # Main user dashboard
│   │   ├── ActivityTimeline.tsx   # Negotiation event feed
│   │   ├── EscrowLedger.tsx       # Full escrow statement
│   │   ├── DocumentVault.tsx      # Secure document library
│   │   ├── CreditHealth.tsx       # Score tracker & rebuild checklist
│   │   ├── NotificationCenter.tsx # Bell dropdown panel
│   │   ├── Messages.tsx           # Secure negotiator messaging
│   │   ├── AdminPanel.tsx         # Admin controls
│   │   ├── CreditorBoard.tsx      # Creditor negotiation status
│   │   ├── ScenarioSimulator.tsx  # Settlement impact slider
│   │   ├── AuthModal.tsx          # Google OAuth + Magic Link
│   │   ├── CustomCursor.tsx       # Custom cursor component
│   │   ├── GrainOverlay.tsx       # SVG noise texture
│   │   └── Layout.tsx             # Dashboard sidebar + top bar
│   │
│   ├── context/
│   │   └── AppContext.tsx         # Global state (React Context)
│   │
│   ├── data.ts                    # Sample data & calculation engine
│   ├── types.ts                   # TypeScript interfaces
│   ├── App.tsx                    # Root component with routing
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Design system CSS + Tailwind v4
│
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

<br />

## 🧮 Debt Calculation Engine

The core business logic lives in `src/data.ts`:

```typescript
// Settlement savings calculation
const settlement = calculateSettlementSavings(cards);
// → { totalDebt, estimatedSettlement, savings, savingsPercent }

// Payoff timeline comparison
const comparison = calculateComparison(cards, monthlyPayment, platformFee);
// → { statusQuo, platformPath, interestSaved, monthsSaved }
```

All calculations are **deterministic and transparent** — no black-box math.

<br />

## 🛡️ Compliance & Disclaimers

The prototype includes persistent compliance messaging:

> *"DebtOptimize is a debt settlement company. We do not provide loans or credit repair services. Results vary and are not guaranteed. Not available in all states."*

All financial projections are clearly labeled as **estimates based on successful negotiation** and not binding offers of credit.

<br />

## 📦 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | React 19 + TypeScript | UI components with type safety |
| **Build Tool** | Vite 8 | Fast dev server & optimized builds |
| **Styling** | Tailwind CSS v4 | Utility-first CSS with custom design tokens |
| **Animations** | Framer Motion | Spring physics, gestures, AnimatePresence |
| **Charts** | Recharts | Interactive debt payoff visualizations |
| **Icons** | Lucide React | Clean, consistent iconography |
| **Auth** | Custom simulation | Google OAuth + Email Magic Link flows |
| **State** | React Context | Lightweight global state management |

<br />

## 🏢 About the Product

**DebtOptimize** is a debt settlement platform targeting the American middle class —
households earning $50K–$150K who carry significant credit card debt but cannot
qualify for traditional consolidation loans.

### The Problem
- **Lower class** → Bankruptcy is the only option (destroys credit for 7–10 years)
- **Upper class** → Has access to low-interest loans, advisors, tax strategies
- **Middle class** → Earns too much for bankruptcy aid, denied for consolidation loans, **stuck paying 29% APR forever**

### The Solution
1. Stop paying creditors
2. Deposit an affordable monthly amount into an FDIC-insured escrow account
3. Our expert negotiators contact creditors and fight for 40–60% settlements
4. Pay settlements from escrow. Become debt-free in 24–48 months.

<br />

## 📄 Documentation

| Document | Description |
|----------|-------------|
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | System architecture, state flow, component hierarchy |
| [`docs/DESIGN.md`](./docs/DESIGN.md) | Design tokens, color system, typography, animation principles |
| [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) | Build, deploy, and environment configuration |
| [`docs/ONBOARDING.md`](./docs/ONBOARDING.md) | User journey map, eligibility criteria, step-by-step flow |
| [`docs/PRODUCT.md`](./docs/PRODUCT.md) | Product positioning, competitive analysis, target demographic |

<br />

## 🤝 Demo Mode

The prototype includes a **Demo Mode toggle** in the dashboard header for client presentations:

- Pre-populated with a realistic borrower profile: **$30,000 debt** across 3 cards
- **18 months of escrow transactions**, **20+ negotiation events**, **14 documents**, **24-month credit history**, and **3 message threads**
- One-click **Reset Demo** button restores all seeded data to default state
- All data is client-side — no backend required for the POC

<br />

<div align="center">

---

**Built with precision. Designed for trust.**

*DebtOptimize · Same Payment, Faster Freedom*

</div>
