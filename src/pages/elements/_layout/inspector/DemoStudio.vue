<script setup>
import { ref, computed, watch, nextTick, onMounted, reactive } from 'vue';
import {
	provideInspector,
	makeReactiveSpec,
	specFromEntry,
	findNode,
	findParent,
	insertChild,
} from './useInspector.js';
import { componentRegistry, canHaveChildren } from './componentRegistry.js';
import { serializeTree, deserializeTree, stageToHtml } from './serialize.js';
import { ElTabs, ElRenderer } from '../../lib/vue';
import StageNode from './StageNode.vue';
import InspectorPanel from './InspectorPanel.vue';
import ComponentPalette from './ComponentPalette.vue';
import './inspector.css';

const props = defineProps({
	initialSpec: { type: Object, required: true },
	title: { type: String, default: 'Studio' },
});

const tree = ref(makeReactiveSpec(props.initialSpec));
const state = provideInspector({ selectedId: tree.value.id });

const tab = ref('stage');
const stageEl = ref(null);

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
// Pick mode — when on, clicks select the deepest stage node under the cursor.
// When off, clicks fall through to native component behaviour (open the
// dropdown, focus the input) so the author can poke at the real interaction.

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
//
// Drop semantics:
//   - Hover over the upper third of a node → insert BEFORE that node.
//   - Hover over the lower third         → insert AFTER that node.
//   - Hover over the middle of a container → insert INSIDE as last child.
//   - Components with `accepts: 'none'` never receive `inside` drops; the
//     drop is split into before/after only.

const drop = reactive({ nodeId: null, position: null }); // 'before' | 'after' | 'inside'
const indicator = ref(null); // { top, left, width, height, kind }

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
		// Hovering the empty stage area — drop into root.
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
	// Only clear when leaving the stage entirely.
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
}

// ---------------------------------------------------------------------------
// Reset

