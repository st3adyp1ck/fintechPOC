# User Onboarding Documentation

## Overview

The onboarding flow is the critical conversion funnel. It must build trust, collect necessary information, and deliver an approval decision — all within 3 minutes. Every step includes progress indicators, explanation of "why we need this," and reassurance about data security.

---

## User Journey Map

```
Discovery                    Conversion                  Activation
    │                            │                            │
    ▼                            ▼                            ▼
┌──────────┐              ┌──────────────┐              ┌─────────────┐
│  Landing  │───CTA────▶  │  Onboarding  │───Approve──▶ │  Dashboard  │
│   Page    │              │    (5 Steps)  │              │   Access    │
└──────────┘              └──────────────┘              └─────────────┘
                                 │
                                 ▼
                          ┌──────────────┐
                          │   Declined   │
                          │  (Soft exit) │
                          └──────────────┘
```

---

## Step 1: Basic Information

### Purpose
Collect identity basics required for KYC compliance and eligibility screening.

### Fields

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| First Name | text | Yes | Non-empty |
| Last Name | text | Yes | Non-empty |
| Email | email | Yes | Valid email format |
| Phone | tel | Yes | US phone format |
| Date of Birth | date | Yes | 18+ years old |
| SSN Last 4 | password | Yes | 4 digits |
| Street Address | text | Yes | Non-empty |
| City | text | Yes | Non-empty |
| State | text | Yes | 2-letter code |
| ZIP | text | Yes | 5 digits |

### UX Patterns
- Fields are grouped logically (name, contact, identity, address)
- Real-time validation with inline error messages
- **Pre-filled with demo data** for POC demonstrations
- Progress bar shows "Step 1 of 5"

### Trust Signals
> "We need this to verify your identity and check your eligibility. Your information is encrypted and never sold."

---

## Step 2: Identity Verification

### Purpose
Federal law (Patriot Act / BSA) requires financial services to verify customer identity.

### Flow

```
User clicks upload area
        │
        ▼
┌─────────────────┐
│  Simulated      │
│  Upload UI      │
│  (2.5s delay)   │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│  Processing     │
│  Animation      │
│  (spinner +     │
│   status text)  │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│  Success Screen │
│  • Match: 99.7% │
│  • Fraud: Pass  │
│  • State: Conf  │
└─────────────────┘
```

### UX Patterns
- Large clickable upload zone with dashed border
- Animated spinner during "processing"
- Success screen with verification details
- **Cannot proceed until verification completes**

### Trust Signals
> "Your data is secure. 256-bit encryption. ID documents are not stored on our servers. Verified by our SOC-2 compliant partner."

---

## Step 3: Soft Credit Check

### Purpose
Understand the user's credit profile to build a personalized negotiation strategy.

### Key Messaging

**CRITICAL:** The user's credit score does **NOT** disqualify them. This must be explicitly stated.

> "Your credit score does not disqualify you. Debt settlement is specifically designed for people who cannot qualify for consolidation loans. We use this data to build your personalized negotiation strategy."

### Flow

```
User clicks "Run Soft Credit Check"
        │
        ▼
┌─────────────────┐
│  Loading State  │
│  (3s simulation)│
└─────────────────┘
        │
        ▼
┌─────────────────┐
│  Results Screen │
│  • Credit Range │
│  • Est. Savings │
│  • Profile Sum  │
└─────────────────┘
```

### Displayed Results

| Metric | Example Value | Notes |
|--------|--------------|-------|
| Credit Score Range | Fair (580-669) | Soft pull, no impact |
| Est. Settlement Savings | $15,600 | Based on 52% avg reduction |
| Total Accounts | 4 | Includes entered debts + inferred |
| Delinquent | 0 | Current status |
| Utilization | 78% | High utilization = good candidate |
| Credit History | 8 years | Length of history |

---

## Step 4: Debt Assessment

### Purpose
Build a complete picture of the user's unsecured debt for accurate savings estimates.

### Dynamic Form

Users can add/remove credit cards dynamically:

```
Debt 1: [Creditor] [Balance] [APR %] [Min Payment]
Debt 2: [Creditor] [Balance] [APR %] [Min Payment]
Debt 3: [Creditor] [Balance] [APR %] [Min Payment]

[+ Add Another Debt]
```

### Additional Fields

| Field | Purpose |
|-------|---------|
| Annual Income | Determines affordable monthly escrow deposit |
| Monthly Expenses | Calculates disposable income for escrow |

### Validation
- Balance must be > $1,000 per card
- APR must be between 0% and 40%
- Minimum payment must be less than balance

---

## Step 5: Eligibility Decision

### Approval Criteria (POC)

For the POC, all users are approved. In production, criteria would include:

- Total unsecured debt: $7,500–$100,000
- Minimum monthly disposable income: $200+
- State availability (not all states allow debt settlement)
- Debt type: Credit cards, personal loans, medical bills (no federal student loans, no secured debt)

