<script setup>
defineProps({
	title: { type: String, default: '' },
	device: { type: String, default: 'Elements Phone' },
});
</script>

<template>
	<div class="mx-auto w-full max-w-[22rem] sm:max-w-[25rem]">
		<div v-if="title" class="mb-3 flex items-center justify-between px-1">
			<p class="text-sm font-semibold tracking-tight text-foreground">{{ title }}</p>
			<p class="hidden text-xs text-muted-foreground sm:block">{{ device }}</p>
		</div>
		<div class="rounded-[3rem] border border-border bg-foreground p-2.5 shadow-2xl shadow-black/20">
			<div class="relative overflow-hidden rounded-[2.35rem] border border-border bg-background">
				<div class="absolute left-1/2 top-2 z-20 h-6 w-24 -translate-x-1/2 rounded-full bg-foreground"></div>
				<div class="absolute left-1/2 top-3 z-30 h-1.5 w-10 -translate-x-1/2 rounded-full bg-background/25"></div>
				<div class="h-[34rem] overflow-hidden sm:h-[38rem]">
					<slot />
				</div>
			</div>
		</div>
	</div>
</template>
