<script>
import { fieldProps } from '../field/fieldProps.js';

export const calendarProps = {
	...fieldProps,
	modelValue: {
		type: String,
		default: '',
		_edit: { group: 'Control props', description: 'Selected date as YYYY-MM-DD.' },
	},
	locale: {
		type: String,
		default: 'en-GB',
		_edit: { description: 'Locale used for month and weekday labels.' },
	},
	weekStartsOn: {
		type: Number,
		default: 1,
		_edit: { options: [0, 1, 2, 3, 4, 5, 6], description: 'First day of week. 0 is Sunday, 1 is Monday.' },
	},
	initialMonth: {
		type: Number,
		default: null,
		_edit: { description: 'Initial visible month, 1-12. Ignored when modelValue has a valid date.' },
	},
	initialYear: {
		type: Number,
		default: null,
		_edit: { description: 'Initial visible year. Ignored when modelValue has a valid date.' },
	},
	min: {
		type: String,
		default: '',
		_edit: { description: 'Minimum selectable date as YYYY-MM-DD.' },
	},
	max: {
		type: String,
		default: '',
		_edit: { description: 'Maximum selectable date as YYYY-MM-DD.' },
	},
	showAdjacentDays: {
		type: Boolean,
		default: true,
		_edit: { description: 'Show dates from the previous and next months in the grid.' },
	},
	fixedWeeks: {
		type: Boolean,
		default: true,
		_edit: { description: 'Always render six weeks so the calendar height stays stable.' },
	},
	registerField: {
		type: Boolean,
		default: true,
		_edit: { description: 'Register with a parent form. Disable when embedding the calendar inside another form control.' },
	},
	nativeInput: {
		type: Boolean,
		default: true,
		_edit: { description: 'Render the hidden native input used for HTML form submission.' },
	},
	disabled: {
		type: Boolean,
		default: false,
		_edit: { description: 'Disable date selection.' },
	},
};
</script>

<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import FieldChrome from '../field/FieldChrome.vue';
import { useField } from '../field/useField.js';

defineOptions({
	__doc: {
		name: 'Calendar',
		tag: '<ElCalendar>',
		description: 'A compact month calendar for choosing a date, with month and year navigation.',
		events: [
			{ name: 'update:modelValue', payload: 'YYYY-MM-DD', description: 'Fired when a date is selected.' },
			{ name: 'change', payload: 'YYYY-MM-DD', description: 'Fired when a date is selected.' },
			{ name: 'view-change', payload: '({ month, year })', description: 'Fired when the visible month or year changes.' },
		],
		keyboard: [
			{ keys: 'ArrowLeft / ArrowRight', action: 'Move focus one day backward or forward.' },
			{ keys: 'ArrowUp / ArrowDown', action: 'Move focus one week backward or forward.' },
			{ keys: 'Home / End', action: 'Move focus to the first or last day of the current week.' },
			{ keys: 'PageUp / PageDown', action: 'Move focus to the same day in the previous or next month.' },
			{ keys: 'Shift + PageUp / PageDown', action: 'Move focus to the same day in the previous or next year.' },
			{ keys: 'Enter / Space', action: 'Select the focused date.' },
		],
	},
});

const props = defineProps(calendarProps);

const emit = defineEmits(['update:modelValue', 'change', 'view-change', 'focus', 'blur']);
const field = useField(props, emit, { idPrefix: 'el-calendar', register: props.registerField });

const today = new Date();
const initialDate = parseDate(field.value.value);
const viewYear = ref(initialDate?.getFullYear() || props.initialYear || today.getFullYear());
const viewMonth = ref(initialDate?.getMonth() ?? clampMonth(props.initialMonth) ?? today.getMonth());
const activeDateValue = ref(formatDate(initialDate || today));
const dayRefs = new Map();

const monthLabel = computed(() => new Intl.DateTimeFormat(props.locale, {
	month: 'long',
	year: 'numeric',
}).format(new Date(viewYear.value, viewMonth.value, 1)));

const weekdayLabels = computed(() => {
	const formatter = new Intl.DateTimeFormat(props.locale, { weekday: 'short' });
	const sunday = new Date(2026, 0, 4);
	return Array.from({ length: 7 }, (_, index) => {
		const dayOffset = (index + props.weekStartsOn) % 7;
		return formatter.format(new Date(2026, 0, sunday.getDate() + dayOffset));
	});
});
const dateLabelFormatter = computed(() => new Intl.DateTimeFormat(props.locale, {
	weekday: 'long',
	day: 'numeric',
	month: 'long',
	year: 'numeric',
}));

