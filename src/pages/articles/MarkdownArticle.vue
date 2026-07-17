<script setup>
import MarkdownIt from 'markdown-it';
import { computed } from 'vue';
import DomCodeBlock from '../../vendor/getdom-studio/src/pages/dev/code-block/DomCodeBlock.vue';
import '../../vendor/getdom-studio/dom-code-block.css';
import { articleComponents } from './articleComponents';

const props = defineProps({
	content: {
		type: String,
		required: true,
	},
});

const markdown = new MarkdownIt({
	html: false,
	linkify: true,
	typographer: true,
});

const defaultFenceRenderer = markdown.renderer.rules.fence;
const labeledFenceNames = {
	diagram: 'Mental model',
	prompt: 'Prompt',
	'model-output': 'Model output',
};
const supportedCodeLanguages = new Set([
	'vue',
	'html',
	'js',
	'ts',
	'css',
	'json',
	'md',
	'python',
	'bash',
	'sh',
	'txt',
]);
const codeLanguageAliases = {
	javascript: 'js',
	typescript: 'ts',
	markdown: 'md',
	text: 'txt',
	plaintext: 'txt',
	plain: 'txt',
	py: 'python',
	shell: 'bash',
	diagram: 'txt',
	prompt: 'txt',
	'model-output': 'txt',
};

/**
 * Render diagrams, prompts, and model outputs as labelled, accessible figures.
 *
 * Other fenced code blocks retain MarkdownIt's default rendering so technical
 * examples and shell commands are unaffected.
 *
 * @param {import('markdown-it/lib/token.mjs').default[]} tokens - Parsed Markdown tokens.
 * @param {number} index - Index of the fence token being rendered.
 * @param {Record<string, unknown>} options - Active MarkdownIt rendering options.
 * @param {Record<string, unknown>} environment - Per-render environment object.
 * @param {import('markdown-it/lib/renderer.mjs').default} self - Active renderer.
 * @returns {string} Rendered HTML for the fenced block.
 */
function renderFence(tokens, index, options, environment, self) {
	const fenceName = tokens[index].info.trim().split(/\s+/)[0];
	const label = labeledFenceNames[fenceName];
	const renderedFence = defaultFenceRenderer(tokens, index, options, environment, self);
	if (!label) return renderedFence;

	return [
		`<figure class="article-io article-io--${fenceName}">`,
		`<figcaption>${label}</figcaption>`,
		renderedFence,
		'</figure>',
	].join('');
}

markdown.renderer.rules.fence = renderFence;

/**
 * Open a shrink-wrapped scroll container around a Markdown table.
 *
 * The wrapper owns horizontal scrolling so the table can retain its native
 * table layout without drawing an empty, full-width border after its cells.
 *
 * @returns {string} Opening HTML for the table and its scroll container.
 */
function renderTableOpen() {
	return '<div class="article-table-scroll"><table>\n';
}

/**
 * Close a Markdown table and its scroll container.
 *
 * @returns {string} Closing HTML for the table and its scroll container.
 */
function renderTableClose() {
	return '</table></div>\n';
}

markdown.renderer.rules.table_open = renderTableOpen;
markdown.renderer.rules.table_close = renderTableClose;

/**
 * Parse a standalone Markdown fence opening.
 *
 * @param {string} line Raw Markdown line.
 * @returns {{ marker: string, length: number, info: string } | null} Fence metadata when matched.
 */
function parseFenceStart(line) {
	const match = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
	if (!match) return null;

	return {
		marker: match[1][0],
		length: match[1].length,
		info: match[2].trim(),
	};
}

/**
 * Determine whether a line closes the active Markdown fence.
 *
 * @param {string} line Raw Markdown line.
 * @param {{ marker: string, length: number }} fence Active fence metadata.
 * @returns {boolean} True when the line is a matching closing fence.
 */
function isFenceEnd(line, fence) {
	const match = line.match(/^ {0,3}(\S+)\s*$/);
	if (!match || match[1].length < fence.length) return false;
	return [...match[1]].every((character) => character === fence.marker);
}

/**
 * Map Markdown language names onto languages supported by DomCodeBlock.
 *
 * Unsupported lesson languages deliberately fall back to plain text instead
 * of being incorrectly highlighted as HTML by the shared highlighter.
 *
 * @param {string} language Language name from the Markdown fence.
 * @returns {string} DomCodeBlock language name.
 */
