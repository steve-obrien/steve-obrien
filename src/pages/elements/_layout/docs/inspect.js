// Reflect documentation metadata from a Vue component.
//
// Props are read from the component's runtime `props` definition. Description,
// labels, options and editor hints come from the same `_edit` blocks that the
// inspector uses, so the docs and the live editor always agree.
//
// Slots and keyboard tables come from an optional `__doc` export on the
// component itself — co-located with the component, picked up here:
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
//
// Event names are merged from runtime `emits`, `__doc.events`, and the raw
// source. The source pass catches quick additions like `emit('new-event')`
// even when the author has not written the richer docs yet.

import { formNodeDefaultValue, normalizeFormNode } from '../../forms/form/formDefinition.js';

const PROP_BLACKLIST = new Set(['class', 'modelModifiers']);

export function inspectComponent(component, source = '') {
	if (!component) return null;
	const doc = component.__doc || {};
	const jsdoc = parseJsdoc(source);
	const docTypes = { ...jsdoc.types, ...(doc.types || {}) };
	const sourceEvents = parseSourceEvents(source);
	return {
		name: doc.name || component.name || component.__name || null,
		description: doc.description || null,
		tag: doc.tag || null,
		props: propEntries(component).map(([name, def]) => buildPropDoc(name, def, docTypes, jsdoc.props[name])),
		slots: doc.slots || [],
		events: mergeEvents(component, doc.events, docTypes, sourceEvents),
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

function mergeEvents(component, docEvents, docTypes = {}, sourceEvents = []) {
	const names = unique([
		...emitNames(component),
		...(docEvents || []).map((event) => event.name),
		...sourceEvents.map((event) => event.name),
	]);
	const docMap = new Map((docEvents || []).map((e) => [e.name, e]));
	const sourceMap = new Map(sourceEvents.map((e) => [e.name, e]));
	if (!names.length) return [];
	return names
		.filter((n) => !n.startsWith('hook:'))
		.map((name) => {
			const eventDoc = docMap.get(name) || {};
			const payload = eventDoc.payload || sourceMap.get(name)?.payload || '';
			const typeRef = eventTypeRef(eventDoc, payload);
			const payloadTypeRef = typeRefFromPayload(payload);
			return {
				name,
				payload,
				description: eventDoc.description || '',
				details: formatDocDetails(eventDoc.details, docTypes) || formatTypeRef(payloadTypeRef, docTypes),
				payloadTokens: payloadTokensFor(payload, typeRef, docTypes),
				typeDefinitions: typeDefinitionsFor(payloadTypeRef, docTypes),
			};
		});
}

function eventTypeRef(eventDoc, payload = '') {
	const detailsRef = typeof eventDoc.details === 'object' ? eventDoc.details?.typeRef : '';
	return eventDoc.typeRef || detailsRef || typeRefFromPayload(eventDoc.payload || payload);
}

function payloadTokensFor(payload = '', typeRef = '', docTypes = {}) {
	const text = String(payload || '');
	if (!text) return [];
	const propertyTypes = eventPayloadPropertyTypes(text, typeRef, docTypes);
	return text
		.split(/(\b[A-Za-z_$][\w$]*\b)/g)
		.filter((token) => token !== '')
		.map((token) => {
			const type = propertyTypes[token] || '';
			return {
				definition: type ? eventPayloadTokenDefinition(token, type, docTypes) : '',
				text: token,
				type,
				typeDefinitions: typeDefinitionsFor(type, docTypes),
			};
		});
}

function eventPayloadPropertyTypes(payload, typeRef, docTypes = {}) {
	const out = {};
	const directParam = payloadParamType(payload);
	if (directParam) out[directParam.name] = directParam.type;

	const def = docTypes?.[typeRef];
	for (const field of def?.fields || []) out[field.name] = field.type;

	const payloadName = payloadParamName(payload);
	if (payloadName && typeRef && !out[payloadName]) out[payloadName] = displayTypeRef(typeRef, docTypes);
	return out;
}

function payloadParamType(payload = '') {
	const match = String(payload).match(/^\(\s*([A-Za-z_$][\w$]*)\s*:\s*([^)]+?)\s*\)$/);
	if (!match) return null;
	return { name: match[1], type: normalizeJsdocType(match[2]) };
}

function payloadParamName(payload = '') {
	return payloadParamType(payload)?.name || '';
}

function eventPayloadTokenDefinition(name, type, docTypes = {}) {
	const refs = referencedTypes(type).filter((ref) => docTypes?.[ref]);
	if (refs[0]) return directTypeDefinition(refs[0], docTypes);
	return `${name}: ${type};`;
}

function unique(values) {
	return [...new Set(values.filter(Boolean))];
}

function parseSourceEvents(source = '') {
	if (!source) return [];
	const events = new Map();

	for (const name of parseDefineEmitsNames(source)) {
		rememberSourceEvent(events, name, false);
	}

	for (const emitter of parseEmitterNames(source)) {
		for (const call of parseCalls(source, emitter)) {
			for (const name of eventNamesFromExpression(call.args[0])) {
				rememberSourceEvent(events, name, call.args.length > 1);
			}
		}
	}

	return [...events.values()];
}

function parseDefineEmitsNames(source) {
	const names = [];
	const arrayPattern = /defineEmits\s*\(\s*\[([\s\S]*?)\]\s*\)/g;
	let match;
	while ((match = arrayPattern.exec(source))) {
		names.push(...stringLiterals(match[1]));
	}

	const objectPattern = /defineEmits\s*\(\s*\{([\s\S]*?)\}\s*\)/g;
	while ((match = objectPattern.exec(source))) {
		names.push(...objectEventKeys(match[1]));
	}

	return unique(names);
}

function objectEventKeys(source) {
	const names = [];
	const keyPattern = /(?:^|,)\s*(?:(['"])(.*?)\1|([A-Za-z_$][\w$-]*))\s*:/g;
	let match;
	while ((match = keyPattern.exec(source))) {
		names.push(match[2] || match[3]);
	}
	return names;
}

function parseEmitterNames(source) {
	const names = ['$emit'];
	const pattern = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*defineEmits\b/g;
	let match;
	while ((match = pattern.exec(source))) names.push(match[1]);
	return unique(names);
}

function parseCalls(source, callee) {
	const calls = [];
	const pattern = new RegExp(`(^|[^\\w$])${escapeRegExp(callee)}\\s*\\(`, 'g');
	let match;
	while ((match = pattern.exec(source))) {
		const openIndex = pattern.lastIndex - 1;
		const args = readCallArguments(source, openIndex);
		if (args) calls.push({ args });
	}
	return calls;
}

function readCallArguments(source, openIndex) {
	const args = [];
	let argStart = openIndex + 1;
	let depth = 0;
	let quote = '';
	let escaped = false;

	for (let index = openIndex + 1; index < source.length; index += 1) {
		const char = source[index];

		if (quote) {
			if (escaped) {
				escaped = false;
			} else if (char === '\\') {
				escaped = true;
			} else if (char === quote) {
				quote = '';
			}
			continue;
		}

		if (char === '\'' || char === '"' || char === '`') {
			quote = char;
			continue;
		}

		if (char === '(' || char === '[' || char === '{') {
			depth += 1;
			continue;
		}

		if (char === ')' && depth === 0) {
			args.push(source.slice(argStart, index).trim());
			return args.filter(Boolean);
		}

		if (char === ')' || char === ']' || char === '}') {
			depth = Math.max(0, depth - 1);
			continue;
		}

		if (char === ',' && depth === 0) {
			args.push(source.slice(argStart, index).trim());
			argStart = index + 1;
		}
	}

	return null;
}

function eventNamesFromExpression(expression = '') {
	const trimmed = expression.trim();
	if (!trimmed) return [];

	const literal = readStringLiteral(trimmed);
	if (literal && !literal.rest) return [literal.value];

	const ternary = splitTopLevelTernary(trimmed);
	if (!ternary) return [];
	return [
		...eventNamesFromExpression(ternary.whenTrue),
		...eventNamesFromExpression(ternary.whenFalse),
	];
}

function splitTopLevelTernary(expression) {
	let depth = 0;
	let quote = '';
	let escaped = false;
	let questionIndex = -1;

	for (let index = 0; index < expression.length; index += 1) {
		const char = expression[index];

		if (quote) {
			if (escaped) escaped = false;
			else if (char === '\\') escaped = true;
			else if (char === quote) quote = '';
			continue;
		}

		if (char === '\'' || char === '"' || char === '`') {
			quote = char;
			continue;
		}

		if (char === '(' || char === '[' || char === '{') depth += 1;
		else if (char === ')' || char === ']' || char === '}') depth = Math.max(0, depth - 1);
		else if (char === '?' && depth === 0 && questionIndex < 0) questionIndex = index;
		else if (char === ':' && depth === 0 && questionIndex >= 0) {
			return {
				whenTrue: expression.slice(questionIndex + 1, index).trim(),
				whenFalse: expression.slice(index + 1).trim(),
			};
		}
	}

	return null;
}

function readStringLiteral(expression) {
	const quote = expression[0];
	if (quote !== '\'' && quote !== '"' && quote !== '`') return null;
	let escaped = false;
	let value = '';

	for (let index = 1; index < expression.length; index += 1) {
		const char = expression[index];
		if (escaped) {
			value += char;
			escaped = false;
			continue;
		}
		if (char === '\\') {
			escaped = true;
			continue;
		}
		if (char === quote) {
			const rest = expression.slice(index + 1).trim();
			if (quote === '`' && value.includes('${')) return null;
			return { rest, value };
		}
		value += char;
	}

	return null;
}

function stringLiterals(source) {
	const names = [];
	const pattern = /(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g;
	let match;
	while ((match = pattern.exec(source))) {
		if (match[1] === '`' && match[2].includes('${')) continue;
		names.push(match[2]);
	}
	return names;
}

function rememberSourceEvent(events, name, hasPayload) {
	if (!name) return;
	const current = events.get(name);
	events.set(name, {
		name,
		payload: current?.payload || (hasPayload ? '(payload: unknown)' : ''),
	});
}

function escapeRegExp(value) {
	return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function propEntries(component) {
	const p = component.props;
	if (!p) return [];
	if (Array.isArray(p)) return p.map((k) => [k, {}]);
	return Object.entries(p).filter(([k]) => !PROP_BLACKLIST.has(k) && !k.startsWith('_'));
}

function buildPropDoc(name, def, docTypes = {}, jsdocProp = {}) {
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
	const shape = propShapeDoc(name, types, edit, editProps, docTypes, jsdocProp);
	return {
		name,
		type,
		ts: shape.ts || fallbackAdvancedType(types, type),
		default: formatDefault(def?.default),
		required: !!def?.required,
		group: edit.group || editProps.group || 'Control props',
		description: edit.description || editProps.description || '',
		details: shape.details,
		example: shape.example,
		typeDefinitions: shape.typeDefinitions,
		editor: edit.component || null,
	};
}

function arrayify(t) { return Array.isArray(t) ? t : [t]; }

function propShapeDoc(name, types, edit, editProps, docTypes, jsdocProp) {
	const typeRef = propTypeRef(edit, editProps, jsdocProp);
	if (typeRef) {
		const ts = displayTypeRef(typeRef, docTypes);
		return {
			details: formatTypeRef(typeRef, docTypes),
			example: collectTypeExamples(typeRef, docTypes, new Set())[0] || '',
			ts,
			typeDefinitions: typeDefinitionsFor(ts, docTypes),
		};
	}

	const manual = edit.details || editProps.details;
	if (manual) return { details: formatDocDetails(manual, docTypes), example: '', ts: '', typeDefinitions: {} };

	const schema = edit.schema || editProps.schema;
	if (!schema || (Array.isArray(schema) && !schema.length)) return emptyShapeDoc();
	if (types.includes(Array)) return schemaShapeDoc(name, 'array', schema);
	if (types.includes(Object)) return schemaShapeDoc(name, 'object', schema);
	return emptyShapeDoc();
}

function propTypeRef(edit, editProps, jsdocProp) {
	return edit.typeRef || editProps.typeRef || jsdocProp.typeRef || '';
}

function displayTypeRef(typeRef, docTypes = {}) {
	return docTypes?.[typeRef]?.alias || typeRef;
}

function fallbackAdvancedType(types, type) {
	if (types.includes(Array)) return 'Array<unknown>';
	if (types.includes(Object)) return 'Record<string, unknown>';
	if (types.includes(String)) return 'string';
	if (types.includes(Number)) return 'number';
	if (types.includes(Boolean)) return 'boolean';
	if (types.includes(Function)) return 'Function';
	return type || 'unknown';
}

function typeDefinitionsFor(ts, docTypes = {}) {
	const names = unique(
		referencedTypes(ts)
			.filter((name) => docTypes?.[name])
			.flatMap((name) => collectReferencedTypeNames(name, docTypes, new Set())),
	);
	return Object.fromEntries(names.map((name) => [name, directTypeDefinition(name, docTypes)]));
}

function formatShapeDetails(name, types, edit, editProps, docTypes, jsdocProp) {
	const typeRef = edit.typeRef || editProps.typeRef || jsdocProp.typeRef;
	if (typeRef) return formatTypeRef(typeRef, docTypes);

	const manual = edit.details || editProps.details;
	if (manual) return formatDocDetails(manual, docTypes);

	const schema = edit.schema || editProps.schema;
	if (!Array.isArray(schema) || !schema.length) return '';
	if (types.includes(Array)) return formatSchemaShape(name, 'array', schema);
	if (types.includes(Object)) return formatSchemaShape(name, 'object', schema);
	return '';
}

function formatDocDetails(details, docTypes = {}) {
	if (!details) return '';
	if (typeof details === 'string') return details;
	if (details.typeRef) return formatTypeRef(details.typeRef, docTypes);
	return JSON.stringify(details, null, 2);
}

function formatTypeRef(typeRef, docTypes = {}) {
	if (!typeRef) return '';
	const seen = new Set();
	const definitions = collectTypeDefinitions(typeRef, docTypes, seen);
	const examples = collectTypeExamples(typeRef, docTypes, new Set());
	return [...definitions, ...examples].filter(Boolean).join('\n\n');
}

function typeRefFromPayload(payload = '') {
	const match = String(payload).match(/:\s*([A-Z][A-Za-z0-9_]*)\)?$/);
	return match?.[1] || '';
}

function collectTypeDefinitions(typeRef, docTypes, seen) {
	if (seen.has(typeRef)) return [];
	seen.add(typeRef);
	const def = docTypes?.[typeRef];
	if (!def) return [`type ${typeRef} = unknown;`];

	const dependencies = [
		...(def.of ? referencedTypes(def.of) : []),
		...(def.fields || []).flatMap((field) => referencedTypes(field.type)),
	].filter((name) => name !== typeRef && docTypes?.[name]);

	return [
		directTypeDefinition(typeRef, docTypes),
		...dependencies.flatMap((name) => collectTypeDefinitions(name, docTypes, seen)),
	];
}

function collectReferencedTypeNames(typeRef, docTypes, seen) {
	if (seen.has(typeRef)) return [];
	seen.add(typeRef);
	const def = docTypes?.[typeRef];
	if (!def) return [];
	const dependencies = [
		...(def.alias ? referencedTypes(def.alias) : []),
		...(def.fields || []).flatMap((field) => referencedTypes(field.type)),
	].filter((name) => name !== typeRef && docTypes?.[name]);
	return [
		typeRef,
		...dependencies.flatMap((name) => collectReferencedTypeNames(name, docTypes, seen)),
	];
}

function directTypeDefinition(typeRef, docTypes = {}) {
	const def = docTypes?.[typeRef];
	if (!def) return `type ${typeRef} = unknown;`;
	if (def.alias) return `type ${typeRef} = ${def.alias};`;
	const lines = (def.fields || []).map(formatTypeField);
	return `type ${typeRef} = {\n${lines.join('\n')}\n};`;
}

function formatTypeField(field) {
	const optional = field.optional ? '?' : '';
	const comment = field.description ? ` // ${field.description}` : '';
	return `\t${field.name}${optional}: ${field.type};${comment}`;
}

function referencedTypes(value) {
	const builtIns = new Set(['Array', 'MouseEvent', 'Record', 'string', 'number', 'boolean', 'unknown', 'null', 'object']);
	return String(value || '')
		.match(/\b[A-Z][A-Za-z0-9_]*\b/g)
		?.filter((name) => !builtIns.has(name)) || [];
}

function collectTypeExamples(typeRef, docTypes, seen) {
	if (seen.has(typeRef)) return [];
	seen.add(typeRef);
	const def = docTypes?.[typeRef];
	if (!def) return [];
	const own = (def.examples || []).map((example) => {
		if (example.value && typeof example.value === 'object' && 'raw' in example.value) return example.value.raw;
		return `const ${example.name}: ${example.type || typeRef} = ${formatExampleValue(example.value, 0)};`;
	});
	return [
		...own,
		...(def.alias ? collectTypeExamples(def.alias.replace(/^Array<(.+)>$/, '$1'), docTypes, seen) : []),
	];
}

function formatExampleValue(value, depth) {
	if (value && typeof value === 'object' && 'raw' in value) return value.raw;
	if (Array.isArray(value)) {
		if (!value.length) return '[]';
		const indent = '\t'.repeat(depth);
		const childIndent = '\t'.repeat(depth + 1);
		return `[\n${value.map((item) => `${childIndent}${formatExampleValue(item, depth + 1)}`).join(',\n')}\n${indent}]`;
	}
	if (value && typeof value === 'object') {
		const entries = Object.entries(value);
		if (!entries.length) return '{}';
		const indent = '\t'.repeat(depth);
		const childIndent = '\t'.repeat(depth + 1);
		return `{\n${entries.map(([key, item]) => `${childIndent}${key}: ${formatExampleValue(item, depth + 1)}`).join(',\n')}\n${indent}}`;
	}
	return JSON.stringify(value);
}

function parseJsdoc(source) {
	if (!source) return { types: {}, props: {} };
	const types = {};
	const props = {};
	for (const block of jsdocBlocks(source)) {
		const comment = cleanJsdoc(block.comment);
		const typedef = parseTypedef(comment);
		if (typedef) types[typedef.name] = typedef;
		if (block.target) {
			const typeRef = parseTypeTag(comment);
			if (typeRef) props[block.target] = { typeRef };
		}
	}
	return { types, props };
}

function jsdocBlocks(source) {
	const blocks = [];
	const pattern = /\/\*\*([\s\S]*?)\*\/\s*([A-Za-z_$][\w$]*)?\s*:?/g;
	let match;
	while ((match = pattern.exec(source))) {
		blocks.push({ comment: match[1], target: match[2] || '' });
	}
	return blocks;
}

function cleanJsdoc(comment) {
	return comment
		.split('\n')
		.map((line) => line.replace(/^\s*\*\s?/, '').trimEnd())
		.join('\n')
		.trim();
}

function parseTypedef(comment) {
	const match = comment.match(/@typedef\s+\{([^}]+)\}\s+([A-Za-z_$][\w$]*)/);
	if (!match) return null;
	const [, type, name] = match;
	if (type !== 'object') {
		return {
			alias: normalizeJsdocType(type),
			examples: parseExamples(comment, name),
			name,
		};
	}
	return {
		fields: parseProperties(comment),
		examples: parseExamples(comment, name),
		name,
	};
}

function parseTypeTag(comment) {
	const match = comment.match(/@type\s+\{([^}]+)\}/);
	return match ? normalizeJsdocType(match[1]) : '';
}

function parseProperties(comment) {
	const properties = [];
	const pattern = /(?:^|\n)@property[ \t]+\{([^}]+)\}[ \t]+(\[[^\]]+\]|[^\s]+)[^\S\n]*(.*)/g;
	let match;
	while ((match = pattern.exec(comment))) {
		const [, rawType, rawName, description] = match;
		const parsed = parsePropertyName(rawName);
		if (!parsed.name) continue;
		properties.push({
			description: description.trim(),
			name: parsed.name,
			optional: parsed.optional,
			type: normalizeJsdocType(rawType),
		});
	}
	return properties;
}

function parsePropertyName(rawName) {
	if (!rawName.startsWith('[')) return { name: rawName, optional: false };
	const inner = rawName.slice(1, -1);
	const [name] = inner.split('=');
	return { name, optional: true };
}

function parseExamples(comment, typeName) {
	const examples = [];
	const pattern = /@example\s*(?:\n|$)([\s\S]*?)(?=\n@[A-Za-z]|\s*$)/g;
	let match;
	let index = 1;
	while ((match = pattern.exec(comment))) {
		const code = match[1].trim();
		if (!code) continue;
		examples.push({
			name: index === 1 ? exampleNameFor(typeName) : `${exampleNameFor(typeName)}${index}`,
			type: typeName,
			value: { raw: code },
		});
		index += 1;
	}
	return examples;
}

function exampleNameFor(typeName) {
	return `${typeName.charAt(0).toLowerCase()}${typeName.slice(1)}Example`;
}

function normalizeJsdocType(type) {
	return String(type)
		.trim()
		.replace(/\|/g, ' | ')
		.replace(/\s+/g, ' ')
		.replace(/\bArray\.<([^>]+)>/g, 'Array<$1>')
		.replace(/\?([A-Za-z_$][\w$]*)/g, '$1 | null');
}

function formatSchemaShape(name, kind, schema) {
	const shape = schemaShapeDoc(name, kind, schema);
	if (!shape.ts) return '';
	return [Object.values(shape.typeDefinitions).join('\n\n'), `Example:\n${shape.example}`].filter(Boolean).join('\n\n');
}

function emptyShapeDoc() {
	return { details: '', example: '', ts: '', typeDefinitions: {} };
}

function schemaShapeDoc(name, kind, schema) {
	if (!Array.isArray(schema) || !schema.some((field) => field?.key)) {
		return formSchemaShapeDoc(name, kind, schema);
	}

	return legacySchemaShapeDoc(name, kind, schema);
}

function legacySchemaShapeDoc(name, kind, schema) {
	const typeName = toTypeName(name);
	const itemTypeName = `${typeName}Item`;
	const lines = schemaTypeFields(schema);
	if (!lines.length) return emptyShapeDoc();
	const example = formatSchemaExample(kind, schema);
	if (kind === 'array') {
		return {
			details: '',
			example,
			ts: `Array<${itemTypeName}>`,
			typeDefinitions: {
				[itemTypeName]: `type ${itemTypeName} = {\n${lines.join('\n')}\n};`,
			},
		};
	}
	return {
		details: '',
		example,
		ts: typeName,
		typeDefinitions: {
			[typeName]: `type ${typeName} = {\n${lines.join('\n')}\n};`,
		},
	};
}

function formSchemaShapeDoc(name, kind, schema) {
	const root = normalizeSchemaDocNode(kind, schema);
	if (!root) return emptyShapeDoc();

	const typeDefinitions = {};
	const typeName = toTypeName(name);
	let ts;
	if (kind === 'array') {
		const itemType = root.type === 'array'
			? typeForFormNode(root.items || { type: 'json' }, `${typeName}Item`, typeDefinitions)
			: typeForFormNode(root, `${typeName}Item`, typeDefinitions);
		ts = `Array<${itemType}>`;
	} else {
		ts = typeForFormNode(root, typeName, typeDefinitions);
	}

	return {
		details: '',
		example: formatFormSchemaExample(root, kind),
		ts,
		typeDefinitions,
	};
}

function normalizeSchemaDocNode(kind, schema) {
	if (!schema) return null;
	const normalized = normalizeFormNode(schema);
	if (!normalized) return null;
	if (kind === 'array' && normalized.type !== 'array') {
		return normalizeFormNode({ type: 'array', items: schema });
	}
	return normalized;
}

function typeForFormNode(node, preferredTypeName, typeDefinitions) {
	const normalized = normalizeFormNode(node);
	if (!normalized) return 'unknown';
	const props = normalized.props || {};
	if (props.valueType) return props.valueType;
	if (Array.isArray(props.options) && props.options.length) return props.options.map((option) => {
		const value = option && typeof option === 'object' && 'value' in option ? option.value : option;
		return JSON.stringify(value);
	}).join(' | ');
	if (normalized.type === 'array') {
		return `Array<${typeForFormNode(normalized.items || { type: 'json' }, preferredTypeName, typeDefinitions)}>`;
	}
	if (normalized.type === 'object') {
		if (!normalized.children?.length) return 'Record<string, unknown>';
		if (!typeDefinitions[preferredTypeName]) {
			const lines = normalized.children
				.filter((child) => child?.props?.name)
				.map((child) => formTypeFieldLine(child, preferredTypeName, typeDefinitions));
			typeDefinitions[preferredTypeName] = `type ${preferredTypeName} = {\n${lines.join('\n')}\n};`;
		}
		return preferredTypeName;
	}
	if (normalized.type === 'boolean') return 'boolean';
	if (normalized.type === 'number' || normalized.type === 'integer') return 'number';
	if (normalized.type === 'array') return 'Array<unknown>';
	if (normalized.type === 'json') return 'unknown';
	return 'string';
}

function formTypeFieldLine(child, parentTypeName, typeDefinitions) {
	const props = child.props || {};
	const name = props.name;
	const optional = props.required ? '' : '?';
	const childTypeName = `${parentTypeName}${singularTypeName(name)}`;
	const type = typeForFormNode(child, childTypeName, typeDefinitions);
	const note = props.description || props.label || props.placeholder || '';
	return `\t${name}${optional}: ${type};${note ? ` // ${note}` : ''}`;
}

function formatFormSchemaExample(root, kind) {
	if (kind === 'array' && root.type !== 'array') {
		return formatSampleValue([sampleFormValue(root, { index: 0 })]);
	}
	return formatSampleValue(sampleFormValue(root, { index: 0 }));
}

function sampleFormValue(node, context = {}) {
	const normalized = normalizeFormNode(node);
	if (!normalized) return null;
	if (normalized.type === 'array') {
		return [sampleFormValue(normalized.items || { type: 'json' }, context)];
	}
	if (normalized.type === 'object') {
		return Object.fromEntries(
			(normalized.children || [])
				.filter((child) => child?.props?.name)
				.map((child) => [child.props.name, sampleFormValue(child, context)]),
		);
	}
	return formNodeDefaultValue(normalized, context);
}

function formatSampleValue(value) {
	return JSON.stringify(value, null, '\t');
}

function singularTypeName(name) {
	return toTypeName(singularWord(name));
}

function singularWord(name) {
	const normalized = String(name || 'item').trim();
	const lower = normalized.toLowerCase();
	if (lower === 'children') return 'child';
	if (lower.endsWith('ies')) return `${normalized.slice(0, -3)}y`;
	if (lower.endsWith('s')) return normalized.slice(0, -1);
	return normalized;
}

function schemaTypeFields(schema) {
	return schema
		.filter((field) => field?.key)
		.map((field) => {
			const type = fieldTypeName(field);
			const optional = field.required ? '' : '?';
			const note = field.description || field.label || field.placeholder || '';
			return `\t${field.key}${optional}: ${type};${note ? ` // ${note}` : ''}`;
		});
}

function formatSchemaExample(kind, schema) {
	const entries = schema
		.filter((field) => field?.key)
		.map((field) => `\t${field.key}: ${sampleValueForField(field)},`);
	const body = `{\n${entries.join('\n')}\n}`;
	if (kind === 'array') return `[\n\t${body.replace(/\n/g, '\n\t')}\n]`;
	return body;
}

function toTypeName(name) {
	return String(name || 'value')
		.split(/[^a-zA-Z0-9]+/)
		.filter(Boolean)
		.map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
		.join('') || 'Value';
}

function fieldTypeName(field) {
	if (field.valueType) return field.valueType;
	if (field.options) return field.options.map((option) => JSON.stringify(option)).join(' | ');
	if (field.type === 'boolean') return 'boolean';
	if (field.type === 'number') return 'number';
	if (field.type === 'json') return 'unknown';
	if (field.type === 'list') return 'Array<unknown>';
	return 'string';
}

function sampleValueForField(field) {
	if ('default' in field && typeof field.default === 'function') {
		try {
			return JSON.stringify(field.default(0));
		} catch {
			return sampleValueForField(Object.fromEntries(Object.entries(field).filter(([key]) => key !== 'default')));
		}
	}
	if ('default' in field && field.default !== undefined) return JSON.stringify(field.default);
	if (Array.isArray(field.options) && field.options.length) return JSON.stringify(field.options[0]);
	if (field.type === 'boolean') return 'false';
	if (field.type === 'number') return '0';
	if (field.type === 'json') return 'null';
	if (field.type === 'list') return '[]';
	if (field.placeholder) return JSON.stringify(field.placeholder);
	if (field.key === 'id') return JSON.stringify('item-1');
	if (field.key === 'value') return JSON.stringify('item-1');
	if (field.key === 'label') return JSON.stringify('Item');
	return JSON.stringify('');
}

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
