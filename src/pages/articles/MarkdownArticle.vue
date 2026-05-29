<script setup>
import MarkdownIt from 'markdown-it';
import { computed } from 'vue';
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

function camelise(value) {
	return value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

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

function buildSegments(content) {
	const segments = [];
	const buffer = [];
	let fenceMarker = '';

	const flushMarkdown = () => {
		const source = buffer.join('\n').trim();
		buffer.length = 0;
		if (!source) return;

		segments.push({
			type: 'markdown',
			html: markdown.render(source),
		});
	};

	for (const line of content.split(/\r?\n/)) {
		const fenceMatch = line.match(/^\s*(```+|~~~+)/);
		if (fenceMatch) {
			const marker = fenceMatch[1][0];
			fenceMarker = fenceMarker === marker ? '' : marker;
			buffer.push(line);
			continue;
		}

		if (fenceMarker) {
			buffer.push(line);
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
.article-component + .article-prose {
	margin-top: 2.5rem;
}

.article-component {
	width: 100%;
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

.article-prose :deep(table) {
	border: 1px solid var(--border);
	border-collapse: collapse;
	border-radius: 0.5rem;
	display: block;
	margin: 2rem 0;
	max-width: 100%;
	overflow-x: auto;
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
