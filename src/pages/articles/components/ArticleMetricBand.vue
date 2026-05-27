<script setup>
defineProps({
	eyebrow: {
		type: String,
		default: 'Article component',
	},
	title: {
		type: String,
		default: 'A Vue-owned section inside markdown',
	},
	body: {
		type: String,
		default: 'Use components for interactive demos, embedded tools, charts, or anything that needs more structure than prose.',
	},
});

const metrics = [
	{
		value: '01',
		label: 'Markdown stays readable',
	},
	{
		value: '02',
		label: 'Components stay maintainable',
	},
	{
		value: '03',
		label: 'Layouts choose article or page width',
	},
];
</script>

<template>
	<section class="article-metric-band">
		<div class="space-y-3">
			<p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{{ eyebrow }}</p>
			<h2 class="max-w-3xl font-serif text-3xl font-normal leading-tight tracking-normal text-foreground sm:text-5xl">
				{{ title }}
			</h2>
			<p class="max-w-2xl text-base leading-8 text-muted-foreground">
				{{ body }}
			</p>
		</div>
		<div class="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
			<div
				v-for="metric in metrics"
				:key="metric.value"
				class="bg-background p-5"
			>
				<p class="font-serif text-3xl text-foreground">{{ metric.value }}</p>
				<p class="mt-2 text-sm leading-6 text-muted-foreground">{{ metric.label }}</p>
			</div>
		</div>
	</section>
</template>

<style scoped>
.article-metric-band {
	background:
		linear-gradient(
			135deg,
			color-mix(in oklch, var(--secondary) 88%, transparent),
			color-mix(in oklch, var(--background) 96%, white 4%)
		);
	border: 1px solid var(--border);
	border-radius: 0.5rem;
	display: grid;
	gap: 2rem;
	padding: clamp(1.5rem, 4vw, 3rem);
}
</style>
