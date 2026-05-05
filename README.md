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

### Deploy to GitHub Pages

Push to `main` to trigger `.github/workflows/deploy.yml`.
The workflow builds the site and deploys the static `dist/` artifacts to GitHub Pages.
GitHub Pages also serves `public/404.html` as the custom not found page.
