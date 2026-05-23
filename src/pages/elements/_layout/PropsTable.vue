<script setup>
defineProps({
	rows: { type: Array, required: true }, // [{ name, type, default, description }]
	title: { type: String, default: 'Props' },
});
</script>

<template>
	<section class="space-y-3">
		<h3 class="text-sm font-semibold uppercase tracking-[0.18em] text-muted">{{ title }}</h3>
		<div class="overflow-x-auto overflow-y-hidden rounded-2xl border border-border">
			<table class="min-w-full text-left text-sm">
				<thead class="bg-secondary-skin text-xs uppercase tracking-wider text-muted">
					<tr>
						<th class="px-4 py-2 font-medium">Name</th>
						<th class="px-4 py-2 font-medium">Type</th>
						<th class="px-4 py-2 font-medium">Default</th>
						<th class="px-4 py-2 font-medium">Description</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-border">
					<tr v-for="r in rows" :key="r.name">
						<td class="px-4 py-3 font-mono text-[12.5px] text-foreground">{{ r.name }}</td>
						<td class="px-4 py-3 font-mono text-[12.5px] text-secondary">{{ r.type }}</td>
						<td class="px-4 py-3 font-mono text-[12.5px] text-secondary">{{ r.default || '—' }}</td>
						<td class="px-4 py-3 text-secondary">{{ r.description }}</td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>
</template>
