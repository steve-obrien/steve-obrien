<script setup>
import { computed } from 'vue';
import ElField from '../field/ElField.vue';
import { fieldProps } from '../field/fieldProps.js';
import { useField } from '../field/useField.js';

defineOptions({
	__doc: {
		name: 'Range input',
		tag: '<ElRangeInput>',
		description: 'A compact slider input for numeric values.',
		icon: 'M5 12h14M8 12a2 2 0 1 0 0.01 0M16 12a2 2 0 1 0 0.01 0',
		slots: [],
	},
});

const props = defineProps({
	...fieldProps,
	modelValue: {
		type: [Number, String],
		default: 0,
		_edit: { description: 'Current numeric value.' },
	},
	min: {
		type: Number,
		default: 0,
		_edit: { description: 'Minimum slider value.' },
	},
	max: {
		type: Number,
		default: 100,
		_edit: { description: 'Maximum slider value.' },
	},
	step: {
		type: Number,
		default: 1,
		_edit: { description: 'Slider increment.' },
	},
	suffix: {
		type: String,
		default: '',
		_edit: { description: 'Optional unit shown beside the value.' },
	},
	showValue: {
		type: Boolean,
		default: true,
		_edit: { description: 'Show the current value beside the slider.' },
	},
});
const emit = defineEmits(['update:modelValue']);
const field = useField(props, emit, { idPrefix: 'el-range-input' });

const displayValue = computed(() => {
	const value = field.value.value === '' ? props.min : Number(field.value.value);
	return Number.isFinite(value) ? value : props.min;
});

const progress = computed(() => {
	const min = Number(props.min);
	const max = Number(props.max);
	const value = displayValue.value;
	const range = max - min;

	if (!Number.isFinite(min) || !Number.isFinite(max) || range <= 0) return 0;

	return Math.min(100, Math.max(0, ((value - min) / range) * 100));
});

function toNumber(value) {
	const number = Number(value);
	return Number.isNaN(number) ? value : number;
}
</script>

<template>
	<ElField v-bind="field.fieldAttrs.value" :chrome="chrome">
		<div class="flex w-full items-center gap-3">
			<input
				v-bind="field.inputAttrs.value"
				type="range"
				:min="min"
				:max="max"
				:step="step"
				:value="displayValue"
				:style="{ '--el-range-progress': `${progress}%` }"
				class="el-range-input__control h-2 w-full cursor-pointer appearance-none rounded-full accent-primary outline-none transition focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-primary [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-sm"
				@input="field.onInput(toNumber($event.target.value))"
				@focus="field.onFocus"
				@blur="field.onBlur"
			/>
			<output v-if="showValue" class="min-w-10 text-right font-mono text-xs text-muted-foreground">
				{{ displayValue }}{{ suffix }}
			</output>
		</div>
	</ElField>
</template>

<style scoped>
.el-range-input__control {
	background: linear-gradient(
		to right,
		var(--primary) 0%,
		var(--primary) var(--el-range-progress),
		var(--secondary) var(--el-range-progress),
		var(--secondary) 100%
	);
}

.el-range-input__control::-moz-range-track {
	height: 0.5rem;
	border-radius: 9999px;
	background: var(--secondary);
}

.el-range-input__control::-moz-range-progress {
	height: 0.5rem;
	border-radius: 9999px;
	background: var(--primary);
}
</style>
