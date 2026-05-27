<script setup>
import { computed, ref, watch } from 'vue';
import ElCodeInput from '../code-input/ElCodeInput.vue';
import { fieldProps } from '../field/fieldProps.js';
import { useField } from '../field/useField.js';

defineOptions({
	__doc: {
		name: 'JSON input',
		tag: '<ElJsonInput>',
		description: 'A JSON form input backed by ElCodeInput. Valid JSON emits parsed data; invalid JSON stays local and shows an error.',
		events: [
			{ name: 'update:modelValue', payload: 'object | array | string | number | boolean | null', description: 'Fired with parsed JSON when the editor contains valid JSON.' },
			{ name: 'valid', payload: 'parsed value', description: 'Fired when JSON parses successfully.' },
			{ name: 'invalid', payload: 'Error', description: 'Fired when JSON cannot be parsed.' },
		],
	},
});

const props = defineProps({
	...fieldProps,
	modelValue: {
		default: null,
		_edit: { component: 'ElJsonInput', description: 'Any JSON-serializable value.' },
	},
	rows: {
		type: Number,
		default: 10,
		_edit: { description: 'Textarea fallback rows.' },
	},
	editor: {
		type: Boolean,
		default: true,
		_edit: { description: 'Attempt to load the enhanced editor from the CDN.' },
	},
	_registerField: {
		type: Boolean,
		default: true,
	},
});

const emit = defineEmits(['update:modelValue', 'valid', 'invalid', 'focus', 'blur']);
const field = useField(props, emit, { idPrefix: 'el-json-input', register: props._registerField });
const text = ref(format(field.value.value));
const error = ref('');
const focused = ref(false);
const codeFieldAttrs = computed(() => ({
	...field.fieldAttrs.value,
	invalid: field.invalid.value || !!error.value,
	errors: error.value ? [error.value] : field.errors.value,
}));

function format(value) {
	return JSON.stringify(value ?? null, null, 2);
}

function onInput(value) {
	text.value = value;
	try {
		const parsed = JSON.parse(value);
		error.value = '';
		field.setFieldState({ errors: [], invalid: false });
		field.onInput(parsed);
		emit('valid', parsed);
	} catch (err) {
		error.value = err.message;
		field.setFieldState({ errors: [err.message], invalid: true });
		emit('invalid', err);
	}
}

function onFocus(event) {
	focused.value = true;
	field.onFocus(event);
}

function onBlur(event) {
	focused.value = false;
	field.onBlur(event);
}

watch(field.value, (value) => {
	if (focused.value) return;
	const next = format(value);
	if (next !== text.value) text.value = next;
});
</script>

<template>
	<div>
		<ElCodeInput
			:model-value="text"
			:id="field.id.value"
			:name="field.htmlName.value"
			:label="codeFieldAttrs.label"
			:description="codeFieldAttrs.description"
			:rows="rows"
			:editor="editor"
			:invalid="codeFieldAttrs.invalid"
			:errors="codeFieldAttrs.errors"
			:required="required"
			:disabled="field.disabled.value"
			:read-only="field.readOnly.value"
			:chrome="chrome"
			:_register-field="false"
			lang="json"
			@update:model-value="onInput"
			@focus="onFocus"
			@blur="onBlur"
		/>
	</div>
</template>
