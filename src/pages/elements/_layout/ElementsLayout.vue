<script setup>
import { RouterLink, useRoute } from 'vue-router';
import { computed, onMounted } from 'vue';
import { useTheme } from '../../../composable/useTheme';
import BtnLightDarkMode from '../../../cmp/BtnLightDarkMode.vue';

const props = defineProps({
	fullWidth: { type: Boolean, default: false },
});

const { initTheme } = useTheme();
onMounted(() => initTheme());

const route = useRoute();
const showSidebar = computed(() => !props.fullWidth && (
	route.path.startsWith('/elements/components')
	|| route.path.startsWith('/elements/headless')
));

const componentGroups = [
	{
		label: 'Tooling',
		items: [
			{ to: '/elements/components/studio', label: 'Studio', tag: 'Pro' },
			{ to: '/elements/components/playground', label: 'Playground' },
		],
	},
	{
		label: 'Elements',
		items: [
			{ to: '/elements/components/button', label: 'Button' },
			{ to: '/elements/components/dropdown', label: 'Dropdown' },
			{ to: '/elements/components/dialog', label: 'Dialog' },
			{ to: '/elements/components/tabs', label: 'Tabs' },
			{ to: '/elements/components/toggle', label: 'Toggle' },
			{ to: '/elements/components/tooltip', label: 'Tooltip' },
			{ to: '/elements/components/accordion', label: 'Accordion' },
			{ to: '/elements/components/combobox', label: 'Combobox' },
			{ to: '/elements/components/popover', label: 'Popover', tag: 'New' },
		],
	},
	{
		label: 'Headless',
		items: [
			{ to: '/elements/headless', label: 'Web components' },
		],
	},
	{
		label: 'Forms',
		items: [
			{ to: '/elements/components/text-input', label: 'Text input', tag: 'New' },
			{ to: '/elements/components/textarea-input', label: 'Textarea' },
			{ to: '/elements/components/number-input', label: 'Number input' },
			{ to: '/elements/components/select-input', label: 'Select input' },
			{ to: '/elements/components/boolean-input', label: 'Boolean input' },
			{ to: '/elements/components/color-input', label: 'Color input' },
			{ to: '/elements/components/list-input', label: 'List input' },
		],
	},
];

const topLinks = [
	{ to: '/elements', label: 'Overview', exact: true },
	{ to: '/elements/components/button', label: 'Components', match: '/elements/components' },
	{ to: '/elements/pricing', label: 'Pricing' },
];
</script>

<template>
	<div class="min-h-screen bg-skin-background text-skin-primary">
		<header class="sticky top-0 z-30 border-b border-skin-border/60 bg-skin-background/80 backdrop-blur">
			<div class="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
				<RouterLink to="/elements" class="flex items-center gap-2 text-skin-primary">
					<span class="grid size-7 place-items-center rounded-lg bg-skin-primary text-skin-inverse text-xs font-bold tracking-tight">E</span>
					<span class="font-semibold tracking-tight">elements</span>
					<span class="ml-2 hidden rounded-full bg-skin-surface px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-skin-secondary ring-1 ring-skin-border md:inline">v1.0</span>
				</RouterLink>
				<nav class="flex items-center gap-1 text-sm">
					<RouterLink
						v-for="l in topLinks"
						:key="l.to"
						:to="l.to"
						class="rounded-full px-3 py-1.5 font-medium transition"
						:class="(l.exact ? route.path === l.to : route.path.startsWith(l.match || l.to))
							? 'bg-skin-primary text-skin-inverse'
							: 'text-skin-secondary hover:text-skin-primary'"
					>{{ l.label }}</RouterLink>
					<div class="ml-2 hidden sm:block">
						<BtnLightDarkMode />
					</div>
					<RouterLink
						to="/elements/pricing"
						class="ml-2 hidden rounded-full bg-skin-primary px-3 py-1.5 text-sm font-medium text-skin-inverse hover:opacity-90 sm:inline"
					>Get access</RouterLink>
					<RouterLink
						to="/"
						class="ml-1 hidden text-xs text-skin-muted hover:text-skin-primary lg:inline"
					>← steveobrien.com</RouterLink>
				</nav>
			</div>
		</header>

		<div :class="fullWidth ? 'w-full px-4' : 'mx-auto w-full max-w-7xl px-6'">
			<div class="flex gap-12 py-10" :class="fullWidth && 'py-6'">
				<aside v-if="showSidebar" class="hidden w-56 shrink-0 md:block">
					<div v-for="(group, gi) in componentGroups" :key="group.label" :class="gi > 0 && 'mt-5'">
						<p class="px-3 text-xs font-semibold uppercase tracking-[0.18em] text-skin-muted">{{ group.label }}</p>
						<nav class="mt-2 space-y-0.5">
							<RouterLink
								v-for="c in group.items"
								:key="c.to"
								:to="c.to"
								class="flex items-center justify-between rounded-lg px-3 py-1.5 text-sm font-medium transition"
								:class="route.path === c.to
									? 'bg-skin-surface text-skin-primary'
									: 'text-skin-secondary hover:bg-skin-surface hover:text-skin-primary'"
							>
								<span>{{ c.label }}</span>
								<span v-if="c.tag" class="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{{ c.tag }}</span>
							</RouterLink>
						</nav>
					</div>
					<div class="mt-8 rounded-2xl border border-skin-border bg-gradient-to-br from-skin-surface to-transparent p-4">
						<p class="text-xs font-semibold uppercase tracking-wider text-skin-muted">Pro</p>
						<p class="mt-1 text-sm font-medium text-skin-primary">Get every blueprint, template &amp; pre-built app.</p>
						<RouterLink to="/elements/pricing" class="mt-3 inline-flex items-center gap-1 text-sm font-medium text-skin-primary hover:underline">
							View pricing →
						</RouterLink>
					</div>
				</aside>

				<main class="min-w-0 flex-1">
					<slot />
				</main>
			</div>
		</div>

		<footer class="border-t border-skin-border/60">
			<div class="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-4 px-6 py-10 text-sm text-skin-secondary sm:flex-row sm:items-center">
				<div class="flex items-center gap-3">
					<span class="grid size-6 place-items-center rounded-md bg-skin-primary text-skin-inverse text-[10px] font-bold">E</span>
					<span>© {{ new Date().getFullYear() }} Elements — by Steve O'Brien</span>
				</div>
				<div class="flex items-center gap-5">
					<RouterLink to="/elements" class="hover:text-skin-primary">Overview</RouterLink>
					<RouterLink to="/elements/components/button" class="hover:text-skin-primary">Components</RouterLink>
					<RouterLink to="/elements/pricing" class="hover:text-skin-primary">Pricing</RouterLink>
					<a href="https://github.com/steve-obrien" target="_blank" rel="noopener" class="hover:text-skin-primary">GitHub</a>
				</div>
			</div>
		</footer>
	</div>
</template>
