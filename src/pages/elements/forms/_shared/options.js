export function booleanProp(value, defaultValue = false) {
	if (value === undefined || value === null) return defaultValue;
	if (value === '' || value === true) return true;
	if (value === false) return false;
	return !['false', '0', 'no', 'off'].includes(String(value).toLowerCase());
}

export function normalizeOption(option, options = {}) {
	const { stringifyValue = false } = options;
	if (option == null) return null;
	if (typeof option === 'string' || typeof option === 'number') {
		const value = stringifyValue ? String(option) : option;
		return { value, label: String(option) };
	}
	const rawValue = option.value ?? option.label;
	if (rawValue == null || rawValue === '') return null;
	const value = stringifyValue ? String(rawValue) : rawValue;
	return {
		...option,
		value,
		label: option.label ?? String(value),
	};
}

export function optionKey(value) {
	return String(value ?? '').toLowerCase();
}

export function searchableText(option, keys = ['label', 'value', 'description', 'group']) {
	return keys
		.map((key) => option?.[key])
		.filter(Boolean)
		.join(' ')
		.toLowerCase();
}

export function uniqueValues(values, options = {}) {
	const { transform = (value) => value, key = optionKey } = options;
	const seen = new Set();
	const out = [];
	for (const value of values || []) {
		const nextValue = transform(value);
		if (nextValue == null || nextValue === '') continue;
		const nextKey = key(nextValue);
		if (seen.has(nextKey)) continue;
		seen.add(nextKey);
		out.push(nextValue);
	}
	return out;
}

export function splitTokens(value, separators = [' ', ',']) {
	const activeSeparators = separators.length ? separators : [' ', ','];
	const escaped = activeSeparators
		.map((separator) => String(separator).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
		.join('');
	return String(value || '')
		.split(new RegExp(`[${escaped}\\n\\r\\t]+`))
		.map((token) => token.trim())
		.filter(Boolean);
}
