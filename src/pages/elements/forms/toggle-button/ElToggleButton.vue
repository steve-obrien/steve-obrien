<script setup>
import { computed } from 'vue';
import ElField from '../field/ElField.vue';
import { fieldProps } from '../field/fieldProps.js';
import { useField } from '../field/useField.js';

defineOptions({
	__doc: {
		name: 'Toggle button',
		tag: '<ElToggleButton>',
		description: 'A pressable form button for boolean choices, using aria-pressed and v-model.',
		slots: [{ name: '(default)', description: 'Button label or custom inline content.' }],
		events: [{ name: 'update:modelValue', payload: '(pressed: boolean)', description: 'Emitted when pressed changes.' }],
	},
});

const props = defineProps({
	...fieldProps,
	modelValue: {
		type: Boolean,
		default: false,
		_edit: { group: 'Control props', description: 'Pressed state.' },
	},
	pressedLabel: {
		type: String,
		default: '',
		_edit: { group: 'Control props', description: 'Optional button label shown while pressed.' },
	},
	unpressedLabel: {
		type: String,
		default: '',
		_edit: { group: 'Control props', description: 'Optional button label shown while not pressed.' },
	},
	size: {
		type: String,
		default: 'md',
		_edit: { group: 'Control props', options: ['sm', 'md', 'lg'], description: 'Button size.' },
	},
});
const emit = defineEmits(['update:modelValue', 'focus', 'blur']);
const field = useField(props, emit, { idPrefix: 'el-toggle-button' });

const pressed = computed(() => Boolean(field.value.value));
const displayLabel = computed(() => {
	if (pressed.value && props.pressedLabel) return props.pressedLabel;
	if (!pressed.value && props.unpressedLabel) return props.unpressedLabel;
	if (!props.pressedLabel && !props.unpressedLabel) return props.label;
	return pressed.value ? props.unpressedLabel : props.pressedLabel;
});
const sizeClass = computed(() => ({
	sm: 'h-8 px-3 text-xs',
	md: 'h-10 px-4 text-sm',
	lg: 'h-11 px-5 text-base',
}[props.size] || 'h-10 px-4 text-sm'));

function toggle() {
	if (field.disabled.value || field.readOnly.value) return;
	field.onInput(!pressed.value);
}
</script>

<template>
	<ElField v-bind="field.fieldAttrs.value" :chrome="chrome">
		<input
			v-if="field.htmlName.value"
			type="hidden"
			:name="field.htmlName.value"
			:value="pressed ? 'true' : 'false'"
		/>
		<button
			:id="field.id.value"
				type="button"
				:aria-pressed="String(pressed)"
				:aria-invalid="field.invalid.value || undefined"
				:aria-describedby="field.describedBy.value || undefined"
				:aria-errormessage="field.errorId.value || undefined"
				:data-invalid="field.invalid.value ? '' : undefined"
			:disabled="field.disabled.value || undefined"
			class="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-border bg-background font-medium text-foreground shadow-sm outline-none transition hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring/50 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground data-[invalid]:border-destructive data-[invalid]:ring-destructive/20"
			:class="sizeClass"
			@click="toggle"
			@focus="field.onFocus"
			@blur="field.onBlur"
		>
			<slot :pressed="pressed" :label="displayLabel">{{ displayLabel || 'Toggle' }}</slot>
		</button>
	</ElField>
</template>
