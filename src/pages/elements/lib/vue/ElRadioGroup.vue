<script setup>
import { onMounted, ref, watch } from 'vue';

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
	modelValue: {
		type: [String, Number],
		default: '',
		_edit: { description: 'Selected value.' },
	},
	options: {
		type: Array,
		required: true,
		_edit: { component: 'ElListInput', description: 'Radio options.' },
	},
	label: {
		type: String,
		default: '',
		_edit: { description: 'Group label.' },
	},
	orientation: {
		type: String,
		default: 'vertical',
		_edit: { options: ['vertical', 'horizontal'], description: 'Arrow key direction.' },
	},
});
const emit = defineEmits(['update:modelValue']);
const root = ref(null);

onMounted(async () => {
	await import('../headless/radio-group.js');
	root.value?.addEventListener('el:change', (event) => emit('update:modelValue', event.detail.value));
});

watch(() => props.modelValue, (value) => {
	if (root.value && String(root.value.value) !== String(value ?? '')) root.value.value = value ?? '';
});

const labelOf = (option) => (option && typeof option === 'object' ? (option.label ?? option.value) : option);
const valueOf = (option) => String(option && typeof option === 'object' ? (option.value ?? option.label) : option);
const selected = (option) => String(props.modelValue ?? '') === valueOf(option);
</script>

<template>
	<div class="grid gap-2">
		<p v-if="label" class="text-sm font-medium text-skin-primary">{{ label }}</p>
		<element-radio-group
			ref="root"
			:value="modelValue ?? ''"
			:orientation="orientation"
			class="grid gap-2"
			:class="orientation === 'horizontal' && 'grid-flow-col justify-start'"
		>
			<button
				v-for="(option, index) in options"
				:key="valueOf(option) || index"
				role="radio"
				:data-value="valueOf(option)"
				class="inline-flex items-center gap-3 rounded-xl border border-skin-border bg-skin-background px-3 py-2 text-left text-sm text-skin-primary outline-none transition hover:bg-skin-surface focus:ring-2 focus:ring-skin-primary/40 aria-checked:border-skin-primary aria-checked:bg-skin-surface"
			>
				<span class="grid size-4 place-items-center rounded-full border border-skin-border" aria-hidden="true">
					<span class="size-2 rounded-full bg-skin-primary" :class="selected(option) ? 'opacity-100' : 'opacity-0'"></span>
				</span>
				<slot name="option" :option="option" :index="index">{{ labelOf(option) }}</slot>
			</button>
		</element-radio-group>
	</div>
</template>
