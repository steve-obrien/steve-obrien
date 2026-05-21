<script setup>
import { computed, onMounted, ref } from 'vue';
import CodePanel from './CodePanel.vue';
import InspectorField from '../inspector/InspectorField.vue';
import { inferSchema } from '../inspector/useInspector.js';

// A playground is just like an <Example>, but the rendered SFC carries a
// reactive `data` object (via defineExpose). The wrapper layers an inspector
// over it — schema inferred from a target Elements component — and exposes
// a Source / Data tab pair so consumers can see either the SFC they would
// write OR the live state being bound to the component.
//
//   import PlaygroundDrawer from './examples/PlaygroundDrawer.vue';
//   import PlaygroundDrawerSrc from './examples/PlaygroundDrawer.vue?raw';
//
//   <Playground
//     :component="PlaygroundDrawer"
//     :source="PlaygroundDrawerSrc"
//     :inspect="ElDrawer"
//     filename="PlaygroundDrawer.vue"
//   />
//
// The playground SFC owns the data declaration — same shape a consumer
// would write — and defineExpose({ data }) lets the wrapper introspect it.
const props = defineProps({
	component: { required: true },           // the playground SFC
	source: { type: String, default: '' },   // ?raw source of the same SFC
	inspect: { required: true },             // the Elements component to infer prop schema from
	title: { type: String, default: 'Playground' },
	description: { type: String, default: '' },
	filename: { type: String, default: 'Playground.vue' },
});

const playgroundRef = ref(null);
const data = ref(null);
onMounted(() => {
	// `defineExpose({ data })` in the playground SFC puts `data` on the proxy.
	data.value = playgroundRef.value?.data || null;
});

const schema = computed(() => {
	if (!data.value) return [];
	return inferSchema({ component: props.inspect, props: data.value, children: [] })
		.filter((f) => f.key !== 'class');
});

const tab = ref('source');
const tabs = [
	{ key: 'source', label: 'Source' },
	{ key: 'data', label: 'Data' },
];

const dataJson = computed(() => (data.value ? JSON.stringify(data.value, null, 2) : ''));
const codeSource = computed(() => (tab.value === 'data' ? dataJson.value : props.source));
const codeLang = computed(() => (tab.value === 'data' ? 'json' : 'vue'));
const codeFilename = computed(() => (tab.value === 'data' ? 'data' : props.filename));
</script>

<template>
	<figure class="my-6 overflow-hidden rounded-2xl border border-skin-border bg-skin-background">
		<figcaption v-if="title || description" class="border-b border-skin-border bg-skin-surface/40 px-5 py-3">
			<p v-if="title" class="text-sm font-semibold tracking-tight text-skin-primary">{{ title }}</p>
			<p v-if="description" class="mt-0.5 text-sm text-skin-secondary">{{ description }}</p>
		</figcaption>

		<div class="grid w-full grid-cols-1 items-start gap-6 bg-gradient-to-br from-skin-surface/40 via-skin-background to-skin-surface/30 p-10 sm:grid-cols-[1fr_240px]">
			<div class="flex items-center justify-center">
				<component :is="component" ref="playgroundRef" />
			</div>
			<aside class="space-y-4 text-left">
				<p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-skin-muted">Properties</p>
				<template v-if="data">
					<InspectorField
						v-for="f in schema"
						:key="f.key"
						:field="f"
						:model-value="data[f.key]"
						@update:model-value="(v) => data[f.key] = v"
					/>
				</template>
			</aside>
		</div>

		<!-- Tab switcher for the code panel below. -->
		<div class="flex items-center gap-1 border-t border-skin-border bg-skin-surface/40 px-3 py-1.5">
			<button
				v-for="t in tabs"
				:key="t.key"
				type="button"
				class="rounded-md px-2.5 py-1 text-xs font-medium transition"
				:class="tab === t.key
					? 'bg-skin-background text-skin-primary shadow-sm ring-1 ring-skin-border'
					: 'text-skin-secondary hover:bg-skin-background hover:text-skin-primary'"
				@click="tab = t.key"
			>{{ t.label }}</button>
		</div>

		<CodePanel
			:source="codeSource"
			:lang="codeLang"
			:filename="codeFilename"
		/>
	</figure>
</template>
