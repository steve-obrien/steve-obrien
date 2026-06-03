import {
	clone,
	fieldOptions,
	formatLabel,
	formDecoration,
	hasOwn,
	isEmpty,
	optionObjects,
	raw,
} from './shared.js';

function jsonSchemaType(schema) {
	const plain = raw(schema) || {};
	const type = Array.isArray(plain.type)
		? plain.type.find((item) => item !== 'null') || plain.type[0]
		: plain.type;

	if (type) return String(type).toLowerCase();
	if (hasOwn(plain, 'const')) return plain.const === null ? 'null' : typeof plain.const;
	if (plain.enum?.length) {
		const value = plain.enum.find((item) => item !== null);
		return value === undefined ? 'null' : typeof value;
	}
	if (plain.properties) return 'object';
	if (plain.items) return 'array';
	return '';
}

function jsonSchemaFormat(schema) {
	const plain = raw(schema) || {};
	return String(plain.format || '').toLowerCase();
}

function jsonSchemaValues(schema) {
	const plain = raw(schema) || {};
	if (plain.enum) return plain.enum;
	if (hasOwn(plain, 'const')) return [plain.const];
	return null;
}

function jsonSchemaAllowsNull(schema) {
	const plain = raw(schema) || {};
	return Array.isArray(plain.type) && plain.type.includes('null');
}

export function isJsonSchema(schema) {
	const plain = raw(schema) || {};
	return Boolean(
		plain.$schema
		|| plain.properties
		|| plain.items
		|| plain.enum
		|| hasOwn(plain, 'const')
		|| ['object', 'array', 'string', 'number', 'integer', 'boolean', 'null'].includes(jsonSchemaType(plain)),
	);
}

function emailLike(value) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value));
}

function uriLike(value) {
	try {
		const url = new URL(String(value));
		return Boolean(url.protocol);
	} catch {
		return false;
	}
}

function jsonTypeMatches(value, type, schema) {
	if (!type || value === null) return value !== null || jsonSchemaAllowsNull(schema);
	if (type === 'integer') return Number.isInteger(Number(value));
	if (type === 'number') return Number.isFinite(Number(value));
	if (type === 'array') return Array.isArray(value);
	if (type === 'object') return value && typeof value === 'object' && !Array.isArray(value);
	if (type === 'boolean') return typeof value === 'boolean';
	if (type === 'string') return typeof value === 'string';
	return true;
}