### Approval Screen

```
┌──────────────────────────────┐
│  ✓ You Are Approved          │
│  Welcome, {FirstName}        │
├──────────────────────────────┤
│  Total Enrolled Debt: $XX    │
│  Est. Settlement: $XX        │
│  Your Savings: $XX (52%)     │
│  Duration: 24-36 months      │
├──────────────────────────────┤
│  What Happens Next:          │
│  1. Stop paying creditors    │
│  2. Build your escrow        │
│  3. We negotiate             │
│  4. Settle & rebuild         │
├──────────────────────────────┤
│  [Legal Protection Included] │
└──────────────────────────────┘
```

### Decline Path (Future)

If a user is declined:
1. Explain **why** clearly
2. Offer **alternatives** (credit counseling, bankruptcy consultation)
3. Provide **resources** (NFCC-certified agencies)
4. Allow **re-apply** in 6 months if situation changes

---

## Conversion Optimization

### Abandonment Recovery

| Drop-off Point | Recovery Action |
|----------------|----------------|
| Step 1 (Basic Info) | Exit-intent popup: "Wait! Your savings estimate is almost ready." |
| Step 2 (ID Verify) | Email after 1 hour: "Complete your verification in 30 seconds" |
| Step 3 (Credit Check) | SMS after 2 hours: "Your credit check results are waiting" |
| Step 4 (Debt Assessment) | Email after 24 hours: "You could save $XX,XXX. Finish your profile." |
| Post-Approval | Onboarding sequence: "Welcome to DebtOptimize. Here's what to expect." |

### A/B Test Ideas

1. **Progress bar style** — Segmented dots vs. continuous bar
2. **CTA copy** — "Check If I Qualify" vs. "See My Savings" vs. "Get My Free Estimate"
3. **Form field order** — Email first (for abandonment recovery) vs. name first (for personalization)
4. **Social proof placement** — Above the fold vs. after form submission
5. **Urgency messaging** — "Limited spots available" vs. "No obligation"

---

## Dashboard Activation

After approval, users land on the **Dashboard** — now a full "financial operations cockpit" with 5 additional views accessible via the sidebar.

### Dashboard Views

| View | Purpose | Key Interaction |
|------|---------|-----------------|
| **Dashboard** | Summary + quick-action widgets | Click Escrow Balance → Ledger |
| **Activity** | Full negotiation timeline | Filter by event type |
| **Escrow Ledger** | Every dollar in/out | Download CSV, filter by date |
| **Documents** | Program paperwork vault | Preview, grid/list toggle |
| **Credit Health** | Score recovery tracking | Toggle checklist items |
| **Impact Simulator** | Per-creditor settlement sliders | Drag to simulate outcomes |
| **Creditors** | Per-card negotiation status | Monitor active negotiations |
| **Messages** | Secure negotiator chat | Send message, auto-reply demo |

### Widget Quick-Actions

From the main Dashboard, users can see at a glance:
- **Recent Activity** — last 3 events with "View all" link
- **Action Required** — count of unread notifications + unsigned documents
- **Credit Score** — current Experian estimate with monthly delta

---

## Analytics Events

Track these events for funnel analysis:

```javascript
// Step progression
analytics.track('Onboarding Step Started', { step: 1 });
analytics.track('Onboarding Step Completed', { step: 1, duration_ms: 45000 });

// ID verification
analytics.track('ID Upload Started');
analytics.track('ID Upload Completed', { match_confidence: 0.997 });

// Credit check
analytics.track('Credit Check Started');
analytics.track('Credit Check Completed', { credit_score_range: 'fair', estimated_savings: 15600 });

// Eligibility
analytics.track('Eligibility Approved', { total_debt: 30000, estimated_savings: 15600 });
analytics.track('Eligibility Declined', { reason: 'insufficient_debt' });

// Dashboard activation
analytics.track('Dashboard First View', { days_since_approval: 0 });

// Dashboard feature engagement
analytics.track('Activity Filter Changed', { filter: 'settlements' });
analytics.track('Escrow CSV Downloaded', { row_count: 46 });
analytics.track('Document Previewed', { document_id: 'doc-003', category: 'Settlement Agreements' });
analytics.track('Credit Task Toggled', { task_id: 'rt-002', status: 'in-progress' });
analytics.track('Notification Clicked', { notification_id: 'notif-001', action_view: 'documents' });
analytics.track('Message Sent', { thread_id: 'thread-001' });
```

---

## Accessibility

- All form fields have associated `<label>` elements
- Error messages are announced via `aria-live="polite"`
- Focus management moves to the first field of each new step
- Progress indicator uses `role="progressbar"` with `aria-valuenow`
- Color is not the only indicator of state (icons + text + color)
