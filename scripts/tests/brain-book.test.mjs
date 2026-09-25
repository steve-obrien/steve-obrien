import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import { createServer } from 'node:http';
import { cp, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import yaml from 'js-yaml';
import { brainBookEditor } from '../brain-book-editor.mjs';
import { loadStaticRoutes } from '../lib/load-routes.mjs';
import { manuscriptMarkdown, renderMarkdown } from '../../src/brain-book/lib/markdown.js';
import { chapterDocumentExtensions, chapterDocumentHtml } from '../../src/brain-book/lib/document.js';
import { getSchema, Node } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';

let fixture;
let server;
let origin;

/** Exercises the actual HTTP middleware against disposable copies of the manuscript. */
beforeEach(async () => {
	fixture = await mkdtemp(path.join(tmpdir(), 'brain-book-test-'));
	await cp('brain-book', fixture, { recursive: true });
	const plugin = brainBookEditor({ bookDirectory: fixture });
	assert.equal(plugin.apply, 'serve');
	assert.equal(plugin.configurePreviewServer, undefined);
	plugin.configureServer({ middlewares: {
		/** Runs the real authoring handler with a fallback for unrelated site routes. */
		use(handler) {
			server = createServer((request, response) => handler(request, response, () => {
				response.writeHead(404).end('Unrelated route');
			}));
		},
	} });
	await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
	origin = `http://127.0.0.1:${server.address().port}`;
});

/** Removes test listeners and fixture files after all assertions complete. */
afterEach(async () => {
	if (server) await new Promise((resolve) => server.close(resolve));
	if (fixture) await rm(fixture, { recursive: true, force: true });
});

/** Posts a realistic same-origin editor request to the disposable HTTP server. */
async function post(route, payload, headers = {}) {
	return fetch(`${origin}${route}`, {
		method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin, ...headers },
		body: JSON.stringify(payload),
	});
}

/** Reads the persisted fixture metadata for save and preservation assertions. */
async function readBook() {
	return yaml.load(await readFile(path.join(fixture, 'book.yml'), 'utf8'));
}

test('contents edits preserve the book identity, chapter order and Markdown', async () => {
	const original = await readBook();
	const manuscript = await readFile(path.join(fixture, 'chapters/introduction.md'), 'utf8');
	const parts = structuredClone(original.parts);
	parts[0].title = 'An edited opening';
	const response = await post('/__brain-book/book', { parts });
	assert.equal(response.status, 200);
	const saved = await readBook();
	assert.equal(saved.title, original.title);
	assert.deepEqual(saved.parts, parts);
	assert.equal(await readFile(path.join(fixture, 'chapters/introduction.md'), 'utf8'), manuscript);
});

test('a chapter save persists manuscript, private guide and metadata together', async () => {
	const details = { title: 'A fixture chapter', question: 'A private question?', status: 'draft', wordTarget: 1300 };
	const response = await post('/__brain-book/chapter/introduction', { content: '# Reader text', guide: 'Private notes', details });
	assert.equal(response.status, 200);
	assert.deepEqual(await response.json(), { saved: true });
	assert.equal(await readFile(path.join(fixture, 'chapters/introduction.md'), 'utf8'), '<!-- book-guide\nPrivate notes\n-->\n\n# Reader text\n');
	const saved = await readBook();
	assert.equal(saved.parts[0].chapters[0].title, details.title);
	assert.equal(saved.parts[0].title, 'Introduction');
});

/** Protects the title/body boundary so normal formatting cannot turn manuscript text into metadata. */
test('the writing document requires a separate title and retains ordinary body headings', () => {
	const schema = getSchema(chapterDocumentExtensions({ modules: { Node }, extensions: [StarterKit] }));
	const title = schema.nodes.chapterTitle.create(null, schema.text('A chapter title'));
	const paragraph = schema.nodes.paragraph.create(null, schema.text('The manuscript.'));
	const heading = schema.nodes.heading.create({ level: 2 }, schema.text('A body heading'));
	assert.doesNotThrow(() => schema.nodes.doc.create(null, [title, heading, paragraph]).check());
	assert.throws(() => schema.nodes.doc.create(null, [paragraph]).check());
	assert.throws(() => schema.nodes.doc.create(null, [title, title, paragraph]).check());
	assert.match(chapterDocumentHtml('A <title> & "thought"', '## Body heading'),
		/^<h1 data-chapter-title>A &lt;title&gt; &amp; "thought"<\/h1><h2>Body heading<\/h2>/);
});

