import { Comment, Fragment, Text, markRaw, normalizeClass } from 'vue';
import { lookupByName, lookupEntry } from './componentRegistry.js';

const INTERNAL_PROPS = new Set(['key', 'ref', 'ref_for', 'ref_key']);
const BOOLEAN_ATTRS = new Set([
	'allowfullscreen', 'async', 'autofocus', 'autoplay', 'checked', 'controls',
	'default', 'defer', 'disabled', 'formnovalidate', 'hidden', 'inert',
	'ismap', 'loop', 'multiple', 'muted', 'nomodule', 'novalidate', 'open',
	'playsinline', 'readonly', 'required', 'reversed', 'selected',
]);

export function slotToSpec(slot) {
	const specs = vnodesToSpecs(slot?.() || [], []);
	if (specs.length === 1) {
		return { ...specs[0], id: 'root' };
	}
	return {
		id: 'root',
		label: 'Studio root',
		component: 'div',
		props: { class: 'min-w-[640px] w-full rounded-3xl border border-border bg-background p-6 text-foreground shadow-2xl shadow-black/10' },
		children: specs,
	};
}

function vnodesToSpecs(vnodes, path) {
	return toArray(vnodes).flatMap((vnode, index) => {
		const spec = vnodeToSpec(vnode, [...path, index]);
		return Array.isArray(spec) ? spec : spec ? [spec] : [];
	});
}

function vnodeToSpec(vnode, path) {
	if (vnode == null || typeof vnode === 'boolean') return null;
	if (typeof vnode === 'string' || typeof vnode === 'number') return textSpec(vnode, path);
	if (Array.isArray(vnode)) return vnodesToSpecs(vnode, path);

	const type = vnode.type;
	if (!type || type === Comment) return null;
	if (type === Fragment) return vnodesToSpecs(vnode.children || [], path);
	if (type === Text) return textSpec(vnode.children ?? '', path);

	const entry = lookupEntry(type) || lookupByName(componentName(type));
	const component = resolveComponent(type, entry);
	const name = entry?.id || componentName(type) || 'node';
	return {
		id: stableId(name, path),
		label: entry?.label || labelFromName(name),
		typeId: entry?.id,
		component,
		props: normalizeProps(vnode.props || {}, entry),
		children: childrenToSpecs(vnode.children, path),
	};
}

function resolveComponent(type, entry) {
	if (entry) return entry.component;
	if (typeof type === 'string') return type;
	if (typeof type === 'object' || typeof type === 'function') return markRaw(type);
	return 'div';
}

function childrenToSpecs(children, path) {
	if (children == null) return [];
	if (typeof children === 'string' || typeof children === 'number') {
		const spec = textSpec(children, [...path, 'text']);
		return spec ? [spec] : [];
	}
	if (Array.isArray(children)) return vnodesToSpecs(children, path);
	if (typeof children === 'object' && typeof children.default === 'function') {
		return vnodesToSpecs(children.default(), path);
	}
	return [];
}

function textSpec(value, path) {
	const text = String(value).replace(/\s+/g, ' ').trim();
	if (!text) return null;
	return {
		id: stableId('text', path),
		label: 'Text',
		typeId: 'html-text',
		text,
	};
}

function normalizeProps(rawProps, entry) {
	const props = {};
	for (const [key, value] of Object.entries(rawProps)) {
		if (INTERNAL_PROPS.has(key) || key.startsWith('onVnode')) continue;
		if (key.startsWith('on') && (typeof value === 'function' || Array.isArray(value))) continue;
		if (!isSerializable(value)) continue;

		if (key === 'class') {
			const className = normalizeClass(value);
			if (className) props.class = className;
			continue;
		}

		props[key] = normalizeBooleanProp(key, value, entry);
	}
	return props;
}

function normalizeBooleanProp(key, value, entry) {
	if (value !== '') return value;
	if (BOOLEAN_ATTRS.has(key.toLowerCase())) return true;
	const prop = entry?.component?.props?.[key];
	const types = Array.isArray(prop?.type) ? prop.type : [prop?.type];
	return types.includes(Boolean) ? true : value;
}

function isSerializable(value) {
	if (value == null) return true;
	const type = typeof value;
	if (type === 'string' || type === 'number' || type === 'boolean') return true;
	if (Array.isArray(value)) return value.every(isSerializable);
	if (type === 'object') return Object.values(value).every(isSerializable);
	return false;
}

function toArray(value) {
	if (value == null) return [];
	return Array.isArray(value) ? value : [value];
}

function componentName(type) {
	if (typeof type === 'string') return type;
	return type?.name || type?.__name || type?.__doc?.tag || type?.__doc?.name || '';
}

function stableId(name, path) {
	const slug = slugify(name) || 'node';
	const suffix = path.map(String).join('-') || '0';
	return `${slug}-${suffix}`;
}

function labelFromName(name) {
	return String(name || 'Node')
		.replace(/[<>]/g, '')
		.replace(/^html-/, '')
		.replace(/^el-/, '')
		.replace(/^El/, '')
		.replace(/[-_]+/g, ' ')
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
		.replace(/\b\w/g, (c) => c.toUpperCase());
}

function slugify(name) {
	return String(name || '')
		.replace(/[<>]/g, '')
		.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}
