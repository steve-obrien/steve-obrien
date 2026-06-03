import {
	fieldOptions,
	formatLabel,
	isEmpty,
	optionObjects,
	raw,
} from './shared.js';

function defOf(schema) {
	return raw(schema)?._def || raw(schema)?.def || raw(schema)?._zod?.def || {};
}

function typeOf(schema) {
	const schemaDef = defOf(schema);
	return schemaDef.typeName || schemaDef.type || raw(schema)?.type || raw(schema)?.kind || '';
}

function hasCallable(schema, name) {
	return typeof raw(schema)?.[name] === 'function';
}

function call(schema, name, ...args) {
	if (!hasCallable(schema, name)) return undefined;
	try {
		return raw(schema)[name](...args);
	} catch {
		return undefined;
	}
}

function unwrap(schema) {
	let current = raw(schema);
	let optional = Boolean(current?.optional || current?.isOptional || current?.required === false);
	let nullable = Boolean(current?.nullable || current?.isNullable);

	for (let index = 0; index < 12; index += 1) {
		const schemaDef = defOf(current);
		const type = typeOf(current);
		if (/optional/i.test(type)) optional = true;
		if (/nullable/i.test(type)) nullable = true;
		if (/default|catch/i.test(type)) optional = true;

		const next = schemaDef.innerType
			|| schemaDef.schema
			|| schemaDef.type
			|| schemaDef.in
			|| schemaDef.out;

		if (!next || next === current || typeof next === 'string') break;
		current = raw(next);
	}

	if (typeof current?.isOptional === 'function') optional = optional || current.isOptional();
	if (typeof current?.isNullable === 'function') nullable = nullable || current.isNullable();

	return { schema: current, optional, nullable };
}

export function objectShape(schema) {
	const unwrapped = unwrap(schema).schema;
	const schemaDef = defOf(unwrapped);
	const shape = schemaDef.shape || unwrapped?.shape || unwrapped?.fields;
	if (typeof shape === 'function') return shape();
	if (shape && typeof shape === 'object') return shape;
	return null;
}

export function isZodLikeSchema(schema) {
	return Boolean(objectShape(schema));
}

function enumValues(schema) {
	const unwrapped = unwrap(schema).schema;
	const schemaDef = defOf(unwrapped);
	const values = schemaDef.values
		|| schemaDef.entries
		|| schemaDef.options
		|| unwrapped?.values
		|| unwrapped?.options
		|| unwrapped?.enum;

	if (Array.isArray(values)) return values;
	if (values && typeof values === 'object') return Object.values(values);
	return null;
}

function checksOf(schema) {
	const schemaDef = defOf(unwrap(schema).schema);
	const checks = [
		...(schemaDef.checks || []),
		...(raw(schema)?.checks || []),
	];
	return checks.map((check) => ({
		raw: check,
		kind: check.kind || check.check || check._zod?.def?.check || check.def?.check || check._def?.check || '',
		value: check.value ?? check.minimum ?? check.maximum ?? check.length ?? check._zod?.def?.value,
		format: check.format || check._zod?.def?.format || check.def?.format || '',
		message: check.message || check._zod?.def?.message || check.def?.message || '',
	}));
}

function schemaFormat(schema) {
	const plain = raw(schema);
	if (plain?.format) return plain.format;
	if (plain?.email) return 'email';
	if (plain?.url) return 'url';
	const checks = checksOf(schema);
	if (checks.some((check) => /email/i.test(`${check.kind} ${check.format}`))) return 'email';
	if (checks.some((check) => /url/i.test(`${check.kind} ${check.format}`))) return 'url';
	return '';
}

function schemaValidator(schema, optional) {
	if (!schema || (!hasCallable(schema, 'safeParse') && !hasCallable(schema, 'parse'))) return null;

	return {
		name: 'schema',
		message: 'This field does not match the schema.',
		validate(value) {
			const normalized = optional && value === '' ? undefined : value;
			const result = call(schema, 'safeParse', normalized);
			if (result) {
				if (result.success) return true;
				return result.error?.issues?.[0]?.message || result.error?.message || 'This field does not match the schema.';
			}
			try {
				call(schema, 'parse', normalized);
				return true;
			} catch (error) {
				return error?.issues?.[0]?.message || error?.message || 'This field does not match the schema.';
			}
		},
	};
}

