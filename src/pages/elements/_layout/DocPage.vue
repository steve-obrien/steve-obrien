<script setup>
defineProps({
	name: { type: String, required: true },
	tagline: { type: String, required: true },
	tag: { type: String, default: '' },
	eyebrow: { type: String, default: 'Component' },
});
</script>

<template>
	<article class="space-y-12">
		<header class="space-y-3 border-b border-border pb-8">
			<p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{{ eyebrow }}</p>
			<div class="flex flex-wrap items-end justify-between gap-4">
				<h1 class="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{{ name }}</h1>
				<code v-if="tag" class="rounded-md bg-secondary-skin px-2 py-1 text-xs font-medium text-secondary ring-1 ring-border">{{ tag }}</code>
			</div>
			<p class="max-w-2xl text-lg leading-relaxed text-secondary">{{ tagline }}</p>
		</header>
		<slot />
	</article>
</template>
