<script setup>
import FieldChrome from '../field/FieldChrome.vue';
import ElButton from '../../components/button/ElButton.vue';
import { fieldProps } from '../field/fieldProps.js';
import { useField } from '../field/useField.js';

const props = defineProps({
	...fieldProps,
	modelValue: {
		default: null,
		_edit: { group: 'Control props', description: 'Selected value.' },
	},
	options: {
		type: Array,
		default: () => [],
		_edit: {
			group: 'Control props',
			component: 'ElJsonListInput',
			description: 'Options to render as buttons.',
			props: {
				compact: true,
				addLabel: '+ Add option',
				schema: [
					{ key: 'label', label: 'Label', placeholder: 'Option label', default: (index) => `Option ${index + 1}` },
					{ key: 'value', label: 'Value', placeholder: 'option-value', default: (index) => `option-${index + 1}` },
				],
			},
		},
	},
});
const emit = defineEmits(['update:modelValue', 'focus', 'blur']);
const field = useField(props, emit, { idPrefix: 'el-select-input' });

// Options can be string[] or { label, value }[].
const labelOf = (o) => (o && typeof o === 'object' ? (o.label ?? o.value) : o);
const valueOf = (o) => (o && typeof o === 'object' ? (o.value ?? o.label) : o);

function select(value) {
	if (field.disabled.value || field.readOnly.value) return;
	field.onInput(value);
}
</script>

<template>
	<FieldChrome :field-attrs="field.fieldAttrs.value" :chrome="chrome">
		<input
			v-if="field.htmlName.value"
			type="hidden"
			:name="field.htmlName.value"
			:value="field.value.value ?? ''"
		/>
			<div
				:id="field.id.value"
				role="group"
				:aria-label="label || undefined"
				:aria-describedby="field.describedBy.value || undefined"
				:aria-invalid="field.invalid.value || undefined"
				:aria-errormessage="field.errorId.value || undefined"
				class="flex flex-wrap gap-0"
			>
			<ElButton
				v-for="(opt, i) in options"
				:key="valueOf(opt)"
				type="button"
				size="sm"
				:variant="field.value.value === valueOf(opt) ? 'primary' : 'secondary'"
				:disabled="field.disabled.value"
				:aria-pressed="field.value.value === valueOf(opt)"
				@click="select(valueOf(opt))"
				@focus="field.onFocus"
				@blur="field.onBlur"
				:class="[
					'-ml-px',
					i === 0 ? 'rounded-l-full' : 'rounded-none',
					i === options.length - 1 ? 'rounded-r-full' : 'rounded-none',
				]"
			>{{ labelOf(opt) }}</ElButton>
		</div>
	</FieldChrome>
</template>