function plainValidator(schema) {
	const plain = raw(schema);
	if (!plain || typeof plain !== 'object' || hasCallable(plain, 'safeParse') || hasCallable(plain, 'parse')) return null;

	return {
		name: 'schema',
		validate(value) {
			if ((plain.optional || plain.required === false) && isEmpty(value)) return true;
			if (plain.minLength != null && String(value || '').length < plain.minLength) return `Use at least ${plain.minLength} characters.`;
			if (plain.maxLength != null && String(value || '').length > plain.maxLength) return `Use ${plain.maxLength} characters or fewer.`;
			if (plain.min != null && Number(value) < plain.min) return `Use a value of ${plain.min} or greater.`;
			if (plain.max != null && Number(value) > plain.max) return `Use a value of ${plain.max} or less.`;
			if (plain.regex && !new RegExp(plain.regex).test(String(value || ''))) return plain.message || 'This field does not match the required pattern.';
			return true;
		},
	};
}

function componentFor(schema, path, options) {
	const plain = raw(schema) || {};
	const type = String(typeOf(schema) || plain.type || '').toLowerCase();
	const format = schemaFormat(schema);
	const values = enumValues(schema) || plain.values || plain.options || plain.enum;
	const override = fieldOptions(options, path, path.split('.').pop(), schema).component || plain.component;

	if (override) return override;
	if (values) return 'ElNativeSelect';
	if (format === 'email') return 'ElEmailInput';
	if (format === 'url') return 'ElUrlInput';
	if (/number|bigint|int|float|double/.test(type)) return 'ElNumberInput';
	if (/boolean|bool/.test(type)) return 'ElCheckbox';
	if (/date/.test(type)) return 'ElCalendar';
	return 'ElTextInput';
}

function fieldPropsFor(schema, path, options) {
	const key = path.split('.').pop();
	const plain = raw(schema) || {};
	const field = fieldOptions(options, path, key, schema);
	const unwrapped = unwrap(schema);
	const values = enumValues(schema) || plain.values || plain.options || plain.enum;
	const validators = [
		schemaValidator(schema, unwrapped.optional),
		plainValidator(schema),
		...(field.props?.validators || []),
	].filter(Boolean);

	const props = {
		name: key,
		label: field.label || plain.label || plain.description || raw(schema)?.description || formatLabel(key),
		description: field.description || plain.help || plain.hint || '',
		required: field.required ?? plain.required ?? !unwrapped.optional,
		...(plain.placeholder ? { placeholder: plain.placeholder } : {}),
		...(validators.length ? { validators } : {}),
		...(field.props || {}),
	};

	if (values && !props.options) props.options = optionObjects(Array.isArray(values) ? values : Object.values(values));
	if (plain.min != null && props.min == null) props.min = plain.min;
	if (plain.max != null && props.max == null) props.max = plain.max;
	if (plain.step != null && props.step == null) props.step = plain.step;

	return props;
}

function childrenForShape(shape, scope, options) {
	return Object.entries(shape || {}).map(([key, childSchema]) => {
		const path = scope ? `${scope}.${key}` : key;
		const nestedShape = objectShape(childSchema);
		if (nestedShape) {
			const field = fieldOptions(options, path, key, childSchema);
			return {
				id: `schema-${path.replace(/\W+/g, '-')}`,
				component: 'ElForm',
				props: {
					name: key,
					class: field.class || 'space-y-3 rounded-xl border border-border bg-secondary/25 p-4',
					...(field.props || {}),
				},
				children: childrenForShape(nestedShape, path, options),
			};
		}

		return {
			id: `schema-${path.replace(/\W+/g, '-')}`,
			component: componentFor(childSchema, path, options),
			props: fieldPropsFor(childSchema, path, options),
		};
	});
}

export function zodSchemaToChildren(schema, options = {}) {
	if (!schema) return [];
	const shape = objectShape(schema) || raw(schema)?.shape || raw(schema)?.fields;
	if (!shape) return [];
	return childrenForShape(typeof shape === 'function' ? shape() : shape, '', options);
}

export const zodSchemaAdapter = {
	name: 'zod',
	matches: isZodLikeSchema,
	toChildren: zodSchemaToChildren,
};
