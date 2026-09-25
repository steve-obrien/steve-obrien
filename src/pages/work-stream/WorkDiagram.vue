<script setup>
defineProps({ diagram: { type: Object, required: true } });
</script>

<template>
	<figure class="my-12 rounded-2xl border border-border bg-muted/30 px-6 py-8 sm:px-9 sm:py-10" aria-label="Technical explanation">
		<div class="max-w-xl space-y-3">
			<p class="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{{ diagram.label }}</p>
			<h2 class="text-2xl font-medium leading-snug tracking-tight">{{ diagram.title }}</h2>
			<p class="text-sm leading-6 text-muted-foreground">{{ diagram.intro }}</p>
		</div>
		<ol class="my-9 grid gap-8 sm:grid-cols-3 sm:gap-6">
			<li v-for="(step, index) in diagram.steps" :key="index" class="relative min-w-0">
				<div class="mb-5 flex items-center gap-3" aria-hidden="true">
					<span class="flex size-8 shrink-0 items-center justify-center rounded-full border border-foreground/25 text-xs font-medium tabular-nums">{{ String(index + 1).padStart(2, '0') }}</span>
					<span v-if="index < diagram.steps.length - 1" class="hidden h-px flex-1 bg-foreground/20 sm:block"></span>
					<span v-if="index < diagram.steps.length - 1" class="hidden text-sm text-muted-foreground sm:block">→</span>
				</div>
				<p class="mb-2 font-mono text-[11px] leading-5 text-muted-foreground">{{ step.label }}</p>
				<h3 class="mb-3 text-base font-semibold leading-6">{{ step.title }}</h3>
				<p class="text-sm leading-6 text-muted-foreground">{{ step.detail }}</p>
			</li>
		</ol>
		<div class="border-t border-border pt-6">
			<p class="text-base font-medium leading-7">{{ diagram.result }}</p>
			<figcaption class="mt-3 text-xs leading-5 text-muted-foreground">{{ diagram.caption }}</figcaption>
		</div>
	</figure>
</template>
