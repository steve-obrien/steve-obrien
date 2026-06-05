function treeItemActionSchema() {
	return {
		type: 'ElForm',
		properties: {
			value: {
				type: 'string',
				label: 'Value',
				placeholder: 'open',
			},
			label: {
				type: 'string',
				label: 'Label',
				placeholder: 'Open',
			},
			icon: {
				type: 'string',
				label: 'Icon path',
				placeholder: 'SVG path data',
			},
			disabled: {
				type: 'boolean',
				label: 'Disabled',
			},
		},
	};
}

function treeItemSchema(depth = 3) {
	return {
		type: 'ElForm',
		properties: {
			id: {
				type: 'string',
				label: 'ID',
				placeholder: 'node-id',
			},
			value: {
				type: 'string',
				label: 'Value',
				placeholder: 'node-value',
			},
			label: {
				type: 'string',
				label: 'Label',
				placeholder: 'Node label',
			},
			name: {
				type: 'string',
				label: 'Name',
				placeholder: 'Fallback label',
			},
			type: {
				type: 'string',
				label: 'Node type',
				placeholder: 'file',
			},
			icon: {
				type: 'string',
				label: 'Icon path',
				placeholder: 'SVG path data',
			},
			rightIcon: {
				type: 'string',
				label: 'Right icon',
				placeholder: 'SVG path data',
			},
			rightIconAction: {
				type: 'string',
				label: 'Right icon action',
			},
			rightIconLabel: {
				type: 'string',
				label: 'Right icon label',
			},
			open: {
				type: 'boolean',
				label: 'Open',
			},
			lazy: {
				type: 'boolean',
				label: 'Lazy',
			},
			loading: {
				type: 'boolean',
				label: 'Loading',
			},
			disabled: {
				type: 'boolean',
				label: 'Disabled',
			},
			draggable: {
				type: 'boolean',
				label: 'Draggable',
			},
			acceptsChildren: {
				type: 'boolean',
				label: 'Accept drops',
				default: true,
			},
			slot: {
				type: 'string',
				label: 'Slot',
				placeholder: 'custom-node',
			},
			actions: {
				type: 'array',
				label: 'Actions',
				items: treeItemActionSchema(),
			},
			children: depth > 0
				? {
					type: 'array',
					label: 'Children',
					items: treeItemSchema(depth - 1),
				}
				: {
					type: 'json',
					label: 'Children',
					default: [],
				},
		},
	};
}

export const treeItemsFormSchema = {
	type: 'array',
	label: 'Tree items',
	items: treeItemSchema(),
};
