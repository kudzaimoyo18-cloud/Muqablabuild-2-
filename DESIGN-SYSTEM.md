# Muqabla — Design System

Derived from the v2 prototype. Emerald + gold on deep noir. Editorial type rhythm. Mobile-first seeker, desktop-first employer, full RTL parity.

---

## Tokens

### Color (oklch)

```css
:root {
  /* Surfaces */
  --surface-base:    oklch(12% 0.012 165);     /* page background */
  --surface-raised:  oklch(16% 0.015 165);     /* cards */
  --surface-overlay: oklch(20% 0.018 165);     /* modals, popovers */
  --surface-sidebar: oklch(10% 0.014 165);     /* employer sidebar */

  /* Accents */
  --accent-emerald: oklch(75% 0.20 162);       /* primary CTA, active */
  --accent-emerald-strong: oklch(68% 0.22 160);
  --accent-emerald-soft: oklch(75% 0.20 162 / 0.18);
  --accent-gold:    oklch(82% 0.16 78);        /* employer icon, badge */
  --accent-gold-soft: oklch(82% 0.16 78 / 0.18);

  /* Text */
  --text:           oklch(98% 0 0);            /* white */
  --text-muted:     oklch(98% 0 0 / 0.55);
  --text-faint:     oklch(98% 0 0 / 0.30);

  /* Borders + hairlines */
  --border-hairline: oklch(98% 0 0 / 0.08);
  --border-soft:     oklch(98% 0 0 / 0.14);

  /* Semantic */
  --success: oklch(75% 0.20 162);
  --warning: oklch(82% 0.16 78);
  --danger:  oklch(70% 0.22 25);
  --info:    oklch(70% 0.15 250);
}
```

### Type Scale

System: Inter (Latin) + Noto Sans Arabic (Arabic). Tight tracking on display, normal on body.

| Token         | Size                                    | Use                            |
| ------------- | --------------------------------------- | ------------------------------ |
| `text-eyebrow`| 11px, 700, 0.12em tracking, uppercase   | Section labels (GET STARTED)   |
| `text-body-sm`| 13px / 1.5                              | Captions, meta                 |
| `text-body`   | 15px / 1.6                              | Default body                   |
| `text-body-lg`| 17px / 1.55                             | Lead paragraph                 |
| `text-title-sm` | 20px / 1.3, 600                       | Card titles                    |
| `text-title` | 28px / 1.25, 700                        | Section titles                 |
| `text-display-sm`| `clamp(2.25rem, 1.5rem + 2vw, 3rem)` 800 -0.02em  | Page headings    |
| `text-display`| `clamp(3rem, 2rem + 4vw, 5rem)` 800 -0.025em       | Hero               |

### Spacing (4pt base)

`4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 120`

### Radii

```
--radius-xs: 6px
--radius-sm: 10px
--radius-md: 14px
--radius-lg: 20px   /* cards */
--radius-xl: 28px   /* hero panels */
--radius-pill: 9999px
```

### Shadows

```
--shadow-card:   0 1px 0 oklch(98% 0 0 / 0.06) inset, 0 8px 24px -12px oklch(0% 0 0 / 0.6)
--shadow-cta:    0 12px 28px -10px oklch(75% 0.20 162 / 0.55)
--shadow-modal:  0 24px 60px -20px oklch(0% 0 0 / 0.8)
```

---

## Components

### CTA Card (onboarding "How will you use Muqabla")
- 64x64 icon block left, rounded-2xl, emerald (seeker) or gold (employer) tint
- Title + description right
- Arrow chevron far right
- Whole card hover: border lifts to soft, subtle translateY(-2px)
- Class: `group flex items-center gap-4 rounded-2xl border border-[--border-hairline] bg-[--surface-raised] p-5 transition hover:border-[--border-soft] hover:-translate-y-0.5`

### KPI Stat Card
- Icon top-right (24px in tinted square)
- Big number (text-display-sm)
- Label below (text-body-sm, muted)
- Delta chip top-left (+18%, +12%) — emerald or gold tint
- Class: `relative rounded-2xl border border-[--border-hairline] bg-[--surface-raised] p-5`

