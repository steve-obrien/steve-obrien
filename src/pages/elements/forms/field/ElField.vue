<script setup>
import { computed, useAttrs } from 'vue';

defineOptions({
	inheritAttrs: false,
	__doc: {
		name: 'Field',
		tag: '<ElField>',
		description: 'Shared form chrome for labels, required markers, descriptions, and custom controls.',
		slots: [
			{ name: '(default)', payload: '{ invalid, errors }', description: 'The form control or custom interactive content.' },
			{ name: 'label', payload: '{ label, required, htmlFor }', description: 'Replace the default label while keeping field layout.' },
			{ name: 'errors', payload: '{ errors }', description: 'Replace the default error list.' },
			{ name: 'description', payload: '{ description }', description: 'Replace the default helper text.' },
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
	descriptionId: {
		type: String,
		default: '',
	},
	errorId: {
		type: String,
		default: '',
	},
	invalid: {
		type: Boolean,
		default: false,
		_edit: { description: 'Mark the field invalid and expose data-invalid for styling.' },
	},
	errors: {
		type: [Array, Object, String],
		default: () => [],
		_edit: { component: 'ElJsonInput', description: 'Validation errors to show below the control.' },
	},
	required: {
		type: Boolean,
		default: false,
		_edit: { description: 'Show a required marker next to the label.' },
	},
	visible: {
		type: Boolean,
		default: true,
		_edit: { description: 'Show or hide the field wrapper.' },
	},
});

const attrs = useAttrs();
const normalizeErrors = (errors) => {
	if (!errors) return [];
	if (typeof errors === 'string') return errors ? [errors] : [];
	if (Array.isArray(errors)) return errors.flatMap((error) => normalizeErrors(error));
	if (typeof errors === 'object') {
		if (errors.message) return [errors.message];
		return Object.values(errors).flatMap((error) => normalizeErrors(error));
	}
	return [];
};
const errorMessages = computed(() => normalizeErrors(props.errors));
const isInvalid = computed(() => (
	props.invalid
	|| errorMessages.value.length > 0
	|| attrs['data-invalid'] === ''
	|| attrs['data-invalid'] === true
	|| attrs['data-invalid'] === 'true'
));
</script>

<template>
	<div v-if="visible" v-bind="attrs" class="space-y-1.5 w-full" :data-invalid="isInvalid ? '' : undefined">
		<slot name="label" :label="label" :required="required" :html-for="htmlFor">
			<component
				:is="htmlFor ? 'label' : 'p'"
				v-if="label"
				v-bind="htmlFor ? { for: htmlFor } : {}"
				class="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
			>
				{{ label }}
				<span v-if="required" class="text-destructive">*</span>
			</component>
		</slot>
		<slot :invalid="isInvalid" :errors="errorMessages" />
		<slot name="errors" :errors="errorMessages">
			<p
				v-for="(error, index) in errorMessages"
				:key="`${error}-${index}`"
				:id="index === 0 ? errorId : undefined"
				class="text-[11px] leading-snug text-destructive"
			>
				{{ error }}
			</p>
		</slot>
		<slot name="description" :description="description">
			<p v-if="description" :id="descriptionId || undefined" class="text-[11px] leading-snug text-muted-foreground">{{ description }}</p>
		</slot>
	</div>
</template>
