<script setup>
import { computed, onMounted, reactive, ref, useSlots } from 'vue';
import CodePanel from './CodePanel.vue';
import InspectorField from '../inspector/InspectorField.vue';
import { inferSchema } from '../inspector/useInspector.js';

// Two modes, one component:
//
// 1. Auto (the simple case) — give it only an `:inspect` component:
//
//    <Playground :inspect="ElDrawer" />
//
//    The wrapper seeds a reactive `data` object from defineProps defaults,
//    binds it to the live component, and synthesises source from the
//    canonical `__doc.tag` + the current data. Slots passed to <Playground>
//    are forwarded to the rendered component.
//
// 2. SFC (for cases that need trigger slots, event wiring, etc.) — supply
//    a `:component` SFC that exposes its own `data` via defineExpose:
//
//    <Playground :inspect="ElDrawer" :component="PlaygroundDrawer"
//                :source="PlaygroundDrawerSrc" />
//
//    The SFC is rendered as-is; its source string is shown verbatim. The
//    wrapper still drives the inspector against the same `data` object.
const props = defineProps({
	inspect: { required: true },
	component: { type: null, default: null },
	source: { type: String, default: '' },
	title: { type: String, default: 'Playground' },
	description: { type: String, default: '' },
	filename: { type: String, default: 'Playground.vue' },
	/** Merged over defineProps defaults — for required props (tabs, items, options, …). */
	initial: { type: Object, default: () => ({}) },
});

const slots = useSlots();
const useSfc = computed(() => !!props.component);

// ---------------------------------------------------------------------------
// Auto-mode data — seeded from the inspected component's defineProps defaults.
function seed() {
	const out = {};
	const defs = props.inspect.props || {};
	for (const [key, def] of Object.entries(defs)) {
		if (key === 'class' || key === 'modelModifiers') continue;
		const d = def && typeof def === 'object' ? def.default : undefined;
		out[key] = typeof d === 'function' ? d() : d;
	}
	return Object.assign(out, props.initial);
}
const autoData = reactive(seed());

// ---------------------------------------------------------------------------
// SFC-mode data — picked up from `defineExpose({ data })` after mount.
const playgroundRef = ref(null);
const sfcData = ref(null);
onMounted(() => {
	if (useSfc.value) sfcData.value = playgroundRef.value?.data || null;
});

// Whichever mode we're in, `data` is the live reactive props object.
const data = computed(() => (useSfc.value ? sfcData.value : autoData));

const schema = computed(() => {
	if (!data.value) return [];
	return inferSchema({ component: props.inspect, props: data.value, children: [] })
		.filter((f) => f.key !== 'class');
});

function onUpdateModelValue(v) {
	if (data.value && 'modelValue' in data.value) data.value.modelValue = v;
}

// ---------------------------------------------------------------------------
// Source generation (auto mode only — SFC mode shows the raw ?raw string).
//
// Safe because the tag name comes from `inspect.__doc.tag` (canonical, set by
// the component author) and the data inside `reactive(...)` is JSON.stringify
// of the live state. There is no guesswork.
const componentTag = computed(() => {
	const tag = props.inspect.__doc?.tag;
	if (tag) return tag.replace(/^</, '').replace(/>$/, '');
	return props.inspect.name || props.inspect.__name || 'Component';
});

const autoSource = computed(() => {
	if (!data.value) return '';
	const tag = componentTag.value;
	const hasModel = 'modelValue' in data.value;
	const literal = JSON.stringify(data.value, null, 2)
		.split('\n')
		.map((l, i) => (i === 0 ? l : '\t' + l))
		.join('\n');
	const handler = hasModel ? '\n\t\t@update:modelValue="data.modelValue = $event"' : '';
	return `<script setup>
import { reactive } from 'vue';
import { ${tag} } from '@elements/vue';

const data = reactive(${literal});
</${'script'}>

<template>
\t<${tag}
\t\tv-bind="data"${handler}
\t/>
</template>`;
});

// ---------------------------------------------------------------------------
// Tabs

const tab = ref('source');
const tabs = [
	{ key: 'source', label: 'Source' },
	{ key: 'data', label: 'Data' },
];

const dataJson = computed(() => (data.value ? JSON.stringify(data.value, null, 2) : ''));
const codeSource = computed(() => {
	if (tab.value === 'data') return dataJson.value;
	return useSfc.value ? props.source : autoSource.value;
});
const codeLang = computed(() => (tab.value === 'data' ? 'json' : 'vue'));
const codeFilename = computed(() => {
	if (tab.value === 'data') return 'data';
	return useSfc.value ? props.filename : 'Playground.vue';
});
</script>

<template>
	<figure class="my-6 overflow-hidden rounded-2xl border border-skin-border bg-skin-background">
		<figcaption v-if="title || description" class="border-b border-skin-border bg-skin-surface/40 px-5 py-3">
			<p v-if="title" class="text-sm font-semibold tracking-tight text-skin-primary">{{ title }}</p>
			<p v-if="description" class="mt-0.5 text-sm text-skin-secondary">{{ description }}</p>
		</figcaption>

		<div class="grid w-full grid-cols-1 items-start gap-6 bg-gradient-to-br from-skin-surface/40 via-skin-background to-skin-surface/30 p-10 sm:grid-cols-[1fr_240px]">
			<div class="flex items-center justify-center">
				<!-- SFC mode: render the playground SFC; it owns the data + slots. -->
				<component v-if="useSfc" :is="component" ref="playgroundRef" />
				<!-- Auto mode: render the inspected component, forwarding every parent slot. -->
				<component
					v-else
					:is="inspect"
					v-bind="autoData"
					@update:modelValue="onUpdateModelValue"
				>
					<template v-for="(_, name) in slots" :key="name" #[name]="slotProps">
						<slot :name="name" v-bind="slotProps || {}" />
					</template>
				</component>
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
