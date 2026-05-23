<script setup>
import { ElButton, ElCard } from '../../../lib/vue';
</script>

<template>
	<ElCard class="max-w-sm">
		<div class="space-y-4">
			<div>
				<p class="text-sm font-medium text-muted-foreground">Workspace</p>
				<h3 class="mt-1 text-xl font-semibold tracking-tight">Design system audit</h3>
				<p class="mt-2 text-sm leading-6 text-muted-foreground">
					Review token usage and component coverage before the next release.
				</p>
			</div>
			<div class="flex items-center justify-between border-t border-border pt-4">
				<span class="rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium text-success">On track</span>
				<ElButton variant="secondary" size="sm">Open</ElButton>
			</div>
		</div>
	</ElCard>
</template>
