<script setup>
import { onMounted, ref, watch } from 'vue';

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
	modelValue: {
		type: [String, Number],
		default: '',
		_edit: { description: 'Selected option value.' },
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
		_edit: { options: ['vertical', 'horizontal'], description: 'Arrow key direction.' },
	},
});
const emit = defineEmits(['update:modelValue', 'select']);
const root = ref(null);

onMounted(async () => {
	await import('../headless/listbox.js');
	root.value?.addEventListener('el:change', (event) => {
		const option = props.options.find((item) => valueOf(item) === event.detail.value) || null;
		emit('update:modelValue', event.detail.value);
		emit('select', { value: event.detail.value, option });
	});
});

watch(() => props.modelValue, (value) => {
	if (root.value && String(root.value.value) !== String(value ?? '')) root.value.value = value ?? '';
});

const labelOf = (option) => (option && typeof option === 'object' ? (option.label ?? option.value) : option);
const valueOf = (option) => String(option && typeof option === 'object' ? (option.value ?? option.label) : option);
</script>

<template>
	<element-listbox
		ref="root"
		:value="modelValue ?? ''"
		:orientation="orientation"
		class="grid gap-1 rounded-2xl border border-border bg-background p-1 shadow-sm"
		:class="orientation === 'horizontal' && 'grid-flow-col'"
	>
		<button
			v-for="(option, index) in options"
			:key="valueOf(option) || index"
			role="option"
			:data-value="valueOf(option)"
			class="rounded-xl px-3 py-2 text-left text-sm text-foreground outline-none transition hover:bg-secondary focus:bg-secondary aria-selected:bg-primary aria-selected:text-primary-foreground"
		>
			<slot name="option" :option="option" :index="index">{{ labelOf(option) }}</slot>
		</button>
	</element-listbox>
</template>
