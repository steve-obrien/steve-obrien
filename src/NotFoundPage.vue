<script setup>
import { RouterLink } from 'vue-router';
import { onMounted } from 'vue';

onMounted(() => {
	document.title = "Page not found | Steve O'Brien";
});
</script>

<template>
	<SteveLayout>
		<section class="space-y-8">
			<p class="text-xs font-semibold uppercase tracking-[0.18em] text-skin-muted">404</p>
			<h1 class="text-4xl font-semibold tracking-tight sm:text-5xl">Page not found</h1>
			<p class="max-w-3xl text-lg leading-relaxed text-skin-secondary">
				This page could not be found. The link may be outdated, or the page may have moved.
			</p>
			<RouterLink
				to="/"
				class="inline-flex rounded-full border border-skin-border bg-skin-surface px-4 py-2 text-sm font-medium text-skin-primary transition-colors hover:text-skin-secondary"
			>
				Back to home
			</RouterLink>
		</section>
	</SteveLayout>
</template>
