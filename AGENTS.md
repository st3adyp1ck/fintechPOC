# AGENTS.md — DebtOptimize

This document contains the essential context an AI coding agent needs to work effectively in this codebase. Read this first before making any changes.

---

## Project Overview

**DebtOptimize** is a high-fidelity functional prototype of a debt settlement platform targeting American middle-class households. It is a single-page application (SPA) built to demonstrate how reducing APR — without increasing monthly out-of-pocket cost — shortens the debt lifecycle. The project is client-side only: there is no backend, no API layer, and all data is simulated.

Key characteristics:
- This is a **demo/proof-of-concept**, not a production system with real users.
- All authentication flows (Google OAuth, Email Magic Link) are **simulated** with animations.
- All financial data is **pre-populated demo data** that can be mutated in the UI.
- The primary goal of the codebase is **visual polish, smooth animations, and persuasive client demonstrations**.

---

## Technology Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Framework | React | 19.2.4 | SPA, no router library |
| Language | TypeScript | ~6.0.2 | Strict linting enabled |
| Build Tool | Vite | 8.0.4 | Dev server, bundling, HMR |
| Styling | Tailwind CSS | 4.2.2 | Uses `@tailwindcss/vite` plugin and `@theme` directive |
| Animations | Framer Motion | 12.38.0 | Primary animation library |
| Charts | Recharts | 3.8.1 | Debt payoff visualizations |
| Icons | Lucide React | 1.8.0 | Consistent iconography |
| Utilities | clsx, tailwind-merge | latest | Conditional class merging |
| Toast | react-hot-toast | 2.6.0 | Notifications |
| Scrolling | lenis | 1.3.23 | Smooth scroll (if used) |
| Marquee | react-fast-marquee | 1.6.5 | Scrolling content |
| Animation | gsap | 3.15.0 | Advanced animations (if used) |

### Build & Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Production build — TypeScript check + Vite bundle → ./dist
npm run build

# Preview production build locally (http://localhost:4173)
npm run preview

