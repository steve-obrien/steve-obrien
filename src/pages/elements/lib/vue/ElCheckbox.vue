<script setup>
import { onMounted, ref, watch } from 'vue';

defineOptions({
	__doc: {
		name: 'Checkbox',
		tag: '<ElCheckbox>',
		description: 'A single accessible checkbox with a visible label and keyboard support.',
		events: [{ name: 'update:modelValue', payload: '(checked: boolean)', description: 'Emitted when checked changes.' }],
	},
});

const props = defineProps({
	modelValue: {
		type: Boolean,
		default: false,
		_edit: { description: 'Checked state.' },
	},
	label: {
		type: String,
		default: '',
		_edit: { description: 'Visible label next to the checkbox.' },
	},
	description: {
		type: String,
		default: '',
		_edit: { description: 'Optional helper text.' },
	},
	disabled: {
		type: Boolean,
		default: false,
		_edit: { description: 'Disable interaction.' },
	},
});
const emit = defineEmits(['update:modelValue']);
const root = ref(null);

function onLabelClick(event) {
	if (props.disabled) return;
	if (event.target === root.value) return;
	root.value?.focus?.();
	root.value?.toggle?.();
}

onMounted(async () => {
	await import('../headless/checkbox.js');
	root.value?.addEventListener('el:change', (event) => emit('update:modelValue', event.detail.checked));
});

watch(() => props.modelValue, (value) => {
	if (root.value && root.value.checked !== value) root.value.checked = value;
});
</script>

<template>
	<label class="inline-flex cursor-pointer items-start gap-3" @click="onLabelClick">
		<element-checkbox
			ref="root"
			:checked="modelValue || null"
			:disabled="disabled || null"
			class="mt-0.5"
		/>
		<span class="grid gap-0.5">
			<span v-if="label" class="text-sm font-medium text-foreground">{{ label }}</span>
			<span v-if="description" class="text-xs text-muted-foreground">{{ description }}</span>
		</span>
	</label>
</template>
