<script setup>
defineProps({
	tags: { type: Array, default: undefined },
});
</script>

<template>
	<ul v-if="tags?.length" aria-label="Technical topics" class="flex flex-wrap gap-2">
		<li v-for="tag in tags" :key="tag" class="rounded-full border border-border px-3 py-1 text-xs leading-5 text-muted-foreground">{{ tag }}</li>
	</ul>
</template>
