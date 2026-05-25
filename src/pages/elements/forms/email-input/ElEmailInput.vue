<script setup>
import { computed } from 'vue';
import ElTextInput from '../text-input/ElTextInput.vue';
import { fieldProps } from '../field/fieldProps.js';
import { emailValidator } from '../field/validators.js';

defineOptions({
	__doc: {
		name: 'Email input',
		tag: '<ElEmailInput>',
		description: 'A convention text field for email addresses with email type, autocomplete, and an email validator.',
		icon: 'M4.75 6.75h14.5v10.5H4.75V6.75Zm0 0 7.25 5.5 7.25-5.5',
		events: [
			{ name: 'update:modelValue', payload: 'string', description: 'Fired when the email address changes.' },
			{ name: 'focus', payload: 'FocusEvent', description: 'Fired when the input receives focus.' },
			{ name: 'blur', payload: 'FocusEvent', description: 'Fired when the input loses focus.' },
		],
	},
});

const props = defineProps({
	...fieldProps,
	label: {
		type: String,
		default: 'Email address',
		_edit: { description: 'Visible field label.' },
	},
	placeholder: {
		type: String,
		default: 'you@example.com',
		_edit: { description: 'Placeholder text shown before entry.' },
	},
	autocomplete: {
		type: String,
		default: 'email',
		_edit: { description: 'Native autocomplete hint.' },
	},
});
const emit = defineEmits(['update:modelValue', 'focus', 'blur']);

const inputProps = computed(() => ({
	...props,
	type: 'email',
	validators: [emailValidator, ...(props.validators || [])],
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
