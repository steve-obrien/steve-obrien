<script setup>
import { computed, ref, watch } from 'vue';
import ElField from './ElField.vue';

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
	},
});

const props = defineProps({
	modelValue: {
		type: String,
		default: '',
		_edit: { description: 'Selected date as YYYY-MM-DD.' },
	},
	label: {
		type: String,
		default: '',
		_edit: { description: 'Visible field label.' },
	},
	description: {
		type: String,
		default: '',
		_edit: { description: 'Optional helper copy below the calendar.' },
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
	disabled: {
		type: Boolean,
		default: false,
		_edit: { description: 'Disable date selection.' },
	},
});

const emit = defineEmits(['update:modelValue', 'change', 'view-change']);

const today = new Date();
const initialDate = parseDate(props.modelValue);
const viewYear = ref(initialDate?.getFullYear() || props.initialYear || today.getFullYear());
const viewMonth = ref(initialDate?.getMonth() ?? clampMonth(props.initialMonth) ?? today.getMonth());

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
			selected: value === props.modelValue,
			today: value === formatDate(today),
			disabled: props.disabled || outsideRange(value),
			hidden: !currentMonth && !props.showAdjacentDays,
		};
	});
});

watch(() => props.modelValue, (value) => {
	const date = parseDate(value);
	if (!date) return;
	viewYear.value = date.getFullYear();
	viewMonth.value = date.getMonth();
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

function outsideRange(value) {
	if (props.min && value < props.min) return true;
	if (props.max && value > props.max) return true;
	return false;
}

function moveMonth(delta) {
	const next = new Date(viewYear.value, viewMonth.value + delta, 1);
	viewYear.value = next.getFullYear();
	viewMonth.value = next.getMonth();
	emit('view-change', { month: viewMonth.value + 1, year: viewYear.value });
}

function moveYear(delta) {
	viewYear.value += delta;
	emit('view-change', { month: viewMonth.value + 1, year: viewYear.value });
}

function selectDate(cell) {
	if (cell.disabled || cell.hidden) return;
	emit('update:modelValue', cell.value);
	emit('change', cell.value);
	if (!cell.currentMonth) {
		viewYear.value = cell.date.getFullYear();
		viewMonth.value = cell.date.getMonth();
		emit('view-change', { month: viewMonth.value + 1, year: viewYear.value });
	}
}
</script>

<template>
	<ElField :label="label" :description="description">
		<div class="w-full rounded-2xl border border-border bg-card p-3 text-card-foreground shadow-sm">
			<div class="flex items-center justify-between gap-2">
				<div class="flex items-center gap-1">
					<button
						type="button"
						class="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-40"
						:disabled="disabled"
						aria-label="Previous year"
						@click="moveYear(-1)"
					>
						<svg viewBox="0 0 24 24" class="size-4" fill="none" aria-hidden="true">
							<path d="m11 7-5 5 5 5M18 7l-5 5 5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					</button>
					<button
						type="button"
						class="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-40"
						:disabled="disabled"
						aria-label="Previous month"
						@click="moveMonth(-1)"
					>
						<svg viewBox="0 0 24 24" class="size-4" fill="none" aria-hidden="true">
							<path d="m15 18-6-6 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					</button>
				</div>

				<p class="min-w-0 truncate text-sm font-semibold tracking-tight text-foreground">{{ monthLabel }}</p>

				<div class="flex items-center gap-1">
					<button
						type="button"
						class="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-40"
						:disabled="disabled"
						aria-label="Next month"
						@click="moveMonth(1)"
					>
						<svg viewBox="0 0 24 24" class="size-4" fill="none" aria-hidden="true">
							<path d="m9 18 6-6-6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					</button>
					<button
						type="button"
						class="grid size-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-40"
						:disabled="disabled"
						aria-label="Next year"
						@click="moveYear(1)"
					>
						<svg viewBox="0 0 24 24" class="size-4" fill="none" aria-hidden="true">
							<path d="m6 17 5-5-5-5M13 17l5-5-5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					</button>
				</div>
			</div>

			<div class="mt-3 grid grid-cols-7 gap-1 text-center">
				<span
					v-for="day in weekdayLabels"
					:key="day"
					class="py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
				>{{ day }}</span>

				<button
					v-for="cell in cells"
					:key="cell.value"
					type="button"
					class="relative grid aspect-square min-h-9 place-items-center rounded-lg text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-35"
					:class="[
						cell.hidden && 'invisible',
						!cell.hidden && !cell.currentMonth && 'text-muted-foreground/60 hover:bg-secondary/60',
						cell.currentMonth && !cell.selected && 'text-foreground hover:bg-secondary',
						cell.today && !cell.selected && 'ring-1 ring-border',
						cell.selected && 'bg-primary text-primary-foreground shadow-sm hover:bg-primary',
					]"
					:disabled="cell.disabled || cell.hidden"
					:aria-label="cell.value"
					:aria-pressed="cell.selected"
					@click="selectDate(cell)"
				>
					{{ cell.day }}
				</button>
			</div>
		</div>
	</ElField>
</template>
