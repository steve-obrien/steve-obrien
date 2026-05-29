<script setup>
import { ref } from 'vue';
import { ElSplitterPanel } from '../../../lib/vue';

const listWidth = ref(280);
</script>

<template>
	<div class="w-full overflow-x-auto">
		<ElSplitterPanel
			v-model:start-size="listWidth"
			class="h-[320px] min-w-[720px] overflow-hidden rounded-xl border border-border bg-background text-sm shadow-sm"
			:min-start="220"
			:min-main="360"
		>
			<template #start>
				<aside class="h-full border-r border-border bg-card">
					<header class="border-b border-border px-4 py-3">
						<p class="font-semibold text-foreground">Inbox</p>
						<p class="text-xs text-muted-foreground">Drag the divider to widen the message list.</p>
					</header>
					<div class="divide-y divide-border">
						<button class="block w-full bg-secondary px-4 py-3 text-left">
							<span class="block font-medium text-foreground">Design review</span>
							<span class="mt-1 block truncate text-xs text-muted-foreground">Hero component feedback and launch copy.</span>
						</button>
						<button class="block w-full px-4 py-3 text-left hover:bg-secondary/70">
							<span class="block font-medium text-foreground">Build notes</span>
							<span class="mt-1 block truncate text-xs text-muted-foreground">Template editor syncing checklist.</span>
						</button>
						<button class="block w-full px-4 py-3 text-left hover:bg-secondary/70">
							<span class="block font-medium text-foreground">Release plan</span>
							<span class="mt-1 block truncate text-xs text-muted-foreground">Tasks to close before the demo.</span>
						</button>
					</div>
				</aside>
			</template>

			<article class="h-full min-w-0 overflow-y-auto p-6">
				<p class="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Design review</p>
				<h3 class="mt-2 text-2xl font-semibold tracking-tight text-foreground">The template editor feels clearer with resizable tools.</h3>
				<p class="mt-3 leading-7 text-muted-foreground">
					Two-pane splitters are useful when the primary content should stay dominant, but a navigation or list panel still needs manual control.
				</p>
			</article>
		</ElSplitterPanel>
	</div>
</template>
