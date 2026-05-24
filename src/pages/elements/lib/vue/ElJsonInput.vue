<script setup>
import { ref, watch } from 'vue';
import ElCodeInput from './ElCodeInput.vue';

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
	modelValue: {
		default: null,
		_edit: { component: 'ElJsonInput', description: 'Any JSON-serializable value.' },
	},
	id: {
		type: String,
		default: '',
		_edit: { description: 'ID forwarded to the underlying code input.' },
	},
	name: {
		type: String,
		default: '',
		_edit: { description: 'Name forwarded to the underlying code input.' },
	},
	label: {
		type: String,
		default: '',
		_edit: { description: 'Visible field label.' },
	},
	description: {
		type: String,
		default: '',
		_edit: { description: 'Optional helper copy below the label.' },
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
	invalid: {
		type: Boolean,
		default: false,
		_edit: { description: 'Mark the input invalid.' },
	},
});

const emit = defineEmits(['update:modelValue', 'valid', 'invalid']);
const text = ref(format(props.modelValue));
const error = ref('');
const focused = ref(false);

function format(value) {
	return JSON.stringify(value ?? null, null, 2);
}

function onInput(value) {
	text.value = value;
	try {
		const parsed = JSON.parse(value);
		error.value = '';
		emit('update:modelValue', parsed);
		emit('valid', parsed);
	} catch (err) {
		error.value = err.message;
		emit('invalid', err);
	}
}

watch(() => props.modelValue, (value) => {
	if (focused.value) return;
	const next = format(value);
	if (next !== text.value) text.value = next;
});
</script>

<template>
	<div>
		<ElCodeInput
			:model-value="text"
			:id="id"
			:name="name"
			:label="label"
			:description="description"
			:rows="rows"
			:editor="editor"
			:invalid="invalid || !!error"
			lang="json"
			@update:model-value="onInput"
			@focus="focused = true"
			@blur="focused = false"
		/>
		<p v-if="error" class="mt-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-mono text-destructive">
			{{ error }}
		</p>
	</div>
</template>
