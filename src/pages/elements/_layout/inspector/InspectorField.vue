<script setup>
import { computed } from 'vue';
import {
	ElTextInput,
	ElTextareaInput,
	ElNumberInput,
	ElSelectInput,
	ElBooleanInput,
	ElColorInput,
} from '../../lib/vue';
import { getEditor } from './editorRegistry.js';

// The inspector form is built from the library's own form primitives:
// every type maps to one of <ElTextInput>, <ElNumberInput>, <ElSelectInput>,
// <ElBooleanInput>, <ElTextareaInput>, <ElColorInput>. Each carries the
// shared <ElField> chrome (label + description) so author-provided hints
// from a prop's `_edit: { description: '…' }` show up automatically.
const props = defineProps({
	field: { type: Object, required: true },
	modelValue: { default: undefined },
});
const emit = defineEmits(['update:modelValue']);

const update = (v) => emit('update:modelValue', v);
const customEditor = computed(() => (props.field.editor ? getEditor(props.field.editor) : null));
</script>

<template>
	<!-- Custom editor referenced by string in the editor registry. -->
	<component
		v-if="customEditor"
		:is="customEditor"
		:model-value="modelValue"
		:label="field.label"
		:description="field.description"
		:field="field"
		@update:model-value="update"
	/>

	<ElSelectInput
		v-else-if="field.type === 'select'"
		:model-value="modelValue"
		:options="field.options"
		:label="field.label"
		:description="field.description"
		@update:model-value="update"
	/>

	<ElBooleanInput
		v-else-if="field.type === 'boolean'"
		:model-value="!!modelValue"
		:label="field.label"
		:description="field.description"
		@update:model-value="update"
	/>

	<ElNumberInput
		v-else-if="field.type === 'number'"
		:model-value="modelValue"
		:label="field.label"
		:description="field.description"
		:min="field.min"
		:max="field.max"
		:step="field.step"
		@update:model-value="update"
	/>

	<ElColorInput
		v-else-if="field.type === 'color'"
		:model-value="modelValue"
		:label="field.label"
		:description="field.description"
		@update:model-value="update"
	/>

	<ElTextareaInput
		v-else-if="field.type === 'text'"
		:model-value="modelValue"
		:label="field.label"
		:description="field.description"
		:rows="field.rows"
		:placeholder="field.placeholder"
		@update:model-value="update"
	/>

	<ElTextInput
		v-else
		:model-value="modelValue"
		:label="field.label"
		:description="field.description"
		:placeholder="field.placeholder"
		@update:model-value="update"
	/>
</template>
