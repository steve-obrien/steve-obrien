# Steve O'Brien

**Founder, engineer and author building useful intelligence.**

I'm a technical founder and full-stack software engineer based in Bristol, UK. For more than two decades, I've worked across product, architecture and code—turning difficult ideas into useful software, technical systems and companies.

[Website](https://steve-obrien.com) · [Writing](https://steve-obrien.com/articles) · [Projects](https://steve-obrien.com/projects) · [LinkedIn](https://www.linkedin.com/in/stevenaobrien/)

> I’ve always wanted to know how to build anything—and, beneath that, how everything works. No one person can hold the whole of human knowledge, but we can learn its broad strokes, zoom into the areas that fascinate us, and try to nudge its edges forward.

## What I'm working on

- **[GrowthScout](https://growthscout.io)** — AI-powered search intelligence that turns evidence into practical content strategy and action.
- **[DOM Studio](https://getdom.studio)** — a code-first UI system that gives people and AI agents a shared contract for dependable interfaces.
- **Intelligence: Human, Artificial, Future** — a book-in-progress exploring how minds work, how machines think and what neuroscience may reveal about the future of intelligence.
- **[Writing](https://steve-obrien.com/articles)** — practical explorations of AI, language models, software engineering and intelligence.

I previously founded and led [Newicon](https://newicon.net), a product engineering and digital transformation company, for 18 years.

## About this repository

This repository contains the source for [steve-obrien.com](https://steve-obrien.com), my personal website, project archive and home for long-form writing.

The site is statically generated and includes:

- A project portfolio and professional history
- Markdown-based articles with generated routes and metadata
- Light, dark and system themes
- Generated sitemap, robots file and custom 404 page
- Optional publishing and AI theme-generation services

## Built with

- [Vue 3](https://vuejs.org/)
- [Vite](https://vite.dev/) and [Vite SSG](https://github.com/antfu-collective/vite-ssg)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Markdown-It](https://github.com/markdown-it/markdown-it)
- [GitHub Pages](https://pages.github.com/)

## Local development

### Requirements

- Node.js 22
- npm

### Setup

```bash
git clone https://github.com/steve-obrien/steve-obrien.git
cd steve-obrien
npm install
npm run dev
```

### Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Generate the production site in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run getdom:check` | Check vendored DOM Studio files for upstream changes |
| `npm run getdom:sync` | Sync clean component sources from DOM Studio |
| `npm run check:outrank-webhook` | Validate Outrank payload handling |
| `npm run theme-ai-server` | Run the optional AI theme service |
| `npm run check:theme-ai` | Validate the configured AI theme endpoint |

## Article publishing

Articles live in:

```text
src/pages/articles/content/<slug>.md
```

The production build automatically turns them into article pages and updates the article index, route metadata, sitemap and robots file.

### Outrank webhook

The optional webhook receiver accepts authenticated article publishing requests from [Outrank](https://www.outrank.so/docs/webhook):

```bash
OUTRANK_WEBHOOK_ACCESS_TOKEN=your-secret-token npm run outrank-webhook-server
```

It listens on `POST /api/outrank/webhook` by default and also accepts `POST /webhook`.

| Environment variable | Purpose | Default |
| --- | --- | --- |
| `OUTRANK_WEBHOOK_ACCESS_TOKEN` | Required Bearer token | — |
| `OUTRANK_WEBHOOK_PORT` | Local server port | `8790` |
| `OUTRANK_WEBHOOK_PATH` | Webhook endpoint path | `/api/outrank/webhook` |
| `OUTRANK_WEBHOOK_MAX_BODY_BYTES` | Maximum request size | `5242880` |
| `OUTRANK_ARTICLE_CONTENT_DIR` | Markdown output directory | `src/pages/articles/content` |

GitHub Pages cannot receive webhook requests. In production, the receiver must run on a small Node or serverless service with HTTPS, with generated Markdown committed back to this repository for deployment.

## Vendored DOM Studio components

Selected DOM Studio components are committed under `src/vendor/getdom-studio`, following a source-owned model similar to shadcn.

- `getdom.components.json` maps upstream source files to their local destinations.
- `getdom.components.lock.json` records the upstream Git revision and copied-file hashes.
- `npm run getdom:check` reports upstream changes without modifying files.
- `npm run getdom:sync` copies a newer clean version from the sibling DOM Studio checkout.

The sync protects both sides: it refuses to copy uncommitted upstream files or overwrite locally modified vendored files. Use `--force` only when intentionally discarding local changes:

```bash
npm run getdom:sync -- --force
```

If DOM Studio is not available at `../getdom.studio`, set `GETDOM_STUDIO_DIR` to its absolute path.

## Deployment

Every push to `main` runs the GitHub Actions workflow in `.github/workflows/deploy.yml`.

The workflow:

1. Installs dependencies with Node.js 22.
2. builds the static site and SEO files.
3. uploads the contents of `dist/`.
4. deploys them to GitHub Pages at [steve-obrien.com](https://steve-obrien.com).
