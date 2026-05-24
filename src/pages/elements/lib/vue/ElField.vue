<script setup>
import { computed, useAttrs } from 'vue';

defineOptions({
	inheritAttrs: false,
	__doc: {
		name: 'Field',
		tag: '<ElField>',
		description: 'Shared form chrome for labels, required markers, descriptions, and custom controls.',
		slots: [
			{ name: '(default)', description: 'The form control or custom interactive content.' },
		],
	},
});

// Field chrome shared by every form input: a small upper label, the control,
// and a description below. All form components in the library wrap their
// control in <ElField> so they pick up consistent labelling out of the box.
//
// <ElField label="Email" description="We'll never share it.">
//   <input … />
// </ElField>
const props = defineProps({
	label: {
		type: String,
		default: '',
		_edit: { description: 'Small label shown above the control.' },
	},
	description: {
		type: String,
		default: '',
		_edit: { description: 'Helper text shown below the control.' },
	},
	htmlFor: {
		type: String,
		default: '',
		_edit: { description: 'ID of the control the label should target.' },
	},
	invalid: {
		type: Boolean,
		default: false,
		_edit: { description: 'Mark the field invalid and expose data-invalid for styling.' },
	},
	required: {
		type: Boolean,
		default: false,
		_edit: { description: 'Show a required marker next to the label.' },
	},
});

const attrs = useAttrs();
const isInvalid = computed(() => (
	props.invalid
	|| attrs['data-invalid'] === ''
	|| attrs['data-invalid'] === true
	|| attrs['data-invalid'] === 'true'
));
</script>

<template>
	<div v-bind="attrs" class="space-y-1.5" :data-invalid="isInvalid ? '' : undefined">
		<component
			:is="htmlFor ? 'label' : 'p'"
			v-if="label"
			v-bind="htmlFor ? { for: htmlFor } : {}"
			class="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
		>
			{{ label }}
			<span v-if="required" class="text-destructive">*</span>
		</component>
		<slot />
		<p v-if="description" class="text-[11px] leading-snug text-muted-foreground">{{ description }}</p>
	</div>
</template>
