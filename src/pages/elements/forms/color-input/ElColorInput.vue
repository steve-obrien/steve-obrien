<script setup>
import { computed, useId } from 'vue';
import ElField from '../field/ElField.vue';

const props = defineProps({
	modelValue: { type: String, default: '#000000' },
	id: String,
	name: String,
	label: String,
	description: String,
	disabled: Boolean,
	invalid: Boolean,
});
const emit = defineEmits(['update:modelValue']);
const generatedId = `el-color-input-${useId()}`;
const inputId = computed(() => props.id || generatedId);
const inputName = computed(() => props.name || inputId.value);
</script>

<template>
	<ElField :label="label" :description="description" :html-for="inputId" :invalid="invalid">
		<div class="flex items-center gap-2">
			<input
				:id="`${inputId}-swatch`"
				type="color"
				:value="modelValue"
				:disabled="disabled"
				class="h-9 w-12 cursor-pointer rounded-lg border border-border bg-background"
				@input="emit('update:modelValue', $event.target.value)"
			/>
			<input
				:id="inputId"
				:name="inputName"
				type="text"
				:value="modelValue"
				:disabled="disabled"
				:aria-invalid="invalid || undefined"
				class="el-input flex-1 font-mono"
				@input="emit('update:modelValue', $event.target.value)"
			/>
		</div>
	</ElField>
</template>
