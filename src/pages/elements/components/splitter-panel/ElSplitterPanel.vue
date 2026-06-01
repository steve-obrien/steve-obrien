<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useSlots, watch } from 'vue';

defineOptions({
	__doc: {
		name: 'Splitter panel',
		tag: '<ElSplitterPanel>',
		description: 'A resizable multi-pane shell for editors, inspectors, file browsers, and app-builder workspaces.',
		icon: 'M5 4v16M19 4v16M8 6h8M8 12h8M8 18h8',
		slots: [
			{ name: 'start', description: 'The leading resizable pane.' },
			{ name: 'default', description: 'The flexible central pane.' },
			{ name: 'end', description: 'Optional trailing resizable pane.' },
			{ name: 'start-handle', description: 'Optional content inside the leading resize handle.' },
			{ name: 'end-handle', description: 'Optional content inside the trailing resize handle.' },
		],
		events: [
			{ name: 'update:startSize', payload: '(pixels)', description: 'Emitted when the leading pane is resized.' },
			{ name: 'update:endSize', payload: '(pixels)', description: 'Emitted when the trailing pane is resized.' },
			{ name: 'resize', payload: '({ startSize, endSize })', description: 'Emitted after either splitter handle moves.' },
		],
	},
});

const props = defineProps({
	orientation: {
		type: String,
		default: 'horizontal',
		validator: (value) => ['horizontal', 'vertical'].includes(value),
		_edit: {
			description: 'Resize direction. Horizontal creates columns; vertical creates rows.',
			options: ['horizontal', 'vertical'],
		},
	},
	startSize: {
		type: Number,
		default: 280,
		_edit: { description: 'Initial width or height of the leading pane in pixels.' },
	},
	endSize: {
		type: Number,
		default: 360,
		_edit: { description: 'Initial width or height of the trailing pane in pixels.' },
	},
	minStart: {
		type: Number,
		default: 180,
		_edit: { description: 'Minimum leading pane width or height.' },
	},
	minMain: {
		type: Number,
		default: 320,
		_edit: { description: 'Minimum central pane width or height.' },
	},
	minEnd: {
		type: Number,
		default: 220,
		_edit: { description: 'Minimum trailing pane width or height.' },
	},
	handleSize: {
		type: Number,
		default: 8,
		_edit: { description: 'Splitter handle hit area in pixels.' },
	},
	handleClass: {
		type: [String, Array, Object],
		default: 'transition hover:bg-ring/25 focus-visible:bg-ring/35 data-[dragging=true]:bg-ring/35',
		_edit: { description: 'Classes applied to each resize button. Use this to make handles transparent, bordered, or prominent.' },
	},
	activeHandleClass: {
		type: [String, Array, Object],
		default: '',
		_edit: { description: 'Additional classes applied to the active resize button while dragging.' },
	},
	handleIndicatorClass: {
		type: [String, Array, Object],
		default: '',
		_edit: { description: 'Classes applied to the small visual indicator inside each resize button.' },
	},
});

const emit = defineEmits(['update:startSize', 'update:endSize', 'resize']);
const slots = useSlots();
const root = ref(null);
const startPx = ref(props.startSize);
const endPx = ref(props.endSize);
const dragging = ref(null);
let resizeObserver = null;

const hasEnd = computed(() => Boolean(slots.end));
const isVertical = computed(() => props.orientation === 'vertical');
const resizeCursor = computed(() => isVertical.value ? 'row-resize' : 'col-resize');
const rootClass = computed(() => [
	'grid min-h-0',
	isVertical.value ? 'overflow-y-auto' : 'overflow-x-auto',
]);
const handleBaseClass = computed(() => [
	'group flex outline-none',
	isVertical.value
		? 'min-w-0 cursor-row-resize items-center justify-center'
		: 'min-h-0 cursor-col-resize items-stretch justify-center',
]);
const defaultIndicatorClass = computed(() => [
	'rounded-full bg-muted-foreground/35 opacity-0 transition group-hover:opacity-100 group-data-[dragging=true]:opacity-100 group-data-[dragging=true]:bg-foreground/50',
	isVertical.value ? 'mx-auto h-0.5 w-10' : 'my-auto h-10 w-0.5',
]);
const gridStyle = computed(() => {
	const tracks = hasEnd.value
		? `${startPx.value}px ${props.handleSize}px minmax(${props.minMain}px, 1fr) ${props.handleSize}px ${endPx.value}px`
		: `${startPx.value}px ${props.handleSize}px minmax(${props.minMain}px, 1fr)`;
	const minSize = hasEnd.value
		? `${props.minStart + props.minMain + props.minEnd + props.handleSize * 2}px`
		: `${props.minStart + props.minMain + props.handleSize}px`;

	if (isVertical.value) return {
		gridTemplateRows: tracks,
		minHeight: minSize,
	};

	return {
		gridTemplateColumns: tracks,
		minWidth: minSize,
	};
});