### Recent Application Row
- Square play thumbnail left (44x44 rounded-lg, dark with emerald play triangle)
- Name (15px 600) + role (13px muted) middle
- Time + AI score badge right (`12m` `94 ✦`)
- Class: `flex items-center gap-4 rounded-xl px-4 py-3 hover:bg-[--surface-overlay]`

### Hiring Funnel Bar
- Stage label left
- Bar (emerald gradient, animated width)
- Count right
- Class: `grid grid-cols-[100px_1fr_40px] items-center gap-3 py-1.5`

### AI Scoring Weights Card
- Stacked bars, each: label / colored bar / percentage
- Bar colors vary by signal: emerald (skill), info (confidence), gold (body lang), pink (sentiment), violet (quality)
- Class: same row pattern as funnel, distinct bar gradient per row

### Match Badge (`94% MATCH`)
- Pill, emerald tint background, emerald border, white number + tiny "MATCH" label below
- Class: `inline-flex flex-col items-center rounded-2xl border border-[--accent-emerald]/40 bg-[--accent-emerald-soft] px-3 py-1.5 text-sm font-bold`

### Anonymous Review Chip
- Tiny pill, gold dot + "Anonymous review" text
- Class: `inline-flex items-center gap-1.5 rounded-pill border border-[--accent-gold]/40 bg-[--accent-gold-soft] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[--accent-gold]`

### Skill Chip
- Small rounded outlined pill
- Class: `rounded-pill border border-[--border-hairline] px-3 py-1 text-[12px] text-[--text-muted]`

### ML Engine Status Pill (sidebar bottom)
- Animated pulse dot + "Analyzing N videos…"
- Class: `flex items-center gap-2 rounded-xl border border-[--border-hairline] bg-[--surface-raised] px-3 py-2 text-xs text-[--text-muted]`

### Seeker Side Icon Stack (TikTok-style)
- Vertical right edge of phone
- 3 buttons: like + count, save, share
- Class: `absolute right-3 bottom-32 flex flex-col gap-4`

### Phone Frame Mockup (for marketing/preview)
- Outer: rounded-[44px] border-[10px] border-zinc-900 bg-black
- Inner clip with safe-area top notch
- Class: `relative mx-auto h-[640px] w-[300px] overflow-hidden rounded-[44px] border-[10px] border-zinc-900 bg-black`

### Browser Window Mockup (for marketing/preview)
- Traffic-light dots top-left, URL pill center
- Class: `rounded-2xl border border-[--border-hairline] bg-[--surface-raised] shadow-[--shadow-card]`

---

## Motion

| Token              | Value                                     | Use                |
| ------------------ | ----------------------------------------- | ------------------ |
| `--ease-out`       | `cubic-bezier(0.16, 1, 0.3, 1)`           | Reveals            |
| `--ease-spring`    | spring(300, 30)                           | Nav cursor, tabs   |
| `--dur-fast`       | 150ms                                     | Hover              |
| `--dur-normal`     | 280ms                                     | Page transitions   |
| `--dur-slow`       | 500ms                                     | Hero entrance      |

Principles:
- Animate `transform` + `opacity` only.
- Stagger child reveals by 60ms.
- Reduced-motion: collapse to 0 duration, keep final state.

---

## RTL

- Use logical properties (`ps-`/`pe-`, `start-`/`end-`).
- Flip arrows + chevrons via `rtl:rotate-180`.
- Sidebar order, KPI grid, funnel direction all mirror automatically.
- Latin names stay LTR inside RTL flow (auto `bidi-isolate`).

---

## Implementation Priorities

| Page                          | Components used                                            |
| ----------------------------- | ---------------------------------------------------------- |
| `/login`, `/register`         | CTA cards, OAuth pill buttons, hero typography             |
| `/onboarding/seeker`          | Progress pills (existing), skill chips, large title        |
| `/onboarding/employer`        | KPI-style fields, gold accent                              |
| `/feed`                       | Side icon stack, anonymous chip, match badge, skill chips, apply CTA |
| `/dashboard`                  | KPI stat cards, recent app rows, hiring funnel, AI scoring weights, ML engine pill |
| `/jobs/new`                   | Form fields styled with hairline borders, skill chips      |
| `/pipeline`                   | Kanban cards with score badges                             |

