<script setup>
import { ElPopover } from '@elements/vue';
</script>

<template>
	<ElPopover
		trigger="hover"
		position="top"
		width="w-72"
		padding="p-0"
	>
		<template #trigger>
			<span class="inline-flex h-10 items-center gap-2 rounded-full bg-secondary px-4 text-sm font-medium text-foreground ring-1 ring-border transition hover:bg-accent">
				<span class="size-2 rounded-full bg-success"></span>
				Status
			</span>
		</template>

		<div class="p-4">
			<div class="flex items-center gap-3">
				<span class="grid size-9 shrink-0 place-items-center rounded-full bg-success/15 text-success">
					<svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
						<path d="M20 6 9 17l-5-5" />
					</svg>
				</span>
				<div class="min-w-0">
					<p class="text-sm font-semibold text-foreground">Deployment healthy</p>
					<p class="mt-0.5 text-xs text-muted-foreground">Last checked 2 minutes ago</p>
				</div>
			</div>
			<div class="mt-4 grid grid-cols-2 gap-3 text-xs">
				<div>
					<p class="text-muted-foreground">Latency</p>
					<p class="mt-1 font-medium text-foreground">42 ms</p>
				</div>
				<div>
					<p class="text-muted-foreground">Error rate</p>
					<p class="mt-1 font-medium text-foreground">0.02%</p>
				</div>
			</div>
		</div>
	</ElPopover>
</template>
