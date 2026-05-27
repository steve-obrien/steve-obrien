<script setup>
import FieldChrome from '../field/FieldChrome.vue';
import { fieldProps } from '../field/fieldProps.js';
import { useField } from '../field/useField.js';

defineOptions({
	__doc: {
		name: 'Position input',
		tag: '<ElPositionInput>',
		description: 'A compact visual picker for popover and floating element positions.',
		events: [{ name: 'update:modelValue', payload: 'string', description: 'Fired when the selected position changes.' }],
	},
});

const props = defineProps({
	...fieldProps,
	modelValue: {
		type: String,
		default: 'bottom-start',
		_edit: { group: 'Control props', description: 'Selected position token.' },
	},
});
const emit = defineEmits(['update:modelValue', 'focus', 'blur']);
const field = useField(props, emit, { idPrefix: 'el-position-input' });

const positions = [
	{ value: 'start-bottom', label: 'Start bottom', class: 'left-0 top-2/3 -translate-y-1/2' },
	{ value: 'start', label: 'Start', class: 'left-0 top-1/2 -translate-y-1/2' },
	{ value: 'start-top', label: 'Start top', class: 'left-0 top-1/3 -translate-y-1/2' },
	{ value: 'top-start', label: 'Top start', class: 'left-1/3 top-0 -translate-x-1/2' },
	{ value: 'top', label: 'Top', class: 'left-1/2 top-0 -translate-x-1/2' },
	{ value: 'top-end', label: 'Top end', class: 'left-2/3 top-0 -translate-x-1/2' },
	{ value: 'end-top', label: 'End top', class: 'right-0 top-1/3 -translate-y-1/2' },
	{ value: 'end', label: 'End', class: 'right-0 top-1/2 -translate-y-1/2' },
	{ value: 'end-bottom', label: 'End bottom', class: 'right-0 top-2/3 -translate-y-1/2' },
	{ value: 'bottom-end', label: 'Bottom end', class: 'left-2/3 bottom-0 -translate-x-1/2' },
	{ value: 'bottom', label: 'Bottom', class: 'left-1/2 bottom-0 -translate-x-1/2' },
	{ value: 'bottom-start', label: 'Bottom start', class: 'left-1/3 bottom-0 -translate-x-1/2' },
];
</script>

<template>
	<FieldChrome :field-attrs="field.fieldAttrs.value" :chrome="chrome">
		<input
			v-if="field.htmlName.value"
			type="hidden"
			:name="field.htmlName.value"
			:value="field.value.value"
		/>
		<div class="relative h-28 rounded-xl border border-border bg-secondary/30 p-3">
			<div class="absolute left-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-background shadow-sm"></div>
			<button
				v-for="position in positions"
				:key="position.value"
				type="button"
				class="absolute grid size-5 place-items-center rounded-full border text-[0px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
				:class="[
					position.class,
					field.value.value === position.value
						? 'border-primary bg-primary text-primary-foreground shadow-sm'
						: 'border-border bg-background text-muted-foreground hover:border-ring hover:bg-accent',
				]"
				:title="position.label"
				:aria-label="position.label"
				:aria-pressed="field.value.value === position.value"
				:disabled="field.disabled.value || undefined"
				@click="field.onInput(position.value)"
				@focus="field.onFocus"
				@blur="field.onBlur"
			>
				<span class="size-1.5 rounded-full bg-current"></span>
			</button>
		</div>
		<p class="font-mono text-xs text-muted-foreground">{{ field.value.value }}</p>
	</FieldChrome>
</template>
