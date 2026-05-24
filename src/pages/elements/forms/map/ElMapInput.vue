<script setup>
import { computed, useId } from 'vue';
import ElField from '../field/ElField.vue';

const props = defineProps({
	modelValue: { type: Object, default: () => ({}) },
	id: String,
	name: String,
	label: String,
	description: String,
	disabled: Boolean,
	invalid: Boolean,
	required: Boolean,
});
const emit = defineEmits(['update:modelValue']);
const generatedId = `el-map-input-${useId()}`;
const inputId = computed(() => props.id || generatedId);
const inputName = computed(() => props.name || inputId.value);
</script>

<template>
	<ElField :label="label" :description="description" :html-for="inputId" :invalid="invalid" :required="required">
		<div>
			<h1>Map Input</h1>
		</div>
	</ElField>
</template>