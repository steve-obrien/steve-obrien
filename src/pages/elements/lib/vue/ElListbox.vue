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
		_edit: { component: 'ElListInput', description: 'Available options.' },
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
		class="grid gap-1 rounded-2xl border border-skin-border bg-skin-background p-1 shadow-sm"
		:class="orientation === 'horizontal' && 'grid-flow-col'"
	>
		<button
			v-for="(option, index) in options"
			:key="valueOf(option) || index"
			role="option"
			:data-value="valueOf(option)"
			class="rounded-xl px-3 py-2 text-left text-sm text-skin-primary outline-none transition hover:bg-skin-surface focus:bg-skin-surface aria-selected:bg-skin-primary aria-selected:text-skin-inverse"
		>
			<slot name="option" :option="option" :index="index">{{ labelOf(option) }}</slot>
		</button>
	</element-listbox>
</template>
