import { readdir } from 'node:fs/promises';
import path from 'node:path';

/**
 * Recursively list Markdown article files relative to the content directory.
 *
 * @param {string} directory - Absolute directory currently being inspected.
 * @param {string} [relativeDirectory=''] - Relative directory accumulated so far.
 * @returns {Promise<string[]>} Relative Markdown paths using platform separators.
 */
export async function listArticleFiles(directory, relativeDirectory = '') {
	const entries = await readdir(path.join(directory, relativeDirectory), {
		withFileTypes: true,
	});
	const files = [];

	for (const entry of entries) {
		if (entry.name.startsWith('.')) continue;
		const relativePath = path.join(relativeDirectory, entry.name);
		if (entry.isDirectory()) {
			files.push(...await listArticleFiles(directory, relativePath));
			continue;
		}
		if (entry.isFile() && entry.name.endsWith('.md')) {
			files.push(relativePath);
		}
	}

	return files.sort();
}

/**
 * Convert a relative Markdown path into its default nested article slug.
 *
 * @param {string} relativePath - Markdown path relative to article content.
 * @returns {string} URL slug with forward-slash directory separators.
 */
export function articleSlugFromRelativePath(relativePath) {
	return relativePath
		.split(path.sep)
		.join('/')
		.replace(/\.md$/i, '');
}

/**
 * Read one simple scalar value from an article's opening frontmatter block.
 *
 * @param {string} raw - Complete Markdown file contents.
 * @param {string} key - Exact frontmatter key to locate.
 * @returns {string} Unquoted scalar value, or an empty string when absent.
 */
export function articleFrontmatterValue(raw, key) {
	const frontmatter = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
	if (!frontmatter) return '';

	for (const line of frontmatter[1].split(/\r?\n/)) {
		const separator = line.indexOf(':');
		if (separator === -1 || line.slice(0, separator).trim() !== key) continue;
		return line
			.slice(separator + 1)
			.trim()
			.replace(/^['"]|['"]$/g, '');
	}

	return '';
}
