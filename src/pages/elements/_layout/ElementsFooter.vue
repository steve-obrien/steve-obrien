<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
	<footer class="border-t border-border/60">
		<div class="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-4 px-4 py-10 text-sm text-muted-foreground sm:px-6 lg:flex-row lg:items-center">
			<div class="flex min-w-0 items-center gap-3">
				<span class="grid size-6 place-items-center rounded-md bg-primary text-primary-foreground text-[10px] font-bold">E</span>
				<span>© {{ new Date().getFullYear() }} Elements — by Steve O'Brien</span>
			</div>
			<div class="flex max-w-full flex-wrap items-center gap-x-5 gap-y-2">
				<RouterLink to="/elements" class="hover:text-foreground">Overview</RouterLink>
				<RouterLink to="/elements/ai" class="hover:text-foreground">AI</RouterLink>
				<RouterLink to="/elements/theming" class="hover:text-foreground">Theming</RouterLink>
				<RouterLink to="/elements/components/button" class="hover:text-foreground">Components</RouterLink>
				<RouterLink to="/elements/visual/card" class="hover:text-foreground">Visual</RouterLink>
				<RouterLink to="/elements/blocks/dashboard" class="hover:text-foreground">Blocks</RouterLink>
				<RouterLink to="/elements/pricing" class="hover:text-foreground">Pricing</RouterLink>
				<a href="https://github.com/steve-obrien" target="_blank" rel="noopener" class="hover:text-foreground">GitHub</a>
			</div>
		</div>
	</footer>
</template>
