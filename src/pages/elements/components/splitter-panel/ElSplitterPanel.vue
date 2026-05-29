<script setup>
import { computed, ref, useSlots, watch } from 'vue';

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
		],
		events: [
			{ name: 'update:startSize', payload: '(pixels)', description: 'Emitted when the leading pane is resized.' },
			{ name: 'update:endSize', payload: '(pixels)', description: 'Emitted when the trailing pane is resized.' },
			{ name: 'resize', payload: '({ startSize, endSize })', description: 'Emitted after either splitter handle moves.' },
		],
	},
});

const props = defineProps({
	startSize: {
		type: Number,
		default: 280,
		_edit: { description: 'Initial width of the leading pane in pixels.' },
	},
	endSize: {
		type: Number,
		default: 360,
		_edit: { description: 'Initial width of the trailing pane in pixels.' },
	},
	minStart: {
		type: Number,
		default: 180,
		_edit: { description: 'Minimum leading pane width.' },
	},
	minMain: {
		type: Number,
		default: 320,
		_edit: { description: 'Minimum central pane width.' },
	},
	minEnd: {
		type: Number,
		default: 220,
		_edit: { description: 'Minimum trailing pane width.' },
	},
	handleSize: {
		type: Number,
		default: 8,
		_edit: { description: 'Splitter handle hit area in pixels.' },
	},
});

const emit = defineEmits(['update:startSize', 'update:endSize', 'resize']);
const slots = useSlots();
const root = ref(null);
const startPx = ref(props.startSize);
const endPx = ref(props.endSize);
const dragging = ref(null);

const hasEnd = computed(() => Boolean(slots.end));
const gridStyle = computed(() => {
	const tracks = hasEnd.value
		? `${startPx.value}px ${props.handleSize}px minmax(${props.minMain}px, 1fr) ${props.handleSize}px ${endPx.value}px`
		: `${startPx.value}px ${props.handleSize}px minmax(${props.minMain}px, 1fr)`;

	return {
		gridTemplateColumns: tracks,
		minWidth: hasEnd.value
			? `${props.minStart + props.minMain + props.minEnd + props.handleSize * 2}px`
			: `${props.minStart + props.minMain + props.handleSize}px`,
	};
});

watch(() => props.startSize, (value) => {
	startPx.value = clamp(value, props.minStart, maxStartSize());
});

watch(() => props.endSize, (value) => {
	endPx.value = clamp(value, props.minEnd, maxEndSize());
});

function beginResize(pane, event) {
	event.preventDefault();
	dragging.value = {
		pane,
		x: event.clientX,
		start: startPx.value,
		end: endPx.value,
	};
	window.addEventListener('pointermove', resizeFromPointer);
	window.addEventListener('pointerup', endResize, { once: true });
	document.body.style.cursor = 'col-resize';
	document.body.style.userSelect = 'none';
}

function resizeFromPointer(event) {
	if (!dragging.value) return;
	const delta = event.clientX - dragging.value.x;

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

function maxStartSize() {
	const width = root.value?.clientWidth || window.innerWidth || 1200;
	const reserved = props.minMain + (hasEnd.value ? endPx.value + props.handleSize * 2 : props.handleSize);
	return Math.max(props.minStart, width - reserved);
}

function maxEndSize() {
	const width = root.value?.clientWidth || window.innerWidth || 1200;
	const reserved = props.minMain + startPx.value + props.handleSize * 2;
	return Math.max(props.minEnd, width - reserved);
}

function clamp(value, min, max) {
	return Math.min(Math.max(value, min), max);
}
</script>

<template>
	<div ref="root" class="grid min-h-0 overflow-x-auto" :style="gridStyle">
		<section class="min-w-0 overflow-hidden">
			<slot name="start" />
		</section>

		<button
			type="button"
			class="group flex min-h-0 cursor-col-resize items-stretch justify-center bg-border/60 outline-none transition hover:bg-ring/40 focus-visible:bg-ring/50"
			aria-label="Resize leading panel"
			@pointerdown="beginResize('start', $event)"
		>
			<span class="my-auto h-10 w-0.5 rounded-full bg-muted-foreground/35 transition group-hover:bg-foreground/50"></span>
		</button>

		<section class="min-w-0 overflow-hidden">
			<slot />
		</section>

		<button
			v-if="hasEnd"
			type="button"
			class="group flex min-h-0 cursor-col-resize items-stretch justify-center bg-border/60 outline-none transition hover:bg-ring/40 focus-visible:bg-ring/50"
			aria-label="Resize trailing panel"
			@pointerdown="beginResize('end', $event)"
		>
			<span class="my-auto h-10 w-0.5 rounded-full bg-muted-foreground/35 transition group-hover:bg-foreground/50"></span>
		</button>

		<section v-if="hasEnd" class="min-w-0 overflow-hidden">
			<slot name="end" />
		</section>
	</div>
</template>
