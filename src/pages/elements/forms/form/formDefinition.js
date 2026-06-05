export const FORM_NODE_RESERVED_KEYS = new Set([
	'id',
	'type',
	'component',
	'children',
	'properties',
	'items',
	'props',
	'text',
	'schema',
]);

export const defaultComponentByType = {
	string: 'ElTextInput',
	text: 'ElTextInput',
	email: 'ElEmailInput',
	url: 'ElUrlInput',
	number: 'ElNumberInput',
	integer: 'ElNumberInput',
	boolean: 'ElToggle',
	date: 'ElDatePicker',
	array: 'ElJsonListInput',
	object: 'ElForm',
	json: 'ElJsonInput',
};

export const typeByComponent = {
	ElAutocomplete: 'string',
	ElCalendar: 'date',
	ElCheckbox: 'boolean',
	ElCodeInput: 'string',
	ElCombobox: 'string',
	ElDatePicker: 'date',
	ElEmailInput: 'email',
	ElForm: 'object',
	ElJsonInput: 'json',
	ElJsonListInput: 'array',
	ElNativeSelect: 'string',
	ElNumberInput: 'number',
	ElPasswordInput: 'string',
	ElRadioGroup: 'string',
	ElSelectInput: 'string',
	ElTagCombobox: 'array',
	ElTextInput: 'string',
	ElTextareaInput: 'string',
	ElToggle: 'boolean',
	ElUrlInput: 'url',
};

const formTypes = new Map();

export function registerFormType(name, definition) {
	if (!name) return null;
	formTypes.set(name, definition);
	return definition;
}

export function getFormType(name) {
	return formTypes.get(name) || null;
}

export function isKnownComponent(name) {
	return Boolean(typeByComponent[name]);
}

export function isKnownDataType(name) {
	return Boolean(defaultComponentByType[name]);
}

function isComponentLike(name) {
	return typeof name === 'string' && /^[A-Z]/.test(name);
}

function clone(value) {
	if (value == null || typeof value !== 'object') return value;
	if (Array.isArray(value)) return value.map(clone);
	return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)]));
}

function formatInferredLabel(key = '') {
	return String(key)
		.replace(/[-_]+/g, ' ')
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
		.replace(/^./, (char) => char.toUpperCase());
}

function definedValues(values) {
	return values.filter((value) => value !== undefined && value !== null);
}

