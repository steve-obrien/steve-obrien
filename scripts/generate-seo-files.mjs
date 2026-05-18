// This is a crappy AI gen script - ideally replace with something better.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { loadStaticRoutes } from './lib/load-routes.mjs';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const cnamePath = path.join(rootDir, 'CNAME');
const siteName = "Steve O'Brien";

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

const getPageMeta = (routePath) => {
	if (routePath === '/') {
		return {
			title: `About | ${siteName}`,
			description: 'About Steve O’Brien: engineer, founder, and builder of practical AI and software systems.',
		};
	}

	if (routePath === '/projects') {
		return {
			title: `Projects | ${siteName}`,
			description: 'Selected projects and products by Steve O’Brien, including software, experiments, and open work.',
		};
	}

	if (routePath === '/experiments') {
		return {
			title: `Experiments | ${siteName}`,
			description: 'Current experiments and prototypes Steve is exploring across AI, developer tools, and product design.',
		};
	}

	if (routePath === '/ideas') {
		return {
			title: `Ideas | ${siteName}`,
			description: 'Notes and early ideas Steve is thinking through before they become concrete projects.',
		};
	}

	const sectionName = routePath.replace(/^\//, '').replace(/-/g, ' ');
	const humanLabel = sectionName.charAt(0).toUpperCase() + sectionName.slice(1);
	return {
		title: `${humanLabel} | ${siteName}`,
		description: `${humanLabel} by ${siteName}.`,
	};
};

const injectMetaIntoPage = async (siteUrl, routePath) => {
	const fileName = routePath === '/' ? 'index.html' : `${routePath.replace(/^\//, '')}.html`;
	const filePath = path.join(distDir, fileName);
	const canonicalUrl = routePath === '/' ? siteUrl : `${siteUrl}${routePath}`;
	const { title, description } = getPageMeta(routePath);

	let html;
	try {
		html = await readFile(filePath, 'utf8');
	} catch {
		return;
	}
	html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
	html = html.replace(/<meta name="description"[\s\S]*?>/gi, '');
	html = html.replace(/<meta property="og:[^"]+"[\s\S]*?>/gi, '');
	html = html.replace(/<meta name="twitter:[^"]+"[\s\S]*?>/gi, '');
	html = html.replace(/<link rel="canonical"[\s\S]*?>/gi, '');

	const metaBlock = [
		`<meta name="description" content="${description}">`,
		`<link rel="canonical" href="${canonicalUrl}">`,
		'<meta property="og:type" content="website">',
		`<meta property="og:site_name" content="${siteName}">`,
		`<meta property="og:title" content="${title}">`,
		`<meta property="og:description" content="${description}">`,
		`<meta property="og:url" content="${canonicalUrl}">`,
		'<meta name="twitter:card" content="summary">',
		`<meta name="twitter:title" content="${title}">`,
		`<meta name="twitter:description" content="${description}">`,
	].join('\n\t\t');

	html = html.replace('</head>', `\t\t${metaBlock}\n\t</head>`);
	await writeFile(filePath, html, 'utf8');
};

const main = async () => {
	await mkdir(distDir, { recursive: true });
	const siteUrl = await readSiteUrl();
	const routes = await loadStaticRoutes();

	await writeFile(path.join(distDir, 'sitemap.xml'), `${buildSitemap(siteUrl, routes)}\n`, 'utf8');
	await writeFile(path.join(distDir, 'robots.txt'), `${buildRobots(siteUrl)}\n`, 'utf8');
	await Promise.all(routes.map((routePath) => injectMetaIntoPage(siteUrl, routePath)));

	console.log(`Generated sitemap.xml, robots.txt, and page metadata for ${siteUrl} (${routes.length} routes)`);
};

await main();
