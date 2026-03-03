# Christine Burke Yoga — Demo Site

A static demo website for Christine Burke Yoga with **two design versions**, built with **Astro + Tailwind CSS** and deployed to **GitHub Pages**.

Combines content from:
- [christineburkeyoga.com](https://www.christineburkeyoga.com/)
- [liberationyoga.com](https://www.liberationyoga.com/) (legacy site)

## Two Versions

The landing page links to both:

| Version | Path | Design |
|---------|------|--------|
| **Version A** | `/version-a/` | Wellness editorial — warm tones, rounded cards, sage accents |
| **Version B** | `/version-b/` | Minimal text-first — inspired by [Grá](https://xn--gr-nia.com/), print-editorial, typographic |

Both versions share the same content files and images. Each has its own layouts, components, and CSS.

## Pages (same for both versions)

| Page | Path |
|------|------|
| Home | `/version-{a,b}/` |
| Work with Christine | `/version-{a,b}/work-with-christine/` |
| Programs | `/version-{a,b}/programs/` |
| Events | `/version-{a,b}/events/` |
| Books & Press | `/version-{a,b}/books-press/` |
| About | `/version-{a,b}/about/` |
| Liberation Yoga (Legacy) | `/version-{a,b}/liberation-yoga/` |
| Contact | `/version-{a,b}/contact/` |

## Project Structure

```
src/
├── content/              # Shared content (JSON, MD)
├── styles/
│   ├── version-a.css     # Version A design tokens + styles
│   └── version-b.css     # Version B design tokens + styles
├── version-a/
│   ├── layouts/          # Version A layout
│   └── components/       # Version A components (Header, Footer)
├── version-b/
│   ├── layouts/          # Version B layout
│   └── components/       # Version B components (Header, Footer, EyebrowLabel, etc.)
└── pages/
    ├── index.astro       # Landing page (links to both versions)
    ├── version-a/        # Version A pages
    └── version-b/        # Version B pages
public/
└── assets/ingested/      # Shared downloaded images
docs/
└── inspiration-notes.md  # Version B design system documentation
```

## Quick Start

```bash
npm install
npm run dev        # Local dev server at localhost:4321
npm run build      # Production build to ./dist/
npm run preview    # Preview production build
```

## Content Ingestion

Content and images are pre-downloaded and committed. To re-run:

```bash
npm run ingest
```

## GitHub Pages Deployment

1. Push to GitHub
2. Go to **Settings > Pages** → set **Source** to **GitHub Actions**
3. Deploys automatically on push to `main`

**Expected URL:** `https://<USERNAME>.github.io/yogodemo/`

The workflow sets `BASE_PATH=/<repo-name>/` automatically. For local testing:

```bash
BASE_PATH=/yogodemo/ npm run build
BASE_PATH=/yogodemo/ npm run preview
```

## Tech Stack

- [Astro](https://astro.build) — Static site generator
- [Tailwind CSS v4](https://tailwindcss.com) — Utility-first CSS
- No backend — contact form uses Formspree (placeholder)
