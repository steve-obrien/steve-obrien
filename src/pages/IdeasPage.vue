<script setup>
const experiments = [
	{
		title: 'Realtime Tools',
		description: 'Prototyping low-latency interfaces for collaborative software.',
		status: 'Active',
	},
	{
		title: 'AI-Augmented Docs',
		description: 'Exploring documentation that adapts to user intent.',
		status: 'Exploring',
	},
	{
		title: 'Design Tokens Lab',
		description: 'Testing scalable systems for clean, accessible UI themes.',
		status: 'Paused',
	},
];
</script>

<template>
	<SteveLayout>
	<section class="space-y-8">
		<div class="space-y-3">
			<p class="text-xs font-semibold uppercase tracking-[0.18em] text-skin-muted">Experiments</p>
			<h1 class="text-4xl font-semibold tracking-tight sm:text-5xl">What I'm testing</h1>
			<p class="max-w-3xl text-lg leading-relaxed text-skin-secondary">
				A running list of ideas. I may do or may not.
			</p>
		</div>
		<div class="space-y-4">
			<article
				v-for="experiment in experiments"
				:key="experiment.title"
				class="rounded-2xl border border-skin-border bg-skin-surface p-6"
			>
				<div class="flex items-start justify-between gap-4">
					<div>
						<h2 class="text-xl font-semibold tracking-tight">{{ experiment.title }}</h2>
						<p class="mt-2 text-skin-secondary">{{ experiment.description }}</p>
					</div>
					<span class="rounded-full border border-skin-border px-3 py-1 text-xs uppercase tracking-wide text-skin-muted">
						{{ experiment.status }}
					</span>
				</div>
			</article>
		</div>
	</section>
	</SteveLayout>
</template>
