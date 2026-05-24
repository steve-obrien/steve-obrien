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
	rows: { type: Number, default: 3 },
	disabled: Boolean,
	invalid: Boolean,
	required: Boolean,
});
const emit = defineEmits(['update:modelValue']);
const generatedId = `el-textarea-input-${useId()}`;
const inputId = computed(() => props.id || generatedId);
const inputName = computed(() => props.name || inputId.value);
</script>

<template>
	<ElField :label="label" :description="description" :html-for="inputId" :invalid="invalid" :required="required">
		<textarea
			:id="inputId"
			:name="inputName"
			:value="modelValue"
			:placeholder="placeholder"
			:rows="rows"
			:disabled="disabled"
			:required="required"
			:aria-invalid="invalid || undefined"
			class="el-textarea"
			@input="emit('update:modelValue', $event.target.value)"
		></textarea>
	</ElField>
</template>