function reset() {
	tree.value = makeReactiveSpec(props.initialSpec);
	state.selectedId = tree.value.id;
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

const tabs = [
	{ key: 'stage', label: 'Stage' },
	{ key: 'data', label: 'Data' },
	{ key: 'html', label: 'HTML' },
	{ key: 'renderer', label: 'Renderer' },
];
</script>

<template>
	<div class="overflow-hidden rounded-2xl border border-skin-border bg-skin-background">
		<div class="flex items-center justify-between border-b border-skin-border bg-skin-surface/40 px-4 py-2">
			<div class="flex items-center gap-3">
				<p class="text-xs font-semibold uppercase tracking-[0.18em] text-skin-muted">{{ title }}</p>
				<span v-if="state.dragEntry" class="rounded-full bg-skin-primary/10 px-2 py-0.5 text-[10px] font-medium text-skin-primary">drag onto the stage</span>
			</div>
			<button
				type="button"
				class="rounded-full px-2.5 py-1 text-[11px] font-medium text-skin-secondary ring-1 ring-skin-border hover:bg-skin-background hover:text-skin-primary"
				@click="reset"
			>Reset</button>
		</div>

		<div class="">
			<ElTabs v-model="tab" :tabs="tabs">
				<!-- ------------------------------------------------------------ Stage -->
				<template #stage>
					<div class="grid grid-cols-1 overflow-hidden rounded-2xl border border-skin-border xl:grid-cols-[220px_1fr_340px]">
						<!-- Palette -->
						<div class="border-skin-border xl:border-r border-b xl:border-b-0">
							<ComponentPalette />
						</div>

						<!-- Stage -->
						<div
							ref="stageEl"
							class="el-stage relative flex items-start justify-center bg-gradient-to-br from-skin-surface/40 via-skin-background to-skin-surface/30 p-10"
							:class="state.pickMode && 'el-pick-mode'"
							style="min-height: 480px;"
							@dragover="onDragOver"
							@dragleave="onDragLeave"
							@drop="onDrop"
						>
							<div v-if="!tree.children?.length" class="pointer-events-none absolute inset-6 grid place-items-center rounded-2xl border-2 border-dashed border-skin-border text-center">
								<div>
									<p class="text-sm font-medium text-skin-secondary">Drop components here</p>
									<p class="mt-1 text-xs text-skin-muted">Drag from the palette on the left. Click a component to inspect.</p>
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

						<!-- Inspector -->
						<div class="border-skin-border bg-skin-background xl:border-l border-t xl:border-t-0">
							<InspectorPanel :tree="tree" :enable-actions="true" />
						</div>
					</div>
				</template>

				<!-- ------------------------------------------------------------ Data -->
				<template #data>
					<div class="space-y-3">
						<div class="flex items-center justify-between">
							<p class="text-sm text-skin-secondary">Edit the JSON below — the stage updates as soon as the structure parses cleanly.</p>
							<button
								type="button"
								class="rounded-md px-2.5 py-1 text-xs font-medium text-skin-secondary ring-1 ring-skin-border hover:bg-skin-surface hover:text-skin-primary"
								@click="copy(jsonText, 'data')"
							>{{ copied === 'data' ? 'Copied' : 'Copy JSON' }}</button>
						</div>
						<textarea
							:value="jsonText"
							spellcheck="false"
							rows="22"
							class="w-full rounded-2xl border border-skin-border bg-[#0b1020] p-4 font-mono text-[12.5px] leading-relaxed text-white/90 outline-none focus:ring-2 focus:ring-skin-primary/40"
							@input="onJsonInput($event.target.value)"
							@focus="jsonFocused = true"
							@blur="jsonFocused = false"
						></textarea>
						<p v-if="jsonError" class="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-mono text-red-600 dark:text-red-400">
							{{ jsonError }}
						</p>
						<p v-else class="text-xs text-skin-muted">Two-way: changes here update the stage, edits in the inspector flow back into the JSON.</p>
					</div>
				</template>

				<!-- ------------------------------------------------------------ HTML -->
				<template #html>
					<div class="space-y-3">
						<div class="flex items-center justify-between">
							<p class="text-sm text-skin-secondary">A copy-paste ready snapshot of the rendered stage — strip the inspector chrome, keep your classes.</p>
							<button
								type="button"
								class="rounded-md px-2.5 py-1 text-xs font-medium text-skin-secondary ring-1 ring-skin-border hover:bg-skin-surface hover:text-skin-primary"
								@click="copy(htmlOutput, 'html')"
							>{{ copied === 'html' ? 'Copied' : 'Copy HTML' }}</button>
						</div>
						<pre class="overflow-auto rounded-2xl border border-skin-border bg-[#0b1020] p-4 font-mono text-[12.5px] leading-relaxed text-white/90"><code>{{ htmlOutput || '<!-- nothing on stage -->' }}</code></pre>
					</div>
				</template>

				<!-- ------------------------------------------------------------ Renderer -->
				<template #renderer>
					<div class="space-y-4">
						<div class="rounded-2xl border border-skin-border bg-gradient-to-br from-skin-surface/40 via-skin-background to-skin-surface/30 p-10">
							<div class="mb-4 flex items-center gap-2">
								<span class="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
								<p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-skin-muted">Rehydrated via &lt;ElRenderer&gt;</p>
							</div>
							<div class="flex items-center justify-center">
								<ElRenderer :spec="serializedSpec" />
							</div>
						</div>
						<details class="rounded-2xl border border-skin-border bg-skin-surface/40 p-4 open:bg-skin-surface/60">
							<summary class="cursor-pointer text-sm font-medium text-skin-primary">Spec passed to ElRenderer</summary>
							<pre class="mt-3 overflow-auto rounded-xl bg-[#0b1020] p-4 font-mono text-[11.5px] leading-relaxed text-white/90"><code>{{ JSON.stringify(serializedSpec, null, 2) }}</code></pre>
						</details>
						<p class="text-xs text-skin-muted">This is the same data you'd load from a database to rebuild the section anywhere.</p>
					</div>
				</template>
			</ElTabs>
		</div>
	</div>
</template>
