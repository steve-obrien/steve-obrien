<script setup>
import { onMounted, ref, watch } from 'vue';

const props = defineProps({
	modelValue: {
		type: Boolean,
		default: false,
		_edit: { description: 'On / off state.' },
	},
	disabled: {
		type: Boolean,
		default: false,
		_edit: { description: 'Disable interaction.' },
	},
	label: {
		type: String,
		default: '',
		_edit: { description: 'Optional label rendered next to the toggle.' },
	},
});
const emit = defineEmits(['update:modelValue']);

const root = ref(null);

onMounted(async () => {
	await import('../../lib/headless/toggle.js');
	root.value?.addEventListener('el:change', (e) => emit('update:modelValue', e.detail.checked));
});
watch(() => props.modelValue, (v) => {
	if (root.value && root.value.checked !== v) root.value.checked = v;
});
</script>

<template>
	<label class="inline-flex items-center gap-3">
		<element-toggle
			ref="root"
			:checked="modelValue || null"
			:disabled="disabled || null"
		/>
		<span v-if="label" class="text-sm text-foreground">{{ label }}</span>
	</label>
</template>