const cells = computed(() => {
	const first = new Date(viewYear.value, viewMonth.value, 1);
	const offset = (first.getDay() - props.weekStartsOn + 7) % 7;
	const daysInMonth = new Date(viewYear.value, viewMonth.value + 1, 0).getDate();
	const total = props.fixedWeeks ? 42 : Math.ceil((offset + daysInMonth) / 7) * 7;

	return Array.from({ length: total }, (_, index) => {
		const date = new Date(viewYear.value, viewMonth.value, index - offset + 1);
		const value = formatDate(date);
		const currentMonth = date.getMonth() === viewMonth.value;
		return {
			date,
			value,
			day: date.getDate(),
			currentMonth,
			selected: value === field.value.value,
			today: value === formatDate(today),
			disabled: field.disabled.value || field.readOnly.value || outsideRange(value),
			hidden: !currentMonth && !props.showAdjacentDays,
		};
	});
});
const tabbableDateValue = computed(() => {
	const activeCell = cells.value.find((cell) => cell.value === activeDateValue.value && !cell.disabled && !cell.hidden);
	return activeCell?.value || visibleSelectableValue();
});

watch(field.value, (value) => {
	const date = parseDate(value);
	if (!date) return;
	viewYear.value = date.getFullYear();
	viewMonth.value = date.getMonth();
	activeDateValue.value = value;
});

function clampMonth(month) {
	if (month == null) return null;
	const value = Number(month);
	if (!Number.isFinite(value)) return null;
	return Math.min(11, Math.max(0, value - 1));
}

function parseDate(value) {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
	const [year, month, day] = value.split('-').map(Number);
	const date = new Date(year, month - 1, day);
	if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
	return date;
}

function pad(value) {
	return String(value).padStart(2, '0');
}

