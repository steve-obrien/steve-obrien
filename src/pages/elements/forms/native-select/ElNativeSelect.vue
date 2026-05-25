<script setup>
import ElField from '../field/ElField.vue';
import { fieldProps } from '../field/fieldProps.js';
import { useField } from '../field/useField.js';

defineOptions({
	__doc: {
		name: 'Native select',
		tag: '<ElNativeSelect>',
		description: 'A styled native select box that keeps browser behaviour while matching the Elements form surface.',
		events: [
			{ name: 'update:modelValue', payload: 'string', description: 'Fired when the selected option changes.' },
		],
	},
});

const props = defineProps({
	...fieldProps,
	options: {
		type: Array,
		default: () => [],
		_edit: {
			component: 'ElJsonListInput',
			props: {
				description: 'Options can be strings or objects with label/value.',
				compact: true,
				schema: [
					{ key: 'label', label: 'Label', placeholder: 'Team workspace' },
					{ key: 'value', label: 'Value', placeholder: 'team' },
				],
			},
		},
	},
	placeholder: {
		type: String,
		default: 'Select an option',
		_edit: { description: 'Disabled placeholder option.' },
	},
});

const emit = defineEmits(['update:modelValue']);
const labelOf = (option) => (option && typeof option === 'object' ? (option.label ?? option.value) : option);
const valueOf = (option) => (option && typeof option === 'object' ? (option.value ?? option.label) : option);
const field = useField(props, emit, { idPrefix: 'el-native-select' });
</script>

<template>
	<ElField v-bind="field.fieldAttrs.value">
		<div class="relative">
			<select
				v-bind="field.inputAttrs.value"
				class="el-input appearance-none pr-10"
				@change="field.onInput($event.target.value)"
				@focus="field.onFocus"
				@blur="field.onBlur"
			>
				<option v-if="placeholder" disabled value="">{{ placeholder }}</option>
				<option v-for="option in options" :key="valueOf(option)" :value="valueOf(option)">
					{{ labelOf(option) }}
				</option>
			</select>
			<svg class="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" aria-hidden="true">
				<path d="M7 10l5 5 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		</div>
	</ElField>
</template>
