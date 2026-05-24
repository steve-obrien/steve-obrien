<script setup>
import { computed } from 'vue';
import { getEditor, getDefaultEditor } from './editorRegistry.js';

// One generic renderer: the field knows which editor component it wants by
// name (e.g. 'ElSelectInput', 'ElJsonListInput'). We resolve the name to the real
// component via the editor registry — no per-type switch statement, no string
// mappings like 'select' or 'text' to maintain.
const props = defineProps({
	field: { type: Object, required: true },
	modelValue: { default: undefined },
});
const emit = defineEmits(['update:modelValue']);
const update = (v) => emit('update:modelValue', v);

const editor = computed(() => getEditor(props.field.component || props.field.editor) || getDefaultEditor());

// Pass through every schema entry except the bookkeeping fields so editors
// pick up their own props (options, rows, min/max/step, placeholder, …).
const editorProps = computed(() => {
	// eslint-disable-next-line no-unused-vars
	const { key, component, editor: _editor, target, label, description, props: fieldProps = {}, ...rest } = props.field;
	return { ...rest, ...fieldProps };
});
</script>

<template>
	<component
		:is="editor"
		:model-value="modelValue"
		:label="field.label"
		:description="field.description"
		v-bind="editorProps"
		@update:model-value="update"
	/>
</template>
