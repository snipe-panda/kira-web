# DESIGN — Kira

Dark, editorial, warm-amber. Mobile-first. The design system lives as Tailwind
v4 CSS-first tokens in `web/src/index.css` (`@theme`), so every token is a
utility (`bg-bg`, `text-amber`, `font-display`, `border-line`, …).

## Tokens

### Colour
| Token | Hex | Use |
|---|---|---|
| `bg` | `#0B0B0C` | canvas |
| `surface` | `#161618` | cards, inputs, dropzone |
| `surface2` | `#1D1D20` | nested fills, tag chips |
| `line` | `#2A2A2E` | borders, dividers |
| `ink` | `#EDEDED` | primary text |
| `muted` | `#9A9AA0` | secondary text (lightened from the Streamlit build for AA contrast) |
| `amber` | `#F2B24C` | primary actions, active states |
| `ambersoft` | `#F5C77E` | the italic hero accent, headline highlights |

### Type
| Token | Family | Use |
|---|---|---|
| `font-display` | Space Grotesk | headings, hero, brand, metrics |
| `font-mono` | Space Mono | eyebrows, stepper numbers, tags, badges |
| `font-body` | Inter | body, inputs, buttons |

- Hero scales fluidly: `clamp(2.3rem, 7vw, 3.6rem)`.
- Eyebrows: 0.72rem, uppercase, 0.2em tracking (`.eyebrow`).
- The "Studio listing" accent is italic + `ambersoft` (synthesised oblique;
  Space Grotesk ships no true italic).

### Shape & motion
- Card radius `16px`; buttons are full pills; inputs `10px`.
- Buttons: primary = `min-h-12` amber fill; ghost = `min-h-11` outline. Both ≥44px.
- Animations gated behind `motion-safe:`; a global `prefers-reduced-motion`
  rule near-zeroes all transitions/animations.

## Components
`BrandHeader`, `Stepper`, `Dropzone`, `icons` (inline SVG set), and primitives in
`ui.tsx`: `Button`, `StageHeader`, `ImageFrame`, `ImageSkeleton`, `Spinner`,
`Note`, `ErrorBanner`, `Tag`. Witty processing lines live in `SPIN` + `pick()`.

## Responsive strategy

Mobile-first, fluid, single max-width. Content caps at **1100px** centred; no
fixed heights; nothing hard-coded to a desktop width.

| Element | Mobile (`<sm`) | `sm`–`lg` | `lg+` |
|---|---|---|---|
| **Stepper** | compact "Step n/4 · label" + progress bar (never overflows) | full labelled stepper | — |
| **Hero** | headline → dropzone → subcopy/chips (CTA stays above the fold) | — | two columns: text left, dropzone centred right |
| **Identify form** | single column, image above | image left / form right | — |
| **Before/after** | stacked | side by side | — |
| **Placement cards** | 1 column | 2 columns | — |

Tested live at **360 / 768 / 1280 / 1920** — no horizontal overflow at any width.

### Two fixes that drove the rebuild
The Streamlit version failed mobile on exactly two points; both are designed out
here from the start:
1. **Stepper overflow at 360px** → condenses to a progress bar under `sm`.
2. **Upload CTA buried below the fold** → hero grid places the dropzone directly
   under the headline on mobile.

## Accessibility
- Form inputs are wrapped in `<label>` (proper association).
- One `<h1>` per view (`StageHeader`); valid heading order.
- Visible `:focus-visible` amber ring on all interactive elements.
- `prefers-reduced-motion` respected; spinner/skeleton pulse only `motion-safe`.
- All images carry descriptive `alt`; decorative icons are `aria-hidden`.
- ARIA: stepper `aria-current`, style-register `role="group"` + `aria-pressed`,
  `role="status"` + `aria-live` on loading states.
- Tap targets ≥44px; SVG icons throughout.
- `ImageFrame` / `ImageSkeleton` reserve image space to control layout shift (CLS).

## Scorecard (vs the mobile-first UI/UX checklist)
Rebuild lifted the app from **~3.2/5 (Streamlit)** to **~4.2/5**.

| Area | Score | Area | Score |
|---|--:|---|--:|
| Mobile usability | 4.5 | Performance readiness | 4.0 |
| Responsive layout | 4.5 | Form / upload UX | 4.0 |
| Visual hierarchy | 4.5 | Content clarity | 4.5 |
| Accessibility | 4.0 | QA readiness | 4.0 |

**Still short of 4.5:** real screen-reader/keyboard pass, cross-browser (Safari/
Firefox), determinate progress for the 30–60s renders, self-hosted fonts.