function normaliseCodeLanguage(language) {
	const normalised = String(language || '').toLowerCase();
	const aliased = codeLanguageAliases[normalised] || normalised;
	return supportedCodeLanguages.has(aliased) ? aliased : 'txt';
}

/**
 * Build a Vue-rendered code segment from one Markdown fence.
 *
 * @param {{ marker: string, length: number, info: string }} fence Fence metadata.
 * @param {string[]} lines Lines collected inside the fence.
 * @returns {Record<string, unknown>} Code segment for the article renderer.
 */
function createCodeSegment(fence, lines) {
	const fenceName = fence.info.split(/\s+/)[0].toLowerCase();
	return {
		type: 'code',
		code: lines.join('\n'),
		language: normaliseCodeLanguage(fenceName),
		label: labeledFenceNames[fenceName] || '',
		variant: labeledFenceNames[fenceName] ? fenceName : '',
	};
}

/**
 * Convert kebab-case directive names into Vue prop casing.
 *
 * @param {string} value - Attribute name from Markdown.
 * @returns {string} Camel-cased prop name.
 */
function camelise(value) {
	return value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Parse one component-directive attribute value.
 *
 * @param {string | undefined} value - Raw attribute value.
 * @param {boolean} isBound - Whether the attribute used Vue binding syntax.
 * @returns {unknown} Parsed primitive, JSON value, or original string.
 */
function parseAttributeValue(value, isBound) {
	if (value === undefined) return true;
	const trimmed = value.trim();

	if (isBound) {
		try {
			return JSON.parse(trimmed);
		} catch {
			return trimmed;
		}
	}

	if (trimmed === 'true') return true;
	if (trimmed === 'false') return false;
	if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
	return trimmed;
}

/**
 * Parse component-directive attributes into Vue props.
 *
 * @param {string} source - Attribute text inside directive braces.
 * @returns {Record<string, unknown>} Parsed component props.
 */
function parseAttributes(source = '') {
	const attrs = {};
	const attrPattern = /(:?[\w-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s}]+)))?/g;
	let match;

	while ((match = attrPattern.exec(source))) {
		const rawKey = match[1];
		const isBound = rawKey.startsWith(':');
		const key = camelise(isBound ? rawKey.slice(1) : rawKey);
		const value = match[2] ?? match[3] ?? match[4];
		attrs[key] = parseAttributeValue(value, isBound);
	}

	return attrs;
}

/**
 * Recognise a supported component directive on a standalone Markdown line.
 *
 * @param {string} line - Trimmed Markdown source line.
 * @returns {{ name: string, props: Record<string, unknown> } | null} Parsed directive.
 */
function parseComponentDirective(line) {
	const namedMatch = line.match(/^::([A-Z][\w]*)\s*(?:\{([^}]*)\})?\s*$/);
	if (namedMatch) {
		const props = parseAttributes(namedMatch[2]);
		return {
			name: namedMatch[1],
			props,
		};
	}

	const genericMatch = line.match(/^::component\s*\{([^}]*)\}\s*$/i);
	if (!genericMatch) return null;

	const props = parseAttributes(genericMatch[1]);
	const name = props.name;
	delete props.name;

	if (!name) return null;

	return {
		name,
		props,
	};
}

/**
 * Split Markdown into rendered prose and registered Vue component segments.
 *
 * @param {string} content - Raw Markdown article body.
 * @returns {Array<Record<string, unknown>>} Ordered render segments.
 */
function buildSegments(content) {
	const segments = [];
	const buffer = [];
	const codeBuffer = [];
	let activeFence = null;

	/**
	 * Render and clear Markdown accumulated since the previous rich segment.
	 *
	 * @returns {void}
	 */
	const flushMarkdown = () => {
		const source = buffer.join('\n').trim();
		buffer.length = 0;
		if (!source) return;

		segments.push({
			type: 'markdown',
			html: markdown.render(source),
		});
	};

	/**
	 * Store and clear the active fenced-code segment.
	 *
	 * @returns {void}
	 */
	const flushCode = () => {
		if (!activeFence) return;
		segments.push(createCodeSegment(activeFence, codeBuffer));
		activeFence = null;
		codeBuffer.length = 0;
	};

	for (const line of content.split(/\r?\n/)) {
		if (activeFence) {
			if (isFenceEnd(line, activeFence)) {
				flushCode();
			} else {
				codeBuffer.push(line);
			}
			continue;
		}

		const fence = parseFenceStart(line);
		if (fence) {
			flushMarkdown();
			activeFence = fence;
			continue;
		}

		const directive = parseComponentDirective(line.trim());
		if (!directive) {
			buffer.push(line);
			continue;
		}

		flushMarkdown();

		const width = directive.props.width === 'page' ? 'page' : 'article';
		delete directive.props.width;

		segments.push({
			type: 'component',
			name: directive.name,
			width,
			props: directive.props,
		});
	}

	flushCode();
	flushMarkdown();
	return segments;
}

