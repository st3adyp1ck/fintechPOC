# Design System

## Design Philosophy

> **Approachable authority.** The product deals with financial stress — the design must feel warm and human while conveying competence and trustworthiness.

This is not a cold bank app. It is not a flashy crypto dashboard. It sits in the middle: **professional enough to trust, warm enough to feel like help.**

---

## Color Palette

### Primary Colors

| Token | Hex | Usage |
|-------|-----|-------|
| **Navy 950** | `#0a0e1f` | Deepest backgrounds, primary text on light |
| **Navy 900** | `#12162b` | Dark sections, sidebar, headers |
| **Navy 800** | `#1e243d` | Cards on dark, hover states |
| **Navy 700** | `#2d3554` | Secondary text on dark |

### Accent Colors

| Token | Hex | Usage |
|-------|-----|-------|
| **Gold 400** | `#edc45a` | Primary CTA buttons, highlights, trust signals |
| **Gold 500** | `#d4961e` | Hover states, focus rings |
| **Teal 500** | `#14b8a6` | Success states, positive metrics, settlement indicators |
| **Teal 400** | `#2dd4bf` | Chart lines, progress bars |

### Surface Colors

| Token | Hex | Usage |
|-------|-----|-------|
| **Cream 50** | `#fdfcfa` | Lightest background |
| **Cream 100** | `#faf8f5` | Page background, card surfaces |
| **Cream 200** | `#f5f0e8` | Elevated cards, hover backgrounds |
| **Cream 300** | `#ebe4d6` | Borders, dividers, disabled states |

### Semantic Colors

| Purpose | Color | Token |
|---------|-------|-------|
| Success / Positive | Emerald | `--color-teal-500` |
| Warning / Caution | Amber | `--color-gold-500` |
| Error / Negative | Rose | `--color-rose-500` |
| Information | Navy | `--color-navy-500` |

### Why This Palette?

- **Cream instead of white** — White feels sterile and corporate. Cream feels human, approachable, premium (think: high-end stationery, luxury hotels)
- **Navy instead of black/gray** — Navy conveys trust, authority, and timelessness without the harshness of pure black
- **Gold accent** — Signals wealth, value, and optimism. Used sparingly for maximum impact
- **Teal for success** — Distinct from generic green. Feels modern and fresh

---

## Typography

### Font Family

```css
font-family: 'Inter', system-ui, sans-serif;
```

Inter was chosen for:
- Excellent legibility at small sizes (critical for financial data)
- Variable font support (can use `font-variation-settings` for fine-tuning)
- Neutral personality that does not compete with the color palette
- Widely available (Google Fonts, system fallback)

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| Display | 72px | 700 | 1.1 | -1.5px |
| H1 | 48px | 700 | 1.15 | -1px |
| H2 | 36px | 700 | 1.2 | -0.5px |
| H3 | 24px | 600 | 1.3 | 0 |
| Body Large | 18px | 400 | 1.6 | 0 |
| Body | 16px | 400 | 1.5 | 0 |
| Caption | 14px | 500 | 1.4 | 0 |
| Label | 12px | 600 | 1.3 | 0.5px (uppercase) |

### Typography Patterns

- **Italic accents** — Used in headlines for emphasis words ("debt.", "Control?")
- **Tight letter-spacing on large type** — Creates density and authority
- **Uppercase + wide tracking on labels** — Creates hierarchy without size competition

---

## Spacing System

Based on a 4px grid:

```
4px   → xs
8px   → sm
12px  → md
16px  → base
24px  → lg
32px  → xl
48px  → 2xl
64px  → 3xl
96px  → 4xl
```

### Section Spacing

- **Between major sections:** 96px (py-24)
- **Within section content:** 32–48px
- **Between related elements:** 16–24px
- **Between tightly grouped elements:** 8–12px

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| **sm** | 8px | Small buttons, tags |
| **md** | 12px | Inputs, small cards |
| **lg** | 16px | Cards, containers |
| **xl** | 24px | Large cards, modals |
| **full** | 9999px | Pills, avatars |

---

## Shadows

```css
/* Subtle elevation */
shadow-sm: 0 1px 2px rgba(18, 22, 43, 0.05);

/* Card default */
shadow-md: 0 4px 12px rgba(18, 22, 43, 0.08);

/* Hover lift */
shadow-lg: 0 12px 32px rgba(18, 22, 43, 0.12);

/* Modal / overlay */
shadow-xl: 0 24px 48px rgba(18, 22, 43, 0.18);

/* Gold accent glow */
shadow-gold: 0 4px 20px rgba(237, 196, 90, 0.25);
```

