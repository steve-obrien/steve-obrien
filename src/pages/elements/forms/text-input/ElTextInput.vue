<script setup>
import FieldChrome from '../field/FieldChrome.vue';
import { fieldProps } from '../field/fieldProps.js';
import { useField } from '../field/useField.js';

defineOptions({
	__doc: {
		name: 'Text input',
		tag: '<ElTextInput>',
		description: 'A styled text field that uses the shared field contract for labels, validation state, and optional form-provider integration.',
		events: [
			{ name: 'update:modelValue', payload: 'string', description: 'Fired when the text changes.' },
			{ name: 'focus', payload: 'FocusEvent', description: 'Fired when the input receives focus.' },
			{ name: 'blur', payload: 'FocusEvent', description: 'Fired when the input loses focus.' },
		],
	},
});

const props = defineProps({
	...fieldProps,
	type: {
		type: String,
		default: 'text',
		_edit: { description: 'Native input type.' },
	},
	autocomplete: {
		type: String,
		default: '',
		_edit: { description: 'Native autocomplete hint.' },
	},
});
const emit = defineEmits(['update:modelValue', 'focus', 'blur']);
const field = useField(props, emit, { idPrefix: 'el-text-input' });
</script>

<template>
	<FieldChrome :field-attrs="field.fieldAttrs.value" :chrome="chrome">
		<input
			v-bind="field.inputAttrs.value"
			:type="type"
			:autocomplete="autocomplete || undefined"
			class="el-input"
			@input="field.onInput($event.target.value)"
			@focus="field.onFocus"
			@blur="field.onBlur"
		/>
	</FieldChrome>
</template>
