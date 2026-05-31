<script setup>
import { onMounted, ref, watch } from 'vue';
import ElField from '../field/ElField.vue';
import { fieldProps } from '../field/fieldProps.js';
import { useField } from '../field/useField.js';

defineOptions({
	__doc: {
		name: 'Radio group',
		tag: '<ElRadioGroup>',
		description: 'A single-select radio group with roving focus and full styling control.',
		slots: [{ name: 'option', payload: '{ option, index }', description: 'Custom option markup.' }],
		events: [{ name: 'update:modelValue', payload: '(value: string)', description: 'Emitted when selection changes.' }],
	},
});

const props = defineProps({
	...fieldProps,
	modelValue: {
		type: [String, Number],
		default: '',
		_edit: { group: 'Control props', description: 'Selected value.' },
	},
	options: {
		type: Array,
		required: true,
		_edit: {
			component: 'ElJsonListInput',
			description: 'Radio options.',
			props: {
				compact: true,
				addLabel: '+ Add option',
				schema: [
					{ key: 'label', label: 'Label', placeholder: 'Option label', default: (index) => `Option ${index + 1}` },
					{ key: 'value', label: 'Value', placeholder: 'option-value', default: (index) => `option-${index + 1}` },
				],
			},
		},
	},
	orientation: {
		type: String,
		default: 'vertical',
		_edit: { group: 'Control props', options: ['vertical', 'horizontal'], description: 'Arrow key direction.' },
	},
});
const emit = defineEmits(['update:modelValue', 'focus', 'blur']);
const root = ref(null);
const field = useField(props, emit, { idPrefix: 'el-radio-group' });

onMounted(async () => {
	await import('../../lib/headless/radio-group.js');
	root.value?.addEventListener('el:change', (event) => field.onInput(event.detail.value));
});

watch(field.value, (value) => {
	if (root.value && String(root.value.value) !== String(value ?? '')) root.value.value = value ?? '';
});

const labelOf = (option) => (option && typeof option === 'object' ? (option.label ?? option.value) : option);
const valueOf = (option) => String(option && typeof option === 'object' ? (option.value ?? option.label) : option);
const selected = (option) => String(field.value.value ?? '') === valueOf(option);
</script>

<template>
	<ElField v-bind="field.fieldAttrs.value" :chrome="chrome">
		<input
			v-if="field.htmlName.value"
			type="hidden"
			:name="field.htmlName.value"
			:value="field.value.value"
		/>
		<element-radio-group
			ref="root"
			:id="field.id.value"
				:value="field.value.value ?? ''"
				:orientation="orientation"
				:aria-label="label || undefined"
				:aria-describedby="field.describedBy.value || undefined"
				:aria-invalid="field.invalid.value || undefined"
				:aria-errormessage="field.errorId.value || undefined"
				class="grid gap-2 data-[invalid]:rounded-2xl data-[invalid]:ring-1 data-[invalid]:ring-destructive"
			:class="orientation === 'horizontal' && 'grid-flow-col justify-start'"
			:data-invalid="field.invalid.value ? '' : undefined"
		>
			<button
				v-for="(option, index) in options"
				:key="valueOf(option) || index"
				role="radio"
				:data-value="valueOf(option)"
				:disabled="field.disabled.value || undefined"
				class="inline-flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2 text-left text-sm text-foreground outline-none transition hover:bg-secondary focus:ring-2 focus:ring-ring/40 aria-checked:border-primary aria-checked:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
				@focus="field.onFocus"
				@blur="field.onBlur"
			>
				<span class="grid size-4 place-items-center rounded-full border border-border" aria-hidden="true">
					<span class="size-2 rounded-full bg-primary" :class="selected(option) ? 'opacity-100' : 'opacity-0'"></span>
				</span>
				<slot name="option" :option="option" :index="index">{{ labelOf(option) }}</slot>
			</button>
		</element-radio-group>
	</ElField>
</template>
