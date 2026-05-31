export const FIELD_PROPS_GROUP = 'Field props';

function fieldProp(definition) {
	return {
		...definition,
		_edit: {
			group: FIELD_PROPS_GROUP,
			...(definition._edit || {}),
		},
	};
}

export const fieldProps = {
	modelValue: fieldProp({
		default: '',
		_edit: { description: 'Current field value.' },
	}),
	id: fieldProp({
		type: String,
		default: '',
		_edit: { description: 'Optional ID override. By default parent forms derive the input ID from the field path using underscores.' },
	}),
	name: fieldProp({
		type: String,
		default: '',
		_edit: { description: 'Local field name. Parent forms derive the full field path and native HTML name from the form hierarchy.' },
	}),
	label: fieldProp({
		type: String,
		default: '',
		_edit: { description: 'Visible field label.' },
	}),
	description: fieldProp({
		type: String,
		default: '',
		_edit: { description: 'Optional helper copy below the field.' },
	}),
	placeholder: fieldProp({
		type: String,
		default: '',
		_edit: { description: 'Placeholder shown when the control is empty.' },
	}),
	required: fieldProp({
		type: Boolean,
		default: false,
		_edit: { description: 'Mark the field as required.' },
	}),
	disabled: fieldProp({
		type: Boolean,
		default: false,
		_edit: { description: 'Disable field interaction.' },
	}),
	readOnly: fieldProp({
		type: Boolean,
		default: false,
		_edit: { description: 'Show the value but prevent editing.' },
	}),
	invalid: fieldProp({
		type: Boolean,
		default: false,
		_edit: { description: 'Mark the field invalid.' },
	}),
	errors: fieldProp({
		type: [Array, Object, String],
		default: () => ({}),
		_edit: { component: 'ElJsonInput', description: 'Validation errors for this field.' },
	}),
	visible: fieldProp({
		type: Boolean,
		default: true,
		_edit: { description: 'Show or hide the field.' },
	}),
	validators: fieldProp({
		type: Array,
		default: () => [],
		_edit: { component: 'ElJsonInput', description: 'Validators attached to this field.' },
	}),
	validateOnBlur: fieldProp({
		type: Boolean,
		default: true,
		_edit: { description: 'Run validators when the field loses focus.' },
	}),
	chrome: fieldProp({
		type: [String, Boolean],
		default: 'field',
		_edit: { options: ['field', false], description: 'Render default field chrome, or false to render only the control while keeping form state wiring.' },
	}),
};

export const fieldPropNames = Object.keys(fieldProps);
