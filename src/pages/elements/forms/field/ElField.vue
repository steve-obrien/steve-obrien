<script setup>
import { computed, inject, provide, reactive, unref, useAttrs } from 'vue';
import { fieldLayoutProviderKey } from './fieldLayout.js';
import { fieldDisplayProviderKey, normalizeErrors } from './useField.js';

defineOptions({
	inheritAttrs: false,
	__doc: {
		name: 'Field',
		tag: '<ElField>',
		description: 'Shared form chrome for labels, required markers, descriptions, errors, and custom controls.',
		slots: [
			{ name: '(default)', payload: '{ invalid, errors, htmlFor, errorId, fields, fieldAttrs }', description: 'The form control or custom interactive content.' },
			{ name: 'label', payload: '{ label, required, htmlFor, invalid, errors, fields, fieldAttrs }', description: 'Replace the default label while keeping field layout.' },
			{ name: 'errors', payload: '{ errors, errorId, invalid, fields, fieldAttrs }', description: 'Replace the default error list.' },
			{ name: 'description', payload: '{ description, descriptionId, fields, fieldAttrs }', description: 'Replace the default helper text.' },
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
	chrome: {
		type: [String, Boolean],
		default: 'field',
		_edit: { options: ['field', false], description: 'Render the field wrapper, or false to provide state without rendering chrome.' },
	},
	fieldLayout: {
		type: [Object, Function, String],
		default: null,
		_edit: { description: 'Optional component used to render this field layout.' },
	},
});

const attrs = useAttrs();
const providedFieldLayout = inject(fieldLayoutProviderKey, null);
const registeredFields = reactive(new Map());

provide(fieldDisplayProviderKey, {
	registerField(key, field) {
		registeredFields.set(key, field);
	},
	unregisterField(key) {
		registeredFields.delete(key);
	},
});

const uniqueErrors = (errors) => {
	const seen = new Set();
	return errors.filter((error) => {
		const key = String(error);
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
};
const unrefOr = (value, fallback = undefined) => {
	const resolved = unref(value);
	return resolved === undefined ? fallback : resolved;
};
const fieldAttrsFromRegistration = (field) => unrefOr(field?.fieldAttrs, {}) || {};
const fieldValue = (field, key) => {
	if (!field) return undefined;
	if (key in field) return unrefOr(field[key]);
	return unrefOr(fieldAttrsFromRegistration(field)[key]);
};
const fieldVisible = (field) => fieldValue(field, 'visible') !== false;
const fieldErrors = (field) => normalizeErrors(fieldValue(field, 'errors'));
const fieldInvalid = (field) => Boolean(fieldValue(field, 'invalid') || fieldErrors(field).length);
const hasInvalidAttr = computed(() => (
	attrs['data-invalid'] === ''
	|| attrs['data-invalid'] === true
	|| attrs['data-invalid'] === 'true'
));
const fields = computed(() => Array.from(registeredFields.values()));
const visibleFields = computed(() => fields.value.filter(fieldVisible));
const firstField = computed(() => visibleFields.value[0] || fields.value[0] || null);
const firstFieldAttrs = computed(() => fieldAttrsFromRegistration(firstField.value));
const hasChrome = computed(() => props.chrome !== false && props.chrome !== 'none');
const resolvedFieldLayout = computed(() => props.fieldLayout || unref(providedFieldLayout) || null);
const errorMessages = computed(() => uniqueErrors([
	...normalizeErrors(props.errors),
	...visibleFields.value.flatMap(fieldErrors),
]));
const resolvedHtmlFor = computed(() => (
	props.htmlFor
	|| firstFieldAttrs.value.htmlFor
	|| fieldValue(firstField.value, 'htmlId')
	|| fieldValue(firstField.value, 'id')
	|| ''
));
const resolvedErrorId = computed(() => (
	props.errorId
	|| firstFieldAttrs.value.errorId
	|| (errorMessages.value.length && resolvedHtmlFor.value ? `${resolvedHtmlFor.value}-error` : '')
));
const resolvedDescription = computed(() => props.description || firstFieldAttrs.value.description || '');
const resolvedDescriptionId = computed(() => (
	props.descriptionId
	|| firstFieldAttrs.value.descriptionId
	|| (resolvedDescription.value && resolvedHtmlFor.value ? `${resolvedHtmlFor.value}-description` : '')
));
const resolvedLabel = computed(() => props.label || firstFieldAttrs.value.label || '');
const resolvedRequired = computed(() => Boolean(
	props.required
	|| firstFieldAttrs.value.required
	|| visibleFields.value.some((field) => fieldValue(field, 'required'))
));
const isInvalid = computed(() => (
	props.invalid
	|| errorMessages.value.length > 0
	|| hasInvalidAttr.value
	|| visibleFields.value.some(fieldInvalid)
));
const isVisible = computed(() => (
	props.visible !== false
	&& (!fields.value.length || visibleFields.value.length > 0)
));
const fieldAttrs = computed(() => ({
	label: resolvedLabel.value,
	description: resolvedDescription.value,
	htmlFor: resolvedHtmlFor.value,
	descriptionId: resolvedDescriptionId.value,
	errorId: resolvedErrorId.value,
	invalid: isInvalid.value,
	required: resolvedRequired.value,
	errors: errorMessages.value,
	visible: isVisible.value,
}));
const slotProps = computed(() => ({
	...fieldAttrs.value,
	fields: visibleFields.value,
	fieldAttrs: fieldAttrs.value,
}));

provide(fieldLayoutProviderKey, resolvedFieldLayout);
</script>

<template>
	<template v-if="isVisible">
		<slot v-if="!hasChrome" v-bind="slotProps" />
		<component
			:is="resolvedFieldLayout"
			v-else-if="resolvedFieldLayout"
			v-bind="{ ...attrs, ...slotProps }"
			:data-invalid="isInvalid ? '' : undefined"
		>
			<template #label="layoutSlotProps">
				<slot name="label" v-bind="{ ...slotProps, ...layoutSlotProps }">
					<component
						:is="resolvedHtmlFor ? 'label' : 'p'"
						v-if="resolvedLabel"
						v-bind="resolvedHtmlFor ? { for: resolvedHtmlFor } : {}"
						class="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
					>
						{{ resolvedLabel }}
						<span v-if="resolvedRequired" class="text-destructive">*</span>
					</component>
				</slot>
			</template>
			<template #default="layoutSlotProps">
				<slot v-bind="{ ...slotProps, ...layoutSlotProps }" />
			</template>
			<template #errors="layoutSlotProps">
				<slot name="errors" v-bind="{ ...slotProps, ...layoutSlotProps }">
					<p
						v-for="(error, index) in errorMessages"
						:key="`${error}-${index}`"
						:id="index === 0 ? resolvedErrorId : undefined"
						class="text-[11px] leading-snug text-destructive"
					>
						{{ error }}
					</p>
				</slot>
			</template>
			<template #description="layoutSlotProps">
				<slot name="description" v-bind="{ ...slotProps, ...layoutSlotProps }">
					<p
						v-if="resolvedDescription"
						:id="resolvedDescriptionId || undefined"
						class="text-[11px] leading-snug text-muted-foreground"
					>{{ resolvedDescription }}</p>
				</slot>
			</template>
		</component>
		<div v-else v-bind="attrs" class="space-y-1.5 w-full" :data-invalid="isInvalid ? '' : undefined">
			<slot name="label" v-bind="slotProps">
				<component
					:is="resolvedHtmlFor ? 'label' : 'p'"
					v-if="resolvedLabel"
					v-bind="resolvedHtmlFor ? { for: resolvedHtmlFor } : {}"
					class="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
				>
					{{ resolvedLabel }}
					<span v-if="resolvedRequired" class="text-destructive">*</span>
				</component>
			</slot>
			<slot v-bind="slotProps" />
			<slot name="errors" v-bind="slotProps">
				<p
					v-for="(error, index) in errorMessages"
					:key="`${error}-${index}`"
					:id="index === 0 ? resolvedErrorId : undefined"
					class="text-[11px] leading-snug text-destructive"
				>
					{{ error }}
				</p>
			</slot>
			<slot name="description" v-bind="slotProps">
				<p
					v-if="resolvedDescription"
					:id="resolvedDescriptionId || undefined"
					class="text-[11px] leading-snug text-muted-foreground"
				>{{ resolvedDescription }}</p>
			</slot>
		</div>
	</template>
</template>