const segments = computed(() => buildSegments(props.content));
</script>

<template>
	<div class="article-markdown">
		<template v-for="(segment, index) in segments" :key="`${segment.type}-${index}`">
			<div
				v-if="segment.type === 'markdown'"
				class="article-prose"
				v-html="segment.html"
			/>
			<div
				v-else-if="segment.type === 'code'"
				class="article-code"
			>
				<figure
					v-if="segment.label"
					class="article-code-figure"
					:class="`article-code-figure--${segment.variant}`"
				>
					<figcaption>{{ segment.label }}</figcaption>
					<DomCodeBlock
						:code="segment.code"
						:lang="segment.language"
						:framed="false"
					/>
				</figure>
				<DomCodeBlock
					v-else
					:code="segment.code"
					:lang="segment.language"
				/>
			</div>
			<div
				v-else
				class="article-component"
				:class="`article-component--${segment.width}`"
			>
				<component
					:is="articleComponents[segment.name]"
					v-if="articleComponents[segment.name]"
					v-bind="segment.props"
				/>
				<div v-else class="article-component-missing">
					Unknown article component: {{ segment.name }}
				</div>
			</div>
		</template>
	</div>
</template>

<style scoped>
.article-markdown {
	width: 100%;
}

.article-prose,
.article-code,
.article-component--article {
	margin-inline: auto;
	max-width: 45rem;
}

.article-prose {
	color: var(--foreground);
	font-size: 1.0625rem;
	line-height: 1.85;
}

.article-prose + .article-prose,
.article-prose + .article-component,
.article-prose + .article-code,
.article-component + .article-prose,
.article-component + .article-code,
.article-code + .article-prose,
.article-code + .article-component,
.article-code + .article-code {
	margin-top: 2.5rem;
}

.article-code,
.article-component {
	width: 100%;
}

.article-code-figure {
	border: 1px solid var(--border);
	border-radius: 0.6rem;
	margin: 0;
	overflow: hidden;
}

.article-code-figure figcaption {
	background: color-mix(in oklch, var(--secondary) 75%, var(--background));
	border-bottom: 1px solid var(--border);
	color: var(--muted-foreground);
	font-size: 0.72rem;
	font-weight: 700;
	letter-spacing: 0.14em;
	padding: 0.65rem 1rem;
	text-transform: uppercase;
}

.article-code-figure :deep(.dom-code) {
	border-radius: 0;
}

.article-code-figure--prompt {
	border-left: 0.25rem solid var(--muted-foreground);
}

.article-code-figure--model-output {
	border-left: 0.25rem solid var(--foreground);
}

.article-code-figure--diagram {
	border-left: 0.25rem solid var(--primary);
}

.article-component--page {
	margin-inline: auto;
	max-width: 72rem;
}

.article-component-missing {
	border: 1px solid var(--border);
	border-radius: 0.5rem;
	color: var(--muted-foreground);
	padding: 1rem;
}

.article-prose :deep(h1),
.article-prose :deep(h2),
.article-prose :deep(h3) {
	color: var(--foreground);
	font-family: Georgia, "Times New Roman", serif;
	font-weight: 400;
	letter-spacing: 0;
	line-height: 1.18;
}

.article-prose :deep(h1) {
	font-size: clamp(2.75rem, 7vw, 5rem);
	margin: 0 0 1.4rem;
}

.article-prose :deep(h2) {
	font-size: clamp(2rem, 4vw, 3.25rem);
	margin: 4rem 0 1.1rem;
}

.article-prose :deep(h3) {
	font-size: 1.55rem;
	margin: 2.8rem 0 0.85rem;
}

.article-prose :deep(p) {
	margin: 1.15rem 0;
}

.article-prose :deep(a) {
	color: inherit;
	text-decoration: underline;
	text-decoration-color: color-mix(in oklch, var(--foreground) 35%, transparent);
	text-underline-offset: 0.22em;
}

.article-prose :deep(a:hover) {
	text-decoration-color: var(--foreground);
}

.article-prose :deep(ul),
.article-prose :deep(ol) {
	margin: 1.25rem 0;
	padding-left: 1.35rem;
}