# Run ESLint
npm run lint
```

There are **no test scripts** defined in `package.json`. The project currently has no automated test suite.

---

## Project Structure

```
├── docs/                          # Human-readable documentation
│   ├── ARCHITECTURE.md            # System design & data flow
│   ├── DESIGN.md                  # Design tokens, colors, typography
│   ├── DEPLOYMENT.md              # Build & deploy guides
│   ├── ONBOARDING.md              # User flow documentation
│   └── PRODUCT.md                 # Product requirements
│
├── src/
│   ├── components/
│   │   ├── LandingPage.tsx        # Public marketing page (hero, calculator, FAQ)
│   │   ├── Onboarding.tsx         # 5-step eligibility flow
│   │   ├── Dashboard.tsx          # Main user dashboard
│   │   ├── AdminPanel.tsx         # Admin controls (rates, fees)
│   │   ├── CreditorBoard.tsx      # Creditor negotiation status table
│   │   ├── ScenarioSimulator.tsx  # Interactive settlement simulator
│   │   ├── AuthModal.tsx          # Simulated Google OAuth + Magic Link
│   │   ├── CustomCursor.tsx       # Custom mouse cursor with hover expansion
│   │   ├── GrainOverlay.tsx       # SVG noise texture overlay
│   │   └── Layout.tsx             # Dashboard sidebar + top bar + footer
│   │
│   ├── context/
│   │   └── AppContext.tsx         # Global state (React Context API)
│   │
│   ├── data.ts                    # Demo data, calculation engine, constants, formatters
│   ├── types.ts                   # All TypeScript interfaces and type aliases
│   ├── App.tsx                    # Root component — view router
│   ├── main.tsx                   # Entry point (ReactDOM.createRoot)
│   └── index.css                  # Tailwind v4 theme, custom CSS, animations
│
├── index.html                     # HTML entry point (loads Inter font from Google Fonts)
├── vite.config.ts                 # Vite config: react plugin + tailwindcss plugin
├── tsconfig.json                  # Project references (app + node)
├── tsconfig.app.json              # App TS config: es2023, bundler mode, strict linting
├── tsconfig.node.json             # Node TS config for Vite config file
├── eslint.config.js               # ESLint flat config: TS + React Hooks + React Refresh
└── package.json
```

---

## Code Organization & Architecture

### View-Based Routing
There is no React Router. `App.tsx` renders components conditionally based on `state.currentView`:
- `landing` → `LandingPage`
- `onboarding` → `Onboarding`
- `dashboard` | `admin` | `creditors` | `simulator` → wrapped in `Layout`

### State Management
A single **React Context** (`AppContext`) holds all global state. This is intentional — it keeps the POC simple while remaining fully typed.

Key state fields:
- `profile: UserProfile` — user's personal info
- `cards: DebtCard[]` — credit card debts with balances, APRs, settlement offers
- `totalMonthlyPayment: number` — monthly escrow deposit
- `platformFee: number` — monthly platform fee (default $49)
- `escrowBalance: number` — current escrow balance
- `currentView: AppView` — active screen
- `demoMode: boolean` — toggles demo data pre-population
- `adminMode: boolean` — whether admin view is active

All state updates are done via immutable spread patterns inside `useCallback` hooks.

### Calculation Engine
All business logic lives in `src/data.ts`:
- `calculateComparison(cards, monthlyPayment, platformFee)` — compares status quo vs. negotiated payoff paths
- `calculateSettlementSavings(cards)` — computes total debt, estimated settlement, savings percentage
- `calculatePayoff(balance, apr, monthlyPayment, platformFee)` — amortization schedule simulation

These are **deterministic pure functions** — no randomness, no API calls.

### Demo Data Defaults
The app boots into demo mode with a pre-populated profile (Alex Mitchell, $72K income, Austin TX) and 3 credit cards (Amex $12K @ 28%, Chase $10K @ 24%, Citi $8K @ 26%). `resetToDemo()` restores this state and jumps to the dashboard.

---

## Code Style Guidelines

### TypeScript
- Target: `ES2023`, module: `ESNext`, module resolution: `bundler`
- `verbatimModuleSyntax: true` — use `import type` for type-only imports
- `noUnusedLocals: true` and `noUnusedParameters: true` — unused variables will fail the build
- `erasableSyntaxOnly: true` — no TypeScript-only runtime syntax like enums with computed values
- `noFallthroughCasesInSwitch: true` — all switch cases must be exhaustive or have breaks
- JSX transform: `react-jsx` (no need to import React)

### Styling
- **Tailwind CSS v4** is used via the `@tailwindcss/vite` plugin. There is no traditional `tailwind.config.js`.
- Custom design tokens are defined in `src/index.css` inside the `@theme` block (e.g., `--color-cream-100`, `--color-navy-900`, `--color-gold-400`).
- Use the custom token names as Tailwind utilities: `bg-cream-100`, `text-navy-900`, `border-gold-400`.
- Additional custom CSS classes live in `src/index.css` for effects that Tailwind utilities cannot express (cursor dot, grain overlays, animated underlines, spotlight cards, etc.).
- The design system is documented in `docs/DESIGN.md`.

### Component Patterns
- Components are default-exported functions in PascalCase files.
- Hooks from `useApp()` are the primary way to access global state.
- Framer Motion's `motion` components are used extensively for hover, tap, and entrance animations.
- Lucide icons are imported individually by name.

### Formatting Conventions
- Currency: use `formatCurrency()` from `src/data.ts` (USD, no decimal places)
- Numbers: use `formatNumber()` from `src/data.ts`
- Percentages: use `formatPercent()` from `src/data.ts` (1 decimal place)

---

## Testing Instructions

**There is currently no test suite.** No Jest, Vitest, Playwright, or Cypress is configured.

If you add tests:
- The project uses Vite, so **Vitest** is the natural choice.
- Prefer adding tests in a `src/__tests__/` directory or co-located `.test.tsx` files.
- Ensure `npm run build` still passes after changes — the TypeScript compiler is the primary correctness gate.

### Manual Verification Checklist
When making UI changes, verify these flows manually:
1. **Landing Page** → scroll animations, savings calculator slider, FAQ accordion, mobile hamburger menu
2. **Onboarding** → 5-step flow progresses without errors; cannot skip steps
3. **Auth Modal** → Google OAuth simulation plays 4-step animation; Magic Link shows "Check your inbox"
4. **Dashboard** → escrow balance, creditor table, comparison cards, area chart render correctly
5. **Impact Simulator** → per-card settlement slider updates metrics and chart in real time
6. **Admin Panel** → toggling negotiated APRs and adjusting platform fee updates dashboard calculations
7. **Demo Mode Toggle** → works in the top bar; Reset Demo restores default data
8. **Custom Cursor** → follows mouse and expands on hoverable elements (disabled on touch devices)

---

## Security Considerations

- **No real authentication backend** — all auth is simulated. Do not implement real password handling or token storage here.
- **All data is client-side** — there is no database, no API, and no persistence. LocalStorage is not used.
- **No secrets in the repo** — there are no `.env` files committed. If you add environment variables for a future backend, prefix them with `VITE_` and never commit secrets.
- **Compliance disclaimer** — a persistent footer disclaimer must remain visible on dashboard views: *"DebtOptimize is a debt settlement company. We do not provide loans or credit repair services. Results vary and are not guaranteed. Not available in all states."*
- **Financial projections are estimates** — any numbers shown must be clearly labeled as estimates based on successful negotiation, not binding offers of credit.

---

## Deployment

The build outputs static files to `/dist`. It can be deployed to any static host (Vercel, Netlify, AWS S3, etc.).

Current deployment configuration:
- No `vercel.json` or `_redirects` file exists in the repo root yet (examples are in `docs/DEPLOYMENT.md`).
- No CI/CD pipeline is configured.
- The Dockerfile example in `docs/DEPLOYMENT.md` is documentation only — not committed.

Recommended platform: **Vercel** (SPA rewrite rule needed: `/* → /index.html`).

---

## Dependencies to Be Aware Of

- **Tailwind CSS v4** uses a different configuration model than v3. Customizations belong in `src/index.css` via `@theme`, not in a `tailwind.config.js` file.
- **Framer Motion** is the animation backbone. Replacing it would require rewriting most component entrance/hover/transition logic.
- **Recharts** is tightly coupled to the Dashboard and Simulator components for area charts and reference lines.
- **React 19** — uses `createRoot` from `react-dom/client` and `StrictMode` in `main.tsx`.

---

## Common Pitfalls

1. **Do not create `tailwind.config.js`** — Tailwind v4 with `@tailwindcss/vite` does not use it. Put theme tokens in `src/index.css`.
2. **TypeScript strictness** — `noUnusedLocals` and `noUnusedParameters` are enabled. Unused imports or variables will break the build.
3. **No routing library** — Navigation is done by calling `setCurrentView()` from `AppContext`. Do not introduce React Router without a strong reason.
4. **Demo mode vs. real data** — The app is designed to always work without a backend. If you add API integration, preserve the `demoMode` toggle so the standalone prototype continues to function.
5. **Custom CSS classes** — Some effects (cursor, grain, spotlight, border-glow) rely on global CSS in `index.css`. Moving or renaming these classes requires updating both the CSS and the components that reference them.
