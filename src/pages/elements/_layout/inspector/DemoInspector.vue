<script setup>
import { onMounted, ref } from 'vue';
import { provideInspector, makeReactiveSpec } from './useInspector.js';
import StageNode from './StageNode.vue';
import InspectorPanel from './InspectorPanel.vue';
import './inspector.css';

const props = defineProps({
	spec: { type: Object, required: true },
	title: { type: String, default: 'Playground' },
	stageClass: { type: String, default: 'min-h-[260px]' },
});

const tree = ref(makeReactiveSpec(props.spec));
const state = provideInspector({ selectedId: tree.value.id });
const stageEl = ref(null);

// Pick mode toggles selection — see InspectorPanel for the button. When off,
// clicks fall through to native component behaviour.
function onStageClickCapture(e) {
	if (!state.pickMode) return;
	const target = e.target.closest('[data-node-id]');
	if (!target || !stageEl.value?.contains(target)) return;
	e.preventDefault();
	e.stopPropagation();
	state.selectedId = target.dataset.nodeId;
}

function reset() {
	tree.value = makeReactiveSpec(props.spec);
	state.selectedId = tree.value.id;
}

onMounted(() => {
	if (stageEl.value) stageEl.value.addEventListener('click', onStageClickCapture, true);
});
</script>

<template>
	<div class="overflow-hidden rounded-2xl border border-skin-border bg-skin-background">
		<div class="flex items-center justify-between border-b border-skin-border bg-skin-surface/40 px-4 py-2">
			<p class="text-xs font-semibold uppercase tracking-[0.18em] text-skin-muted">{{ title }}</p>
			<button
				type="button"
				class="rounded-full px-2.5 py-1 text-[11px] font-medium text-skin-secondary ring-1 ring-skin-border hover:bg-skin-background hover:text-skin-primary"
				@click="reset"
			>Reset</button>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-[1fr_320px]">
			<div
				ref="stageEl"
				class="el-stage relative flex items-center justify-center bg-gradient-to-br from-skin-surface/40 via-skin-background to-skin-surface/30 p-10"
				:class="[stageClass, state.pickMode && 'el-pick-mode']"
			>
				<StageNode :node="tree" />
			</div>
			<div class="border-skin-border lg:border-l lg:border-t-0 border-t bg-skin-background">
				<InspectorPanel :tree="tree" />
			</div>
		</div>
	</div>
</template>
