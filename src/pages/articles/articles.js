const articleModules = import.meta.glob('./content/*.md', {
	query: '?raw',
	import: 'default',
	eager: true,
});

const WORDS_PER_MINUTE = 220;

/**
 * Build the default URL slug from the markdown filename.
 *
 * Authors can override this with `slug:` in frontmatter, but the filename is
 * the simplest convention for most articles.
 *
 * @param {string} path - Vite glob path for a markdown content file.
 * @returns {string} URL-safe slug without the `.md` extension.
 */
function slugFromPath(path) {
	return path
		.split('/')
		.pop()
		.replace(/\.md$/i, '');
}

/**
 * Parse the small frontmatter value shapes this site needs.
 *
 * This intentionally stays tiny rather than adding a YAML dependency. It
 * supports strings, booleans, numbers, and simple comma-separated arrays like
 * `tags: [AI, Vue, Writing]`.
 *
 * @param {string} value - Raw value from the right-hand side of a frontmatter field.
 * @returns {string | number | boolean | string[]} Parsed metadata value.
 */
function parseValue(value) {
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
}

function normaliseStringList(value) {
	if (Array.isArray(value)) {
		return value.map((item) => String(item).trim()).filter(Boolean);
	}

	if (typeof value !== 'string') return [];

	return value
		.split(',')
		.map((item) => item.trim())
		.filter(Boolean);
}

/**
 * Split markdown into frontmatter metadata and article body content.
 *
 * The parser expects frontmatter to be the first block in the file:
 *
 * ```
 * ---
 * title: Example
 * date: 2026-05-26
 * ---
 * ```
 *
 * @param {string} raw - Full raw markdown file content.
 * @returns {{ meta: Record<string, unknown>, body: string }} Parsed metadata and markdown body.
 */
function parseFrontmatter(raw) {
	const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
	if (!match) {
		return {
			meta: {},
			body: raw.trim(),
		};
	}

	const meta = {};
	for (const line of match[1].split(/\r?\n/)) {
		const separator = line.indexOf(':');
		if (separator === -1) continue;
		const key = line.slice(0, separator).trim();
		const value = line.slice(separator + 1).trim();
		if (!key) continue;
		meta[key] = parseValue(value);
	}

	return {
		meta,
		body: raw.slice(match[0].length).trim(),
	};
}

/**
 * Remove markdown constructs that should not count as prose reading time.
 *
 * Code examples and Vue component directives can be visually substantial, but
 * they are not read like paragraphs. This keeps estimates closer to the actual
 * long-form writing in the article.
 *
 * @param {string} body - Raw markdown body without frontmatter.
 * @returns {string} Markdown body reduced to countable prose.
 */
function proseForReadingTime(body) {
	return body
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/~~~[\s\S]*?~~~/g, ' ')
		.replace(/^::[A-Z][\w]*(?:\{[^}]*\})?\s*$/gm, ' ')
		.replace(/^::component\s*\{[^}]*\}\s*$/gim, ' ')
		.replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
		.replace(/\[[^\]]+]\([^)]+\)/g, '$1')
		.replace(/[#>*_`~|[\](){}:.,;!?-]/g, ' ');
}

/**
 * Estimate reading time from article prose.
 *
 * @param {string} body - Raw markdown body without frontmatter.
 * @returns {string} Human-readable reading time label.
 */
function calculateReadingTime(body) {
	const words = proseForReadingTime(body)
		.trim()
		.split(/\s+/)
		.filter(Boolean);
	const minutes = Math.max(1, Math.ceil(words.length / WORDS_PER_MINUTE));
	return `${minutes} min read`;
}

/**
 * Convert one markdown file into the article shape used by routes and views.
 *
 * The `body` keeps markdown untouched so `MarkdownArticle.vue` can render prose
 * and mount registered Vue component directives later in the page lifecycle.
 *
 * @param {string} path - Vite glob path for the markdown file.
 * @param {string} raw - Raw markdown file content.
 * @returns {{
 * 	slug: string,
 * 	title: string,
 * 	description: string,
 * 	metaDescription: string,
 * 	metaKeywords: string[],
 * 	date: string,
 * 	readingTime: string,
 * 	tags: string[],
 * 	body: string
 * }} Normalised article record.
 */
function normaliseArticle(path, raw) {
	const { meta, body } = parseFrontmatter(raw);
	const slug = meta.slug || slugFromPath(path);
	const description = meta.description || '';
	const metaDescription = meta.metaDescription
		|| meta.meta_description
		|| meta['meta-description']
		|| description;
	const metaKeywords = meta.metaKeywords
		|| meta.meta_keywords
		|| meta['meta-keywords']
		|| meta.keywords;

	return {
		slug,
		title: meta.title || slug.replace(/-/g, ' '),
		description,
		metaDescription,
		metaKeywords: normaliseStringList(metaKeywords),
		date: meta.date || '',
		readingTime: calculateReadingTime(body),
		tags: Array.isArray(meta.tags) ? meta.tags : [],
		body,
	};
}

/**
 * All articles, newest first.
 *
 * Adding another `.md` file under `content/` automatically updates the index,
 * detail route list, and static build output. Articles are ordered by the
 * frontmatter `date` field in descending order.
 */
export const articles = Object.entries(articleModules)
	.map(([path, raw]) => normaliseArticle(path, raw))
	.sort((a, b) => String(b.date).localeCompare(String(a.date)));

/**
 * Find an article for the current route slug.
 *
 * @param {string} slug - Article slug from `/articles/:slug`.
 * @returns {ReturnType<typeof normaliseArticle> | undefined} Matching article, when present.
 */
export function getArticle(slug) {
	return articles.find((article) => article.slug === slug);
}
