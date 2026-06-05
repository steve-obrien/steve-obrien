<script setup>
import { Comment, Fragment, Text, computed, onMounted, ref, useSlots, watch } from 'vue';
import { highlight } from './docs/shiki.js';

const props = defineProps({
	lang: { type: String, default: 'vue' },
	code: { type: String, default: '' },
	filename: { type: String, default: '' },
	defaultOpen: { type: Boolean, default: true },
	previewLines: { type: Number, default: 0 },
});

const slots = useSlots();
const displayCode = computed(() => props.code || serializeNodes(slots.default?.() || []).trim());
const highlighted = ref(null);
const codeStyle = computed(() => {
	if (!props.previewLines) return {};
	return { maxHeight: `${Math.round((props.previewLines * 20.625) + 32)}px` };
});

async function refreshHighlight() {
	highlighted.value = await highlight(displayCode.value, props.lang);
}

onMounted(refreshHighlight);
watch(() => [displayCode.value, props.lang], refreshHighlight);

function escapeText(value) {
	return String(value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

function escapeAttribute(value) {
	return escapeText(value).replace(/"/g, '&quot;');
}

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

function serializeType(type) {
	if (typeof type === 'string') return type;
	return type?.name || type?.__name || 'component';
}

function serializeChildren(children, depth) {
	if (typeof children === 'string') return escapeText(children);
	if (Array.isArray(children)) return serializeNodes(children, depth);
	if (typeof children === 'object' && children?.default) return serializeNodes(children.default(), depth);
	return '';
}

function serializeNode(node, depth = 0) {
	if (!node) return '';
	if (typeof node === 'string') return `${'\t'.repeat(depth)}${escapeText(node)}`;
	if (node.type === Text) return `${'\t'.repeat(depth)}${escapeText(node.children || '')}`;
	if (node.type === Comment) return '';
	if (node.type === Fragment) return serializeNodes(node.children || [], depth);

	const tag = serializeType(node.type);
	const props = serializeProps(node.props);
	const open = props ? `<${tag} ${props}>` : `<${tag}>`;
	const children = serializeChildren(node.children, depth + 1);
	const indent = '\t'.repeat(depth);

	if (!children) return `${indent}${open}</${tag}>`;
	if (!children.includes('\n') && !children.trim().startsWith('<')) return `${indent}${open}${children}</${tag}>`;
	return `${indent}${open}\n${children}\n${indent}</${tag}>`;
}

function serializeNodes(nodes, depth = 0) {
	return nodes
		.map((node) => serializeNode(node, depth))
		.filter(Boolean)
		.join('\n');
}
</script>

<template>
	<div
		class="el-code overflow-auto rounded-2xl border border-border bg-background"
		:style="codeStyle"
	>
		<div v-if="highlighted" class="el-shiki" v-html="highlighted"></div>
		<pre v-else class="overflow-auto bg-[#0b1020] p-4 text-[12.5px] leading-relaxed text-white/90"><code>{{ displayCode }}</code></pre>
	</div>
</template>
