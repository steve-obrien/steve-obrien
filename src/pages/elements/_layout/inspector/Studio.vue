<script setup>
import { ref, computed, watch, nextTick, onMounted, reactive, useSlots } from 'vue';
import {
	provideInspector,
	makeReactiveSpec,
	specFromEntry,
	findNode,
	findParent,
	insertChild,
	flattenTree,
} from './useInspector.js';
import { componentRegistry, canHaveChildren } from './componentRegistry.js';
import { serializeTree, deserializeTree, stageToHtml } from './serialize.js';
import { ElRenderer } from '../../lib/vue/index.js';
import StageNode from './StageNode.vue';
import InspectorPanel from './InspectorPanel.vue';
import ComponentPalette from './ComponentPalette.vue';
import { slotToSpec } from './markupToSpec.js';
import './inspector.css';

const props = defineProps({
	initialSpec: { type: Object, default: null },
	title: { type: String, default: 'Studio' },
});

const slots = useSlots();

function initialSpec() {
	return props.initialSpec || slotToSpec(slots.default);
}

const tree = ref(makeReactiveSpec(initialSpec()));
const state = provideInspector({ selectedId: tree.value.id });

const activePanel = ref('inspect');
const showPalette = ref(false);
const stageEl = ref(null);

const panels = [
	{ key: 'inspect', label: 'Inspect' },
	{ key: 'data', label: 'Data' },
	{ key: 'html', label: 'HTML' },
	{ key: 'renderer', label: 'Render' },
];

const nodes = computed(() => flattenTree(tree.value));

// ---------------------------------------------------------------------------
// Serialization & derived views

const serializedSpec = computed(() => serializeTree(tree.value));

const jsonText = ref(JSON.stringify(serializedSpec.value, null, 2));
const jsonError = ref('');
const jsonFocused = ref(false);

watch(serializedSpec, (next) => {
	if (!jsonFocused.value) {
		jsonText.value = JSON.stringify(next, null, 2);
		jsonError.value = '';
	}
}, { deep: true });

function onJsonInput(value) {
	jsonText.value = value;
	try {
		const parsed = JSON.parse(value);
		const newTree = deserializeTree(parsed);
		if (!newTree) throw new Error('Empty tree');
		tree.value = newTree;
		state.selectedId = newTree.id;
		jsonError.value = '';
	} catch (e) {
		jsonError.value = e.message;
	}
}

const htmlOutput = ref('');
async function captureHtml() {
	await nextTick();
	if (stageEl.value) htmlOutput.value = stageToHtml(stageEl.value);
}
watch(serializedSpec, captureHtml, { deep: true });

// ---------------------------------------------------------------------------
// Selection and stage interaction

function select(id) { state.selectedId = id; }
function togglePick() { state.pickMode = !state.pickMode; }

function onStageClickCapture(e) {
	if (!state.pickMode) return;
	const target = e.target.closest('[data-node-id]');
	if (!target || !stageEl.value?.contains(target)) return;
	e.preventDefault();
	e.stopPropagation();
	state.selectedId = target.dataset.nodeId;
}

// ---------------------------------------------------------------------------
// Drag-and-drop with line indicator

const drop = reactive({ nodeId: null, position: null });
const indicator = ref(null);

function detectOrientation(el) {
	if (!el || typeof window === 'undefined') return 'vertical';
	const cs = window.getComputedStyle(el);
	if (cs.display.includes('flex') && (cs.flexDirection === 'row' || cs.flexDirection === 'row-reverse')) {
		return 'horizontal';
	}
	return 'vertical';
}

function clearDrop() {
	drop.nodeId = null;
	drop.position = null;
	indicator.value = null;
}

