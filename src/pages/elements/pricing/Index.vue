<script setup>
import { RouterLink } from 'vue-router';
import ElementsLayout from '../_layout/ElementsLayout.vue';
import { ElButton, ElAccordion } from '../lib/vue';

const tiers = [
	{
		name: 'Starter',
		tagline: 'For solo builders and side projects.',
		price: 0,
		priceLabel: 'Free',
		priceSuffix: null,
		cta: 'Start free',
		ctaTo: '/elements/components/button',
		ctaVariant: 'secondary',
		features: [
			'All 8 open-source components',
			'Headless web component primitives',
			'Vue integration layer',
			'Tailwind CSS 4 styling',
			'MIT licensed for personal use',
		],
	},
	{
		name: 'Pro',
		tagline: 'For makers and teams shipping serious products.',
		price: 149,
		priceLabel: null,
		priceSuffix: 'one-time · lifetime',
		cta: 'Get lifetime access',
		ctaTo: '#checkout',
		ctaVariant: 'primary',
		highlight: true,
		features: [
			'Everything in Starter — forever',
			'Premium components: data grid, command palette, file uploader, date range picker, charts',
			'Real-app blueprints (admin, billing, settings, onboarding)',
			'Figma source files and design tokens',
			'Private GitHub repo with semver releases',
			'Lifetime updates — every new release, included',
		],
	},
	{
		name: 'Studio',
		tagline: 'For agencies and product studios.',
		price: 499,
		priceLabel: null,
		priceSuffix: 'one-time · lifetime · unlimited seats',
		cta: 'Get Studio',
		ctaTo: '#checkout',
		ctaVariant: 'secondary',
		features: [
			'Everything in Pro',
			'Unlimited team seats inside your company',
			'Client-project licence — ship into customer codebases',
			'Custom theming and brand kit',
			'Private Slack channel',
			'Annual architecture review with Steve',
		],
	},
];

const proPerks = [
	{ title: 'Real app templates', body: 'Production-grade scaffolds for admin dashboards, billing portals, onboarding flows, and settings panels. Wired up with elements, ready to fork.' },
	{ title: 'Premium primitives', body: 'Data grid, command palette, file uploader, date range, multi-select, virtual list, charts. The components teams actually re-build on every project.' },
	{ title: 'Figma source', body: 'Pixel-accurate Figma library with the same tokens, variants, and spacing as the code. Stay in sync from design to ship.' },
	{ title: 'Theme presets', body: 'Drop-in brand palettes (Minimal, Editorial, Console, Brutalist) with semantic tokens that work everywhere.' },
];

const faqs = [
	{ title: 'Is this really lifetime?', content: 'Yes — one payment, yours forever. You get every component, blueprint, and update we release from now on. No renewals, no subscriptions, no expiry.' },
	{ title: 'Can I use the free tier in commercial projects?', content: 'Yes — the open-source components are MIT licensed. Pro and Studio unlock the premium components, templates, and the design source files.' },
	{ title: 'Do I get future updates?', content: 'Every Pro and Studio licence includes lifetime updates. New components, new blueprints, breaking-change migrations — all included.' },
	{ title: 'What about React, Svelte, or vanilla?', content: 'The headless layer is plain custom elements, so it already works in any framework. The polished Vue layer ships first. React and Svelte adapters land in Pro through the year — included.' },
	{ title: 'Is there a refund policy?', content: '14-day no-questions-asked refund on Pro and Studio. If it isn’t a fit, email and you’ll be refunded the same day.' },
	{ title: 'How does the team licence work?', content: 'Studio includes unlimited seats inside your organisation and the right to ship elements into customer codebases as part of a project.' },
];

const comparisonRows = [
	{ feature: 'Open-source primitives', starter: true, pro: true, studio: true },
	{ feature: 'Vue integration layer', starter: true, pro: true, studio: true },
	{ feature: 'Premium components', starter: false, pro: true, studio: true },
	{ feature: 'App blueprints & templates', starter: false, pro: true, studio: true },
	{ feature: 'Figma source files', starter: false, pro: true, studio: true },
	{ feature: 'Theme presets', starter: false, pro: true, studio: true },
	{ feature: 'Lifetime updates', starter: false, pro: true, studio: true },
	{ feature: 'Unlimited team seats', starter: false, pro: false, studio: true },
	{ feature: 'Client-project licence', starter: false, pro: false, studio: true },
	{ feature: 'Annual review with Steve', starter: false, pro: false, studio: true },
];
</script>

