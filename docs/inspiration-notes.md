# Inspiration Notes — Grá (grü-nia.com) Design Language

## Color Tokens

| Token      | Value     | Usage                          |
|------------|-----------|--------------------------------|
| `--bg`     | `#fbfaf7` | Warm near-white background     |
| `--fg`     | `#1a1a1a` | Primary text (near-black)      |
| `--muted`  | `#8a8a86` | Secondary text, captions       |
| `--border` | `#e5e4e0` | Hairline separators            |
| `--accent` | `#1a1a1a` | CTA text/links (matches fg)    |

Monochrome palette. No bright colors. Accent is identical to foreground — emphasis comes from weight and size, not color.

## Typography Scale

Single font family: **Inter** (clean modern grotesk).

| Role          | Size (clamp)           | Weight | Leading   | Tracking      |
|---------------|------------------------|--------|-----------|---------------|
| Display / H1  | clamp(2.5rem, 5vw, 4.5rem) | 400 | 1.05      | -0.02em       |
| H2            | clamp(1.5rem, 3vw, 2.25rem) | 400 | 1.15     | -0.01em       |
| H3            | 1.25rem                | 500    | 1.3       | 0             |
| Body          | 1.0625rem (17px)       | 400    | 1.65      | 0             |
| Small / Meta  | 0.875rem               | 400    | 1.5       | 0             |
| Eyebrow       | 0.75rem                | 500    | 1.4       | 0.2em         |

Eyebrow labels: **UPPERCASE** + wide letter-spacing (0.2em). Used for section titles.
Display headings may also optionally use wide-spaced uppercase (e.g. "W O R K  W I T H  C H R I S T I N E").

## Spacing Scale

| Token       | Value   | Usage                        |
|-------------|---------|------------------------------|
| `--space-1` | 0.5rem  | Inline gaps                  |
| `--space-2` | 1rem    | Small element spacing        |
| `--space-3` | 2rem    | Card/component padding       |
| `--space-4` | 4rem    | Section internal spacing     |
| `--space-5` | 6rem    | Section vertical padding     |
| `--space-6` | 8rem    | Hero / major section padding |

| Token      | Value   | Usage                            |
|------------|---------|----------------------------------|
| `--maxw`   | 68ch    | Content column max width         |
| `--maxw-wide` | 80rem | Full-width container limit    |
| `--gutter` | 1.5rem  | Side padding (mobile: 1.25rem)   |

Content stays in a narrow readable column (~60-70ch). Images may break wider.

## Navigation / Link Styling

- Text-only inline nav links separated by ` · ` (middle dot).
- No heavy bar background. Nav sits on page background.
- Links: no underline by default. Subtle underline on hover (transition ~200ms).
- Subpages: include a `← Back` text link.
- Primary CTA: thin 1px border outline button OR simple text link. No filled pill.

## List Layout (Programs / Events → "Menu" Style)

Render structured lists like a restaurant menu:

```
TITLE                                     DATE / LOCATION
Description text in muted color below
─────────────────────────────────────────────────────────
```

- Left-aligned title, right-aligned meta (date, location).
- 1px hairline rule separator between items.
- No cards, no shadows, no background fills.
- Hover: subtle shift or underline, nothing more.

## Motion Rules

- **Hover underline**: `text-decoration-color` transition, 200ms ease.
- **Image zoom**: scale(1.02) on hover, 400ms ease. Only on gallery images.
- **Fade-in**: optional IntersectionObserver fade on scroll, opacity 0→1, 300ms.
- **prefers-reduced-motion**: wrap ALL transitions/animations in:
  ```css
  @media (prefers-reduced-motion: no-preference) { ... }
  ```
  With reduced motion: no transitions, no fade, instant state changes.
