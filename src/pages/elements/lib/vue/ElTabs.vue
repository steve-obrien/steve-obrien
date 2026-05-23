<script setup>
import { onMounted, ref, watch } from 'vue';

const props = defineProps({
	modelValue: { type: String, default: '' },
	tabs: { type: Array, required: true }, // [{ key, label }]
	/** Stretch tabs + active panel to fill a flex parent (studio / inspector shell). */
	fill: { type: Boolean, default: false },
});
const emit = defineEmits(['update:modelValue']);

const root = ref(null);

onMounted(async () => {
	await import('../headless/tabs.js');
	root.value?.addEventListener('el:change', (e) => emit('update:modelValue', e.detail.value));
});

watch(() => props.modelValue, (v) => {
	if (root.value && v && root.value.value !== v) root.value.value = v;
});
</script>

<template>
	<element-tabs
		ref="root"
		:value="modelValue || tabs[0]?.key"
		:class="fill ? 'flex min-h-0 flex-1 flex-col' : 'block'"
	>
		<div
			role="tablist"
			class="inline-flex shrink-0 gap-1 rounded-full border border-border bg-secondary p-1"
		>
			<button
				v-for="t in tabs"
				:key="t.key"
				:data-tab="t.key"
				class="rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 data-[active]:bg-background data-[active]:text-foreground data-[active]:shadow-sm"
			>{{ t.label }}</button>
		</div>
		<div :class="fill ? 'mt-3 flex min-h-0 flex-1 flex-col overflow-hidden' : 'mt-6'">
			<div
				v-for="t in tabs"
				:key="t.key"
				:data-panel="t.key"
				:class="fill && 'flex min-h-0 flex-1 flex-col overflow-hidden'"
			>
				<slot :name="t.key" />
			</div>
		</div>
	</element-tabs>
</template>
