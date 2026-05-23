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
		<h3 class="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">{{ title }}</h3>
		<div class="overflow-hidden rounded-2xl border border-border">
			<table class="w-full text-left text-sm">
				<thead class="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
					<tr>
						<th class="px-4 py-2 font-medium">Name</th>
						<th class="px-4 py-2 font-medium">Scope</th>
						<th class="px-4 py-2 font-medium">Description</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-border">
					<tr v-for="s in info.slots" :key="s.name">
						<td class="px-4 py-3 font-mono text-[12.5px] text-foreground">#{{ s.name }}</td>
						<td class="px-4 py-3 font-mono text-[12.5px] text-muted-foreground">{{ s.payload || '—' }}</td>
						<td class="px-4 py-3 text-muted-foreground">{{ s.description || '—' }}</td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>
</template>
