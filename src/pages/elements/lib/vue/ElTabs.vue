<script setup>
import { onMounted, ref, watch } from 'vue';

const props = defineProps({
	modelValue: { type: String, default: '' },
	tabs: { type: Array, required: true }, // [{ key, label }]
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
	<element-tabs ref="root" :value="modelValue || tabs[0]?.key" class="block">
		<div
			role="tablist"
			class="inline-flex gap-1 rounded-full border border-skin-border bg-skin-surface p-1"
		>
			<button
				v-for="t in tabs"
				:key="t.key"
				:data-tab="t.key"
				class="rounded-full px-4 py-1.5 text-sm font-medium text-skin-secondary transition focus:outline-none focus-visible:ring-2 focus-visible:ring-skin-primary/60 data-[active]:bg-skin-background data-[active]:text-skin-primary data-[active]:shadow-sm"
			>{{ t.label }}</button>
		</div>
		<div class="mt-6">
			<div v-for="t in tabs" :key="t.key" :data-panel="t.key">
				<slot :name="t.key" />
			</div>
		</div>
	</element-tabs>
</template>
