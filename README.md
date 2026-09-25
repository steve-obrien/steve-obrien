# Steve O'Brien

**Founder, engineer and author building useful intelligence.**

I'm a technical founder and full-stack software engineer based in Bristol, UK. For more than two decades, I've worked across product, architecture and code—turning difficult ideas into useful software, technical systems and companies.

[Website](https://steve-obrien.com) · [Writing](https://steve-obrien.com/articles) · [Projects](https://steve-obrien.com/projects) · [LinkedIn](https://www.linkedin.com/in/stevenaobrien/)

> I’ve always wanted to know how to build anything. And, beneath that, how everything works. No one person can hold the whole of human knowledge, but we can learn its broad strokes, zoom into the areas that fascinate us, and try to nudge the edges forward.

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

This app reserves local ports **8200–8299**: Vite `8200`, optional theme API
`8201`, preview `8202`, and optional Outrank webhook `8203`. The theme endpoint
also runs inside Vite during normal development. Caddy serves the frontend at
`https://local.steve-obrien.com`. Dev and preview fail if their port is occupied.
See `~/Sites/PORTS.md` for the shared allocation register.

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

Use the [tone-of-voice guide](docs/tone-of-voice.md) for website copy, articles, daily work notes and weekly reviews.

Articles live in:

```text
src/pages/articles/content/<slug>.md
```

The production build automatically turns them into article pages and updates the article index, route metadata, sitemap and robots file.

## Deployment

Every push to `main` runs the GitHub Actions workflow in `.github/workflows/deploy.yml`.

The workflow:

1. Installs dependencies with Node.js 22.
2. builds the static site and SEO files.
3. uploads the contents of `dist/`.
4. deploys them to GitHub Pages at [steve-obrien.com](https://steve-obrien.com).


## Brain Book (local development only)

Open <https://local.steve-obrien.com/brain-book> while `npm run dev` is running.
It shares port **8200** with the personal site. Chapters, contents and the local
editor use their own book layout within the existing router.

- `brain-book/book.yml`: canonical parts, ordering, headings and planning metadata.
- `brain-book/chapters/*.md`: canonical manuscript and private guide notes.
- `brain-book/README.md`: authoring instructions.
- `src/brain-book/`: book reader and editor UI.
- `scripts/brain-book-editor.mjs`: development-only file-saving endpoints.

The entire book is excluded from production builds and previews, including
Markdown, guide notes, editor code, routes and sitemap entries. `npm run build`
checks this automatically. `npm run test:brain-book` verifies editor saves and
validation using disposable copies of the manuscript.

The old `~/Sites/brainbook` folder is retained as a backup. Its npm commands now
use this project; port 8400 and the separate book hostname are retired.