/** Verifies that formatting survives the real HTML-to-Markdown save and reader path. */
test('rich manuscript formatting survives saving and reopening without mixing in guide notes', async () => {
	const html = '<h2>A formatted chapter</h2><p><strong>Bold</strong>, <em>italic</em>, <u>underlined</u> and <s>struck out</s>.</p>'
		+ '<blockquote><p>A quotation.</p></blockquote><ul><li><p>One thought</p></li></ul>'
		+ '<ol start="3"><li><p>A numbered thought</p></li></ol>'
		+ '<p><a href="https://example.com/research">Research</a></p><img src="https://example.com/brain.png" alt="A brain">'
		+ '<pre><code class="language-js">const thought = "a &lt; b";</code></pre>'
		+ '<table><tbody><tr><th colspan="2"><p>Two minds</p></th></tr><tr><td><p>A | B</p><p>Another paragraph</p></td><td><p>Second cell</p></td></tr></tbody></table>';
	const content = manuscriptMarkdown(html);
	assert.match(content, /^## A formatted chapter/);
	assert.match(content, /\*\*Bold\*\*/);
	assert.match(content, /```js/);
	assert.match(content, /3\.\s+A numbered thought/);
	const details = { title: 'Formatting fixture', question: 'Private question?', status: 'draft', wordTarget: 1300 };
	const response = await post('/__brain-book/chapter/introduction', { content, guide: 'Private fixture notes', details });
	assert.equal(response.status, 200);
	const stored = await readFile(path.join(fixture, 'chapters/introduction.md'), 'utf8');
	assert.equal(stored, `<!-- book-guide\nPrivate fixture notes\n-->\n\n${content}\n`);
	const reopened = renderMarkdown(content);
	for (const pattern of [/<h2>/, /<strong>Bold<\/strong>/, /<em>italic<\/em>/, /<u>underlined<\/u>/,
		/<del>struck out<\/del>/, /<blockquote>/, /<ul>/, /<ol start="3">/, /href="https:\/\/example.com\/research"/,
		/src="https:\/\/example.com\/brain.png"/, /class="language-js"/, /colspan="2"/, /A \| B/, /<p>Another paragraph<\/p>/]) {
		assert.match(reopened, pattern);
	}
	assert(!reopened.includes('Private fixture notes'));
	assert.equal(manuscriptMarkdown('<p></p>'), '');
});

test('invalid contents, missing chapters and unsafe file paths leave files unchanged', async () => {
	const before = await readFile(path.join(fixture, 'book.yml'), 'utf8');
	for (const payload of [{ parts: [] }, { parts: null }, { parts: [{ number: 0 }] }]) {
		assert.equal((await post('/__brain-book/book', payload)).status, 400);
	}
	assert.equal((await post('/__brain-book/chapter/missing', {})).status, 404);
	assert.equal((await post('/__brain-book/chapter/%2e%2e%2ffile', {})).status, 404);
	const parts = (await readBook()).parts;
	parts[0].chapters[0].status = 'invalid';
	assert.equal((await post('/__brain-book/book', { parts })).status, 400);
	assert.equal(await readFile(path.join(fixture, 'book.yml'), 'utf8'), before);
});

test('cross-origin and form submissions cannot write to the editor', async () => {
	assert.equal((await post('/__brain-book/book', {}, { Origin: 'https://another.example' })).status, 403);
	assert.equal((await post('/__brain-book/book', {}, { 'Content-Type': 'text/plain' })).status, 415);
	assert.equal((await fetch(`${origin}/__brain-book/book`)).status, 405);
	assert.equal((await fetch(`${origin}/`)).status, 404);
});

test('the published sitemap route inventory excludes the local book', async () => {
	const routes = await loadStaticRoutes();
	assert(routes.includes('/'));
	assert(!routes.some((route) => route.includes('brain-book')));
});
