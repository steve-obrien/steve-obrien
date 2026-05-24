<script setup>
import ElField from './ElField.vue';

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
	modelValue: { default: '' },
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
	placeholder: {
		type: String,
		default: 'Select an option',
		_edit: { description: 'Disabled placeholder option.' },
	},
	disabled: {
		type: Boolean,
		default: false,
		_edit: { description: 'Disable the select.' },
	},
	required: {
		type: Boolean,
		default: false,
		_edit: { description: 'Show the required marker in the label.' },
	},
});

const emit = defineEmits(['update:modelValue']);
const labelOf = (option) => (option && typeof option === 'object' ? (option.label ?? option.value) : option);
const valueOf = (option) => (option && typeof option === 'object' ? (option.value ?? option.label) : option);
</script>

<template>
	<ElField :label="label" :description="description" :required="required">
		<div class="relative">
			<select
				:value="modelValue"
				:disabled="disabled"
				class="h-10 w-full appearance-none rounded-lg border border-input bg-background px-3 pr-10 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:opacity-50"
				@change="emit('update:modelValue', $event.target.value)"
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
