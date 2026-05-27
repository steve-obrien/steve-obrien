<script setup>
import FieldChrome from '../field/FieldChrome.vue';
import { fieldProps } from '../field/fieldProps.js';
import { useField } from '../field/useField.js';

const props = defineProps({
	...fieldProps,
	rows: { type: Number, default: 3 },
});
const emit = defineEmits(['update:modelValue']);
const field = useField(props, emit, { idPrefix: 'el-textarea-input' });
</script>

<template>
	<FieldChrome :field-attrs="field.fieldAttrs.value" :chrome="chrome">
		<textarea
			:id="field.id.value"
			:name="field.htmlName.value"
			:value="field.value.value"
			:placeholder="placeholder"
			:rows="rows"
			:disabled="field.disabled.value || undefined"
			:readonly="field.readOnly.value || undefined"
			:required="required || undefined"
			:aria-invalid="field.invalid.value || undefined"
			:data-invalid="field.invalid.value ? '' : undefined"
			class="el-textarea"
			@input="field.onInput($event.target.value)"
			@focus="field.onFocus"
			@blur="field.onBlur"
		></textarea>
	</FieldChrome>
</template>