function formatDate(date) {
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function dateLabel(cell) {
	return dateLabelFormatter.value.format(cell.date);
}

function outsideRange(value) {
	if (props.min && value < props.min) return true;
	if (props.max && value > props.max) return true;
	return false;
}

function emitViewChange() {
	emit('view-change', { month: viewMonth.value + 1, year: viewYear.value });
}

function moveMonth(delta) {
	const next = new Date(viewYear.value, viewMonth.value + delta, 1);
	viewYear.value = next.getFullYear();
	viewMonth.value = next.getMonth();
	emitViewChange();
}

function moveYear(delta) {
	viewYear.value += delta;
	emitViewChange();
}

function selectDate(cell) {
	if (cell.disabled || cell.hidden) return;
	activeDateValue.value = cell.value;
	field.onInput(cell.value);
	emit('change', cell.value);
	if (!cell.currentMonth) {
		viewYear.value = cell.date.getFullYear();
		viewMonth.value = cell.date.getMonth();
		emitViewChange();
	}
}

function setDayRef(value, element) {
	if (element) dayRefs.set(value, element);
	else dayRefs.delete(value);
}

function visibleSelectableValue() {
	return cells.value.find((cell) => !cell.hidden && !cell.disabled)?.value || '';
}

async function focusDate(value, updateView = true) {
	const date = parseDate(value);
	if (!date || outsideRange(value)) return false;
	activeDateValue.value = value;
	if (updateView && (date.getFullYear() !== viewYear.value || date.getMonth() !== viewMonth.value)) {
		viewYear.value = date.getFullYear();
		viewMonth.value = date.getMonth();
		emitViewChange();
	}
	await nextTick();
	const button = dayRefs.get(value);
	if (!button || button.disabled) return false;
	button.focus();
	return true;
}

function dateByOffset(value, { days = 0, months = 0, years = 0 } = {}) {
	const date = parseDate(value);
	if (!date) return null;
	return new Date(date.getFullYear() + years, date.getMonth() + months, date.getDate() + days);
}

function weekBoundary(value, end = false) {
	const date = parseDate(value);
	if (!date) return null;
	const dayOffset = (date.getDay() - props.weekStartsOn + 7) % 7;
	return new Date(date.getFullYear(), date.getMonth(), date.getDate() + (end ? 6 - dayOffset : -dayOffset));
}

async function onCellKeydown(event, cell) {
	let target = null;
	if (event.key === 'Enter' || event.key === ' ') {
		event.preventDefault();
		selectDate(cell);
		return;
	}
	if (event.key === 'ArrowLeft') target = dateByOffset(cell.value, { days: -1 });
	else if (event.key === 'ArrowRight') target = dateByOffset(cell.value, { days: 1 });
	else if (event.key === 'ArrowUp') target = dateByOffset(cell.value, { days: -7 });
	else if (event.key === 'ArrowDown') target = dateByOffset(cell.value, { days: 7 });
	else if (event.key === 'Home') target = weekBoundary(cell.value);
	else if (event.key === 'End') target = weekBoundary(cell.value, true);
	else if (event.key === 'PageUp') target = dateByOffset(cell.value, event.shiftKey ? { years: -1 } : { months: -1 });
	else if (event.key === 'PageDown') target = dateByOffset(cell.value, event.shiftKey ? { years: 1 } : { months: 1 });
	if (!target) return;
	event.preventDefault();
	await focusDate(formatDate(target));
}

async function focusSelectedDate() {
	const selected = parseDate(field.value.value) && !outsideRange(field.value.value)
		? field.value.value
		: visibleSelectableValue();
	if (selected) await focusDate(selected);
}

defineExpose({
	focusDate,
	focusSelectedDate,
});
</script>

<template>
	<FieldChrome :field-attrs="field.fieldAttrs.value" :chrome="chrome">
		<input
			v-if="nativeInput && field.htmlName.value"
			type="hidden"
			:name="field.htmlName.value"
			:value="field.value.value"
		/>
		<div
			:id="field.id.value"
			role="group"
			class="w-full rounded-2xl border border-border bg-card p-3 text-card-foreground shadow-sm data-[invalid]:border-destructive"
			:aria-label="label || undefined"
			:aria-describedby="field.describedBy.value || undefined"
			:aria-invalid="field.invalid.value || undefined"
			:aria-errormessage="field.errorId.value || undefined"
			:data-invalid="field.invalid.value ? '' : undefined"
		>
			<div class="flex items-center justify-between gap-2">
				<div class="flex items-center gap-1">
					<button
						type="button"
						class="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-40"
						:disabled="field.disabled.value"
						aria-label="Previous year"
						@click="moveYear(-1)"
						@focus="field.onFocus"
						@blur="field.onBlur"
					>
						<svg viewBox="0 0 24 24" class="size-4" fill="none" aria-hidden="true">
							<path d="m11 7-5 5 5 5M18 7l-5 5 5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					</button>
					<button
						type="button"
						class="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-40"
						:disabled="field.disabled.value"
						aria-label="Previous month"
						@click="moveMonth(-1)"
						@focus="field.onFocus"
						@blur="field.onBlur"
					>
						<svg viewBox="0 0 24 24" class="size-4" fill="none" aria-hidden="true">
							<path d="m15 18-6-6 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					</button>
				</div>

				<p :id="`${field.id.value}-month`" class="min-w-0 truncate text-sm font-semibold tracking-tight text-foreground">{{ monthLabel }}</p>

				<div class="flex items-center gap-1">
					<button
						type="button"
						class="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-40"
						:disabled="field.disabled.value"
						aria-label="Next month"
						@click="moveMonth(1)"
						@focus="field.onFocus"
						@blur="field.onBlur"
					>
						<svg viewBox="0 0 24 24" class="size-4" fill="none" aria-hidden="true">
							<path d="m9 18 6-6-6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					</button>
					<button
						type="button"
						class="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-40"
						:disabled="field.disabled.value"
						aria-label="Next year"
						@click="moveYear(1)"
						@focus="field.onFocus"
						@blur="field.onBlur"
					>
						<svg viewBox="0 0 24 24" class="size-4" fill="none" aria-hidden="true">
							<path d="m6 17 5-5-5-5M13 17l5-5-5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					</button>
				</div>
			</div>

			<div
				role="grid"
				:aria-labelledby="`${field.id.value}-month`"
				class="mt-3 grid grid-cols-7 gap-1 text-center"
			>
				<span
					v-for="day in weekdayLabels"
					:key="day"
					role="columnheader"
					class="py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
				>{{ day }}</span>

				<button
					v-for="cell in cells"
					:key="cell.value"
					:ref="(element) => setDayRef(cell.value, element)"
					type="button"
					role="gridcell"
					class="relative grid aspect-square min-h-9 place-items-center rounded-lg text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-35"
					:class="[
						cell.hidden && 'invisible',
						!cell.hidden && !cell.currentMonth && 'text-muted-foreground/60 hover:bg-secondary/60',
						cell.currentMonth && !cell.selected && 'text-foreground hover:bg-secondary',
						cell.today && !cell.selected && 'ring-1 ring-border',
						cell.selected && 'bg-primary text-primary-foreground shadow-sm hover:bg-primary',
					]"
					:disabled="cell.disabled || cell.hidden"
					:tabindex="cell.value === tabbableDateValue ? 0 : -1"
					:aria-label="dateLabel(cell)"
					:aria-selected="cell.selected"
					:aria-current="cell.today ? 'date' : undefined"
					@click="selectDate(cell)"
					@focus="field.onFocus"
					@blur="field.onBlur"
					@keydown="onCellKeydown($event, cell)"
				>
					{{ cell.day }}
				</button>
			</div>
		</div>
	</FieldChrome>
</template>
