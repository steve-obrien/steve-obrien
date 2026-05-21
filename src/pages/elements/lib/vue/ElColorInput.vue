<script setup>
import ElField from './ElField.vue';

const props = defineProps({
	modelValue: { type: String, default: '#000000' },
	label: String,
	description: String,
	disabled: Boolean,
});
const emit = defineEmits(['update:modelValue']);
</script>

<template>
	<ElField :label="label" :description="description">
		<div class="flex items-center gap-2">
			<input
				type="color"
				:value="modelValue"
				:disabled="disabled"
				class="h-9 w-12 cursor-pointer rounded-lg border border-skin-border bg-skin-background"
				@input="emit('update:modelValue', $event.target.value)"
			/>
			<input
				type="text"
				:value="modelValue"
				:disabled="disabled"
				class="h-9 flex-1 rounded-lg border border-skin-border bg-skin-background px-3 text-sm font-mono text-skin-primary outline-none focus:ring-2 focus:ring-skin-primary/40"
				@input="emit('update:modelValue', $event.target.value)"
			/>
		</div>
	</ElField>
</template>
