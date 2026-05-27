<script setup>
import FieldChrome from '../field/FieldChrome.vue';
import { fieldProps } from '../field/fieldProps.js';
import { useField } from '../field/useField.js';

defineOptions({
	__doc: {
		name: 'Color input',
		tag: '<ElColorInput>',
		description: 'Native colour picker paired with a hex text field, both bound to the same value.',
		events: [
			{ name: 'update:modelValue', payload: 'string', description: 'Fired when the colour changes.' },
			{ name: 'focus', payload: 'FocusEvent', description: 'Fired when either control receives focus.' },
			{ name: 'blur', payload: 'FocusEvent', description: 'Fired when either control loses focus.' },
		],
	},
});

const props = defineProps({
	...fieldProps,
	modelValue: {
		type: String,
		default: '#000000',
		_edit: { group: 'Control props', description: 'Hex colour value.' },
	},
});
const emit = defineEmits(['update:modelValue', 'focus', 'blur']);
const field = useField(props, emit, { idPrefix: 'el-color-input' });
</script>

<template>
	<FieldChrome :field-attrs="field.fieldAttrs.value" :chrome="chrome">
		<div class="flex items-center gap-2">
			<input
				:id="`${field.id.value}-swatch`"
				type="color"
				:value="field.value.value"
				:disabled="field.disabled.value || undefined"
				class="h-9 w-12 cursor-pointer rounded-lg border border-border bg-background"
				@input="field.onInput($event.target.value)"
				@focus="field.onFocus"
				@blur="field.onBlur"
			/>
			<input
				v-bind="field.inputAttrs.value"
				type="text"
				class="el-input flex-1 font-mono"
				@input="field.onInput($event.target.value)"
				@focus="field.onFocus"
				@blur="field.onBlur"
			/>
		</div>
	</FieldChrome>
</template>
