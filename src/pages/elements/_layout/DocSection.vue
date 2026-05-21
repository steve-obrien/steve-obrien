<script setup>
defineProps({ title: String, eyebrow: String });
</script>

<template>
	<section class="space-y-4">
		<div v-if="title || eyebrow" class="space-y-1">
			<p v-if="eyebrow" class="text-xs font-semibold uppercase tracking-[0.18em] text-skin-muted">{{ eyebrow }}</p>
			<h2 v-if="title" class="text-2xl font-semibold tracking-tight text-skin-primary">{{ title }}</h2>
		</div>
		<slot />
	</section>
</template>
