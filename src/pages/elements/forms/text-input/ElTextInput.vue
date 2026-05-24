<script setup>
import { computed, useId } from 'vue';
import ElField from '../field/ElField.vue';

const props = defineProps({
	modelValue: { type: String, default: '' },
	id: String,
	name: String,
	label: String,
	description: String,
	placeholder: String,
	disabled: Boolean,
	invalid: Boolean,
	required: Boolean,
});
const emit = defineEmits(['update:modelValue']);
const generatedId = `el-text-input-${useId()}`;
const inputId = computed(() => props.id || generatedId);
const inputName = computed(() => props.name || inputId.value);
</script>

<template>
	<ElField :label="label" :description="description" :html-for="inputId" :invalid="invalid" :required="required">
		<input
			:id="inputId"
			:name="inputName"
			type="text"
			:value="modelValue"
			:placeholder="placeholder"
			:disabled="disabled"
			:required="required"
			:aria-invalid="invalid || undefined"
			class="el-input"
			@input="emit('update:modelValue', $event.target.value)"
		/>
	</ElField>
</template>