function inferStringType(value, key = '') {
	const name = String(key).toLowerCase();
	const text = String(value || '');
	if (name.includes('email') || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return 'email';
	if (
		name === 'url'
		|| name === 'href'
		|| name.endsWith('url')
		|| name.includes('avatar')
		|| name.includes('image')
		|| /^https?:\/\//.test(text)
	) return 'url';
	if (name.includes('date') || /^\d{4}-\d{2}-\d{2}$/.test(text)) return 'date';
	if (text.length > 160 || text.includes('\n')) return 'text';
	return 'string';
}

function inferNodeForValues(values, context = {}) {
	const candidates = definedValues(values);
	const props = context.key ? { label: formatInferredLabel(context.key) } : {};

	if (!candidates.length) return { type: 'json', ...props };
	if (candidates.every(Array.isArray)) {
		return {
			type: 'array',
			...props,
			items: inferNodeForValues(candidates.flat(), context),
		};
	}
	if (candidates.every((value) => value && typeof value === 'object' && !Array.isArray(value))) {
		return inferObjectFormNode(candidates, props);
	}
	if (candidates.some((value) => value && typeof value === 'object')) return { type: 'json', ...props };
	if (candidates.every((value) => typeof value === 'boolean')) return { type: 'boolean', ...props };
	if (candidates.every((value) => typeof value === 'number')) {
		return { type: candidates.every(Number.isInteger) ? 'integer' : 'number', ...props };
	}
	if (candidates.every((value) => typeof value === 'string')) {
		return { type: inferStringType(candidates[0], context.key), ...props };
	}
	return { type: 'json', ...props };
}

function inferObjectFormNode(objects, props = {}) {
	const keys = [...new Set(objects.flatMap((object) => Object.keys(object)))];
	return {
		type: 'ElForm',
		...props,
		properties: Object.fromEntries(keys.map((key) => [
			key,
			inferNodeForValues(objects.map((object) => object[key]), { key }),
		])),
	};
}

export function inferFormNodeFromValue(value) {
	if (Array.isArray(value)) {
		return {
			type: 'array',
			items: inferNodeForValues(value),
		};
	}
	if (value && typeof value === 'object') {
		return inferObjectFormNode([value]);
	}
	return null;
}

function shorthandProps(node) {
	return Object.fromEntries(
		Object.entries(node)
			.filter(([key]) => !FORM_NODE_RESERVED_KEYS.has(key))
			.map(([key, value]) => [key, clone(value)]),
	);
}

function normalizeChildren(children) {
	if (!children) return [];
	if (Array.isArray(children)) return children.map((child) => normalizeFormNode(child));
	if (typeof children === 'object') {
		return Object.entries(children).map(([name, child]) => normalizeFormNode(child, { name }));
	}
	return [];
}

function resolvedTypeDefinition(type) {
	const definition = getFormType(type);
	if (!definition) return null;
	return normalizeFormNode(definition);
}

function resolveTypeAndComponent(node, typeDefinition) {
	const rawType = node.type;
	let type = null;
	let component = node.component || null;

	if (typeDefinition) {
		type = typeDefinition.type;
		component ||= typeDefinition.component;
	}

	if (rawType && isKnownComponent(rawType)) {
		component ||= rawType;
		type ||= typeByComponent[rawType];
	} else if (rawType && isKnownDataType(rawType)) {
		type ||= rawType;
		component ||= defaultComponentByType[rawType];
	} else if (rawType && isComponentLike(rawType)) {
		component ||= rawType;
		type ||= typeByComponent[rawType] || (node.children || node.properties ? 'object' : rawType);
	} else if (rawType) {
		type ||= rawType;
		component ||= defaultComponentByType[rawType] || null;
	}

	if (component && !type) type = typeByComponent[component] || null;
	if (!type && (node.children || node.properties)) type = 'object';
	if (!component && type) component = defaultComponentByType[type] || null;
	if (!type) type = 'string';
	if (!component) component = defaultComponentByType[type] || type;

	return { type, component };
}

export function normalizeFormNode(node, context = {}) {
	if (node == null) return null;
	if (typeof node === 'string' || typeof node === 'number') {
		return { type: 'text', text: String(node) };
	}
	if (typeof node !== 'object') return null;
	if (node.component == null && node.text != null) {
		return {
			...(node.id ? { id: node.id } : {}),
			type: 'text',
			text: String(node.text || ''),
		};
	}

	const typeDefinition = resolvedTypeDefinition(node.type);
	const mergedNode = typeDefinition
		? {
			...typeDefinition,
			...node,
			props: {
				...(typeDefinition.props || {}),
				...(node.props || {}),
			},
			children: node.children ?? node.properties ?? typeDefinition.children,
			items: node.items ?? typeDefinition.items,
		}
		: node;
	const { type, component } = resolveTypeAndComponent(mergedNode, typeDefinition);
	const children = normalizeChildren(mergedNode.children ?? mergedNode.properties);
	const topLevelProps = shorthandProps(mergedNode);
	const inferredName = context.name && topLevelProps.name == null && mergedNode.props?.name == null
		? { name: context.name }
		: {};
	const props = {
		...topLevelProps,
		...inferredName,
		...(mergedNode.props ? clone(mergedNode.props) : {}),
	};
	const normalized = {
		...(mergedNode.id ? { id: mergedNode.id } : {}),
		type,
		component,
		props,
	};

	if (children.length) normalized.children = children;
	if (mergedNode.items) normalized.items = normalizeFormNode(mergedNode.items);
	return normalized;
}

export function normalizeFormChildren(children) {
	return normalizeChildren(children).filter(Boolean);
}

function resolveDefaultValue(value, context = {}) {
	return typeof value === 'function' ? value(context.index ?? 0, context) : clone(value);
}

export function formNodeDefaultValue(node, context = {}) {
	const normalized = normalizeFormNode(node);
	if (!normalized) return null;
	const props = normalized.props || {};
	if (props.default !== undefined) return resolveDefaultValue(props.default, context);
	if (props.options?.length) {
		const first = props.options[0];
		return first && typeof first === 'object' && 'value' in first ? clone(first.value) : clone(first);
	}
	if (normalized.type === 'object') {
		return Object.fromEntries(
			(normalized.children || [])
				.map((child) => [child.props?.name, formNodeDefaultValue(child, context)])
				.filter(([name]) => name),
		);
	}
	if (normalized.type === 'array') return [];
	if (normalized.type === 'boolean') return false;
	if (normalized.type === 'number' || normalized.type === 'integer') return 0;
	if (normalized.type === 'json') return null;
	if (props.name === 'id' || props.name === 'value') return `item-${(context.index ?? 0) + 1}`;
	if (props.name === 'label' || props.name === 'name') return `Item ${(context.index ?? 0) + 1}`;
	return '';
}

function optionValues(options) {
	if (!Array.isArray(options)) return null;
	return options.map((option) => (
		option && typeof option === 'object' && 'value' in option ? option.value : option
	));
}

function jsonSchemaTypeFor(node) {
	if (node.type === 'email' || node.type === 'url' || node.type === 'date' || node.type === 'text') return 'string';
	if (node.type === 'json') return 'object';
	if (isKnownDataType(node.type)) return node.type === 'integer' ? 'integer' : node.type;
	if (node.children?.length) return 'object';
	return 'string';
}

export function formDefinitionToJsonSchema(definition) {
	const node = Array.isArray(definition) || (definition && !definition.type && !definition.component)
		? normalizeFormNode({ type: 'object', children: definition })
		: normalizeFormNode(definition);
	return formNodeToJsonSchema(node);
}

export function formNodeToJsonSchema(node) {
	const normalized = normalizeFormNode(node);
	if (!normalized) return {};
	const props = normalized.props || {};
	const type = jsonSchemaTypeFor(normalized);
	const schema = { type };

	if (props.label) schema.title = props.label;
	if (props.description) schema.description = props.description;
	if (props.default !== undefined) schema.default = clone(props.default);
	if (props.placeholder) schema.examples = [props.placeholder];

	if (normalized.type === 'email') schema.format = 'email';
	if (normalized.type === 'url') schema.format = 'uri';
	if (normalized.type === 'date') schema.format = 'date';
	if (props.format) schema.format = props.format;

	const enumValues = props.enum || optionValues(props.options);
	if (enumValues?.length) schema.enum = enumValues;

	for (const [propName, schemaName] of [
		['minLength', 'minLength'],
		['maxLength', 'maxLength'],
		['minimum', 'minimum'],
		['maximum', 'maximum'],
		['min', 'minimum'],
		['max', 'maximum'],
		['pattern', 'pattern'],
	]) {
		if (props[propName] !== undefined && schema[schemaName] === undefined) {
			schema[schemaName] = clone(props[propName]);
		}
	}

	if (type === 'object') {
		const required = [];
		schema.properties = {};
		for (const child of normalized.children || []) {
			const name = child.props?.name;
			if (!name) continue;
			schema.properties[name] = formNodeToJsonSchema(child);
			if (child.props?.required) required.push(name);
		}
		if (required.length) schema.required = required;
	}

	if (type === 'array') {
		schema.items = normalized.items ? formNodeToJsonSchema(normalized.items) : {};
	}

	return schema;
}
