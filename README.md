## Steve O'Brien Personal Site

Static personal website built with Vue 3, Vite SSG, and Tailwind CSS v4.

### Local development

```bash
npm install
npm run dev
```

### Build static output

```bash
npm run build
```

Build artifacts are generated in `dist/`.
The build also generates `dist/sitemap.xml` and `dist/robots.txt`.

### Outrank webhook publishing

Outrank can publish and update articles by POSTing to a webhook endpoint with `Authorization: Bearer <token>` as described in the [Outrank webhook docs](https://www.outrank.so/docs/webhook).

Run the local receiver:

```bash
OUTRANK_WEBHOOK_ACCESS_TOKEN=your-secret-token npm run outrank-webhook-server
```

By default it listens on `POST /api/outrank/webhook` and also accepts `POST /webhook`. It writes articles to `src/pages/articles/content/<slug>.md`, so the existing Vite SSG build automatically creates the article index, detail pages, sitemap, and SEO metadata.

Environment variables:

- `OUTRANK_WEBHOOK_ACCESS_TOKEN`: required Bearer token configured in Outrank.
- `OUTRANK_WEBHOOK_PORT`: optional local server port, default `8790`.
- `OUTRANK_WEBHOOK_PATH`: optional endpoint path, default `/api/outrank/webhook`.
- `OUTRANK_WEBHOOK_MAX_BODY_BYTES`: optional request size limit, default `5242880`.
- `OUTRANK_ARTICLE_CONTENT_DIR`: optional markdown output directory, default `src/pages/articles/content`.

GitHub Pages cannot host POST webhook endpoints. For production, host `scripts/outrank-webhook-server.mjs` on a small Node service or serverless platform with HTTPS, then commit/push the generated markdown files back to this repository so the Pages workflow deploys the updated static site.

Validate the payload handling without changing real articles:

```bash
npm run check:outrank-webhook
```

### Deploy to GitHub Pages

Push to `main` to trigger `.github/workflows/deploy.yml`.
The workflow builds the site and deploys the static `dist/` artifacts to GitHub Pages.
GitHub Pages also serves `public/404.html` as the custom not found page.
