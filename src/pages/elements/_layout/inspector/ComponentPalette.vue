<script setup>
import { computed } from 'vue';
import { groupedRegistry } from './componentRegistry.js';
import { useInspector } from './useInspector.js';

const ctx = useInspector();
const groups = computed(() => Object.entries(groupedRegistry));

function onDragStart(event, entry) {
	event.dataTransfer.setData('application/x-elements-entry', entry.id);
	event.dataTransfer.effectAllowed = 'copy';
	if (ctx) ctx.dragEntry = entry.id;
}
function onDragEnd() { if (ctx) ctx.dragEntry = null; }
</script>

<template>
	<div class="flex h-full flex-col">
		<div class="border-b border-skin-border px-4 py-3">
			<p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-skin-muted">Palette</p>
			<p class="text-sm font-medium text-skin-primary">Drag onto the stage</p>
		</div>
		<div class="flex-1 overflow-auto p-3">
			<div v-for="[group, entries] in groups" :key="group" class="mb-5 last:mb-0">
				<p class="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-skin-muted">{{ group }}</p>
				<div class="grid grid-cols-2 gap-2">
					<button
						v-for="e in entries"
						:key="e.id"
						type="button"
						draggable="true"
						class="group flex flex-col items-start gap-1.5 rounded-xl border border-skin-border bg-skin-background p-3 text-left transition hover:-translate-y-0.5 hover:border-skin-primary/40 hover:shadow-md"
						@dragstart="onDragStart($event, e)"
						@dragend="onDragEnd"
					>
						<span class="grid size-7 place-items-center rounded-md bg-skin-surface text-[14px] font-semibold text-skin-primary">{{ e.icon }}</span>
						<span class="text-[12px] font-medium text-skin-primary">{{ e.label }}</span>
					</button>
				</div>
			</div>
		</div>
	</div>
</template>
