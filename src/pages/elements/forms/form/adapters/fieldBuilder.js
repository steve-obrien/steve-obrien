export function fieldPath(scope, key) {
	return scope ? `${scope}.${key}` : key;
}

export function fieldId(prefix, path) {
	return `${prefix}-${path.replace(/\W+/g, '-')}`;
}

export function nestedFormNode({ idPrefix, path, key, field, children }) {
	return {
		id: fieldId(idPrefix, path),
		component: 'ElForm',
		props: {
			name: key,
			class: field.class || 'space-y-3 rounded-xl border border-border bg-secondary/25 p-4',
			...(field.props || {}),
		},
		children,
	};
}

export function childrenForFieldShape(shape, scope, options, adapter) {
	return Object.entries(shape || {}).map(([key, childSchema]) => {
		const path = fieldPath(scope, key);
		const nested = adapter.nestedShape(childSchema, path, key, options);
		const nestedShape = nested?.shape || nested;
		const nestedAdapter = nested?.adapter || adapter;

		if (nestedShape) {
			return nestedFormNode({
				idPrefix: adapter.idPrefix,
				path,
				key,
				field: adapter.fieldForNested(childSchema, path, key, options),
				children: childrenForFieldShape(nestedShape, path, options, nestedAdapter),
			});
		}

		return {
			id: fieldId(adapter.idPrefix, path),
			component: adapter.componentFor(childSchema, path, options),
			props: adapter.fieldPropsFor(childSchema, path, key, options),
		};
	});
}