function updateIndicator() {
	if (!drop.nodeId || !stageEl.value) {
		indicator.value = null;
		return;
	}
	const el = stageEl.value.querySelector(`[data-node-id="${drop.nodeId}"]`);
	if (!el) return;
	const r = el.getBoundingClientRect();
	const sr = stageEl.value.getBoundingClientRect();
	if (drop.position === 'inside') {
		indicator.value = {
			top: r.top - sr.top,
			left: r.left - sr.left,
			width: r.width,
			height: r.height,
			kind: 'inside',
		};
		return;
	}
	const orientation = detectOrientation(el.parentElement);
	if (orientation === 'horizontal') {
		indicator.value = {
			top: r.top - sr.top,
			left: (drop.position === 'before' ? r.left : r.right) - sr.left - 2,
			width: 4,
			height: r.height,
			kind: 'line',
		};
	} else {
		indicator.value = {
			top: (drop.position === 'before' ? r.top : r.bottom) - sr.top - 2,
			left: r.left - sr.left,
			width: r.width,
			height: 4,
			kind: 'line',
		};
	}
}

function onDragOver(event) {
	event.preventDefault();
	if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
	const targetEl = event.target.closest('[data-node-id]');
	if (!targetEl || !stageEl.value?.contains(targetEl)) {
		drop.nodeId = tree.value.id;
		drop.position = 'inside';
		updateIndicator();
		return;
	}
	const id = targetEl.dataset.nodeId;
	const node = findNode(tree.value, id);
	if (!node) return clearDrop();

	const r = targetEl.getBoundingClientRect();
	const orientation = detectOrientation(targetEl.parentElement);
	const pos = orientation === 'horizontal' ? event.clientX - r.left : event.clientY - r.top;
	const size = orientation === 'horizontal' ? r.width : r.height;
	const ratio = size > 0 ? pos / size : 0.5;
	const accepts = canHaveChildren(node);

	if (id === tree.value.id) {
		drop.nodeId = id;
		drop.position = 'inside';
	} else if (accepts && ratio > 0.3 && ratio < 0.7) {
		drop.nodeId = id;
		drop.position = 'inside';
	} else if (ratio < 0.5) {
		drop.nodeId = id;
		drop.position = 'before';
	} else {
		drop.nodeId = id;
		drop.position = 'after';
	}
	updateIndicator();
}

function onDragLeave(event) {
	if (!stageEl.value?.contains(event.relatedTarget)) clearDrop();
}

function onDrop(event) {
	event.preventDefault();
	const entryId = event.dataTransfer.getData('application/x-elements-entry');
	const entry = componentRegistry.find((e) => e.id === entryId);
	const target = drop.nodeId ? findNode(tree.value, drop.nodeId) : tree.value;
	const position = drop.position || 'inside';
	clearDrop();
	state.dragEntry = null;
	if (!entry || !target) return;

	const node = specFromEntry(entry);
	if (position === 'inside') {
		if (!canHaveChildren(target)) return;
		insertChild(target, node);
	} else {
		const parent = findParent(tree.value, target.id) || tree.value;
		const i = parent.children.findIndex((c) => c.id === target.id);
		insertChild(parent, node, position === 'before' ? i : i + 1);
	}
	state.selectedId = node.id;
	showPalette.value = false;
}

// ---------------------------------------------------------------------------
// Actions

function reset() {
	tree.value = makeReactiveSpec(initialSpec());
	state.selectedId = tree.value.id;
	showPalette.value = false;
	clearDrop();
}

const copied = ref('');
function copy(text, key) {
	if (typeof navigator === 'undefined' || !navigator.clipboard) return;
	navigator.clipboard.writeText(text);
	copied.value = key;
	setTimeout(() => { if (copied.value === key) copied.value = ''; }, 1500);
}

onMounted(() => {
	if (stageEl.value) stageEl.value.addEventListener('click', onStageClickCapture, true);
	captureHtml();
});
</script>