function jsonSchemaValidator(schema) {
	const plain = raw(schema);
	if (!plain || typeof plain !== 'object') return null;

	const type = jsonSchemaType(plain);
	const format = jsonSchemaFormat(plain);
	const values = jsonSchemaValues(plain);

	return {
		name: 'json-schema',
		message: 'This field does not match the schema.',
		validate(value) {
			if (isEmpty(value)) return true;
			if (!jsonTypeMatches(value, type, plain)) return `Use a ${type} value.`;
			if (values && !values.includes(value)) return 'Choose one of the allowed values.';
			if ((type === 'string' || !type) && plain.minLength != null && String(value).length < plain.minLength) return `Use at least ${plain.minLength} characters.`;
			if ((type === 'string' || !type) && plain.maxLength != null && String(value).length > plain.maxLength) return `Use ${plain.maxLength} characters or fewer.`;
			if (plain.pattern) {
				try {
					if (!new RegExp(plain.pattern).test(String(value))) return plain.errorMessage?.pattern || 'This field does not match the required pattern.';
				} catch {
					return true;
				}
			}
			if ((type === 'number' || type === 'integer') && plain.minimum != null && Number(value) < plain.minimum) return `Use a value of ${plain.minimum} or greater.`;
			if ((type === 'number' || type === 'integer') && plain.maximum != null && Number(value) > plain.maximum) return `Use a value of ${plain.maximum} or less.`;
			if ((type === 'number' || type === 'integer') && plain.exclusiveMinimum != null && Number(value) <= plain.exclusiveMinimum) return `Use a value greater than ${plain.exclusiveMinimum}.`;
			if ((type === 'number' || type === 'integer') && plain.exclusiveMaximum != null && Number(value) >= plain.exclusiveMaximum) return `Use a value less than ${plain.exclusiveMaximum}.`;
			if ((type === 'number' || type === 'integer') && plain.multipleOf != null && Number(value) % plain.multipleOf !== 0) return `Use a multiple of ${plain.multipleOf}.`;
			if (type === 'array' && plain.minItems != null && value.length < plain.minItems) return `Add at least ${plain.minItems} items.`;
			if (type === 'array' && plain.maxItems != null && value.length > plain.maxItems) return `Use ${plain.maxItems} items or fewer.`;
			if (format === 'email' && !emailLike(value)) return 'Enter a valid email address.';
			if ((format === 'uri' || format === 'url') && !uriLike(value)) return 'Enter a valid URL.';
			if (format === 'date' && !/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return 'Use YYYY-MM-DD.';
			return true;
		},
	};
}

function jsonSchemaComponentFor(schema, path, options) {
	const plain = raw(schema) || {};
	const type = jsonSchemaType(plain);
	const format = jsonSchemaFormat(plain);
	const values = jsonSchemaValues(plain);
	const field = fieldOptions(options, path, path.split('.').pop(), schema);
	const override = field.component || plain.component;

	if (override) return override;
	if (values) return 'ElNativeSelect';
	if (type === 'array') return 'ElJsonListInput';
	if (format === 'email') return 'ElEmailInput';
	if (format === 'uri' || format === 'url') return 'ElUrlInput';
	if (format === 'date') return 'ElDatePicker';
	if (type === 'number' || type === 'integer') return 'ElNumberInput';
	if (type === 'boolean') return 'ElCheckbox';
	if (plain.maxLength && plain.maxLength > 160) return 'ElTextareaInput';
	return 'ElTextInput';
}

function jsonListFieldType(schema) {
	const type = jsonSchemaType(schema);
	const format = jsonSchemaFormat(schema);
	if (format === 'email') return 'email';
	if (format === 'uri' || format === 'url') return 'url';
	if (format === 'date') return 'date';
	if (type === 'number' || type === 'integer') return 'number';
	if (type === 'object' || type === 'array') return 'json';
	return 'text';
}

function jsonListSchemaForItems(items) {
	const plain = raw(items) || {};
	const properties = plain.properties || {};
	return Object.entries(properties).map(([key, child]) => {
		const childSchema = raw(child) || {};
		const decoration = formDecoration(child);
		return {
			key,
			label: decoration.label || childSchema.title || formatLabel(key),
			type: decoration.type || jsonListFieldType(childSchema),
			placeholder: decoration.placeholder || childSchema.examples?.[0] || '',
			...(hasOwn(childSchema, 'default') ? { default: clone(childSchema.default) } : {}),
		};
	});
}

function defaultValueForJsonSchema(schema) {
	const plain = raw(schema) || {};
	const type = jsonSchemaType(plain);

	if (hasOwn(plain, 'default')) return clone(plain.default);
	if (hasOwn(plain, 'const')) return clone(plain.const);
	if (type === 'array') return [];
	if (type === 'boolean') return false;
	return undefined;
}

function jsonSchemaFieldPropsFor(schema, path, required, options) {
	const key = path.split('.').pop();
	const plain = raw(schema) || {};
	const field = fieldOptions(options, path, key, schema);
	const type = jsonSchemaType(plain);
	const values = jsonSchemaValues(plain);
	const validators = [
		jsonSchemaValidator(schema),
		...(field.props?.validators || []),
	].filter(Boolean);
	const defaultValue = defaultValueForJsonSchema(plain);

	const props = {
		name: key,
		label: field.label || plain.title || formatLabel(key),
		description: field.description ?? plain.description ?? '',
		required,
		...(plain.examples?.[0] ? { placeholder: plain.examples[0] } : {}),
		...(validators.length ? { validators } : {}),
		...(defaultValue !== undefined ? { modelValue: defaultValue } : {}),
		...(field.props || {}),
	};

	if (values && !props.options) props.options = optionObjects(values);
	if (plain.minimum != null && props.min == null) props.min = plain.minimum;
	if (plain.maximum != null && props.max == null) props.max = plain.maximum;
	if (type === 'integer' && props.step == null) props.step = 1;
	if (plain.multipleOf != null && props.step == null) props.step = plain.multipleOf;
	if (type === 'array' && plain.items?.properties && !props.schema) props.schema = jsonListSchemaForItems(plain.items);

	return props;
}

function childrenForJsonSchemaObject(schema, scope, options) {
	const plain = raw(schema) || {};
	const required = new Set(Array.isArray(plain.required) ? plain.required : []);

	return Object.entries(plain.properties || {}).map(([key, childSchema]) => {
		const child = raw(childSchema) || {};
		const path = scope ? `${scope}.${key}` : key;
		const nestedObject = jsonSchemaType(child) === 'object' && child.properties;

		if (nestedObject) {
			const field = fieldOptions(options, path, key, childSchema);
			return {
				id: `json-schema-${path.replace(/\W+/g, '-')}`,
				component: 'ElForm',
				props: {
					name: key,
					class: field.class || 'space-y-3 rounded-xl border border-border bg-secondary/25 p-4',
					...(field.props || {}),
				},
				children: childrenForJsonSchemaObject(child, path, options),
			};
		}

		return {
			id: `json-schema-${path.replace(/\W+/g, '-')}`,
			component: jsonSchemaComponentFor(childSchema, path, options),
			props: jsonSchemaFieldPropsFor(childSchema, path, required.has(key), options),
		};
	});
}

export function jsonSchemaToChildren(schema, options = {}) {
	const plain = raw(schema);
	if (!plain || typeof plain !== 'object' || !isJsonSchema(plain)) return [];
	if (jsonSchemaType(plain) !== 'object' || !plain.properties) return [];
	return childrenForJsonSchemaObject(plain, '', options);
}

export const jsonSchemaAdapter = {
	name: 'json-schema',
	matches: isJsonSchema,
	toChildren: jsonSchemaToChildren,
};
