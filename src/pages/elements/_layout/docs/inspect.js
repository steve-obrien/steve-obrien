// Reflect documentation metadata from a Vue component.
//
// Props are read from the component's runtime `props` definition. Description,
// labels, options and editor hints come from the same `_edit` blocks that the
// inspector uses, so the docs and the live editor always agree.
//
// Slots, events and keyboard tables come from an optional `__doc` export on
// the component itself — co-located with the component, picked up here:
//
//   <script>
//   export const __doc = {
//     name: 'Dropdown',
//     description: '…',
//     tag: '<element-dropdown>',
//     slots: [{ name: 'trigger', description: '…' }],
//     events: [{ name: 'select', payload: '(value: string)', description: '…' }],
//     keyboard: [{ keys: '↑ / ↓', action: '…' }],
//   };
//   </script>

const PROP_BLACKLIST = new Set(['class', 'modelModifiers']);

export function inspectComponent(component) {
	if (!component) return null;
	const doc = component.__doc || {};
	return {
		name: doc.name || component.name || component.__name || null,
		description: doc.description || null,
		tag: doc.tag || null,
		props: propEntries(component).map(([name, def]) => buildPropDoc(name, def)),
		slots: doc.slots || [],
		// Events are read from defineEmits at the runtime level — defineEmits
		// is the canonical list of what the component fires. `__doc.events`
		// supplies the human-friendly payload type + description for each.
		events: mergeEvents(component, doc.events),
		keyboard: doc.keyboard || [],
		examples: doc.examples || [],
	};
}

function emitNames(component) {
	const e = component.emits;
	if (!e) return [];
	if (Array.isArray(e)) return e;
	return Object.keys(e);
}

function mergeEvents(component, docEvents) {
	const names = emitNames(component);
	const docMap = new Map((docEvents || []).map((e) => [e.name, e]));
	// No defineEmits → fall back entirely to whatever the author wrote in __doc.
	if (!names.length) return docEvents || [];
	return names
		.filter((n) => !n.startsWith('hook:'))
		.map((name) => ({
			name,
			payload: docMap.get(name)?.payload || '',
			description: docMap.get(name)?.description || '',
		}));
}

function propEntries(component) {
	const p = component.props;
	if (!p) return [];
	if (Array.isArray(p)) return p.map((k) => [k, {}]);
	return Object.entries(p).filter(([k]) => !PROP_BLACKLIST.has(k) && !k.startsWith('_'));
}

function buildPropDoc(name, def) {
	const edit = def?._edit || {};
	const editProps = edit.props || {};
	const types = arrayify(def?.type ?? def);
	let type;
	if (edit.options || editProps.options) {
		type = (edit.options || editProps.options).map((o) => (typeof o === 'string' ? `'${o}'` : String(o))).join(' | ');
	} else {
		const formatted = types.map(formatType).filter(Boolean);
		type = formatted.length ? formatted.join(' | ') : 'any';
	}
	return {
		name,
		type,
		default: formatDefault(def?.default),
		required: !!def?.required,
		group: edit.group || editProps.group || 'Control props',
		description: edit.description || editProps.description || '',
		editor: edit.component || edit.editor || null,
	};
}

function arrayify(t) { return Array.isArray(t) ? t : [t]; }

function formatType(t) {
	if (t === String) return 'string';
	if (t === Number) return 'number';
	if (t === Boolean) return 'boolean';
	if (t === Array) return 'array';
	if (t === Object) return 'object';
	if (t === Function) return 'function';
	if (t == null) return null;
	return typeof t === 'function' && t.name ? t.name.toLowerCase() : null;
}

function formatDefault(v) {
	if (v === undefined || v === null) return '—';
	if (typeof v === 'function') {
		try {
			const r = v();
			const str = JSON.stringify(r);
			return str && str.length < 40 ? str : '() => …';
		} catch {
			return '() => …';
		}
	}
	if (typeof v === 'string') return v ? `'${v}'` : "''";
	if (typeof v === 'boolean' || typeof v === 'number') return String(v);
	const str = JSON.stringify(v);
	return str && str.length < 40 ? str : '…';
}
