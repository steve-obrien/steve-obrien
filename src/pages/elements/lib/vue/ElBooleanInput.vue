<script setup>
import ElField from './ElField.vue';
import ElToggle from './ElToggle.vue';

const props = defineProps({
	modelValue: { type: Boolean, default: false },
	label: String,
	description: String,
	disabled: Boolean,
});
const emit = defineEmits(['update:modelValue']);
</script>

<template>
	<ElField :label="label" :description="description">
		<ElToggle
			:model-value="!!modelValue"
			:disabled="disabled"
			@update:model-value="(v) => emit('update:modelValue', v)"
		/>
	</ElField>
</template>
