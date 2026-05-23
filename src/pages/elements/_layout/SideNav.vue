<script setup>
import { sideNavLinks } from './sideNavLinks';
import { RouterLink, useRoute } from 'vue-router';

const route = useRoute();
</script>

<template>
	<aside>
		<div v-for="(group, gi) in sideNavLinks" :key="group.label" :class="gi > 0 && 'mt-5'">
			<p class="px-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{{ group.label }}</p>
			<nav class="mt-2 space-y-0.5">
				<RouterLink
				v-for="c in group.items"
				:key="c.to"
				:to="c.to"
				class="flex items-center justify-between rounded-lg px-3 py-1.5 text-sm font-medium transition"
				:class="route.path === c.to
					? 'bg-secondary text-secondary-foreground'
					: 'text-muted-foreground hover:bg-secondary hover:text-foreground'">
					<span>{{ c.label }}</span>
					<span v-if="c.tag" class="rounded-full bg-success/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-success dark:text-success">{{ c.tag }}</span>
				</RouterLink>
			</nav>
		</div>
		<div class="mt-8 rounded-2xl border border-border bg-gradient-to-br from-secondary to-transparent p-4">
			<p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pro</p>
			<p class="mt-1 text-sm font-medium text-foreground">Get every blueprint, template &amp; pre-built app.</p>
			<RouterLink to="/elements/pricing" class="mt-3 inline-flex items-center gap-1 text-sm font-medium text-foreground hover:underline">
				View pricing →
			</RouterLink>
		</div>
	</aside>
</template>
