import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ARTICLE_CONTENT_DIR = path.join('src', 'pages', 'articles', 'content');

export class OutrankWebhookError extends Error {
	constructor(message, status = 400) {
		super(message);
		this.name = 'OutrankWebhookError';
		this.status = status;
	}
}

export function defaultArticleContentDir(rootDir = process.cwd()) {
	return path.resolve(rootDir, ARTICLE_CONTENT_DIR);
}

export async function handleOutrankWebhookPayload(payload, options = {}) {
	const eventType = payload?.event_type;
	const fallbackDate = isoDate(payload?.timestamp) || isoDate(new Date());

	if (eventType === 'publish_articles') {
		const articles = payload?.data?.articles;
		if (!Array.isArray(articles)) {
			throw new OutrankWebhookError('publish_articles payload must include data.articles.');
		}

		return {
			eventType,
			...(await upsertOutrankArticles(articles, {
				...options,
				fallbackDate,
			})),
		};
	}

	if (eventType === 'update_article') {
		const article = payload?.data?.article;
		if (!isRecord(article)) {
			throw new OutrankWebhookError('update_article payload must include data.article.');
		}

		return {
			eventType,
			...(await upsertOutrankArticles([article], {
				...options,
				fallbackDate,
			})),
		};
	}

	throw new OutrankWebhookError(`Unsupported Outrank event_type: ${eventType || 'missing'}.`);
}

export async function upsertOutrankArticles(articles, options = {}) {
	const contentDir = path.resolve(options.contentDir || defaultArticleContentDir());
	await mkdir(contentDir, { recursive: true });

	const results = [];
	for (const article of articles) {
		const result = await upsertOutrankArticle(article, {
			contentDir,
			fallbackDate: options.fallbackDate || isoDate(new Date()),
		});
		results.push(result);
	}

	return {
		articles: results,
		count: results.length,
	};
}

async function upsertOutrankArticle(article, { contentDir, fallbackDate }) {
	if (!isRecord(article)) {
		throw new OutrankWebhookError('Article payload must be an object.');
	}

	const slug = normaliseSlug(article.slug || article.title || article.id);
	if (!slug) {
		throw new OutrankWebhookError('Article payload must include a slug, title, or id.');
	}

	const filePath = path.join(contentDir, `${slug}.md`);
	const existing = await readOptionalFile(filePath);
	const existingMeta = parseFrontmatter(existing);
	const markdown = articleToMarkdown(article, {
		slug,
		existingMeta,
		fallbackDate,
	});

	await writeFile(filePath, markdown, 'utf8');

	return {
		slug,
		filePath,
		action: existing ? 'updated' : 'created',
	};
}

export function articleToMarkdown(article, options = {}) {
	const slug = options.slug || normaliseSlug(article.slug || article.title || article.id);
	const existingMeta = options.existingMeta || {};
	const fallbackDate = options.fallbackDate || isoDate(new Date());
	const title = cleanInlineText(article.title) || cleanInlineText(existingMeta.title) || slug.replace(/-/g, ' ');
	const description = cleanInlineText(article.meta_description)
		|| cleanInlineText(article.metaDescription)
		|| cleanInlineText(existingMeta.description)
		|| cleanInlineText(existingMeta.metaDescription)
		|| '';
	const date = isoDate(article.created_at)
		|| isoDate(article.createdAt)
		|| isoDate(existingMeta.date)
		|| fallbackDate;
	const tags = normaliseStringList(article.tags);
	const imageUrl = cleanInlineText(article.image_url)
		|| cleanInlineText(article.imageUrl)
		|| cleanInlineText(existingMeta.imageUrl)
		|| '';
	const outrankId = cleanInlineText(article.id) || cleanInlineText(existingMeta.outrankId) || '';
	const body = normaliseBody(article.content_markdown || article.contentMarkdown || '');

	if (!body) {
		throw new OutrankWebhookError(`Article "${slug}" is missing content_markdown.`);
	}

	const frontmatter = [
		['title', title],
		['description', description],
		['date', date],
		['tags', tags],
		['metaDescription', description],
		['metaKeywords', tags],
		['imageUrl', imageUrl],
		['outrankId', outrankId],
	]
		.filter(([, value]) => value !== '' && (!Array.isArray(value) || value.length > 0))
		.map(([key, value]) => `${key}: ${formatFrontmatterValue(value)}`);

	return [
		'---',
		...frontmatter,
		'---',
		'',
		body,
		'',
	].join('\n');
}

export function normaliseSlug(value) {
	return String(value || '')
		.trim()
		.toLowerCase()
		.replace(/['"]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.replace(/-{2,}/g, '-');
}

function parseFrontmatter(raw) {
	if (!raw) return {};
	const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
	if (!match) return {};

	const meta = {};
	for (const line of match[1].split(/\r?\n/)) {
		const separator = line.indexOf(':');
		if (separator === -1) continue;
		const key = line.slice(0, separator).trim();
		const value = line.slice(separator + 1).trim();
		if (!key) continue;
		meta[key] = parseFrontmatterValue(value);
	}
	return meta;
}

function parseFrontmatterValue(value) {
	const trimmed = value.trim();
	if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
		return trimmed
			.slice(1, -1)
			.split(',')
			.map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
			.filter(Boolean);
	}
	return trimmed.replace(/^['"]|['"]$/g, '');
}

function formatFrontmatterValue(value) {
	if (Array.isArray(value)) {
		return `[${value.map((item) => quoteListItem(item)).join(', ')}]`;
	}

	return cleanInlineText(value);
}

function quoteListItem(value) {
	return JSON.stringify(cleanInlineText(value));
}

function normaliseStringList(value) {
	if (!Array.isArray(value)) return [];
	return value
		.map((item) => cleanInlineText(item))
		.filter(Boolean);
}

function cleanInlineText(value) {
	return String(value || '')
		.replace(/\r?\n/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function normaliseBody(value) {
	return String(value || '')
		.replace(/\r\n/g, '\n')
		.trim();
}

function isoDate(value) {
	if (!value) return '';
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) return '';
	return date.toISOString().slice(0, 10);
}

function isRecord(value) {
	return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

async function readOptionalFile(filePath) {
	try {
		return await readFile(filePath, 'utf8');
	} catch (error) {
		if (error.code === 'ENOENT') return '';
		throw error;
	}
}
