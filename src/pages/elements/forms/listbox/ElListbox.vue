<script setup>
import { onMounted, ref, watch } from 'vue';
import FieldChrome from '../field/FieldChrome.vue';
import { fieldProps } from '../field/fieldProps.js';
import { useField } from '../field/useField.js';

defineOptions({
	__doc: {
		name: 'Listbox',
		tag: '<ElListbox>',
		description: 'A styled select-like list without free-text entry.',
		slots: [{ name: 'option', payload: '{ option, index }', description: 'Custom option markup.' }],
		events: [
			{ name: 'update:modelValue', payload: '(value: string)', description: 'Emitted when selection changes.' },
			{ name: 'select', payload: '({ option, value })', description: 'Emitted with the full selected option.' },
		],
	},
});

const props = defineProps({
	...fieldProps,
	modelValue: {
		type: [String, Number],
		default: '',
		_edit: { group: 'Control props', description: 'Selected option value.' },
	},
	options: {
		type: Array,
		required: true,
		_edit: {
			component: 'ElJsonListInput',
			description: 'Available options.',
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
const emit = defineEmits(['update:modelValue', 'select', 'focus', 'blur']);
const root = ref(null);
const field = useField(props, emit, { idPrefix: 'el-listbox' });

onMounted(async () => {
	await import('../../lib/headless/listbox.js');
	root.value?.addEventListener('el:change', (event) => {
		const option = props.options.find((item) => valueOf(item) === event.detail.value) || null;
		field.onInput(event.detail.value);
		emit('select', { value: event.detail.value, option });
	});
});

watch(field.value, (value) => {
	if (root.value && String(root.value.value) !== String(value ?? '')) root.value.value = value ?? '';
});

const labelOf = (option) => (option && typeof option === 'object' ? (option.label ?? option.value) : option);
const valueOf = (option) => String(option && typeof option === 'object' ? (option.value ?? option.label) : option);
</script>

<template>
	<FieldChrome :field-attrs="field.fieldAttrs.value" :chrome="chrome">
		<input
			v-if="field.htmlName.value"
			type="hidden"
			:name="field.htmlName.value"
			:value="field.value.value"
		/>
		<element-listbox
			ref="root"
			:id="field.id.value"
			:value="field.value.value ?? ''"
			:orientation="orientation"
			:aria-invalid="field.invalid.value || undefined"
			class="grid gap-1 rounded-2xl border border-border bg-background p-1 shadow-sm data-[invalid]:border-destructive"
			:class="orientation === 'horizontal' && 'grid-flow-col'"
			:data-invalid="field.invalid.value ? '' : undefined"
		>
			<button
				v-for="(option, index) in options"
				:key="valueOf(option) || index"
				role="option"
				:data-value="valueOf(option)"
				:disabled="field.disabled.value || undefined"
				class="rounded-xl px-3 py-2 text-left text-sm text-foreground outline-none transition hover:bg-secondary focus:bg-secondary aria-selected:bg-primary aria-selected:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
				@focus="field.onFocus"
				@blur="field.onBlur"
			>
				<slot name="option" :option="option" :index="index">{{ labelOf(option) }}</slot>
			</button>
		</element-listbox>
	</FieldChrome>
</template>