.article-prose :deep(ul) {
	list-style: disc;
}

.article-prose :deep(ul ul) {
	list-style: circle;
}

.article-prose :deep(ul ul ul) {
	list-style: square;
}

.article-prose :deep(ol) {
	list-style: decimal;
}

.article-prose :deep(ol ol) {
	list-style: lower-alpha;
}

.article-prose :deep(ol ol ol) {
	list-style: lower-roman;
}

.article-prose :deep(li) {
	margin: 0.5rem 0;
	padding-left: 0.2rem;
}

.article-prose :deep(li::marker) {
	color: var(--muted-foreground);
	font-weight: 600;
}

.article-prose :deep(.article-table-scroll) {
	border: 1px solid var(--border);
	border-radius: 0.5rem;
	margin: 2rem 0;
	max-width: 100%;
	overflow-x: auto;
	width: fit-content;
}

.article-prose :deep(table) {
	border-collapse: collapse;
	margin: 0;
	width: max-content;
	white-space: nowrap;
}

.article-prose :deep(thead) {
	background: color-mix(in oklch, var(--secondary) 80%, var(--background));
}

.article-prose :deep(th),
.article-prose :deep(td) {
	border-bottom: 1px solid var(--border);
	border-right: 1px solid var(--border);
	padding: 0.65rem 0.85rem;
	text-align: left;
	vertical-align: top;
}

.article-prose :deep(th:last-child),
.article-prose :deep(td:last-child) {
	border-right: 0;
}

.article-prose :deep(tbody tr:last-child td) {
	border-bottom: 0;
}

.article-prose :deep(th) {
	color: var(--foreground);
	font-size: 0.9em;
	font-weight: 600;
	letter-spacing: 0.01em;
}

.article-prose :deep(td) {
	color: var(--muted-foreground);
	font-size: 0.94em;
}

.article-prose :deep(tbody tr:nth-child(even)) {
	background: color-mix(in oklch, var(--secondary) 45%, transparent);
}

.article-prose :deep(blockquote) {
	border-left: 1px solid var(--border);
	color: var(--muted-foreground);
	font-family: Georgia, "Times New Roman", serif;
	font-size: 1.45rem;
	line-height: 1.55;
	margin: 2.5rem 0;
	padding-left: 1.5rem;
}

.article-prose :deep(img) {
	border: 1px solid var(--border);
	border-radius: 0.5rem;
	display: block;
	height: auto;
	margin: 2rem 0;
	width: 100%;
}

.article-prose :deep(code) {
	background: var(--secondary);
	border: 1px solid var(--border);
	border-radius: 0.35rem;
	font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
	font-size: 0.86em;
	padding: 0.1rem 0.3rem;
}

.article-prose :deep(pre) {
	background: var(--secondary);
	border: 1px solid var(--border);
	border-radius: 0.5rem;
	overflow-x: auto;
	padding: 1.1rem;
}

.article-prose :deep(pre code) {
	background: transparent;
	border: 0;
	border-radius: 0;
	display: block;
	font-size: 0.85rem;
	line-height: 1.7;
	padding: 0;
}

.article-prose :deep(.article-io) {
	border: 1px solid var(--border);
	border-radius: 0.6rem;
	margin: 1.5rem 0;
	overflow: hidden;
}

.article-prose :deep(.article-io figcaption) {
	background: color-mix(in oklch, var(--secondary) 75%, var(--background));
	border-bottom: 1px solid var(--border);
	color: var(--muted-foreground);
	font-size: 0.72rem;
	font-weight: 700;
	letter-spacing: 0.14em;
	padding: 0.65rem 1rem;
	text-transform: uppercase;
}

.article-prose :deep(.article-io pre) {
	border: 0;
	border-radius: 0;
	margin: 0;
}

.article-prose :deep(.article-io--prompt) {
	border-left: 0.25rem solid var(--muted-foreground);
}

.article-prose :deep(.article-io--model-output) {
	border-left: 0.25rem solid var(--foreground);
}

.article-prose :deep(.article-io--diagram) {
	border-left: 0.25rem solid var(--primary);
}

.article-prose :deep(.article-io--diagram pre) {
	background: color-mix(in oklch, var(--secondary) 70%, var(--background));
}

.article-prose :deep(hr) {
	border: 0;
	border-top: 1px solid var(--border);
	margin: 3.5rem 0;
}

@media (max-width: 720px) {
	.article-prose {
		font-size: 1rem;
		line-height: 1.75;
	}
}
</style>
