<script setup>
import { computed, nextTick, ref, useId, watch } from 'vue';
import ElPopover, { popoverProps } from '../../components/popover/ElPopover.vue';
import ElCalendar, { calendarProps } from '../calendar/ElCalendar.vue';
import ElField from '../field/ElField.vue';
import { fieldProps } from '../field/fieldProps.js';
import { useField } from '../field/useField.js';

defineOptions({
	__doc: {
		name: 'Date picker',
		tag: '<ElDatePicker>',
		description: 'A text date input with a popover calendar picker. Stores YYYY-MM-DD while letting people type dd/mm/yyyy or mm/dd/yyyy.',
		icon: 'M7 4v3M17 4v3M5 8h14M6 6h12v13H6V6Zm3 6h2M13 12h2M9 16h2M13 16h2',
		events: [
			{ name: 'update:modelValue', payload: 'YYYY-MM-DD', description: 'Fired when a valid date is typed or selected.' },
			{ name: 'change', payload: 'YYYY-MM-DD', description: 'Fired when a valid date is committed.' },
			{ name: 'invalid-date', payload: 'string', description: 'Fired when typed text cannot be parsed or is outside the allowed range.' },
			{ name: 'focus', payload: 'FocusEvent', description: 'Fired when the text input receives focus.' },
			{ name: 'blur', payload: 'FocusEvent', description: 'Fired when the text input loses focus.' },
		],
		keyboard: [
			{ keys: 'Alt + ArrowDown', action: 'Open the calendar popover.' },
			{ keys: 'Enter', action: 'Commit the typed date when it is valid.' },
			{ keys: 'Esc', action: 'Close the popover.' },
			{ keys: 'Arrow keys in calendar', action: 'Move focus by day or week once the calendar is open.' },
		],
	},
});

const props = defineProps({
	...fieldProps,
	modelValue: {
		type: String,
		default: '',
		_edit: { group: 'Control props', description: 'Selected date as YYYY-MM-DD.' },
	},
	dateFormat: {
		type: String,
		default: 'dd/mm/yyyy',
		_edit: { options: ['dd/mm/yyyy', 'mm/dd/yyyy'], description: 'How typed dates are parsed and displayed.' },
	},
	popoverProps: {
		type: Object,
		default: () => ({}),
		_edit: {
			component: 'ElPropDefinitionInput',
			description: 'Props passed to the inner ElPopover. Date picker defaults position to bottom-end, width to w-[20rem], padding to p-0, and arrow to true.',
			props: {
				definitions: popoverProps,
				include: ['position', 'offset', 'collisionPadding', 'floatingMode', 'flip', 'lockScroll', 'arrow', 'width', 'padding'],
				compact: true,
			},
		},
	},
	calendarProps: {
		type: Object,
		default: () => ({}),
		_edit: {
			component: 'ElPropDefinitionInput',
			description: 'Props passed to the inner ElCalendar, such as locale, weekStartsOn, min, max, fixedWeeks, and showAdjacentDays.',
			props: {
				definitions: calendarProps,
				include: ['locale', 'weekStartsOn', 'initialMonth', 'initialYear', 'min', 'max', 'showAdjacentDays', 'fixedWeeks', 'disabled'],
				compact: true,
			},
		},
	},
});

const emit = defineEmits(['update:modelValue', 'change', 'invalid-date', 'focus', 'blur']);
const field = useField(props, emit, { idPrefix: 'el-date-picker' });
const popover = ref(null);
const calendar = ref(null);
const displayValue = ref(formatDisplay(field.value.value));
const parseError = ref('');
const uniqueId = useId();
const triggerId = computed(() => `${field.id.value || uniqueId}-calendar-button`);
const placeholderText = computed(() => props.placeholder || props.dateFormat);
const resolvedCalendarProps = computed(() => ({
	...defaultPropsFrom(calendarProps),
	...props.calendarProps,
	modelValue: field.value.value,
	disabled: field.disabled.value || props.calendarProps.disabled,
	chrome: 'none',
	registerField: false,
	nativeInput: false,
}));
const resolvedPopoverProps = computed(() => ({
	...defaultPropsFrom(popoverProps),
	position: 'bottom-end',
	width: 'w-[20rem]',
	padding: 'p-0',
	arrow: true,
	...props.popoverProps,
	triggerId: triggerId.value,
}));
const combinedErrors = computed(() => [
	...field.errors.value,
	...(parseError.value ? [parseError.value] : []),
]);
const invalid = computed(() => Boolean(field.invalid.value || parseError.value));
const fieldAttrs = computed(() => ({
	...field.fieldAttrs.value,
	invalid: invalid.value,
	errors: combinedErrors.value,
}));
const inputAttrs = computed(() => ({
	...field.inputAttrs.value,
	value: displayValue.value,
	placeholder: placeholderText.value,
	'aria-invalid': invalid.value || undefined,
	'data-invalid': invalid.value ? '' : undefined,
}));

watch(field.value, (value) => {
	displayValue.value = formatDisplay(value);
	if (isIsoDate(value)) clearParseError();
});

function defaultPropsFrom(definitions) {
	return Object.fromEntries(Object.entries(definitions).map(([key, definition]) => [key, defaultPropValue(definition)]));
}

