<script setup>
import ElField from './ElField.vue';

const props = defineProps({
	modelValue: { type: Number, default: 0 },
	label: String,
	description: String,
	min: Number,
	max: Number,
	step: Number,
	placeholder: String,
	disabled: Boolean,
	required: Boolean,
});
const emit = defineEmits(['update:modelValue']);
</script>

<template>
	<ElField :label="label" :description="description" :required="required">
		<input
			type="number"
			:value="modelValue"
			:min="min"
			:max="max"
			:step="step"
			:placeholder="placeholder"
			:disabled="disabled"
			class="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring/40 disabled:opacity-50"
			@input="emit('update:modelValue', Number($event.target.value))"
		/>
	</ElField>
</template>
