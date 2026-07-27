// This is a crappy AI gen script - ideally replace with something better.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { loadStaticRoutes } from './lib/load-routes.mjs';
import { articleSlugFromRelativePath, listArticleFiles } from './lib/article-files.mjs';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const cnamePath = path.join(rootDir, 'CNAME');
const articleContentDir = path.join(rootDir, 'src', 'pages', 'articles', 'content');
const siteName = "Steve O'Brien";
let articleMetaByRoute = new Map();

const escapeHtml = (value) => String(value)
	.replace(/&/g, '&amp;')
	.replace(/</g, '&lt;')
	.replace(/>/g, '&gt;')
	.replace(/"/g, '&quot;')
	.replace(/'/g, '&#39;');

const parseValue = (value) => {
	const trimmed = value.trim();
	if (trimmed === 'true') return true;
	if (trimmed === 'false') return false;
	if (/^\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
	if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
		return trimmed
			.slice(1, -1)
			.split(',')
			.map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
			.filter(Boolean);
	}
	return trimmed.replace(/^['"]|['"]$/g, '');
};

const normaliseStringList = (value) => {
	if (Array.isArray(value)) {
		return value.map((item) => String(item).trim()).filter(Boolean);
	}

	if (typeof value !== 'string') return [];

	return value
		.split(',')
		.map((item) => item.trim())
		.filter(Boolean);
};

const parseFrontmatter = (raw) => {
	const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
	if (!match) return {};

	const meta = {};
	for (const line of match[1].split(/\r?\n/)) {
		const separator = line.indexOf(':');
		if (separator === -1) continue;
		const key = line.slice(0, separator).trim();
		const value = line.slice(separator + 1).trim();
		if (!key) continue;
		meta[key] = parseValue(value);
	}

	return meta;
};

const loadArticleMeta = async () => {
	const metaByRoute = new Map();

	try {
		const files = await listArticleFiles(articleContentDir);
		for (const file of files) {
			const filePath = path.join(articleContentDir, file);
			const raw = await readFile(filePath, 'utf8');
			const meta = parseFrontmatter(raw);
			if (meta.status !== 'published') continue;
			const slug = meta.slug || articleSlugFromRelativePath(file);
			const title = meta.title || String(slug).replace(/-/g, ' ');
			const description = meta.metaDescription
				|| meta.meta_description
				|| meta['meta-description']
				|| meta.description
				|| `${title} by ${siteName}.`;
			const keywords = meta.metaKeywords
				|| meta.meta_keywords
				|| meta['meta-keywords']
				|| meta.keywords;
			const image = meta.imageUrl
				|| meta.image_url
				|| meta['image-url']
				|| meta.image;

			metaByRoute.set(`/articles/${slug}`, {
				title: `${title} | ${siteName}`,
				description,
				keywords: normaliseStringList(keywords),
				image,
			});
		}
	} catch {
		return metaByRoute;
	}

	return metaByRoute;
};

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

const toAbsoluteUrl = (siteUrl, value) => {
	if (!value) return '';
	const text = String(value).trim();
	if (/^https?:\/\//i.test(text)) return text;
	if (text.startsWith('/')) return `${siteUrl}${text}`;
	return `${siteUrl}/${text}`;
};

const getPageMeta = (routePath) => {
	const articleMeta = articleMetaByRoute.get(routePath);
	if (articleMeta) return articleMeta;

	if (routePath === '/') {
		return {
			title: "Steve O'Brien | Engineer, Founder, Practical AI Systems",
			description: 'Engineer, founder, and fractional CTO helping founders and technical teams turn ambiguous AI ideas into testable products and scalable software systems.',
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

	if (routePath === '/articles') {
		return {
			title: `Articles | ${siteName}`,
			description: 'Long-form articles by Steve O’Brien on software, AI, and building useful systems.',
		};
	}

	if (routePath === '/news') {
		return {
			title: `News | ${siteName}`,
			description: 'A daily feed of AI research, brain science, software engineering, and agentic systems Steve is tracking.',
		};
	}

	if (routePath.startsWith('/news/')) {
		return {
			title: `News summary | ${siteName}`,
			description: 'Generated reading notes from Steve’s daily AI, neuroscience, software engineering, and agentic systems feed.',
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
	const { title, description, keywords, image } = getPageMeta(routePath);
	const keywordContent = normaliseStringList(keywords).join(', ');
	const imageUrl = toAbsoluteUrl(siteUrl, image);

	let html;
	try {
		html = await readFile(filePath, 'utf8');
	} catch {
		return;
	}
	html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
	html = html.replace(/<meta name="description"[\s\S]*?>/gi, '');
	html = html.replace(/<meta name="keywords"[\s\S]*?>/gi, '');
	html = html.replace(/<meta property="og:[^"]+"[\s\S]*?>/gi, '');
	html = html.replace(/<meta name="twitter:[^"]+"[\s\S]*?>/gi, '');
	html = html.replace(/<link rel="canonical"[\s\S]*?>/gi, '');

	const metaBlock = [
		`<meta name="description" content="${escapeHtml(description)}">`,
		keywordContent ? `<meta name="keywords" content="${escapeHtml(keywordContent)}">` : '',
		`<link rel="canonical" href="${escapeHtml(canonicalUrl)}">`,
		'<meta property="og:type" content="website">',
		`<meta property="og:site_name" content="${escapeHtml(siteName)}">`,
		`<meta property="og:title" content="${escapeHtml(title)}">`,
		`<meta property="og:description" content="${escapeHtml(description)}">`,
		`<meta property="og:url" content="${escapeHtml(canonicalUrl)}">`,
		imageUrl ? `<meta property="og:image" content="${escapeHtml(imageUrl)}">` : '',
		`<meta name="twitter:card" content="${imageUrl ? 'summary_large_image' : 'summary'}">`,
		`<meta name="twitter:title" content="${escapeHtml(title)}">`,
		`<meta name="twitter:description" content="${escapeHtml(description)}">`,
		imageUrl ? `<meta name="twitter:image" content="${escapeHtml(imageUrl)}">` : '',
	].filter(Boolean).join('\n\t\t');

	html = html.replace('</head>', `\t\t${metaBlock}\n\t</head>`);
	await writeFile(filePath, html, 'utf8');
};

const main = async () => {
	await mkdir(distDir, { recursive: true });
	const siteUrl = await readSiteUrl();
	const routes = await loadStaticRoutes();
	articleMetaByRoute = await loadArticleMeta();

	await writeFile(path.join(distDir, 'sitemap.xml'), `${buildSitemap(siteUrl, routes)}\n`, 'utf8');
	await writeFile(path.join(distDir, 'robots.txt'), `${buildRobots(siteUrl)}\n`, 'utf8');
	await Promise.all(routes.map((routePath) => injectMetaIntoPage(siteUrl, routePath)));

	console.log(`Generated sitemap.xml, robots.txt, and page metadata for ${siteUrl} (${routes.length} routes)`);
};

await main();
