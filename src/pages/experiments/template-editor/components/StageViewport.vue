<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
	selectedLabel: {
		type: String,
		default: '',
	},
	canDelete: {
		type: Boolean,
		default: false,
	},
	dragging: {
		type: Boolean,
		default: false,
	},
});

const emit = defineEmits([
	'stage-drop',
	'clear-drop-target',
	'hover-node',
	'clear-hover',
	'delete-selected',
]);

const stageShellEl = ref(null);
const viewportMode = ref('desktop');
const zoom = ref(1);

const viewportOptions = [
	{ id: 'desktop', label: 'Desktop', width: 1280, height: 720 },
	{ id: 'tablet', label: 'Tablet', width: 768, height: 1024 },
	{ id: 'mobile', label: 'Mobile', width: 390, height: 844 },
];
const zoomSteps = [0.5, 0.75, 1, 1.25, 1.5];

const activeViewport = computed(() => viewportOptions.find((option) => option.id === viewportMode.value) || viewportOptions[0]);
const zoomLabel = computed(() => `${Math.round(zoom.value * 100)}%`);
const frameSizerStyle = computed(() => ({
	width: `${activeViewport.value.width * zoom.value}px`,
	minHeight: `${activeViewport.value.height * zoom.value}px`,
}));
const frameStyle = computed(() => ({
	width: `${activeViewport.value.width}px`,
	minHeight: `${activeViewport.value.height}px`,
	transform: `scale(${zoom.value})`,
	transformOrigin: 'top left',
}));

function setViewport(mode) {
	viewportMode.value = mode;
	focus();
}

function stepZoom(direction) {
	const currentIndex = zoomSteps.findIndex((value) => value === zoom.value);
	const fallbackIndex = zoomSteps.findIndex((value) => value === 1);
	const nextIndex = Math.min(Math.max((currentIndex >= 0 ? currentIndex : fallbackIndex) + direction, 0), zoomSteps.length - 1);
	zoom.value = zoomSteps[nextIndex];
	focus();
}

function handlePointerDown(event) {
	if (isEditableTarget(event.target)) return;
	focus();
}

function handlePointerMove(event) {
	const target = event.target instanceof Element
		? event.target.closest('[data-template-node]')
		: null;
	emit('hover-node', target?.getAttribute('data-template-node') || '');
}

function handleDelete(event) {
	if (!props.canDelete) return;
	if (event) event.preventDefault();
	emit('delete-selected');
	focus();
}

function handleKeydown(event) {
	if (!['Backspace', 'Delete'].includes(event.key)) return;
	if (event.metaKey || event.ctrlKey || event.altKey) return;
	if (isEditableTarget(event.target)) return;
	handleDelete(event);
}

function handleDragLeave(event) {
	if (event.currentTarget.contains(event.relatedTarget)) return;
	emit('clear-drop-target');
}

function isEditableTarget(target) {
	if (!(target instanceof HTMLElement)) return false;
	return target.closest('input, textarea, select, [contenteditable="true"]');
}

function focus() {
	stageShellEl.value?.focus({ preventScroll: true });
}

defineExpose({ focus });
</script>

<template>
	<section class="flex min-h-0 flex-1 flex-col bg-background text-foreground">
		<div class="flex min-h-12 shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-3 text-card-foreground">
			<div class="flex min-w-0 items-center gap-2">
				<div class="flex rounded-md border border-border bg-background p-0.5">
					<button
						v-for="option in viewportOptions"
						:key="option.id"
						type="button"
						class="h-7 rounded px-2 text-[11px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
						:class="viewportMode === option.id && 'bg-secondary text-foreground'"
						@click="setViewport(option.id)"
					>
						{{ option.label }}
					</button>
				</div>
				<div class="flex items-center rounded-md border border-border bg-background">
					<button type="button" class="flex h-8 w-8 items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground" title="Zoom out" @click="stepZoom(-1)">-</button>
					<span class="w-12 text-center text-[11px] font-medium text-muted-foreground">{{ zoomLabel }}</span>
					<button type="button" class="flex h-8 w-8 items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground" title="Zoom in" @click="stepZoom(1)">+</button>
				</div>
				<span class="hidden text-[11px] text-muted-foreground sm:inline">{{ activeViewport.width }} x {{ activeViewport.height }}</span>
			</div>
			<div class="flex shrink-0 items-center gap-2">
				<p v-if="selectedLabel" class="hidden max-w-48 truncate text-[11px] text-muted-foreground md:block">{{ selectedLabel }}</p>
				<button
					type="button"
					class="h-8 rounded-md border border-destructive/30 px-2 text-[11px] font-medium text-destructive hover:bg-destructive/10 disabled:pointer-events-none disabled:opacity-40"
					:disabled="!canDelete"
					@click="handleDelete"
				>
					Delete
				</button>
			</div>
		</div>

		<div
			ref="stageShellEl"
			tabindex="0"
			class="min-h-0 flex-1 overflow-auto bg-muted/35 p-6 outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
			:class="dragging && 'bg-accent/30'"
			@dragover.prevent
			@dragleave="handleDragLeave"
			@drop.prevent="emit('stage-drop')"
			@keydown="handleKeydown"
			@pointerdown="handlePointerDown"
			@pointermove="handlePointerMove"
			@pointerleave="emit('clear-hover')"
		>
			<div class="mx-auto" :style="frameSizerStyle">
				<div class="overflow-hidden border border-border bg-background shadow-sm" :style="frameStyle">
					<slot />
				</div>
			</div>
		</div>
	</section>
</template>
