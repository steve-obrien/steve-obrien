<script setup>
import ElField from './ElField.vue';

const props = defineProps({
	modelValue: { type: String, default: '' },
	label: String,
	description: String,
	placeholder: String,
	rows: { type: Number, default: 3 },
	disabled: Boolean,
	required: Boolean,
});
const emit = defineEmits(['update:modelValue']);
</script>

<template>
	<ElField :label="label" :description="description" :required="required">
		<textarea
			:value="modelValue"
			:placeholder="placeholder"
			:rows="rows"
			:disabled="disabled"
			class="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring/40 disabled:opacity-50"
			@input="emit('update:modelValue', $event.target.value)"
		></textarea>
	</ElField>
</template>
