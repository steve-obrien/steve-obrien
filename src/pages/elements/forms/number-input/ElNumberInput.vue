<script setup>
import FieldChrome from '../field/FieldChrome.vue';
import { fieldProps } from '../field/fieldProps.js';
import { useField } from '../field/useField.js';

const props = defineProps({
	...fieldProps,
	modelValue: {
		type: [Number, String],
		default: '',
		_edit: { description: 'Current numeric value.' },
	},
	min: Number,
	max: Number,
	step: Number,
});
const emit = defineEmits(['update:modelValue']);
const field = useField(props, emit, { idPrefix: 'el-number-input' });

function toNumber(value) {
	if (value === '') return '';
	const number = Number(value);
	return Number.isNaN(number) ? value : number;
}
</script>

<template>
	<FieldChrome :field-attrs="field.fieldAttrs.value" :chrome="chrome">
		<input
			v-bind="field.inputAttrs.value"
			type="number"
			:min="min"
			:max="max"
			:step="step"
			class="el-input"
			@input="field.onInput(toNumber($event.target.value))"
			@focus="field.onFocus"
			@blur="field.onBlur"
		/>
	</FieldChrome>
</template>
