import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';

const prefix = '/__brain-book/';
const statuses = new Set(['seed', 'outline', 'draft', 'review', 'complete']);

/** Reads a bounded JSON body from the local authoring client. */
async function readJsonBody(request) {
	let body = '';
	for await (const chunk of request) {
		body += chunk;
		if (Buffer.byteLength(body) > 1_000_000) throw new Error('Editor payload is too large.');
	}
	return JSON.parse(body);
}

/** Sends a non-cacheable JSON response from the local file editor. */
function sendJson(response, status, payload) {
	response.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
	response.end(JSON.stringify(payload));
}

/** Validates editable chapter metadata before it reaches the canonical YAML file. */
function validateChapter(chapter) {
	if (typeof chapter?.title !== 'string' || !chapter.title.trim()
		|| typeof chapter.question !== 'string' || !statuses.has(chapter.status)
		|| !Number.isInteger(chapter.wordTarget) || chapter.wordTarget < 100) {
		throw new Error('Chapters need a title, question, valid status, and word target of at least 100.');
	}
}

/**
 * Checks a contents edit retains every existing part and chapter exactly once.
 * Slugs and numbers are stable identifiers; new chapters are added in the source files.
 */
function validateParts(parts, currentParts) {
	if (!Array.isArray(parts) || parts.length !== currentParts.length) throw new Error('Keep all existing book parts.');
	const partNumbers = new Set();
	const slugs = new Set();
	const currentChapters = currentParts.flatMap((part) => part.chapters);
	for (const part of parts) {
		if (!currentParts.some((current) => current.number === part.number) || partNumbers.has(part.number)
			|| typeof part.title !== 'string' || !part.title.trim() || typeof part.description !== 'string'
			|| !Array.isArray(part.chapters)) throw new Error('Invalid or duplicate book part.');
		partNumbers.add(part.number);
		for (const chapter of part.chapters) {
			const current = currentChapters.find((item) => item.slug === chapter.slug);
			if (!current || current.number !== chapter.number || slugs.has(chapter.slug)) throw new Error('Invalid or duplicate chapter.');
			validateChapter(chapter);
			slugs.add(chapter.slug);
		}
	}
	if (slugs.size !== currentChapters.length) throw new Error('Keep all existing chapters.');
}

/** Writes the book structure while retaining its title and other top-level metadata. */
async function writeBook(bookPath, book) {
	await writeFile(bookPath, yaml.dump(book, { indent: 2, lineWidth: 110, noRefs: true }), 'utf8');
}

/**
 * Adds local Markdown/YAML editing to Vite's development server only.
 * Preview and production builds never register these filesystem endpoints.
 *
 * @param {{ bookDirectory?: string }} options Optional fixture directory for integration tests.
 * @returns {import('vite').Plugin} The local authoring plugin.
 */
export function brainBookEditor({ bookDirectory } = {}) {
	return {
		name: 'brain-book-editor',
		apply: 'serve',
		/** Registers authoring routes against this project's canonical book folder. */
		configureServer(server) {
			const directory = bookDirectory ?? path.join(server.config.root, 'brain-book');
			const bookPath = path.join(directory, 'book.yml');
			/** Persists validated local edits without exposing a cross-origin file writer. */
			server.middlewares.use(async function handleBookEdit(request, response, next) {
				if (!request.url?.startsWith(prefix)) return next();
				if (request.method !== 'POST') return sendJson(response, 405, { error: 'Use POST to save an edit.' });
				if (!request.headers['content-type']?.startsWith('application/json')) {
					return sendJson(response, 415, { error: 'Send application/json.' });
				}
				if (request.headers.origin && request.headers.origin !== `http://${request.headers.host}`
					&& request.headers.origin !== `https://${request.headers.host}`) {
					return sendJson(response, 403, { error: 'Save edits from this local site.' });
				}
				try {
					const chapterRoute = request.url.match(/^\/__brain-book\/chapter\/([a-z0-9-]+)$/);
					if (request.url !== `${prefix}book` && !chapterRoute) return sendJson(response, 404, { error: 'Unknown editor route.' });
					const payload = await readJsonBody(request);
					const current = yaml.load(await readFile(bookPath, 'utf8'));
					if (request.url === `${prefix}book`) {
						validateParts(payload.parts, current.parts);
						await writeBook(bookPath, { ...current, parts: payload.parts });
					} else {
						const slug = chapterRoute[1];
						const chapter = current.parts.flatMap((part) => part.chapters).find((item) => item.slug === slug);
						if (!chapter) return sendJson(response, 404, { error: 'Unknown chapter.' });
						if (typeof payload.content !== 'string' || typeof payload.guide !== 'string') throw new Error('Manuscript and guide must be text.');
						validateChapter(payload.details);
						const { title, question, status, wordTarget } = payload.details;
						Object.assign(chapter, { title, question, status, wordTarget });
						const guide = payload.guide.trim();
						if (guide.includes('-->')) throw new Error('Guide notes cannot contain a closing HTML comment.');
						const markdown = [guide ? `<!-- book-guide\n${guide}\n-->` : '', payload.content.trim()].filter(Boolean).join('\n\n') + '\n';
						await writeFile(path.join(directory, 'chapters', `${slug}.md`), markdown, 'utf8');
						await writeBook(bookPath, current);
					}
					sendJson(response, 200, { saved: true });
				} catch (error) {
					sendJson(response, 400, { error: error.message });
				}
			});
		},
	};
}
