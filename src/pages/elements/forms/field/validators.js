export function createValidator(name, validate, message = 'This field is invalid.', options = {}) {
	return {
		...options,
		name,
		message,
		validate,
	};
}

const validatorRegistry = new Map();

function valueFromProps(props = {}, names = ['value']) {
	for (const name of names) {
		if (props[name] !== undefined) return props[name];
	}
	return undefined;
}

function isEmptyValue(value) {
	if (Array.isArray(value)) return value.length === 0;
	return value === undefined || value === null || value === '';
}

function validatorProps(record = {}) {
	return {
		...(record.props || {}),
		...(record.options || {}),
		...Object.fromEntries(Object.entries(record).filter(([key]) => ![
			'name',
			'rule',
			'type',
			'validator',
			'validate',
			'message',
			'props',
			'options',
		].includes(key))),
	};
}

export function defineValidator(definition) {
	if (!definition?.name || typeof definition.validate !== 'function') return null;
	const {
		name,
		validate,
		message,
		...metadata
	} = definition;
	const validator = createValidator(name, validate, message, metadata);
	validatorRegistry.set(definition.name, validator);
	return validator;
}

export function getValidator(name) {
	return validatorRegistry.get(name) || null;
}

export function listValidators() {
	return Array.from(validatorRegistry.values());
}

export function compileValidator(validator) {
	if (!validator) return null;
	if (typeof validator === 'function') return createValidator(validator.name || 'validator', validator);
	if (typeof validator === 'string') return getValidator(validator);
	if (typeof validator !== 'object') return null;
	if (typeof validator.validate === 'function') return validator;

	const name = validator.name || validator.rule || validator.type || validator.validator;
	const registered = getValidator(name);
	if (!registered) return null;
	const props = validatorProps(validator);

	return createValidator(
		name,
		async (value, context = {}) => {
			const result = await registered.validate(value, {
				...context,
				props,
				validator,
			});
			if (result !== true && result !== undefined && result !== null && validator.message) {
				return validator.message;
			}
			return result;
		},
		validator.message || registered.message,
	);
}

export function compileValidators(validators = []) {
	return validators.map((validator) => compileValidator(validator)).filter(Boolean);
}

export function normalizeValidatorResult(result, validator) {
	if (result === true || result === undefined || result === null) {
		return null;
	}
	if (typeof result === 'string') {
		return {
			name: validator.name || 'validator',
			message: result,
		};
	}
	if (typeof result === 'object') {
		if (result.valid === true) return null;
		return {
			name: result.name || result.code || validator.name || 'validator',
			message: result.message || validator.message || 'This field is invalid.',
			code: result.code,
			meta: result.meta,
		};
	}
	return {
		name: validator.name || 'validator',
		message: validator.message || 'This field is invalid.',
	};
}

export const requiredValidator = defineValidator({
	name: 'required',
	label: 'Required',
	description: 'Requires a non-empty value.',
	message: 'This field is required.',
	validate(value) {
		if (Array.isArray(value)) return value.length > 0;
		return value !== undefined && value !== null && String(value).trim() !== '';
	},
});

export const emailValidator = defineValidator({
	name: 'email',
	label: 'Email',
	description: 'Requires an email address.',
	message: 'Enter a valid email address.',
	validate(value) {
		if (!value) return true;
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value));
	},
});

export const urlValidator = defineValidator({
	name: 'url',
	label: 'URL',
	description: 'Requires an HTTP or HTTPS URL.',
	message: 'Enter a valid URL.',
	validate(value) {
		if (!value) return true;
		try {
			const url = new URL(String(value));
			return ['http:', 'https:'].includes(url.protocol);
		} catch {
			return false;
		}
	},
});

export const minLengthValidator = defineValidator({
	name: 'minLength',
	label: 'Minimum length',
	description: 'Requires text to be at least this many characters.',
	props: {
		min: {
			type: Number,
			default: 2,
			_edit: { label: 'Minimum', description: 'Minimum number of characters.' },
		},
	},
	message: 'This field is too short.',
	validate(value, { props = {} } = {}) {
		if (isEmptyValue(value)) return true;
		const min = Number(valueFromProps(props, ['min', 'value', 'length']));
		if (!Number.isFinite(min)) return true;
		return String(value).length >= min || `Use at least ${min} characters.`;
	},
});

export const maxLengthValidator = defineValidator({
	name: 'maxLength',
	label: 'Maximum length',
	description: 'Requires text to be no longer than this many characters.',
	props: {
		max: {
			type: Number,
			default: 120,
			_edit: { label: 'Maximum', description: 'Maximum number of characters.' },
		},
	},
	message: 'This field is too long.',
	validate(value, { props = {} } = {}) {
		if (isEmptyValue(value)) return true;
		const max = Number(valueFromProps(props, ['max', 'value', 'length']));
		if (!Number.isFinite(max)) return true;
		return String(value).length <= max || `Use ${max} characters or fewer.`;
	},
});