<template>
	<div class="el-studio flex min-h-0 flex-1 overflow-hidden bg-background">
		<div class="relative grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[240px_1fr_360px]">
			<!-- Left rail ----------------------------------------------------- -->
			<aside class="relative z-10 flex min-h-0 flex-col border-r border-border bg-card text-card-foreground">
				<div class="border-b border-border p-2">
					<button
						type="button"
						class="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
						@click="showPalette = !showPalette"
					>
						<svg class="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
							<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
						</svg>
						Component
					</button>
				</div>

				<div class="flex-1"></div>

				<div class="max-h-[46%] overflow-hidden border-t border-border bg-background/50">
					<div class="flex items-center justify-between px-3 py-2">
						<p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Layers</p>
						<span class="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{{ nodes.length }}</span>
					</div>
					<ul class="max-h-72 space-y-0.5 overflow-auto px-2 pb-2">
						<li v-for="{ node, depth } in nodes" :key="node.id">
							<button
								type="button"
								class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition"
								:class="state.selectedId === node.id
									? 'bg-primary/10 text-foreground ring-1 ring-primary/20'
									: 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'"
								:style="{ paddingLeft: 8 + depth * 14 + 'px' }"
								@click="select(node.id)"
							>
								<svg viewBox="0 0 16 16" class="size-3 shrink-0 opacity-60" fill="none" aria-hidden="true">
									<rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.2" />
								</svg>
								<span class="truncate font-medium">{{ node.label }}</span>
							</button>
						</li>
					</ul>
				</div>
			</aside>

			<!-- Webflow-style component drawer ------------------------------- -->
			<div
				v-if="showPalette"
				class="absolute bottom-3 left-3 top-3 z-30 w-[20rem] overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl shadow-black/20 ring-1 ring-border/60 lg:left-[252px]"
			>
				<div class="flex items-center justify-between border-b border-border px-4 py-3">
					<div>
						<p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Add</p>
						<p class="text-sm font-medium">Components</p>
					</div>
					<button
						type="button"
						class="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
						aria-label="Close component palette"
						@click="showPalette = false"
					>
						<svg class="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
							<path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
						</svg>
					</button>
				</div>
				<ComponentPalette :show-header="false" />
			</div>

			<!-- Stage -------------------------------------------------------- -->
			<div
				ref="stageEl"
				class="el-stage relative min-h-0 overflow-auto bg-[radial-gradient(circle_at_top_left,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_24rem),linear-gradient(135deg,color-mix(in_oklch,var(--secondary)_70%,transparent),var(--background),color-mix(in_oklch,var(--secondary)_55%,transparent))] p-8"
				:class="state.pickMode && 'el-pick-mode'"
				@dragover="onDragOver"
				@dragleave="onDragLeave"
				@drop="onDrop"
			>
				<div v-if="state.dragEntry" class="pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground shadow-lg">
					Drop onto the stage
				</div>

				<div v-if="!tree.children?.length" class="pointer-events-none absolute inset-6 grid place-items-center rounded-2xl border-2 border-dashed border-border text-center">
					<div>
						<p class="text-sm font-medium text-muted-foreground">Drop components here</p>
						<p class="mt-1 text-xs text-muted-foreground">Click + Component, then drag from the palette.</p>
					</div>
				</div>

				<StageNode :node="tree" />

				<div
					v-if="indicator"
					class="el-drop-indicator"
					:class="indicator.kind === 'inside' && 'el-drop-indicator--inside'"
					:style="{
						top: indicator.top + 'px',
						left: indicator.left + 'px',
						width: indicator.width + 'px',
						height: indicator.height + 'px',
					}"
				></div>
			</div>

			<!-- Right rail --------------------------------------------------- -->
			<aside class="flex min-h-0 flex-col border-l border-border bg-card text-card-foreground">
				<div class="border-b border-border p-2">
					<div class="flex items-center gap-1">
						<button
							v-for="panel in panels"
							:key="panel.key"
							type="button"
							class="h-8 flex-1 rounded-md px-2 text-xs font-medium transition"
							:class="activePanel === panel.key
								? 'bg-primary text-primary-foreground'
								: 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'"
							@click="activePanel = panel.key"
						>{{ panel.label }}</button>
					</div>
					<div class="mt-2 flex items-center gap-2">
						<button
							type="button"
							class="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md px-2 text-xs font-medium ring-1 transition"
							:class="state.pickMode
								? 'bg-secondary text-secondary-foreground ring-border'
								: 'bg-background text-muted-foreground ring-border hover:bg-secondary'"
							:title="state.pickMode ? 'Click selects - turn off to interact' : 'Clicks pass through - turn on to select'"
							@click="togglePick"
						>
							<svg viewBox="0 0 16 16" class="size-3.5" fill="none" aria-hidden="true">
								<path d="M2 2l5.5 12 1.8-5.2L14.5 7 2 2z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
							</svg>
							{{ state.pickMode ? 'Pick' : 'Interact' }}
						</button>
						<button
							type="button"
							class="h-8 rounded-md px-2.5 text-xs font-medium text-muted-foreground ring-1 ring-border hover:bg-secondary hover:text-secondary-foreground"
							@click="reset"
						>Reset</button>
					</div>
				</div>

				<div class="min-h-0 flex-1 overflow-auto">
					<InspectorPanel
						v-if="activePanel === 'inspect'"
						:tree="tree"
						:enable-actions="true"
						:show-header="false"
						:show-layers="false"
						:show-pick="false"
					/>

					<div v-else-if="activePanel === 'data'" class="space-y-3 p-3">
						<div class="flex items-center justify-between gap-3">
							<p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">JSON data</p>
							<button
								type="button"
								class="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border hover:bg-secondary hover:text-secondary-foreground"
								@click="copy(jsonText, 'data')"
							>{{ copied === 'data' ? 'Copied' : 'Copy' }}</button>
						</div>
						<textarea
							:value="jsonText"
							spellcheck="false"
							rows="24"
							class="h-[calc(100dvh-13rem)] w-full resize-none rounded-xl border border-border bg-[#0b1020] p-3 font-mono text-[11.5px] leading-relaxed text-white/90 outline-none focus:ring-2 focus:ring-ring/40"
							@input="onJsonInput($event.target.value)"
							@focus="jsonFocused = true"
							@blur="jsonFocused = false"
						></textarea>
						<p v-if="jsonError" class="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs font-mono text-destructive">
							{{ jsonError }}
						</p>
					</div>

					<div v-else-if="activePanel === 'html'" class="space-y-3 p-3">
						<div class="flex items-center justify-between gap-3">
							<p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Rendered HTML</p>
							<button
								type="button"
								class="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground ring-1 ring-border hover:bg-secondary hover:text-secondary-foreground"
								@click="copy(htmlOutput, 'html')"
							>{{ copied === 'html' ? 'Copied' : 'Copy' }}</button>
						</div>
						<pre class="h-[calc(100dvh-12rem)] overflow-auto rounded-xl border border-border bg-[#0b1020] p-3 font-mono text-[11.5px] leading-relaxed text-white/90"><code>{{ htmlOutput || '<!-- nothing on stage -->' }}</code></pre>
					</div>

					<div v-else class="space-y-3 p-3">
						<p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">ElRenderer preview</p>
						<div class="rounded-xl border border-border bg-background p-5">
							<ElRenderer :spec="serializedSpec" />
						</div>
						<details class="rounded-xl border border-border bg-secondary/50 p-3">
							<summary class="cursor-pointer text-sm font-medium">Spec passed to ElRenderer</summary>
							<pre class="mt-3 max-h-80 overflow-auto rounded-lg bg-[#0b1020] p-3 font-mono text-[11px] leading-relaxed text-white/90"><code>{{ JSON.stringify(serializedSpec, null, 2) }}</code></pre>
						</details>
					</div>
				</div>
			</aside>
		</div>
	</div>
</template>
