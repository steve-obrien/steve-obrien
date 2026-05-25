export function createValidator(name, validate, message = 'This field is invalid.') {
	return {
		name,
		message,
		validate,
	};
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

export const requiredValidator = createValidator(
	'required',
	(value) => {
		if (Array.isArray(value)) return value.length > 0;
		return value !== undefined && value !== null && String(value).trim() !== '';
	},
	'This field is required.',
);

export const emailValidator = createValidator(
	'email',
	(value) => {
		if (!value) return true;
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value));
	},
	'Enter a valid email address.',
);

export const urlValidator = createValidator(
	'url',
	(value) => {
		if (!value) return true;
		try {
			const url = new URL(String(value));
			return ['http:', 'https:'].includes(url.protocol);
		} catch {
			return false;
		}
	},
	'Enter a valid URL.',
);
