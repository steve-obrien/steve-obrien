// Round-trippable serialization for the inspector tree.
//
// Spec nodes carry a live Vue component reference, which can't go into JSON.
// We replace the reference with the matching `typeId` from the component
// registry, and resolve it back on load. The result is a plain JSON object
// you can save to a DB / send to a server and rehydrate later via ElRenderer.

import { componentRegistry, isTextNode } from './componentRegistry.js';
import { makeReactiveSpec, uid } from './useInspector.js';

function lookupByComponent(component) {
	return componentRegistry.find((e) => e.component === component);
}

function lookupById(typeId) {
	return componentRegistry.find((e) => e.id === typeId);
}

export function serializeTree(node) {
	if (!node) return null;
	if (isTextNode(node)) {
		return { id: node.id, type: 'html-text', text: node.text };
	}
	const typeId = node.typeId || lookupByComponent(node.component)?.id;
	const out = {
		id: node.id,
		type: typeId || (typeof node.component === 'string' ? node.component : 'unknown'),
		props: { ...(node.props || {}) },
	};
	if (node.children?.length) out.children = node.children.map(serializeTree);
	return out;
}

export function deserializeTree(data) {
	if (!data) return null;
	return makeReactiveSpec(deserializeNode(data));
}

function deserializeNode(data) {
	// Pure text node.
	if (data.type === 'html-text' || (data.text != null && !data.type)) {
		return {
			id: data.id || uid('t'),
			text: data.text ?? '',
			typeId: 'html-text',
		};
	}
	const entry = lookupById(data.type);
	if (!entry && !data.type) throw new Error('Node is missing a `type` field.');
	return {
		id: data.id || uid('n'),
		label: entry?.label || data.type,
		component: entry?.component ?? data.type, // fall back to raw tag string
		typeId: entry?.id || data.type,
		props: data.props || {},
		children: (data.children || []).map(deserializeNode),
	};
}

// ---------------------------------------------------------------------------
// HTML output — formatted, copy-paste-ready

const VOID = new Set([
	'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
	'link', 'meta', 'source', 'track', 'wbr',
]);
const STRIP_ATTRS = new Set([
	'data-node-id', 'data-selected', 'data-drop-target-id', 'data-v-app',
]);
const STRIP_CLASSES = new Set([
	'el-stage-node', 'el-text-node',
]);

export function elementToHtml(el, depth = 0) {
	if (!el) return '';
	const indent = '\t'.repeat(depth);

	if (el.nodeType === 3 /* text */) {
		const t = el.textContent.replace(/\s+/g, ' ').trim();
		return t ? indent + escapeText(t) : '';
	}
	if (el.nodeType !== 1) return '';

	// Unwrap the el-text-node span — emit its text content directly.
	if (el.classList?.contains('el-text-node')) {
		const t = el.textContent.replace(/\s+/g, ' ').trim();
		return t ? indent + escapeText(t) : '';
	}

	const tag = el.tagName.toLowerCase();
	const attrs = [];
	for (const a of el.attributes) {
		if (STRIP_ATTRS.has(a.name)) continue;
		if (a.name.startsWith('data-v-')) continue;
		if (a.name === 'class') {
			const cls = a.value
				.split(/\s+/)
				.filter((c) => c && !STRIP_CLASSES.has(c))
				.join(' ');
			if (cls) attrs.push(`class="${escapeAttr(cls)}"`);
			continue;
		}
		if (a.value === '') attrs.push(a.name);
		else attrs.push(`${a.name}="${escapeAttr(a.value)}"`);
	}
	const open = `<${tag}${attrs.length ? ' ' + attrs.join(' ') : ''}`;
	if (VOID.has(tag)) return indent + open + ' />';

	const parts = [];
	for (const c of el.childNodes) {
		const part = elementToHtml(c, depth + 1);
		if (part) parts.push(part);
	}

	if (parts.length === 0) return indent + open + `></${tag}>`;
	if (
		el.childNodes.length === 1 &&
		el.firstChild.nodeType === 3 &&
		parts[0].trim().length < 60
	) {
		return indent + open + '>' + parts[0].trim() + `</${tag}>`;
	}
	return indent + open + '>\n' + parts.join('\n') + '\n' + indent + `</${tag}>`;
}

function escapeAttr(s) { return String(s).replace(/"/g, '&quot;'); }
function escapeText(s) { return String(s).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c])); }

export function stageToHtml(stageEl) {
	if (!stageEl) return '';
	const root = stageEl.querySelector('[data-node-id]');
	if (!root) return '';
	return elementToHtml(root, 0);
}
