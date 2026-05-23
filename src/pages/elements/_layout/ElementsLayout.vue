<script setup>
import { RouterLink, useRoute } from 'vue-router';
import { computed, onMounted, ref } from 'vue';
import { useTheme } from '../../../composable/useTheme';
import BtnLightDarkMode from '../../../cmp/BtnLightDarkMode.vue';
import { ElDrawer, ElButton } from '@elements/vue';
import SideNav from './SideNav.vue';

const props = defineProps({
	fullWidth: { type: Boolean, default: false },
});

const { initTheme } = useTheme();
onMounted(() => initTheme());

const route = useRoute();
// Sidebar reads from nav.js — show on all elements doc pages except pricing.
const showSidebar = computed(() => !props.fullWidth && (
	route.path.startsWith('/elements')
	&& route.path !== '/elements/pricing'
));


const topLinks = [
	{ to: '/elements', label: 'Overview', exact: true },
	{ to: '/elements/theming', label: 'Theming' },
	{ to: '/elements/components/button', label: 'Components', match: '/elements/components' },
	{ to: '/elements/visual/card', label: 'Visual', match: '/elements/visual' },
	{ to: '/elements/pricing', label: 'Pricing' },
];

const mobileMenuOpen = ref(false);
</script>

<template>
	<div class="min-h-screen bg-background text-foreground">
		<header class="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
			<div class="mx-auto flex h-16 w-full items-center justify-between px-6">
				<RouterLink to="/elements" class="flex items-center gap-2 text-foreground">
					<span class="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground text-xs font-bold tracking-tight">E</span>
					<span class="font-semibold tracking-tight">elements</span>
					<span class="ml-2 hidden rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground ring-1 ring-border md:inline">v1.0</span>
				</RouterLink>
				<!-- Mobile menu-->
				<ElButton variant="secondary" @click="mobileMenuOpen = true">Menu</ElButton>
				<Teleport to="body">
					<ElDrawer v-model="mobileMenuOpen" side="left" title="Filters" width="var(--container-xs)">
						<div class="space-y-4 p-4 text-sm text-muted-foreground">
							<SideNav v-if="showSidebar" class="block w-56 shrink-0 " />
						</div>
					</ElDrawer>
				</Teleport>
					<nav class=" items-center gap-1 text-sm hidden sm:flex">
					<RouterLink
						v-for="l in topLinks"
						:key="l.to"
						:to="l.to"
						class="rounded-full px-3 py-1.5 font-medium transition"
						:class="(l.exact ? route.path === l.to : route.path.startsWith(l.match || l.to))
							? 'bg-primary text-primary-foreground'
							: 'text-muted-foreground hover:text-foreground'"
					>{{ l.label }}</RouterLink>
					<div class="ml-2 hidden sm:block">
						<BtnLightDarkMode />
					</div>
					<RouterLink
						to="/elements/pricing"
						class="ml-2 hidden sm:inline not-first:rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 "
					>Get access</RouterLink>
					<RouterLink
						to="/"
						class="ml-1 hidden lg:inline text-xs text-muted-foreground hover:text-foreground "
					>← steveobrien.com</RouterLink>
				</nav>
			</div>
		</header>

		<div class="w-full px-4">
			<div class="flex gap-12 py-10" :class="fullWidth && 'py-6'">
				<SideNav v-if="showSidebar" class="hidden w-56 shrink-0 md:block" />

				<main class="min-w-0  flex-1 ">
					<div class="mx-auto w-full max-w-4xl px-6">
					<slot />
					</div>
				</main>
			</div>
		</div>

		<footer class="border-t border-border/60">
			<div class="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-4 px-6 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center">
				<div class="flex items-center gap-3">
					<span class="grid size-6 place-items-center rounded-md bg-primary text-primary-foreground text-[10px] font-bold">E</span>
					<span>© {{ new Date().getFullYear() }} Elements — by Steve O'Brien</span>
				</div>
				<div class="flex items-center gap-5">
					<RouterLink to="/elements" class="hover:text-foreground">Overview</RouterLink>
					<RouterLink to="/elements/theming" class="hover:text-foreground">Theming</RouterLink>
					<RouterLink to="/elements/components/button" class="hover:text-foreground">Components</RouterLink>
					<RouterLink to="/elements/visual/card" class="hover:text-foreground">Visual</RouterLink>
					<RouterLink to="/elements/pricing" class="hover:text-foreground">Pricing</RouterLink>
					<a href="https://github.com/steve-obrien" target="_blank" rel="noopener" class="hover:text-foreground">GitHub</a>
				</div>
			</div>
		</footer>
	</div>
</template>
