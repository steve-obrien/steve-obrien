<script setup>
defineProps({
	eyebrow: { type: String, default: 'Mobile' },
	title: { type: String, required: true },
	description: { type: String, required: true },
});
</script>

<template>
	<section class="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-start">
		<div class="min-w-0 space-y-4">
			<div class="space-y-2">
				<p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{{ eyebrow }}</p>
				<h2 class="text-2xl font-semibold tracking-tight text-foreground">{{ title }}</h2>
				<p class="max-w-2xl text-sm leading-6 text-muted-foreground">{{ description }}</p>
			</div>
			<slot name="notes" />
		</div>
		<div class="min-w-0 lg:sticky lg:top-8">
			<slot />
		</div>
	</section>
</template>