---

## Animation Principles

### Timing

| Duration | Usage |
|----------|-------|
| 150ms | Micro-interactions (button press, checkbox toggle) |
| 300ms | Hover states, small transitions |
| 500ms | Component entrances, page transitions |
| 800ms | Large reveals, hero animations |
| 1200ms | Chart animations, complex sequences |

### Easing

| Name | Value | Usage |
|------|-------|-------|
| **Ease Out** | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | Entrances, reveals |
| **Spring** | `stiffness: 400, damping: 30` | Hover effects, interactive elements |
| **Linear** | `linear` | Continuous loops, loading spinners |

### Animation Patterns

1. **Staggered Children** — Elements enter one after another (50ms delay between siblings)
2. **Parallax Scroll** — Hero content moves at different speed than background
3. **Hover Lift** — Cards translate Y -4px on hover with shadow increase
4. **Spring Scale** — Buttons scale to 1.03 on hover, 0.97 on press
5. **Progressive Disclosure** — Content reveals as user scrolls into viewport

---

## Component Patterns

### Cards

```
┌─────────────────────────────┐
│  bg: cream-50               │
│  border: 1px cream-300      │
│  border-radius: 16px        │
│  padding: 24px              │
│  shadow: shadow-sm          │
│                             │
│  hover:                     │
│    y: -4px                  │
│    shadow: shadow-lg        │
│    transition: 300ms ease   │
└─────────────────────────────┘
```

### Buttons

**Primary (Gold)**
- Background: `gold-500`
- Text: `navy-950`
- Border radius: `12px`
- Padding: `16px 32px`
- Font weight: `700`
- Hover: `scale(1.03)`, background `gold-400`

**Secondary (Navy)**
- Background: `navy-900`
- Text: `cream-50`
- Border radius: `12px`
- Padding: `16px 32px`
- Hover: `scale(1.03)`, background `navy-800`

**Ghost**
- Background: `transparent`
- Border: `1px white/10`
- Text: `cream-50`
- Hover: `bg-white/10`

### Inputs

```
┌─────────────────────────────┐
│  bg: white                  │
│  border: 1px cream-300      │
│  border-radius: 12px        │
│  padding: 12px 16px         │
│  font-size: 14px            │
│                             │
│  focus:                     │
│    border: gold-500         │
│    ring: 3px gold-500/30    │
└─────────────────────────────┘
```

---

## Textures & Effects

### Grain Overlay

A subtle SVG noise texture is applied to dark sections to add physical depth:

```css
.grain-dark::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,...feTurbulence...");
}
```

### Spotlight Card Effect

A radial gradient follows the mouse cursor on card hover:

```css
.spotlight-card::before {
  background: radial-gradient(circle, rgba(237, 196, 90, 0.15) 0%, transparent 70%);
  transform: translate(-50%, -50%);
  /* Position updated via JS on mousemove */
}
```

### Custom Cursor

- **Default:** 8px solid dot in `navy-950` with `mix-blend-mode: difference`
- **Hover:** Expands to 48px circle with gold-tinted background
- **Update:** Position lerps at 0.15 factor per frame for smooth follow

---

## Responsive Breakpoints

| Name | Width | Usage |
|------|-------|-------|
| **sm** | 640px | Minor adjustments |
| **md** | 768px | Tablet layout, 2-column grids |
| **lg** | 1024px | Desktop sidebar visible, full navigation |
| **xl** | 1280px | Max content width, generous whitespace |
| **2xl** | 1536px | Ultra-wide optimizations |

### Mobile Strategy

- **Landing page:** Single column, stacked sections, hamburger navigation
- **Dashboard:** Sidebar becomes top navigation, cards stack vertically
- **Onboarding:** Full-width forms, larger touch targets
- **Custom cursor:** Disabled on touch devices (`pointer: coarse`)

---

## Accessibility

### Color Contrast

All text meets WCAG AA standards:
- Body text on cream: 4.5:1 minimum
- Large text on navy: 3:1 minimum
- Interactive elements have visible focus states

### Focus States

```css
input:focus, button:focus, a:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(237, 196, 90, 0.3);
  border-color: #d4961e;
}
```

### Motion Preferences

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Iconography

- **Library:** Lucide React
- **Size scale:** 16px (inline), 20px (buttons), 24px (feature icons)
- **Stroke width:** 2px default, 1.5px for small icons
- **Color:** Inherits from parent text color
