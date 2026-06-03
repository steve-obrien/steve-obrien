export function raw(value) {
	return value && typeof value === 'object' && '__v_raw' in value ? value.__v_raw : value;
}

export function hasOwn(value, key) {
	return Object.prototype.hasOwnProperty.call(value || {}, key);
}

export function clone(value) {
	if (value == null || typeof value !== 'object') return value;
	if (Array.isArray(value)) return value.map((item) => clone(item));
	return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)]));
}

export function formatLabel(value) {
	return String(value || '')
		.replace(/[-_]+/g, ' ')
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
		.replace(/^./, (letter) => letter.toUpperCase());
}

export function optionObjects(values) {
	return values.map((value) => ({
		label: formatLabel(value),
		value,
	}));
}

export function isEmpty(value) {
	return value === undefined || value === null || value === '';
}

export function mergeFieldConfig(base = {}, override = {}) {
	return {
		...base,
		...override,
		props: {
			...(base.props || {}),
			...(override.props || {}),
		},
	};
}

export function formDecoration(schema) {
	const plain = raw(schema) || {};
	return plain['x-el'] || plain.xEl || plain['x-form'] || plain.xForm || {};
}

export function fieldOptions(options, path, key, schema) {
	const inline = formDecoration(schema);
	const external = options.fields?.[path] || options.fields?.[key] || {};
	return mergeFieldConfig(inline, external);
}
