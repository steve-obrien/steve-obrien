<script setup>
defineProps({
	name: { type: String, required: true },
	tagline: { type: String, required: true },
	tag: { type: String, default: '' },
});
</script>

<template>
	<article class="space-y-12">
		<header class="space-y-3 border-b border-skin-border pb-8">
			<p class="text-xs font-semibold uppercase tracking-[0.18em] text-skin-muted">Component</p>
			<div class="flex flex-wrap items-end justify-between gap-4">
				<h1 class="text-4xl font-bold tracking-tight text-skin-primary sm:text-5xl">{{ name }}</h1>
				<code v-if="tag" class="rounded-md bg-skin-surface px-2 py-1 text-xs font-medium text-skin-secondary ring-1 ring-skin-border">{{ tag }}</code>
			</div>
			<p class="max-w-2xl text-lg leading-relaxed text-skin-secondary">{{ tagline }}</p>
		</header>
		<slot />
	</article>
</template>
