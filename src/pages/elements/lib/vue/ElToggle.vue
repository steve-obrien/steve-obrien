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
	await import('../headless/toggle.js');
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
			class="el-toggle relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full bg-skin-border transition aria-checked:bg-skin-primary"
		>
			<span class="el-toggle-thumb pointer-events-none ml-0.5 size-5 rounded-full bg-white shadow transition"></span>
		</element-toggle>
		<span v-if="label" class="text-sm text-skin-primary">{{ label }}</span>
	</label>
</template>

<style>
element-toggle[aria-checked="true"] .el-toggle-thumb,
element-toggle.el-toggle[aria-checked="true"] .el-toggle-thumb {
	transform: translateX(1.25rem);
}
</style>