watch(() => props.startSize, (value) => {
	startPx.value = clamp(value, props.minStart, maxStartSize());
	syncSizesToBounds();
});

watch(() => props.endSize, (value) => {
	endPx.value = clamp(value, props.minEnd, maxEndSize());
	syncSizesToBounds();
});

watch(() => props.orientation, () => {
	nextTick(syncSizesToBounds);
});

onMounted(() => {
	nextTick(syncSizesToBounds);

	if (typeof ResizeObserver === 'undefined') return;
	resizeObserver = new ResizeObserver(syncSizesToBounds);
	if (root.value) resizeObserver.observe(root.value);
});

onBeforeUnmount(() => {
	resizeObserver?.disconnect();
	endResize();
});

function beginResize(pane, event) {
	event.preventDefault();
	dragging.value = {
		pane,
		position: pointerPosition(event),
		start: startPx.value,
		end: endPx.value,
	};
	window.addEventListener('pointermove', resizeFromPointer);
	window.addEventListener('pointerup', endResize, { once: true });
	document.body.style.cursor = resizeCursor.value;
	document.body.style.userSelect = 'none';
}

function resizeFromPointer(event) {
	if (!dragging.value) return;
	const delta = pointerPosition(event) - dragging.value.position;

	if (dragging.value.pane === 'start') {
		updateStartSize(clamp(dragging.value.start + delta, props.minStart, maxStartSize()));
	} else {
		updateEndSize(clamp(dragging.value.end - delta, props.minEnd, maxEndSize()));
	}
}

function endResize() {
	window.removeEventListener('pointermove', resizeFromPointer);
	document.body.style.cursor = '';
	document.body.style.userSelect = '';
	dragging.value = null;
}

function updateStartSize(value) {
	startPx.value = value;
	emit('update:startSize', value);
	emit('resize', { startSize: startPx.value, endSize: endPx.value });
}

function updateEndSize(value) {
	endPx.value = value;
	emit('update:endSize', value);
	emit('resize', { startSize: startPx.value, endSize: endPx.value });
}

function syncSizesToBounds() {
	if (!root.value) return;

	const nextStart = clamp(startPx.value, props.minStart, maxStartSize());
	startPx.value = nextStart;

	if (!hasEnd.value) return;
	endPx.value = clamp(endPx.value, props.minEnd, maxEndSize());
}

function maxStartSize() {
	const width = panelWidth();
	const reserved = props.minMain + (hasEnd.value ? endPx.value + props.handleSize * 2 : props.handleSize);
	return Math.max(props.minStart, width - reserved);
}

function maxEndSize() {
	const width = panelWidth();
	const reserved = props.minMain + startPx.value + props.handleSize * 2;
	return Math.max(props.minEnd, width - reserved);
}

function panelWidth() {
	if (isVertical.value) return root.value?.clientHeight || globalThis.innerHeight || 800;
	return root.value?.clientWidth || globalThis.innerWidth || 1200;
}

function pointerPosition(event) {
	return isVertical.value ? event.clientY : event.clientX;
}

function isDragging(pane) {
	return dragging.value?.pane === pane;
}

function handleLabel(pane) {
	if (!isVertical.value) return pane === 'start' ? 'Resize leading panel' : 'Resize trailing panel';
	return pane === 'start' ? 'Resize upper panel' : 'Resize lower panel';
}

function clamp(value, min, max) {
	return Math.min(Math.max(value, min), max);
}
</script>

<template>
	<div ref="root" :class="rootClass" :style="gridStyle">
		<section class="min-h-0 min-w-0 overflow-hidden">
			<slot name="start" />
		</section>

		<button
			type="button"
			:class="[handleBaseClass, handleClass, isDragging('start') && activeHandleClass]"
			:aria-label="handleLabel('start')"
			:aria-orientation="isVertical ? 'horizontal' : 'vertical'"
			:data-dragging="isDragging('start')"
			@pointerdown="beginResize('start', $event)"
		>
			<slot name="start-handle" :active="isDragging('start')" :orientation="orientation">
				<span :class="[defaultIndicatorClass, handleIndicatorClass]"></span>
			</slot>
		</button>

		<section class="min-h-0 min-w-0 overflow-hidden">
			<slot />
		</section>

		<button
			v-if="hasEnd"
			type="button"
			:class="[handleBaseClass, handleClass, isDragging('end') && activeHandleClass]"
			:aria-label="handleLabel('end')"
			:aria-orientation="isVertical ? 'horizontal' : 'vertical'"
			:data-dragging="isDragging('end')"
			@pointerdown="beginResize('end', $event)"
		>
			<slot name="end-handle" :active="isDragging('end')" :orientation="orientation">
				<span :class="[defaultIndicatorClass, handleIndicatorClass]"></span>
			</slot>
		</button>

		<section v-if="hasEnd" class="min-h-0 min-w-0 overflow-hidden">
			<slot name="end" />
		</section>
	</div>
</template>
