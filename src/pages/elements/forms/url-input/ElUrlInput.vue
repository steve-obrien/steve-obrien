<script setup>
import { computed } from 'vue';
import ElTextInput from '../text-input/ElTextInput.vue';
import { fieldProps } from '../field/fieldProps.js';
import { urlValidator } from '../field/validators.js';

defineOptions({
	__doc: {
		name: 'URL input',
		tag: '<ElUrlInput>',
		description: 'A convention text field for web addresses with URL type, autocomplete, and a URL validator.',
		icon: 'M10.25 13.75 13.75 10.25M8.9 10.9 7.8 12a3 3 0 0 0 4.2 4.2l1.1-1.1M15.1 13.1l1.1-1.1A3 3 0 0 0 12 7.8l-1.1 1.1',
		events: [
			{ name: 'update:modelValue', payload: 'string', description: 'Fired when the URL changes.' },
			{ name: 'focus', payload: 'FocusEvent', description: 'Fired when the input receives focus.' },
			{ name: 'blur', payload: 'FocusEvent', description: 'Fired when the input loses focus.' },
		],
	},
});

const props = defineProps({
	...fieldProps,
	label: {
		type: String,
		default: 'URL',
		_edit: { description: 'Visible field label.' },
	},
	placeholder: {
		type: String,
		default: 'https://example.com',
		_edit: { description: 'Placeholder text shown before entry.' },
	},
	autocomplete: {
		type: String,
		default: 'url',
		_edit: { description: 'Native autocomplete hint.' },
	},
});
const emit = defineEmits(['update:modelValue', 'focus', 'blur']);

const inputProps = computed(() => ({
	...props,
	type: 'url',
	validators: [urlValidator, ...(props.validators || [])],
}));
</script>

<template>
	<ElTextInput
		v-bind="inputProps"
		@update:model-value="emit('update:modelValue', $event)"
		@focus="emit('focus', $event)"
		@blur="emit('blur', $event)"
	/>
</template>
