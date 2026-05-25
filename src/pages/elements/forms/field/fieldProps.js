export const fieldProps = {
	modelValue: {
		default: '',
		_edit: { description: 'Current field value.' },
	},
	id: {
		type: String,
		default: '',
		_edit: { description: 'Optional ID override. By default parent forms derive the input ID from the field path using underscores.' },
	},
	name: {
		type: String,
		default: '',
		_edit: { description: 'Local field name. Parent forms derive the full field path and native HTML name from the form hierarchy.' },
	},
	label: {
		type: String,
		default: '',
		_edit: { description: 'Visible field label.' },
	},
	description: {
		type: String,
		default: '',
		_edit: { description: 'Optional helper copy below the field.' },
	},
	placeholder: {
		type: String,
		default: '',
		_edit: { description: 'Placeholder shown when the control is empty.' },
	},
	required: {
		type: Boolean,
		default: false,
		_edit: { description: 'Mark the field as required.' },
	},
	disabled: {
		type: Boolean,
		default: false,
		_edit: { description: 'Disable field interaction.' },
	},
	readOnly: {
		type: Boolean,
		default: false,
		_edit: { description: 'Show the value but prevent editing.' },
	},
	invalid: {
		type: Boolean,
		default: false,
		_edit: { description: 'Mark the field invalid.' },
	},
	errors: {
		type: [Array, Object, String],
		default: () => ({}),
		_edit: { component: 'ElJsonInput', description: 'Validation errors for this field.' },
	},
	visible: {
		type: Boolean,
		default: true,
		_edit: { description: 'Show or hide the field.' },
	},
	validators: {
		type: Array,
		default: () => [],
		_edit: { component: 'ElJsonInput', description: 'Validators attached to this field.' },
	},
	validateOnBlur: {
		type: Boolean,
		default: true,
		_edit: { description: 'Run validators when the field loses focus.' },
	},
};
