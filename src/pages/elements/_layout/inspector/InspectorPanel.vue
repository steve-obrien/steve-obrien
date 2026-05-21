<script setup>
import { computed } from 'vue';
import {
	useInspector,
	flattenTree,
	getFieldValue,
	setFieldValue,
	findParent,
	removeNode,
	moveNode,
	duplicateNode,
} from './useInspector.js';
import InspectorField from './InspectorField.vue';

const props = defineProps({
	tree: { type: Object, required: true },
	enableActions: { type: Boolean, default: false },
});

const ctx = useInspector();
const nodes = computed(() => flattenTree(props.tree));
const selected = computed(() => nodes.value.find((n) => n.node.id === ctx.selectedId)?.node);
const isRoot = computed(() => selected.value?.id === props.tree.id);

function select(id) { ctx.selectedId = id; }
function togglePick() { ctx.pickMode = !ctx.pickMode; }

function onDelete() {
	if (!selected.value || isRoot.value) return;
	const parent = findParent(props.tree, selected.value.id);
	removeNode(props.tree, selected.value.id);
	ctx.selectedId = parent?.id || props.tree.id;
}
function onDuplicate() {
	if (!selected.value || isRoot.value) return;
	const copy = duplicateNode(props.tree, selected.value.id);
	if (copy) ctx.selectedId = copy.id;
}
function onMove(dir) {
	if (!selected.value || isRoot.value) return;
	moveNode(props.tree, selected.value.id, dir);
}
</script>

<template>
	<div class="flex h-full flex-col">
		<div class="flex items-center justify-between border-b border-skin-border px-4 py-3">
			<div>
				<p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-skin-muted">Inspector</p>
				<p class="text-sm font-medium text-skin-primary">Live properties</p>
			</div>
			<button
				type="button"
				class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 transition"
				:class="ctx.pickMode
					? 'bg-skin-primary text-skin-inverse ring-skin-primary'
					: 'bg-skin-background text-skin-secondary ring-skin-border hover:bg-skin-surface'"
				:title="ctx.pickMode ? 'Click selects · turn off to interact' : 'Clicks pass through · turn on to select'"
				@click="togglePick"
			>
				<svg viewBox="0 0 16 16" class="size-3.5" fill="none">
					<path d="M2 2l5.5 12 1.8-5.2L14.5 7 2 2z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
				</svg>
				{{ ctx.pickMode ? 'Pick' : 'Interact' }}
			</button>
		</div>

		<div class="border-b border-skin-border px-2 py-2">
			<p class="px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-skin-muted">Layers</p>
			<ul class="space-y-0.5">
				<li v-for="{ node, depth } in nodes" :key="node.id">
					<button
						type="button"
						class="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs transition"
						:class="ctx.selectedId === node.id
							? 'bg-skin-primary/10 text-skin-primary'
							: 'text-skin-secondary hover:bg-skin-surface'"
						:style="{ paddingLeft: 8 + depth * 14 + 'px' }"
						@click="select(node.id)"
					>
						<svg viewBox="0 0 16 16" class="size-3 shrink-0 opacity-60" fill="none">
							<rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.2" />
						</svg>
						<span class="truncate font-medium">{{ node.label }}</span>
					</button>
				</li>
			</ul>
		</div>

		<div class="flex-1 overflow-auto p-4">
			<template v-if="selected">
				<div class="mb-4 flex items-start justify-between gap-3">
					<div>
						<p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-skin-muted">Selected</p>
						<p class="text-base font-semibold tracking-tight text-skin-primary">{{ selected.label }}</p>
					</div>
				</div>

				<div v-if="selected.schema?.length" class="space-y-4">
					<InspectorField
						v-for="f in selected.schema"
						:key="(f.target || 'props') + ':' + f.key"
						:field="f"
						:model-value="getFieldValue(selected, f)"
						@update:model-value="(v) => setFieldValue(selected, f, v)"
					/>
				</div>
				<p v-else class="rounded-lg border border-dashed border-skin-border bg-skin-surface/40 p-4 text-xs text-skin-muted">
					This node has no editable properties.
				</p>

				<!-- Actions (builder only) -->
				<div v-if="enableActions && !isRoot" class="mt-6 space-y-2 border-t border-skin-border pt-4">
					<p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-skin-muted">Actions</p>
					<div class="flex flex-wrap gap-1.5">
						<button class="rounded-md bg-skin-background px-2.5 py-1 text-xs font-medium text-skin-secondary ring-1 ring-skin-border hover:bg-skin-surface" @click="onMove(-1)">↑ Up</button>
						<button class="rounded-md bg-skin-background px-2.5 py-1 text-xs font-medium text-skin-secondary ring-1 ring-skin-border hover:bg-skin-surface" @click="onMove(1)">↓ Down</button>
						<button class="rounded-md bg-skin-background px-2.5 py-1 text-xs font-medium text-skin-secondary ring-1 ring-skin-border hover:bg-skin-surface" @click="onDuplicate">⧉ Duplicate</button>
						<button class="rounded-md bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-600 ring-1 ring-red-500/30 hover:bg-red-500/15 dark:text-red-400" @click="onDelete">✕ Delete</button>
					</div>
				</div>
			</template>
			<p v-else class="text-xs text-skin-muted">Select a component to edit its properties.</p>
		</div>
	</div>
</template>
