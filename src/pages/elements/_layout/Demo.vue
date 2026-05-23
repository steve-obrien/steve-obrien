<script setup>
defineProps({ title: String });
</script>

<template>
	<div class="overflow-hidden rounded-2xl border border-border">
		<div v-if="title" class="border-b border-border bg-secondary/60 px-4 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">{{ title }}</div>
		<div class="flex min-h-[180px] items-center justify-center bg-gradient-to-br from-secondary/60 via-background to-secondary/40 p-10">
			<slot />
		</div>
	</div>
</template>