export const lengthValidator = defineValidator({
	name: 'length',
	label: 'Exact length',
	description: 'Requires text to have exactly this many characters.',
	props: {
		length: {
			type: Number,
			default: 8,
			_edit: { label: 'Length', description: 'Exact number of characters.' },
		},
	},
	message: 'This field has the wrong length.',
	validate(value, { props = {} } = {}) {
		if (isEmptyValue(value)) return true;
		const length = Number(valueFromProps(props, ['length', 'value']));
		if (!Number.isFinite(length)) return true;
		return String(value).length === length || `Use exactly ${length} characters.`;
	},
});

export const patternValidator = defineValidator({
	name: 'pattern',
	label: 'Pattern',
	description: 'Requires text to match a regular expression.',
	props: {
		pattern: {
			type: String,
			default: '',
			_edit: { label: 'Pattern', description: 'Regular expression pattern.' },
		},
		flags: {
			type: String,
			default: '',
			_edit: { label: 'Flags', description: 'Optional regular expression flags.' },
		},
	},
	message: 'This field does not match the required pattern.',
	validate(value, { props = {} } = {}) {
		if (isEmptyValue(value)) return true;
		const pattern = valueFromProps(props, ['pattern', 'regex', 'value']);
		if (!pattern) return true;
		const flags = props.flags || '';
		try {
			return new RegExp(pattern, flags).test(String(value));
		} catch {
			return true;
		}
	},
});

export const minValidator = defineValidator({
	name: 'min',
	label: 'Minimum value',
	description: 'Requires a number to be at least this value.',
	props: {
		min: {
			type: Number,
			default: 0,
			_edit: { label: 'Minimum', description: 'Minimum numeric value.' },
		},
	},
	message: 'This field is too small.',
	validate(value, { props = {} } = {}) {
		if (isEmptyValue(value)) return true;
		const min = Number(valueFromProps(props, ['min', 'value']));
		if (!Number.isFinite(min)) return true;
		return Number(value) >= min || `Use a value of ${min} or greater.`;
	},
});

export const maxValidator = defineValidator({
	name: 'max',
	label: 'Maximum value',
	description: 'Requires a number to be at most this value.',
	props: {
		max: {
			type: Number,
			default: 100,
			_edit: { label: 'Maximum', description: 'Maximum numeric value.' },
		},
	},
	message: 'This field is too large.',
	validate(value, { props = {} } = {}) {
		if (isEmptyValue(value)) return true;
		const max = Number(valueFromProps(props, ['max', 'value']));
		if (!Number.isFinite(max)) return true;
		return Number(value) <= max || `Use a value of ${max} or less.`;
	},
});

export const betweenValidator = defineValidator({
	name: 'between',
	label: 'Between',
	description: 'Requires a number to stay inside a range.',
	props: {
		min: {
			type: Number,
			default: 0,
			_edit: { label: 'Minimum', description: 'Minimum numeric value.' },
		},
		max: {
			type: Number,
			default: 100,
			_edit: { label: 'Maximum', description: 'Maximum numeric value.' },
		},
	},
	message: 'This field is outside the allowed range.',
	validate(value, { props = {} } = {}) {
		if (isEmptyValue(value)) return true;
		const min = Number(valueFromProps(props, ['min', 'from']));
		const max = Number(valueFromProps(props, ['max', 'to']));
		const number = Number(value);
		if (!Number.isFinite(number)) return false;
		if (Number.isFinite(min) && number < min) return `Use a value of ${min} or greater.`;
		if (Number.isFinite(max) && number > max) return `Use a value of ${max} or less.`;
		return true;
	},
});

export const numberValidator = defineValidator({
	name: 'number',
	label: 'Number',
	description: 'Requires a numeric value.',
	message: 'Use a number.',
	validate(value) {
		if (isEmptyValue(value)) return true;
		return Number.isFinite(Number(value));
	},
});

export const integerValidator = defineValidator({
	name: 'integer',
	label: 'Integer',
	description: 'Requires a whole number.',
	message: 'Use a whole number.',
	validate(value) {
		if (isEmptyValue(value)) return true;
		return Number.isInteger(Number(value));
	},
});

export const oneOfValidator = defineValidator({
	name: 'oneOf',
	label: 'One of',
	description: 'Requires the value to match an allowed list.',
	props: {
		values: {
			type: Array,
			default: () => [],
			_edit: {
				component: 'ElJsonInput',
				label: 'Values',
				description: 'Allowed values.',
				props: { rows: 4 },
			},
		},
	},
	message: 'Choose one of the allowed values.',
	validate(value, { props = {} } = {}) {
		if (isEmptyValue(value)) return true;
		const values = valueFromProps(props, ['values', 'options', 'value']) || [];
		const allowed = Array.isArray(values) ? values.map((item) => (
			item && typeof item === 'object' && 'value' in item ? item.value : item
		)) : [];
		return allowed.includes(value);
	},
});
