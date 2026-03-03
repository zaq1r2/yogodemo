# Christine Burke Yoga — Demo Site

A static demo website for Christine Burke Yoga, built with **Astro + Tailwind CSS** and deployed to **GitHub Pages**.

Combines content from:
- [christineburkeyoga.com](https://www.christineburkeyoga.com/)
- [liberationyoga.com](https://www.liberationyoga.com/) (legacy site)

## Pages

| Page | Path |
|------|------|
| Home | `/` |
| Work with Christine | `/work-with-christine/` |
| Programs | `/programs/` |
| Events | `/events/` |
| Books & Press | `/books-press/` |
| About | `/about/` |
| Liberation Yoga (Legacy) | `/liberation-yoga/` |
| Contact | `/contact/` |

## Quick Start

```bash
npm install
npm run dev        # Local dev server at localhost:4321
npm run build      # Production build to ./dist/
npm run preview    # Preview production build
```

## Content Ingestion

Content and images have been pre-downloaded and committed to the repo. To re-run ingestion:

```bash
npm run ingest
```

This fetches HTML from source URLs, extracts text, downloads images, and produces structured content files in `src/content/` and `public/assets/ingested/`.

## Content Structure

Editable content files:

```
src/content/
  site.json         # Site name, tagline, email, socials, CTA labels
  events.json       # Events list (sorted by date on render)
  programs.json     # Programs with features and CTAs
  books.json        # Book covers, descriptions, buy links
  press.json        # Press mentions and media features
  about.md          # Bio and approach (real extracted copy)
  legacy.md         # Liberation Yoga story (real extracted copy)
  ingested/         # Raw ingested markdown from source sites
```

## GitHub Pages Deployment

### Setup

1. Push this repo to GitHub
2. Go to **Settings > Pages**
3. Set **Source** to **GitHub Actions**
4. The workflow at `.github/workflows/deploy.yml` will build and deploy on push to `main`

### Expected URL

```
https://<USERNAME>.github.io/yogodemo/
```

### BASE_PATH

The GitHub Actions workflow automatically sets `BASE_PATH=/<repo-name>/` for the build. For local development, the base path defaults to `/`.

To test with a custom base path locally:

```bash
BASE_PATH=/yogodemo/ npm run build
BASE_PATH=/yogodemo/ npm run preview
```

## Commands

| Command | Action |
|---------|--------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server at `localhost:4321` |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview production build locally |
| `npm run ingest` | Re-run content ingestion script |

## Tech Stack

- [Astro](https://astro.build) — Static site generator
- [Tailwind CSS v4](https://tailwindcss.com) — Utility-first CSS
- No backend — contact form uses Formspree (placeholder)
