<script setup>
import { Comment, Fragment, Text, computed, onMounted, ref, useSlots, watch } from 'vue';
import { highlight } from '../../lib/vue/codeHighlighter.js';

defineOptions({
	__doc: {
		name: 'Code block',
		tag: '<DomCodeBlock>',
		description: 'A syntax-highlighted code block for examples, API snippets, and generated source previews.',
		icon: 'M8 9l-4 3 4 3M16 9l4 3-4 3M14 5l-4 14',
		playground: {
			initial: {
				code: `import { DomCodeBlock } from '@getdom/studio/vue';

const source = '<DomButton>Save</DomButton>';`,
				lang: 'js',
				framed: true,
				previewLines: 0,
			},
		},
	},
});

const props = defineProps({
	lang: {
		type: String,
		default: 'vue',
		_edit: {
			options: ['vue', 'html', 'js', 'ts', 'css', 'json', 'md', 'python', 'bash', 'sh', 'txt'],
			description: 'Language passed to the syntax highlighter.',
		},
	},
	code: {
		type: String,
		default: '',
		_edit: {
			component: 'DomCodeInput',
			props: { rows: 8, editor: false },
			description: 'Code to render. If empty, default slot content is serialized.',
		},
	},
	filename: {
		type: String,
		default: '',
		_edit: { description: 'Optional source filename for labels and wrappers.' },
	},
	previewLines: {
		type: Number,
		default: 0,
		_edit: { description: 'Maximum visible lines before the block scrolls. Use 0 for no cap.' },
	},
	framed: {
		type: Boolean,
		default: true,
		_edit: { description: 'Render the standard border, radius, and canvas background.' },
	},
});

const slots = useSlots();
const displayCode = computed(() => props.code || serializeNodes(slots.default?.() || []).trim());
const highlighted = ref(null);
const codeStyle = computed(() => {
	if (!props.previewLines) return {};
	return { maxHeight: `${Math.round((props.previewLines * 20.625) + 32)}px` };
});

/**
 * Refreshes highlighted HTML when the source text or language changes.
 *
 * @returns {Promise<void>} Resolves after the highlighted output is stored.
 */
async function refreshHighlight() {
	highlighted.value = await highlight(displayCode.value, props.lang);
}

onMounted(refreshHighlight);
watch(() => [displayCode.value, props.lang], refreshHighlight);

/**
 * Escapes text content for safe HTML serialization.
 *
 * @param {unknown} value Raw text-like value.
 * @returns {string} Escaped text.
 */
