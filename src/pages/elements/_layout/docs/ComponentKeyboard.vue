<script setup>
import { computed } from 'vue';
import { inspectComponent } from './inspect.js';

const props = defineProps({
	component: { required: true },
	title: { type: String, default: 'Keyboard' },
});
const info = computed(() => inspectComponent(props.component));
</script>

<template>
	<section v-if="info?.keyboard?.length" class="space-y-3">
		<h3 class="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">{{ title }}</h3>
		<ul class="space-y-2 rounded-2xl border border-border bg-secondary/40 p-5 text-sm">
			<li v-for="row in info.keyboard" :key="row.keys" class="flex items-start gap-4">
				<kbd class="rounded bg-background px-2 py-0.5 font-mono text-xs ring-1 ring-border">{{ row.keys }}</kbd>
				<span class="text-muted-foreground">{{ row.action }}</span>
			</li>
		</ul>
	</section>
</template>
