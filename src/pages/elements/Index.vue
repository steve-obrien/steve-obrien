<script setup>
import { RouterLink } from 'vue-router';
import ElementsLayout from './_layout/ElementsLayout.vue';
import { ElButton, ElDropdown, ElToggle, ElTooltip } from './lib/vue';
import { ref } from 'vue';

const toggle = ref(true);
const features = [
	{
		title: 'Headless web components',
		body: 'Behaviour ships as plain custom elements — <element-dropdown>, <element-dialog> — that work in any HTML, with no framework lock-in.',
	},
	{
		title: 'First-class Vue integration',
		body: 'A thin Vue layer wraps every primitive so you get reactive props, v-model, and slots — without re-implementing keyboard and ARIA.',
	},
	{
		title: 'Tailwind CSS 4 ready',
		body: 'Styled with semantic skin tokens so the same components look right in light, dark, and your own brand themes.',
	},
	{
		title: 'Accessibility, by default',
		body: 'WAI-ARIA roles, focus management, keyboard navigation, and screen-reader behaviour are part of every primitive.',
	},
	{
		title: 'Tree-shakeable, tiny',
		body: 'Import only what you need. Each headless module averages under 2kb gzipped — no runtime style framework.',
	},
	{
		title: 'Production-grade primitives',
		body: 'Dropdowns, dialogs, tabs, comboboxes, toggles, tooltips, accordions — all crafted to ship in real products.',
	},
];

const components = [
	{ name: 'Button', tag: 'el-button', to: '/elements/components/button' },
	{ name: 'Dropdown', tag: 'element-dropdown', to: '/elements/components/dropdown' },
	{ name: 'Dialog', tag: 'element-dialog', to: '/elements/components/dialog' },
	{ name: 'Tabs', tag: 'element-tabs', to: '/elements/components/tabs' },
	{ name: 'Toggle', tag: 'element-toggle', to: '/elements/components/toggle' },
	{ name: 'Tooltip', tag: 'element-tooltip', to: '/elements/components/tooltip' },
	{ name: 'Accordion', tag: 'element-accordion', to: '/elements/components/accordion' },
	{ name: 'Combobox', tag: 'element-combobox', to: '/elements/components/combobox' },
];
</script>

<template>
	<ElementsLayout>
		<section class="relative -mt-6 pb-20 pt-10">
			<div class="absolute inset-x-0 top-0 -z-10 mx-auto h-72 w-3/4 rounded-full bg-gradient-to-br from-skin-primary/10 via-skin-primary/5 to-transparent blur-3xl"></div>
			<div class="mx-auto max-w-3xl text-center">
				<p class="text-xs font-semibold uppercase tracking-[0.22em] text-skin-muted">A component library worth owning</p>
				<h1 class="mt-4 text-5xl font-bold leading-[1.05] tracking-tight text-skin-primary sm:text-6xl">
					Build interfaces that <span class="italic">feel</span> high-end.
				</h1>
				<p class="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-skin-secondary">
					<strong class="text-skin-primary">elements</strong> is a professional component library: headless web component primitives, a polished Vue layer, and Tailwind CSS 4 styling. Designed for serious products.
				</p>
				<div class="mt-8 flex flex-wrap items-center justify-center gap-3">
					<ElButton :as="'router-link'" :to="'/elements/components/button'" variant="primary" size="lg">Browse components</ElButton>
					<ElButton :as="'router-link'" :to="'/elements/pricing'" variant="secondary" size="lg">See pricing →</ElButton>
				</div>
			</div>

			<div class="mx-auto mt-16 max-w-4xl rounded-3xl border border-skin-border bg-skin-surface/40 p-8 shadow-xl shadow-black/[0.04] ring-1 ring-black/[0.02]">
				<div class="flex items-center justify-between border-b border-skin-border pb-4 text-xs uppercase tracking-wider text-skin-muted">
					<span>Live preview</span>
					<span>elements / playground</span>
				</div>
				<div class="grid grid-cols-1 items-center gap-8 py-8 sm:grid-cols-3">
					<div class="flex flex-col items-start gap-3">
						<span class="text-xs font-medium uppercase tracking-wider text-skin-muted">Button</span>
						<ElButton variant="primary">Get started</ElButton>
					</div>
					<div class="flex flex-col items-start gap-3">
						<span class="text-xs font-medium uppercase tracking-wider text-skin-muted">Dropdown</span>
						<ElDropdown :items="[{ label: 'Profile', value: 'p' }, { label: 'Billing', value: 'b' }, { label: 'Sign out', value: 'o' }]" label="Account" />
					</div>
					<div class="flex flex-col items-start gap-3">
						<span class="text-xs font-medium uppercase tracking-wider text-skin-muted">Toggle</span>
						<ElToggle v-model="toggle" label="Notifications" />
					</div>
				</div>
			</div>
		</section>

		<section class="border-t border-skin-border py-20">
			<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				<div v-for="f in features" :key="f.title" class="rounded-2xl border border-skin-border bg-skin-background p-6">
					<h3 class="text-base font-semibold tracking-tight text-skin-primary">{{ f.title }}</h3>
					<p class="mt-2 text-sm leading-relaxed text-skin-secondary">{{ f.body }}</p>
				</div>
			</div>
		</section>

		<section class="border-t border-skin-border py-20">
			<div class="mb-10 flex items-end justify-between">
				<div>
					<p class="text-xs font-semibold uppercase tracking-[0.18em] text-skin-muted">Library</p>
					<h2 class="mt-1 text-3xl font-bold tracking-tight text-skin-primary">Every primitive you need.</h2>
				</div>
				<RouterLink to="/elements/components/button" class="text-sm font-medium text-skin-primary hover:underline">Browse all →</RouterLink>
			</div>
			<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
				<RouterLink
					v-for="c in components"
					:key="c.tag"
					:to="c.to"
					class="group flex items-center justify-between rounded-xl border border-skin-border bg-skin-background p-4 transition hover:-translate-y-0.5 hover:border-skin-primary/40 hover:shadow-lg"
				>
					<div>
						<p class="text-sm font-semibold tracking-tight text-skin-primary">{{ c.name }}</p>
						<code class="text-[11px] text-skin-muted">&lt;{{ c.tag }}&gt;</code>
					</div>
					<span class="text-skin-muted transition group-hover:translate-x-0.5 group-hover:text-skin-primary">→</span>
				</RouterLink>
			</div>
		</section>

		<section class="border-t border-skin-border py-20 text-center">
			<h2 class="text-3xl font-bold tracking-tight text-skin-primary sm:text-4xl">Ready to ship interfaces that feel right?</h2>
			<p class="mx-auto mt-3 max-w-xl text-skin-secondary">Pro adds blueprints, real app templates, and the components teams reach for first.</p>
			<div class="mt-6 flex items-center justify-center gap-3">
				<ElButton :as="'router-link'" :to="'/elements/pricing'" size="lg">Get access</ElButton>
				<ElTooltip text="Open-source primitives included" placement="bottom">
					<ElButton :as="'router-link'" :to="'/elements/components/button'" variant="ghost" size="lg">Try the free tier</ElButton>
				</ElTooltip>
			</div>
		</section>
	</ElementsLayout>
</template>
