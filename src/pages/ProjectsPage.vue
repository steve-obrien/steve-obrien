<script setup>
const projects = [
	{
		name: 'New Icon',
		blurb: 'Product engineering and strategy focused on practical software.',
		link: 'https://newicon.net',
	},
	{
		name: 'Personal Lab',
		blurb: 'A sandbox for experiments in developer experience and AI tooling.',
		link: '#',
	},
	{
		name: 'Open Source Notes',
		blurb: 'Small utilities and patterns shared in public repositories.',
		link: '#',
	},
];
</script>

<template>
	<SteveLayout>
	<section class="space-y-8">
		<div class="space-y-3">
			<p class="text-xs font-semibold uppercase tracking-[0.18em] text-skin-muted">Projects</p>
			<h1 class="text-4xl font-semibold tracking-tight sm:text-5xl">Selected work</h1>
			<p class="max-w-3xl text-lg leading-relaxed text-skin-secondary">
				A concise set of projects that represent what I care about building.
			</p>
		</div>
		<div class="grid gap-4 sm:grid-cols-2">
			<a
				v-for="project in projects"
				:key="project.name"
				:href="project.link"
				target="_blank"
				rel="noreferrer"
				class="rounded-2xl border border-skin-border bg-skin-surface p-6 transition-colors hover:border-skin-primary"
			>
				<h2 class="text-xl font-semibold tracking-tight">{{ project.name }}</h2>
				<p class="mt-2 text-skin-secondary">{{ project.blurb }}</p>
			</a>
		</div>
	</section>
	</SteveLayout>
</template>
