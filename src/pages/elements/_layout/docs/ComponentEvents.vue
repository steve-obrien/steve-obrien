<script setup>
import { computed } from 'vue';
import { inspectComponent } from './inspect.js';

const props = defineProps({
	component: { required: true },
	title: { type: String, default: 'Events' },
	// Vue-side events are listened to with `@select` — that's the natural prefix.
	// Headless / web-component events use plain names (`el:open`), so pass `prefix=""`.
	prefix: { type: String, default: '@' },
});
const info = computed(() => inspectComponent(props.component));
</script>

<template>
	<section v-if="info?.events?.length" class="space-y-3">
		<h3 class="text-sm font-semibold uppercase tracking-[0.18em] text-skin-muted">{{ title }}</h3>
		<div class="overflow-hidden rounded-2xl border border-skin-border">
			<table class="w-full text-left text-sm">
				<thead class="bg-skin-surface text-xs uppercase tracking-wider text-skin-muted">
					<tr>
						<th class="px-4 py-2 font-medium">Name</th>
						<th class="px-4 py-2 font-medium">Payload</th>
						<th class="px-4 py-2 font-medium">Description</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-skin-border">
					<tr v-for="e in info.events" :key="e.name">
						<td class="px-4 py-3 font-mono text-[12.5px] text-skin-primary">{{ prefix }}{{ e.name }}</td>
						<td class="px-4 py-3 font-mono text-[12.5px] text-skin-secondary">{{ e.payload || '—' }}</td>
						<td class="px-4 py-3 text-skin-secondary">{{ e.description || '—' }}</td>
					</tr>
				</tbody>
			</table>
		</div>
		<p class="text-[11px] text-skin-muted">
			Names auto-detected from <code class="font-mono">defineEmits</code>; payload and description from
			<code class="font-mono">__doc.events</code>.
		</p>
	</section>
</template>
