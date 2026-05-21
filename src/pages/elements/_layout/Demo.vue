<script setup>
defineProps({ title: String });
</script>

<template>
	<div class="overflow-hidden rounded-2xl border border-skin-border">
		<div v-if="title" class="border-b border-skin-border bg-skin-surface/60 px-4 py-2 text-xs font-medium uppercase tracking-wider text-skin-muted">{{ title }}</div>
		<div class="flex min-h-[180px] items-center justify-center bg-gradient-to-br from-skin-surface/60 via-skin-background to-skin-surface/40 p-10">
			<slot />
		</div>
	</div>
</template>
