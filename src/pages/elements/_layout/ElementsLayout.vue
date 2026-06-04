<script setup>
import { RouterLink, useRoute } from 'vue-router';
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useTheme } from '../../../composable/useTheme';
import BtnLightDarkMode from '../../../cmp/BtnLightDarkMode.vue';
import { ElDrawer, ElButton } from '@elements/vue';
import SideNav from './SideNav.vue';
import ElementsFooter from './ElementsFooter.vue';

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
	{ to: '/elements/ai', label: 'AI' },
	{ to: '/elements/theming', label: 'Theming' },
	{ to: '/elements/components/button', label: 'Components', match: '/elements/components' },
	{ to: '/elements/visual/card', label: 'Visual', match: '/elements/visual' },
	{ to: '/elements/blocks/dashboard', label: 'Blocks', match: '/elements/blocks' },
	{ to: '/elements/pricing', label: 'Pricing' },
];

const mobileMenuOpen = ref(false);
const detailsPanel = ref(null);

function scrollDetailsToTop() {
	if (detailsPanel.value) detailsPanel.value.scrollTo({ top: 0 });
}

watch(() => route.fullPath, async () => {
	await nextTick();
	scrollDetailsToTop();
});
</script>

<template>
	<div class="min-h-screen bg-background text-foreground">
		<header class="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
			<div class="mx-auto flex h-16 w-full min-w-0 items-center justify-between gap-3 px-4 sm:px-6">
				<RouterLink to="/elements" class="flex min-w-0 items-center gap-2 text-foreground">
					<span class="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground text-xs font-bold tracking-tight">E</span>
					<span class="truncate font-semibold tracking-tight">elements</span>
					<span class="ml-2 hidden rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground ring-1 ring-border md:inline">v1.0</span>
				</RouterLink>
				<!-- Mobile menu-->
				<ElButton class="shrink-0 md:hidden" variant="secondary" @click="mobileMenuOpen = true">Menu</ElButton>
				<Teleport to="body">
					<ElDrawer v-model="mobileMenuOpen" side="left" title="Menu" width="min(88vw, var(--container-xs))">
						<div class="space-y-6 p-4 text-sm text-muted-foreground">
							<nav class="grid gap-1">
								<RouterLink
									v-for="l in topLinks"
									:key="l.to"
									:to="l.to"
									class="rounded-lg px-3 py-2 font-medium transition"
									:class="(l.exact ? route.path === l.to : route.path.startsWith(l.match || l.to))
										? 'bg-primary text-primary-foreground'
										: 'text-muted-foreground hover:bg-secondary hover:text-foreground'"
									@click="mobileMenuOpen = false"
								>{{ l.label }}</RouterLink>
							</nav>
							<SideNav v-if="showSidebar" class="block w-full shrink-0" />
						</div>
					</ElDrawer>
				</Teleport>
				<nav class="hidden min-w-0 items-center gap-1 text-sm md:flex">
					<RouterLink
						v-for="l in topLinks"
						:key="l.to"
						:to="l.to"
						class="rounded-full px-3 py-1.5 font-medium transition"
						:class="(l.exact ? route.path === l.to : route.path.startsWith(l.match || l.to))
							? 'bg-primary text-primary-foreground'
							: 'text-muted-foreground hover:text-foreground'"
					>{{ l.label }}</RouterLink>
					<div class="ml-2">
						<BtnLightDarkMode />
					</div>
					<RouterLink
						to="/elements/pricing"
						class="ml-2 rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
					>Get access</RouterLink>
					<RouterLink
						to="/"
						class="ml-1 hidden lg:inline text-xs text-muted-foreground hover:text-foreground "
					>← steveobrien.com</RouterLink>
				</nav>
			</div>
		</header>

		<div v-if="showSidebar" class="w-full px-4">
			<div class="flex gap-12 py-10 md:h-[calc(100vh-4rem)] md:overflow-hidden md:py-0">
				<SideNav persist-scroll class="hidden w-56 shrink-0 md:block md:h-full md:overflow-y-auto md:py-10 md:pr-2" />

				<main ref="detailsPanel" class="min-w-0 flex-1 md:h-full md:overflow-y-auto md:py-10 md:pr-2">
					<div class="mx-auto w-full max-w-4xl">
						<slot />
					</div>
					<ElementsFooter class="mt-16" />
				</main>
			</div>
		</div>

		<div v-else class="w-full px-4">
			<div class="flex gap-12 py-10" :class="fullWidth && 'py-6'">
				<main class="min-w-0 flex-1">
					<div class="mx-auto w-full max-w-4xl">
						<slot />
					</div>
				</main>
			</div>
		</div>

		<ElementsFooter v-if="!showSidebar" />
	</div>
</template>