function escapeText(value) {
	return String(value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

/**
 * Escapes an attribute value for safe HTML serialization.
 *
 * @param {unknown} value Raw attribute value.
 * @returns {string} Escaped attribute value.
 */
function escapeAttribute(value) {
	return escapeText(value).replace(/"/g, '&quot;');
}

/**
 * Normalizes Vue class bindings into a static class string.
 *
 * @param {string|Array|object|unknown} value Vue class binding value.
 * @returns {string} Serialized class list.
 */
function normalizeClass(value) {
	if (!value) return '';
	if (typeof value === 'string') return value;
	if (Array.isArray(value)) return value.map(normalizeClass).filter(Boolean).join(' ');
	if (typeof value === 'object') {
		return Object.entries(value)
			.filter(([, active]) => active)
			.map(([name]) => name)
			.join(' ');
	}
	return String(value);
}

/**
 * Normalizes Vue style bindings into a static style string.
 *
 * @param {string|object|unknown} value Vue style binding value.
 * @returns {string} Serialized inline style.
 */
function normalizeStyle(value) {
	if (!value) return '';
	if (typeof value === 'string') return value;
	if (typeof value === 'object') {
		return Object.entries(value)
			.map(([name, styleValue]) => `${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}: ${styleValue}`)
			.join('; ');
	}
	return String(value);
}

/**
 * Serializes Vue vnode props into HTML attributes.
 *
 * @param {Record<string, unknown>} props Raw vnode props.
 * @returns {string} Serialized attributes.
 */
function serializeProps(props = {}) {
	return Object.entries(props)
		.filter(([name, value]) => (
			value !== false
			&& value != null
			&& typeof value !== 'function'
			&& !['key', 'ref', 'ref_for', 'ref_key'].includes(name)
			&& !name.startsWith('onVnode')
		))
		.map(([name, value]) => {
			if (name === 'class') value = normalizeClass(value);
			if (name === 'style') value = normalizeStyle(value);
			if (value === true || value === '') return name;
			return `${name}="${escapeAttribute(value)}"`;
		})
		.filter(Boolean)
		.join(' ');
}

/**
 * Resolves a Vue vnode type into a readable tag name.
 *
 * @param {string|object} type Vue vnode type.
 * @returns {string} Serialized tag name.
 */
function serializeType(type) {
	if (typeof type === 'string') return type;
	return type?.name || type?.__name || 'component';
}

/**
 * Serializes vnode children into an HTML string.
 *
 * @param {string|Array|object} children Raw vnode children.
 * @param {number} depth Current indentation depth.
 * @returns {string} Serialized child content.
 */
function serializeChildren(children, depth) {
	if (typeof children === 'string') return escapeText(children);
	if (Array.isArray(children)) return serializeNodes(children, depth);
	if (typeof children === 'object' && children?.default) return serializeNodes(children.default(), depth);
	return '';
}

/**
 * Serializes a Vue vnode into a readable HTML snippet.
 *
 * @param {object|string} node Vue vnode or text node.
 * @param {number} depth Current indentation depth.
 * @returns {string} Serialized node markup.
 */
function serializeNode(node, depth = 0) {
	if (!node) return '';
	if (typeof node === 'string') return `${'\t'.repeat(depth)}${escapeText(node)}`;
	if (node.type === Text) return `${'\t'.repeat(depth)}${escapeText(node.children || '')}`;
	if (node.type === Comment) return '';
	if (node.type === Fragment) return serializeNodes(node.children || [], depth);

	const tag = serializeType(node.type);
	const serializedProps = serializeProps(node.props);
	const open = serializedProps ? `<${tag} ${serializedProps}>` : `<${tag}>`;
	const children = serializeChildren(node.children, depth + 1);
	const indent = '\t'.repeat(depth);

	if (!children) return `${indent}${open}</${tag}>`;
	if (!children.includes('\n') && !children.trim().startsWith('<')) return `${indent}${open}${children}</${tag}>`;
	return `${indent}${open}\n${children}\n${indent}</${tag}>`;
}

/**
 * Serializes a list of Vue vnodes into a readable HTML snippet.
 *
 * @param {Array} nodes Vue vnodes.
 * @param {number} depth Current indentation depth.
 * @returns {string} Serialized node list.
 */
function serializeNodes(nodes, depth = 0) {
	return nodes
		.map((node) => serializeNode(node, depth))
		.filter(Boolean)
		.join('\n');
}
</script>

<template>
	<div
		class="dom-code relative w-full min-w-0 max-w-full overflow-auto"
		:class="framed ? 'rounded-2xl border border-border bg-canvas' : ''"
		:style="codeStyle"
		:data-language="lang || undefined"
		:data-filename="filename || undefined"
	>
		<span class="pointer-events-none absolute right-3 top-1 z-10 font-mono text-[9px] font-medium uppercase leading-none tracking-wider text-muted-fg">
			{{ lang || 'text' }}
		</span>
		<div v-if="highlighted" class="dom-shiki" v-html="highlighted"></div>
		<pre v-else class="min-w-0 max-w-full overflow-auto bg-canvas p-4 font-mono text-[12.5px] leading-relaxed text-canvas-fg"><code>{{ displayCode }}</code></pre>
	</div>
</template>
