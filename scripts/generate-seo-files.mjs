import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const cnamePath = path.join(rootDir, 'CNAME');
const routesFilePath = path.join(rootDir, 'src', 'routes.js');
const pagesDirPath = path.join(rootDir, 'src', 'pages');

const readSiteUrl = async () => {
	try {
		const cname = (await readFile(cnamePath, 'utf8')).trim();
		if (!cname) {
			throw new Error('CNAME file is empty');
		}
		return `https://${cname}`;
	} catch {
		return 'https://steve-obrien.com';
	}
};

const toPathFromPageFile = (fileName) => {
	const baseName = fileName.replace(/\.vue$/i, '');
	if (baseName === 'AboutPage') {
		return '/';
	}
	const slug = baseName
		.replace(/Page$/i, '')
		.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
		.toLowerCase();
	return `/${slug}`;
};

const loadRoutesFromRoutesFile = async () => {
	const routesFile = await readFile(routesFilePath, 'utf8');
	const matches = [...routesFile.matchAll(/path:\s*['"`]([^'"`]+)['"`]/g)];
	const routePaths = matches
		.map((match) => match[1]?.trim())
		.filter(Boolean)
		.filter((routePath) => routePath.startsWith('/'));

	return [...new Set(routePaths)];
};

const loadRoutesFromPagesDirectory = async () => {
	const files = await readdir(pagesDirPath);
	const pageFiles = files.filter((file) => file.endsWith('.vue'));
	const routePaths = pageFiles.map(toPathFromPageFile);
	return [...new Set(routePaths)];
};

const loadRoutes = async () => {
	try {
		const routes = await loadRoutesFromRoutesFile();
		if (routes.length > 0) {
			return routes;
		}
	} catch {
		// Fall back to inferring route paths from page component filenames.
	}

	return loadRoutesFromPagesDirectory();
};

const buildSitemap = (siteUrl, routes) => {
	const now = new Date().toISOString();
	const urlEntries = routes
		.map((route) => {
			const location = route === '/' ? siteUrl : `${siteUrl}${route}`;
			return [
				'\t<url>',
				`\t\t<loc>${location}</loc>`,
				`\t\t<lastmod>${now}</lastmod>`,
				'\t\t<changefreq>weekly</changefreq>',
				'\t\t<priority>0.8</priority>',
				'\t</url>',
			].join('\n');
		})
		.join('\n');

	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
		urlEntries,
		'</urlset>',
	].join('\n');
};

const buildRobots = (siteUrl) => {
	return [
		'User-agent: *',
		'Allow: /',
		'',
		`Sitemap: ${siteUrl}/sitemap.xml`,
	].join('\n');
};

const main = async () => {
	await mkdir(distDir, { recursive: true });
	const siteUrl = await readSiteUrl();
	const routes = await loadRoutes();

	await writeFile(path.join(distDir, 'sitemap.xml'), `${buildSitemap(siteUrl, routes)}\n`, 'utf8');
	await writeFile(path.join(distDir, 'robots.txt'), `${buildRobots(siteUrl)}\n`, 'utf8');

	console.log(`Generated sitemap.xml and robots.txt for ${siteUrl} (${routes.length} routes)`);
};

await main();
