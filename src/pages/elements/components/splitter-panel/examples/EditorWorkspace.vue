<script setup>
import { ref } from 'vue';
import { ElSplitterPanel } from '../../../lib/vue';

const left = ref(240);
const right = ref(300);
</script>

<template>
	<div class="w-full overflow-x-auto">
		<ElSplitterPanel
			v-model:start-size="left"
			v-model:end-size="right"
			class="h-[360px] min-w-[860px] overflow-hidden rounded-xl border border-border bg-background text-sm shadow-sm"
			:min-start="180"
			:min-main="360"
			:min-end="240"
		>
			<template #start>
				<aside class="flex h-full flex-col bg-card">
					<header class="border-b border-border px-4 py-3">
						<p class="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Files</p>
					</header>
					<nav class="space-y-1 p-3">
						<button class="flex w-full items-center rounded-md bg-secondary px-3 py-2 text-left font-medium text-secondary-foreground">ProjectDashboard.vue</button>
						<button class="flex w-full items-center rounded-md px-3 py-2 text-left text-muted-foreground hover:bg-secondary">HeroPanel.vue</button>
						<button class="flex w-full items-center rounded-md px-3 py-2 text-left text-muted-foreground hover:bg-secondary">TaskList.vue</button>
					</nav>
				</aside>
			</template>

			<main class="h-full min-w-0 bg-secondary/30 p-5">
				<div class="mx-auto h-full max-w-xl rounded-xl border border-border bg-background p-6 shadow-sm">
					<p class="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Stage</p>
					<h3 class="mt-3 text-2xl font-semibold tracking-tight text-foreground">Visual component preview</h3>
					<p class="mt-2 text-muted-foreground">The center panel stays fluid while the surrounding tools resize.</p>
					<div class="mt-6 grid grid-cols-3 gap-3">
						<div class="rounded-lg border border-border bg-card p-3">
							<p class="text-xs text-muted-foreground">Tasks</p>
							<strong class="mt-2 block text-xl text-foreground">38</strong>
						</div>
						<div class="rounded-lg border border-border bg-card p-3">
							<p class="text-xs text-muted-foreground">Risks</p>
							<strong class="mt-2 block text-xl text-foreground">4</strong>
						</div>
						<div class="rounded-lg border border-border bg-card p-3">
							<p class="text-xs text-muted-foreground">Ready</p>
							<strong class="mt-2 block text-xl text-foreground">82%</strong>
						</div>
					</div>
				</div>
			</main>

			<template #end>
				<aside class="h-full bg-card p-4">
					<p class="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Inspector</p>
					<label class="mt-4 block text-xs font-medium text-muted-foreground">Class</label>
					<div class="mt-2 rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground">grid gap-4 p-6</div>
					<label class="mt-4 block text-xs font-medium text-muted-foreground">Props</label>
					<div class="mt-2 space-y-2">
						<div class="rounded-md border border-border bg-background px-3 py-2 text-muted-foreground">title: Dashboard</div>
						<div class="rounded-md border border-border bg-background px-3 py-2 text-muted-foreground">status: Prototype</div>
					</div>
				</aside>
			</template>
		</ElSplitterPanel>
	</div>
</template>