function defaultPropValue(definition) {
	if (!definition || !Object.prototype.hasOwnProperty.call(definition, 'default')) {
		return definition?.type === Boolean ? false : undefined;
	}
	if (typeof definition.default === 'function' && definition.type !== Function) return definition.default();
	return definition.default;
}

function pad(value) {
	return String(value).padStart(2, '0');
}

function isIsoDate(value) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
	const [year, month, day] = value.split('-').map(Number);
	const date = new Date(year, month - 1, day);
	return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function isoToParts(value) {
	if (!isIsoDate(value)) return null;
	const [year, month, day] = value.split('-').map(Number);
	return { year, month, day };
}

function partsToIso({ year, month, day }) {
	return `${year}-${pad(month)}-${pad(day)}`;
}

function formatDisplay(value) {
	const parts = isoToParts(value);
	if (!parts) return '';
	if (props.dateFormat === 'mm/dd/yyyy') return `${pad(parts.month)}/${pad(parts.day)}/${parts.year}`;
	return `${pad(parts.day)}/${pad(parts.month)}/${parts.year}`;
}

function parseDisplay(value) {
	const trimmed = String(value || '').trim();
	if (!trimmed) return { iso: '', error: '' };
	const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
	if (!match) return { iso: '', error: `Use ${props.dateFormat}.` };
	const first = Number(match[1]);
	const second = Number(match[2]);
	const year = Number(match[3]);
	const month = props.dateFormat === 'mm/dd/yyyy' ? first : second;
	const day = props.dateFormat === 'mm/dd/yyyy' ? second : first;
	const iso = partsToIso({ year, month, day });
	if (!isIsoDate(iso)) return { iso: '', error: 'Enter a real calendar date.' };
	if (resolvedCalendarProps.value.min && iso < resolvedCalendarProps.value.min) return { iso: '', error: `Date must be on or after ${formatDisplay(resolvedCalendarProps.value.min)}.` };
	if (resolvedCalendarProps.value.max && iso > resolvedCalendarProps.value.max) return { iso: '', error: `Date must be on or before ${formatDisplay(resolvedCalendarProps.value.max)}.` };
	return { iso, error: '' };
}

function clearParseError() {
	parseError.value = '';
	field.setFieldState({ errors: [], invalid: false });
}

function setParseError(message) {
	parseError.value = message;
	field.setFieldState({ errors: message ? [message] : [], invalid: Boolean(message) });
	if (message) emit('invalid-date', message);
}

function commitDate(iso) {
	clearParseError();
	field.setValue(iso);
	displayValue.value = formatDisplay(iso);
	emit('change', iso);
}

function commitTypedValue() {
	const parsed = parseDisplay(displayValue.value);
	if (parsed.error) {
		setParseError(parsed.error);
		return false;
	}
	commitDate(parsed.iso);
	return true;
}

function onInput(event) {
	displayValue.value = event.target.value;
	if (!displayValue.value.trim()) {
		commitDate('');
		return;
	}
	const parsed = parseDisplay(displayValue.value);
	if (!parsed.error) commitDate(parsed.iso);
	else parseError.value = '';
}

async function onBlur(event) {
	let errorMessage = '';
	if (displayValue.value.trim()) {
		const parsed = parseDisplay(displayValue.value);
		if (parsed.error) {
			errorMessage = parsed.error;
			parseError.value = parsed.error;
		} else {
			commitDate(parsed.iso);
		}
	} else {
		clearParseError();
	}
	await field.onBlur(event);
	if (errorMessage) setParseError(errorMessage);
}

function onKeydown(event) {
	if (event.key === 'Enter') {
		event.preventDefault();
		commitTypedValue();
	} else if (event.key === 'ArrowDown' && event.altKey) {
		event.preventDefault();
		popover.value?.open();
	} else if (event.key === 'Escape') {
		popover.value?.close();
	}
}

function selectCalendarDate(value) {
	commitDate(value);
	popover.value?.close();
}

async function focusCalendar() {
	await nextTick();
	await calendar.value?.focusSelectedDate?.();
}
</script>

<template>
	<ElField v-bind="fieldAttrs" :chrome="chrome">
		<div class="relative w-full">
			<input
				v-bind="inputAttrs"
				type="text"
				inputmode="numeric"
				autocomplete="off"
				class="el-input pr-11"
				@input="onInput"
				@focus="field.onFocus"
				@blur="onBlur"
				@keydown="onKeydown"
			/>
			<button
				:id="triggerId"
				type="button"
				class="absolute inset-y-1 right-1 grid size-8 cursor-pointer place-items-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50"
				:disabled="field.disabled.value || field.readOnly.value"
				:aria-label="`Choose date for ${props.label || field.name.value}`"
				@click.stop
				@focus="field.onFocus"
				@blur="field.onBlur"
			>
				<svg viewBox="0 0 24 24" class="size-4" fill="none" aria-hidden="true">
					<path d="M7 4v3M17 4v3M5 8h14M6 6h12v13H6V6Z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
			</button>
		</div>

		<ElPopover
			ref="popover"
			v-bind="resolvedPopoverProps"
			@open="focusCalendar"
		>
			<ElCalendar
				ref="calendar"
				v-bind="resolvedCalendarProps"
				@change="selectCalendarDate"
			/>
		</ElPopover>
	</ElField>
</template>
