<script setup>
import { computed } from 'vue';
import { inspectComponent } from './inspect.js';

const props = defineProps({
	component: { required: true },
	title: { type: String, default: 'Slots' },
});
const info = computed(() => inspectComponent(props.component));
</script>

<template>
	<section v-if="info?.slots?.length" class="space-y-3">
		<h3 class="text-sm font-semibold uppercase tracking-[0.18em] text-skin-muted">{{ title }}</h3>
		<div class="overflow-hidden rounded-2xl border border-skin-border">
			<table class="w-full text-left text-sm">
				<thead class="bg-skin-surface text-xs uppercase tracking-wider text-skin-muted">
					<tr>
						<th class="px-4 py-2 font-medium">Name</th>
						<th class="px-4 py-2 font-medium">Scope</th>
						<th class="px-4 py-2 font-medium">Description</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-skin-border">
					<tr v-for="s in info.slots" :key="s.name">
						<td class="px-4 py-3 font-mono text-[12.5px] text-skin-primary">#{{ s.name }}</td>
						<td class="px-4 py-3 font-mono text-[12.5px] text-skin-secondary">{{ s.payload || '—' }}</td>
						<td class="px-4 py-3 text-skin-secondary">{{ s.description || '—' }}</td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>
</template>
