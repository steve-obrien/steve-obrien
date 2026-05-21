<script setup>
import { computed } from 'vue';

const props = defineProps({
	element: { required: true },
	title: { type: String, default: 'Attributes' },
});
const attrs = computed(() => props.element?.__doc?.attributes || []);
const name = computed(() => props.element?.__doc?.name);
</script>

<template>
	<section v-if="attrs.length" class="space-y-3">
		<h3 class="text-sm font-semibold uppercase tracking-[0.18em] text-skin-muted">{{ title }}</h3>
		<div class="overflow-hidden rounded-2xl border border-skin-border">
			<table class="w-full text-left text-sm">
				<thead class="bg-skin-surface text-xs uppercase tracking-wider text-skin-muted">
					<tr>
						<th class="px-4 py-2 font-medium">Name</th>
						<th class="px-4 py-2 font-medium">Type</th>
						<th class="px-4 py-2 font-medium">Description</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-skin-border">
					<tr v-for="a in attrs" :key="a.name">
						<td class="px-4 py-3 font-mono text-[12.5px] text-skin-primary">{{ a.name }}</td>
						<td class="px-4 py-3 font-mono text-[12.5px] text-skin-secondary">{{ a.type || '—' }}</td>
						<td class="px-4 py-3 text-skin-secondary">{{ a.description || '—' }}</td>
					</tr>
				</tbody>
			</table>
		</div>
		<p v-if="name" class="text-[11px] text-skin-muted">
			From <code class="font-mono">{{ name }}.__doc.attributes</code>.
		</p>
	</section>
</template>
