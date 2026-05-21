<script setup>
import ElField from './ElField.vue';

const props = defineProps({
	modelValue: { type: String, default: '' },
	label: String,
	description: String,
	placeholder: String,
	disabled: Boolean,
	required: Boolean,
});
const emit = defineEmits(['update:modelValue']);
</script>

<template>
	<ElField :label="label" :description="description" :required="required">
		<input
			type="text"
			:value="modelValue"
			:placeholder="placeholder"
			:disabled="disabled"
			class="h-9 w-full rounded-lg border border-skin-border bg-skin-background px-3 text-sm text-skin-primary outline-none transition focus:ring-2 focus:ring-skin-primary/40 disabled:opacity-50"
			@input="emit('update:modelValue', $event.target.value)"
		/>
	</ElField>
</template>
