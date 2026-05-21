import { provide, inject, reactive } from 'vue';
import { lookupEntry, lookupById, isTextNode } from './componentRegistry.js';

const KEY = Symbol('elements.inspector');

let _uid = 0;
export function uid(prefix = 'n') {
	_uid += 1;
	return `${prefix}-${_uid.toString(36)}`;
}

// ---------------------------------------------------------------------------
// Schema inference
//
// Inline hints live on the component's prop definition under the `_edit` key:
//
//   const props = defineProps({
//     items: { type: Array, required: true, _edit: { component: 'ElListInput' } },
//   });
//
// Strings are used to identify editor components so generated output (e.g. ElRenderer)
// does not pull form components into the bundle. The studio resolves the string
// against the editor registry at render time.

function inferFieldType(def) {
	if (!def) return 'string';
	const t = def?.type ?? def;
	const types = Array.isArray(t) ? t : [t];
	if (types.includes(Boolean)) return 'boolean';
	if (types.includes(Number)) return 'number';
	if (types.includes(Array) || types.includes(Object) || types.includes(Function)) return null;
	return 'string';
}

function componentProps(component) {
	if (!component || typeof component === 'string') return {};
	const p = component.props;
	if (!p) return {};
	if (Array.isArray(p)) return Object.fromEntries(p.map((k) => [k, {}]));
	return p;
}

export function inferSchema(node) {
	if (isTextNode(node)) {
		return [{ key: 'text', label: 'Text', type: 'text', rows: 3, target: 'text' }];
	}

	const fields = [];
	const entry = lookupEntry(node.component);
	const hints = entry?.hints || {};

	const propDefs = componentProps(node.component);
	for (const [key, def] of Object.entries(propDefs)) {
		if (key === 'class' || key === 'modelModifiers') continue;

		// Per-prop hints — `_edit` on the prop definition is the canonical
		// place (lives with the component, shows up in source). Registry hints
		// stack on top so the studio can override.
		const inlineEdit = def && typeof def === 'object' && def._edit;
		const merged = { ...(inlineEdit || {}), ...(hints[key] || {}) };
		const hasHint = Object.keys(merged).length > 0;

		// Resolve type:
		//   1. explicit `type` from a hint
		//   2. 'editor' if an editor component is named
		//   3. Vue prop type inference
		const type = merged.type || (merged.component ? 'editor' : inferFieldType(def));
		if (!type) continue;

		fields.push({
			...(hasHint ? merged : {}),
			key,
			label: merged.label || prettify(key),
			type,
			editor: merged.component,
		});
	}

	if (!fields.some((f) => f.key === 'class')) {
		fields.push({
			key: 'class',
			label: 'Tailwind classes',
			type: 'text',
			rows: 3,
			hint: 'Any utility classes — applied to the rendered element.',
		});
	}

	return fields;
}

function prettify(s) {
	return s
		.replace(/([A-Z])/g, ' $1')
		.replace(/^./, (c) => c.toUpperCase())
		.replace(/Model Value/, 'Value');
}

// ---------------------------------------------------------------------------
// Reactive tree

export function makeReactiveSpec(node) {
	if (!node) return null;

	// Text node — { id, text, [typeId] }
	if (node.component == null && node.text != null) {
		const next = reactive({
			id: node.id || uid('t'),
			label: node.label || 'Text',
			typeId: 'html-text',
			component: null,
			props: reactive({}),
			text: node.text,
			schema: null,
			children: [],
		});
		next.schema = node.schema ?? inferSchema(next);
		return next;
	}

	// Element node. Convert `text` shorthand into a single text child.
	let rawChildren = node.children;
	if ((!rawChildren || rawChildren.length === 0) && node.text != null) {
		rawChildren = [{ text: node.text }];
	}
	rawChildren = rawChildren || [];

	const typeId = node.typeId || lookupEntry(node.component)?.id || null;
	const next = reactive({
		id: node.id || uid(),
		label: node.label || lookupEntry(node.component)?.label || 'Node',
		typeId,
		component: node.component,
		props: reactive({ ...(node.props || {}) }),
		text: null,
		schema: null,
		children: rawChildren.map(makeReactiveSpec),
	});
	next.schema = node.schema ?? inferSchema(next);
	return next;
}

// Build a new reactive spec from a palette entry.
export function specFromEntry(entry) {
	const d = entry.defaults || {};
	return makeReactiveSpec({
		id: uid(entry.id),
		label: entry.label,
		typeId: entry.id,
		component: entry.component,
		props: { ...(d.props || {}) },
		text: d.text,
		children: (d.children || []).map((c) => ({ ...c })),
	});
}

// ---------------------------------------------------------------------------
// Tree operations

export function flattenTree(node, depth = 0, out = []) {
	if (!node) return out;
	out.push({ node, depth });
	(node.children || []).forEach((c) => flattenTree(c, depth + 1, out));
	return out;
}

export function findNode(tree, id) {
	if (!tree) return null;
	if (tree.id === id) return tree;
	for (const c of tree.children || []) {
		const f = findNode(c, id);
		if (f) return f;
	}
	return null;
}

export function findParent(tree, id) {
	for (const c of tree.children || []) {
		if (c.id === id) return tree;
		const p = findParent(c, id);
		if (p) return p;
	}
	return null;
}

export function removeNode(tree, id) {
	const parent = findParent(tree, id);
	if (!parent) return false;
	parent.children = parent.children.filter((c) => c.id !== id);
	return true;
}

export function moveNode(tree, id, dir) {
	const parent = findParent(tree, id);
	if (!parent) return;
	const i = parent.children.findIndex((c) => c.id === id);
	const j = i + dir;
	if (j < 0 || j >= parent.children.length) return;
	const arr = parent.children;
	[arr[i], arr[j]] = [arr[j], arr[i]];
	parent.children = [...arr];
}

export function insertChild(parent, child, index) {
	if (!parent) return;
	const i = index == null ? parent.children.length : index;
	parent.children = [
		...parent.children.slice(0, i),
		child,
		...parent.children.slice(i),
	];
}

export function duplicateNode(tree, id) {
	const parent = findParent(tree, id);
	const node = findNode(tree, id);
	if (!parent || !node) return null;
	const copy = makeReactiveSpec(JSON.parse(JSON.stringify(stripNonSerializable(node))));
	restoreComponentRefs(copy, node);
	parent.children = [...parent.children, copy];
	return copy;
}

function stripNonSerializable(node) {
	return {
		id: uid(node.id),
		label: node.label,
		props: node.props,
		text: node.text,
		children: (node.children || []).map(stripNonSerializable),
	};
}

function restoreComponentRefs(target, source) {
	target.component = source.component;
	target.typeId = source.typeId;
	(target.children || []).forEach((c, i) => {
		const src = source.children?.[i];
		if (src) restoreComponentRefs(c, src);
	});
}

// ---------------------------------------------------------------------------
// Composition API helpers

export function provideInspector(initial = {}) {
	const state = reactive({
		selectedId: initial.selectedId ?? null,
		// `pickMode` on (the default) → clicks select; hovers show an outline.
		// off → clicks pass through to the underlying component (open the
		// dropdown, focus the input, etc.) so authors can poke at real behaviour.
		pickMode: initial.pickMode ?? true,
		dragEntry: null,
	});
	provide(KEY, state);
	return state;
}

export function useInspector() {
	return inject(KEY, null);
}

export function getFieldValue(node, field) {
	if (field.target === 'text') return node.text;
	return node.props[field.key];
}

export function setFieldValue(node, field, value) {
	if (field.target === 'text') node.text = value;
	else node.props[field.key] = value;
}
