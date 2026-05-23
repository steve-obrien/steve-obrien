<script setup>
import { computed } from 'vue';
import { inspectComponent } from './inspect.js';

const props = defineProps({
	component: { required: true },
	title: { type: String, default: 'Props' },
});
const info = computed(() => inspectComponent(props.component));
</script>

<template>
	<section v-if="info?.props?.length" class="space-y-3">
		<h3 class="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">{{ title }}</h3>
		<div class="overflow-hidden rounded-2xl border border-border">
			<table class="w-full text-left text-sm">
				<thead class="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
					<tr>
						<th class="px-4 py-2 font-medium">Name</th>
						<th class="px-4 py-2 font-medium">Type</th>
						<th class="px-4 py-2 font-medium">Default</th>
						<th class="px-4 py-2 font-medium">Description</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-border">
					<tr v-for="p in info.props" :key="p.name">
						<td class="px-4 py-3 font-mono text-[12.5px] text-foreground">
							<code>{{ p.name }}</code><span v-if="p.required" class="ml-0.5 text-destructive">*</span>
						</td>
						<td class="px-4 py-3 font-mono text-[12.5px] text-muted-foreground">{{ p.type }}</td>
						<td class="px-4 py-3 font-mono text-[12.5px] text-muted-foreground">{{ p.default }}</td>
						<td class="px-4 py-3 text-muted-foreground">{{ p.description || '—' }}</td>
					</tr>
				</tbody>
			</table>
		</div>
		<p class="text-[11px] text-muted-foreground">
			Auto-generated from <code class="font-mono">{{ info.name || 'component' }}.props</code> and inline
			<code class="font-mono">_edit</code> hints.
		</p>
	</section>
</template>
