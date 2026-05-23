<script setup>
import { RouterLink, useRoute } from 'vue-router';
import { computed, onMounted } from 'vue';
import { useTheme } from '../../../composable/useTheme';
import BtnLightDarkMode from '../../../cmp/BtnLightDarkMode.vue';
import { ElPopover } from '../lib/vue';
import { sideNavLinks } from './sideNavLinks';
const { initTheme } = useTheme();
onMounted(() => initTheme());

const route = useRoute();

const topLinks = [
	{ to: '/elements', label: 'Overview', exact: true },
	{ to: '/elements/components/button', label: 'Components', match: '/elements/components' },
	{ to: '/elements/pricing', label: 'Pricing' },
];

const pageTitle = computed(() => {
	if (route.path.includes('/studio')) return 'Studio';
	if (route.path.includes('/playground')) return 'Playground';
	return 'Inspector';
});
</script>

<template>
	<div class="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
		<header class="z-30 shrink-0 border-b border-border/60 bg-background">
			<div class="flex h-12 items-center justify-between gap-4 px-4">
				<div class="flex min-w-0 items-center gap-4">
					<RouterLink to="/elements" class="flex shrink-0 items-center gap-2 text-foreground">
						<span class="grid size-6 place-items-center rounded-md bg-primary text-primary-foreground text-[10px] font-bold tracking-tight">E</span>
						<span class="hidden font-semibold tracking-tight sm:inline">elements</span>
					</RouterLink>
					<span class="hidden h-4 w-px bg-border sm:block" aria-hidden="true"></span>
					<p class="truncate text-sm font-semibold tracking-tight text-foreground">{{ pageTitle }}</p>
				</div>
				<nav class="flex shrink-0 items-center gap-1 text-sm">
					<RouterLink
					v-for="l in topLinks"
					:key="l.to"
					:to="l.to"
					class="hidden rounded-full px-2.5 py-1 text-xs font-medium transition sm:inline"
					:class="(l.exact ? route.path === l.to : route.path.startsWith(l.match || l.to))
						? 'bg-primary text-primary-foreground'
						: 'text-muted-foreground hover:text-foreground'">{{ l.label }}</RouterLink>
					<BtnLightDarkMode />
					<RouterLink
					to="/elements/pricing"
					class="hidden rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:opacity-90 md:inline">Get access</RouterLink>
				</nav>
			</div>
		</header>

		<div class="flex min-h-0 flex-1">
			<main class="flex min-h-0 min-w-0 flex-1 flex-col">
				<slot />
			</main>
		</div>
	</div>
</template>