<template>
	<ElementsLayout>
		<section class="-mt-6 pb-16 pt-10 text-center">
			<p class="text-xs font-semibold uppercase tracking-[0.22em] text-skin-muted">Pricing</p>
			<h1 class="mt-3 text-5xl font-bold leading-[1.05] tracking-tight text-skin-primary sm:text-6xl">Pay once. Use forever.</h1>
			<p class="mx-auto mt-5 max-w-2xl text-lg text-skin-secondary">
				No subscriptions. No expiry. One payment unlocks every premium component, blueprint, and update — for life.
			</p>
			<div class="mt-6 inline-flex items-center gap-2 rounded-full border border-skin-border bg-skin-surface/60 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-skin-muted">
				<span class="size-1.5 rounded-full bg-emerald-500"></span>
				Lifetime licence · Lifetime updates
			</div>
		</section>

		<section class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<div
				v-for="t in tiers"
				:key="t.name"
				class="relative flex flex-col rounded-3xl border bg-skin-background p-7 transition"
				:class="t.highlight ? 'border-skin-primary shadow-2xl shadow-black/10 ring-1 ring-skin-primary/10' : 'border-skin-border'"
			>
				<span v-if="t.highlight" class="absolute -top-3 left-7 rounded-full bg-skin-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-skin-inverse">Most popular</span>
				<div>
					<p class="text-sm font-semibold tracking-tight text-skin-primary">{{ t.name }}</p>
					<p class="mt-1 text-sm text-skin-secondary">{{ t.tagline }}</p>
				</div>
				<div class="mt-6 flex items-baseline gap-1">
					<template v-if="t.priceLabel">
						<span class="text-5xl font-bold tracking-tight text-skin-primary">{{ t.priceLabel }}</span>
					</template>
					<template v-else>
						<span class="text-5xl font-bold tracking-tight text-skin-primary">${{ t.price }}</span>
						<span class="text-sm text-skin-secondary">once</span>
					</template>
				</div>
				<p v-if="t.priceSuffix" class="mt-1 text-xs font-medium uppercase tracking-wider text-skin-muted">{{ t.priceSuffix }}</p>
				<ul class="mt-6 space-y-2.5 text-sm">
					<li v-for="f in t.features" :key="f" class="flex items-start gap-2 text-skin-secondary">
						<svg viewBox="0 0 20 20" class="mt-0.5 size-4 shrink-0" fill="none">
							<path d="M5 10.5l3 3 7-7.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" :class="t.highlight ? 'text-skin-primary' : 'text-emerald-500'" />
						</svg>
						<span>{{ f }}</span>
					</li>
				</ul>
				<div class="mt-auto pt-8">
					<ElButton
						:as="t.ctaTo.startsWith('/') ? 'router-link' : 'a'"
						:to="t.ctaTo"
						:href="t.ctaTo"
						:variant="t.ctaVariant"
						size="lg"
						class="w-full"
					>{{ t.cta }}</ElButton>
				</div>
			</div>
		</section>

		<section class="mt-24 border-t border-skin-border pt-16">
			<div class="mb-10 text-center">
				<p class="text-xs font-semibold uppercase tracking-[0.18em] text-skin-muted">What's inside Pro</p>
				<h2 class="mt-2 text-3xl font-bold tracking-tight text-skin-primary">The components that put real apps together.</h2>
			</div>
			<div class="grid gap-6 sm:grid-cols-2">
				<div v-for="p in proPerks" :key="p.title" class="rounded-2xl border border-skin-border bg-skin-surface/40 p-6">
					<h3 class="text-base font-semibold tracking-tight text-skin-primary">{{ p.title }}</h3>
					<p class="mt-2 text-sm leading-relaxed text-skin-secondary">{{ p.body }}</p>
				</div>
			</div>
		</section>

		<section class="mt-24 border-t border-skin-border pt-16">
			<div class="mb-8 text-center">
				<p class="text-xs font-semibold uppercase tracking-[0.18em] text-skin-muted">Compare</p>
				<h2 class="mt-2 text-3xl font-bold tracking-tight text-skin-primary">What you get at each tier.</h2>
			</div>
			<div class="overflow-hidden rounded-2xl border border-skin-border">
				<table class="w-full text-left text-sm">
					<thead class="bg-skin-surface text-xs uppercase tracking-wider text-skin-muted">
						<tr>
							<th class="px-4 py-3 font-medium">Feature</th>
							<th class="px-4 py-3 text-center font-medium">Starter</th>
							<th class="px-4 py-3 text-center font-medium">Pro</th>
							<th class="px-4 py-3 text-center font-medium">Studio</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-skin-border">
						<tr v-for="r in comparisonRows" :key="r.feature">
							<td class="px-4 py-3 text-skin-primary">{{ r.feature }}</td>
							<td class="px-4 py-3 text-center text-skin-secondary">{{ r.starter ? '✓' : '—' }}</td>
							<td class="px-4 py-3 text-center text-skin-secondary">{{ r.pro ? '✓' : '—' }}</td>
							<td class="px-4 py-3 text-center text-skin-secondary">{{ r.studio ? '✓' : '—' }}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</section>

		<section class="mt-24 border-t border-skin-border pt-16">
			<div class="mb-8 text-center">
				<p class="text-xs font-semibold uppercase tracking-[0.18em] text-skin-muted">FAQ</p>
				<h2 class="mt-2 text-3xl font-bold tracking-tight text-skin-primary">Questions, answered.</h2>
			</div>
			<div class="mx-auto max-w-2xl">
				<ElAccordion :items="faqs" />
			</div>
		</section>

		<section id="checkout" class="mt-24 border-t border-skin-border pt-16 text-center">
			<div class="mx-auto max-w-2xl rounded-3xl border border-skin-border bg-gradient-to-br from-skin-surface to-transparent p-10">
				<h2 class="text-3xl font-bold tracking-tight text-skin-primary">One payment. Forever yours.</h2>
				<p class="mt-3 text-skin-secondary">Stop rebuilding the same dropdown for the tenth time. Buy once, get every component, every blueprint, every update we ever ship.</p>
				<div class="mt-6 flex flex-wrap items-center justify-center gap-3">
					<ElButton size="lg">Get Pro — $149 once</ElButton>
					<ElButton variant="secondary" size="lg" :as="'router-link'" :to="'/elements/components/button'">Try the free tier</ElButton>
				</div>
				<p class="mt-4 text-xs text-skin-muted">14-day refund. No subscriptions, ever.</p>
			</div>
		</section>
	</ElementsLayout>
</template>
