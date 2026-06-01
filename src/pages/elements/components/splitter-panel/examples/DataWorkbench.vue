<script setup>
import { ref } from 'vue';
import { ElSplitterPanel } from '../../../lib/vue';

const side = ref(220);
const details = ref(260);
</script>

<template>
	<div class="w-full overflow-x-auto">
		<ElSplitterPanel
			v-model:start-size="side"
			v-model:end-size="details"
			class="h-[340px] min-w-[820px] overflow-hidden rounded-xl border border-border bg-background text-sm shadow-sm"
			:min-start="180"
			:min-main="260"
			:min-end="220"
		>
			<template #start>
				<aside class="h-full bg-card p-4">
					<p class="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Sources</p>
					<div class="mt-4 space-y-2">
						<div class="rounded-md bg-secondary px-3 py-2 font-medium text-secondary-foreground">projects</div>
						<div class="rounded-md px-3 py-2 text-muted-foreground">tasks</div>
						<div class="rounded-md px-3 py-2 text-muted-foreground">users</div>
					</div>
				</aside>
			</template>

			<main class="h-full min-w-0 overflow-auto p-5">
				<table class="w-full min-w-[420px] text-left">
					<thead class="text-xs uppercase tracking-[0.14em] text-muted-foreground">
						<tr>
							<th class="border-b border-border py-2">Project</th>
							<th class="border-b border-border py-2">Owner</th>
							<th class="border-b border-border py-2">Status</th>
						</tr>
					</thead>
					<tbody class="text-foreground">
						<tr>
							<td class="border-b border-border py-3">Launch OS</td>
							<td class="border-b border-border py-3">Product</td>
							<td class="border-b border-border py-3">Prototype</td>
						</tr>
						<tr>
							<td class="border-b border-border py-3">Editor shell</td>
							<td class="border-b border-border py-3">Design</td>
							<td class="border-b border-border py-3">Review</td>
						</tr>
						<tr>
							<td class="border-b border-border py-3">Data sync</td>
							<td class="border-b border-border py-3">Platform</td>
							<td class="border-b border-border py-3">Planned</td>
						</tr>
					</tbody>
				</table>
			</main>

			<template #end>
				<aside class="h-full bg-card p-4">
					<p class="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Row details</p>
					<h3 class="mt-4 font-semibold text-foreground">Launch OS</h3>
					<p class="mt-2 leading-6 text-muted-foreground">Resizable detail panes work well for database browsers, API explorers, and admin tools.</p>
				</aside>
			</template>
		</ElSplitterPanel>
	</div>
</template>
