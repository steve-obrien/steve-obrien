<script setup>
import { computed, useId } from 'vue';
import ElField from './ElField.vue';

const props = defineProps({
	modelValue: { type: Number, default: 0 },
	id: String,
	name: String,
	label: String,
	description: String,
	min: Number,
	max: Number,
	step: Number,
	placeholder: String,
	disabled: Boolean,
	invalid: Boolean,
	required: Boolean,
});
const emit = defineEmits(['update:modelValue']);
const generatedId = `el-number-input-${useId()}`;
const inputId = computed(() => props.id || generatedId);
const inputName = computed(() => props.name || inputId.value);
</script>

<template>
	<ElField :label="label" :description="description" :html-for="inputId" :invalid="invalid" :required="required">
		<input
			:id="inputId"
			:name="inputName"
			type="number"
			:value="modelValue"
			:min="min"
			:max="max"
			:step="step"
			:placeholder="placeholder"
			:disabled="disabled"
			:required="required"
			:aria-invalid="invalid || undefined"
			class="el-input"
			@input="emit('update:modelValue', Number($event.target.value))"
		/>
	</ElField>
</template>
