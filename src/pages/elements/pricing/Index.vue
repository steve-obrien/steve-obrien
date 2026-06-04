<script setup>
import ElementsLayout from '../_layout/ElementsLayout.vue';
import { ElButton, ElAccordion } from '../lib/vue';

const tiers = [
	{
		name: 'Open',
		tagline: 'For trying the system and shipping public primitives.',
		price: 0,
		priceLabel: 'Free',
		priceSuffix: null,
		cta: 'Start free',
		ctaTo: '/elements/components/button',
		ctaVariant: 'secondary',
		features: [
			'Open-source components and examples',
			'Headless web component primitives',
			'Vue integration layer',
			'Theme tokens and Tailwind CSS 4 styling',
			'Living documentation for the free set',
		],
	},
	{
		name: 'Source',
		tagline: 'For makers who want to own the code they ship.',
		price: 149,
		priceLabel: null,
		priceSuffix: 'one-time · lifetime v1 access',
		cta: 'Get source access',
		ctaTo: '#checkout',
		ctaVariant: 'primary',
		highlight: true,
		features: [
			'Everything in Open',
			'Generated Vue source shown before you copy',
			'Private source repo and downloadable releases',
			'Copy, import, or vendor with git subtree',
			'Portable docs for your own app components',
			'Lifetime access to Elements v1 releases',
		],
	},
	{
		name: 'Studio',
		tagline: 'For teams shipping Elements into client projects.',
		price: 499,
		priceLabel: null,
		priceSuffix: 'one-time · lifetime v1 access · team licence',
		cta: 'Get Studio',
		ctaTo: '#checkout',
		ctaVariant: 'secondary',
		features: [
			'Everything in Source',
			'Unlimited team seats inside your company',
			'Client-project licence for customer codebases',
			'Pro blocks for admin, billing, settings, and onboarding',
			'Private examples and implementation notes',
			'Architecture review for your component workflow',
		],
	},
];

const proPerks = [
	{ title: 'Source-first delivery', body: 'Every paid component is visible as generated source. Copy it into your app, import it as a package, or vendor the whole workspace with git subtree.' },
	{ title: 'Portable living docs', body: 'Bring the Elements documentation engine into your own product. It discovers local components, examples, props, and usage notes automatically.' },
	{ title: 'Editable generated apps', body: 'Generated screens are built from the same headless primitives, ElForm, and Vue components you can inspect and change.' },
	{ title: 'Theme ownership', body: 'Styles are token driven and designed to be copied. Your app owns the CSS variables, spacing, radius, and final look.' },
];

const sourceHighlights = [
	'Generated from Elements primitives',
	'Uses ElForm and headless behaviours',
	'Ready to copy into src/elements',
	'Documented automatically when added',
];

const faqs = [
	{ title: 'Do I get the source code?', content: 'Yes. The paid version is source access, not a black-box dependency. You can inspect the generated source on the site, download releases, copy individual components, or vendor the repo into your project.' },
	{ title: 'Do I have to use Elements as a dependency?', content: 'No. Import mode is there when it is convenient. Copy mode and git subtree mode are there when you want to own and edit the code inside your app.' },
	{ title: 'Can I package the docs with my own app?', content: 'That is the plan. The docs engine is designed to discover your copied components and examples, so each app can carry its own living component library without setting up Storybook.' },
	{ title: 'Can I change the theme?', content: 'Yes. Theme values are CSS variables and component styles are designed to be copied into your project. The host app owns the final tokens, not the package.' },
	{ title: 'Is this really lifetime?', content: 'Source and Studio are one-time purchases with lifetime access to Elements v1 releases. Future major versions may be sold separately, with upgrade pricing for existing customers.' },
	{ title: 'How does the team licence work?', content: 'Studio includes unlimited seats inside your organisation and the right to ship Elements source into client codebases as part of paid project work.' },
];

const comparisonRows = [
	{ feature: 'Open-source primitives', starter: true, source: true, studio: true },
	{ feature: 'Headless web components', starter: true, source: true, studio: true },
	{ feature: 'Vue integration layer', starter: true, source: true, studio: true },
	{ feature: 'Generated source preview', starter: false, source: true, studio: true },
	{ feature: 'Private source releases', starter: false, source: true, studio: true },
	{ feature: 'Copy and subtree workflow', starter: false, source: true, studio: true },
	{ feature: 'Portable docs engine', starter: false, source: true, studio: true },
	{ feature: 'Pro app blocks', starter: false, source: false, studio: true },
	{ feature: 'Unlimited team seats', starter: false, source: false, studio: true },
	{ feature: 'Client-project licence', starter: false, source: false, studio: true },
];

const generatedSource = [
	'<script setup>',
	"import { ElButton, ElForm } from '@elements/vue';",
	'',
	'const schema = {',
	"	title: 'Invite teammate',",
	'	fields: [',
	"		{ name: 'email', type: 'email', label: 'Email', required: true },",
	"		{ name: 'role', type: 'select', label: 'Role', options: ['Admin', 'Editor'] },",
	'	],',
	'};',
	'</' + 'script>',
	'',
	'<template>',
	'	<element-dialog>',
	'		<ElButton slot="trigger">Invite teammate</ElButton>',
	'		<ElForm :schema="schema" submit-label="Send invite" />',
	'	</element-dialog>',
	'</template>',
].join('\n');
</script>

<template>
	<ElementsLayout>


		<section class="-mt-6 pb-16 pt-10 text-center">
			<p class="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Pricing</p>
			<h1 class="mt-3 text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl">Buy the source. Own the system.</h1>
			<p class="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
				Elements Pro gives you the code, the generated examples, and the living documentation workflow. Import it, copy it, or vendor it into your app.
			</p>
			<div class="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
				<span class="size-1.5 rounded-full bg-success"></span>
				Source access · Copy mode · Git subtree friendly
			</div>
		</section>

		<section class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<div
				v-for="t in tiers"
				:key="t.name"
				class="relative flex flex-col rounded-3xl border bg-background p-7 transition"
				:class="t.highlight ? 'border-primary shadow-2xl shadow-black/10 ring-1 ring-ring/10' : 'border-border'"
			>
				<span v-if="t.highlight" class="absolute -top-3 left-7 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">Most popular</span>
				<div>
					<p class="text-sm font-semibold tracking-tight text-foreground">{{ t.name }}</p>
					<p class="mt-1 text-sm text-muted-foreground">{{ t.tagline }}</p>
				</div>
				<div class="mt-6 flex items-baseline gap-1">
					<template v-if="t.priceLabel">
						<span class="text-5xl font-bold tracking-tight text-foreground">{{ t.priceLabel }}</span>
					</template>
					<template v-else>
						<span class="text-5xl font-bold tracking-tight text-foreground">£{{ t.price }}</span>
						<span class="text-sm text-muted-foreground">once</span>
					</template>
				</div>
				<p v-if="t.priceSuffix" class="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">{{ t.priceSuffix }}</p>
				<ul class="mt-6 space-y-2.5 text-sm">
					<li v-for="f in t.features" :key="f" class="flex items-start gap-2 text-muted-foreground">
						<svg viewBox="0 0 20 20" class="mt-0.5 size-4 shrink-0" fill="none">
							<path d="M5 10.5l3 3 7-7.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" :class="t.highlight ? 'text-foreground' : 'text-success'" />
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

		<section class="mt-24 border-t border-border pt-16">
			<div class="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
				<div>
					<p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Source access</p>
					<h2 class="mt-2 text-3xl font-bold tracking-tight text-foreground">See the code before you bring it home.</h2>
					<p class="mt-4 text-sm leading-relaxed text-muted-foreground">
						Pro pages can show the generated source that powers each component or block. It is built from Elements primitives, so the code you preview is the code you can copy, edit, and document inside your own app.
					</p>
					<ul class="mt-6 grid gap-3 text-sm">
						<li v-for="item in sourceHighlights" :key="item" class="flex items-start gap-2 text-muted-foreground">
							<span class="mt-2 size-1.5 rounded-full bg-success"></span>
							<span>{{ item }}</span>
						</li>
					</ul>
				</div>
				<div class="overflow-hidden rounded-2xl border border-border bg-secondary/30">
					<div class="flex items-center justify-between border-b border-border px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">
						<span>Generated source</span>
						<span>InviteDialog.vue</span>
					</div>
					<pre class="max-h-[30rem] overflow-auto p-5 text-[12px] leading-relaxed text-foreground"><code>{{ generatedSource }}</code></pre>
				</div>
			</div>
		</section>

		<section class="mt-24 border-t border-border pt-16">
			<div class="mb-10 text-center">
				<p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">What's inside Pro</p>
				<h2 class="mt-2 text-3xl font-bold tracking-tight text-foreground">A component library you can fold into your product.</h2>
			</div>
			<div class="grid gap-6 sm:grid-cols-2">
				<div v-for="p in proPerks" :key="p.title" class="rounded-2xl border border-border bg-secondary/40 p-6">
					<h3 class="text-base font-semibold tracking-tight text-foreground">{{ p.title }}</h3>
					<p class="mt-2 text-sm leading-relaxed text-muted-foreground">{{ p.body }}</p>
				</div>
			</div>
		</section>

		<section class="mt-24 border-t border-border pt-16">
			<div class="mb-8 text-center">
				<p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Compare</p>
				<h2 class="mt-2 text-3xl font-bold tracking-tight text-foreground">What you get at each tier.</h2>
			</div>
			<div class="overflow-hidden rounded-2xl border border-border">
				<table class="w-full text-left text-sm">
					<thead class="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
						<tr>
							<th class="px-4 py-3 font-medium">Feature</th>
							<th class="px-4 py-3 text-center font-medium">Open</th>
							<th class="px-4 py-3 text-center font-medium">Source</th>
							<th class="px-4 py-3 text-center font-medium">Studio</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border">
						<tr v-for="r in comparisonRows" :key="r.feature">
							<td class="px-4 py-3 text-foreground">{{ r.feature }}</td>
							<td class="px-4 py-3 text-center text-muted-foreground">{{ r.starter ? '✓' : '—' }}</td>
							<td class="px-4 py-3 text-center text-muted-foreground">{{ r.source ? '✓' : '—' }}</td>
							<td class="px-4 py-3 text-center text-muted-foreground">{{ r.studio ? '✓' : '—' }}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</section>

		<section class="mt-24 border-t border-border pt-16">
			<div class="mb-8 text-center">
				<p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">FAQ</p>
				<h2 class="mt-2 text-3xl font-bold tracking-tight text-foreground">Questions, answered.</h2>
			</div>
			<div class="mx-auto max-w-2xl">
				<ElAccordion :items="faqs" />
			</div>
		</section>

		<section id="checkout" class="mt-24 border-t border-border pt-16 text-center">
			<div class="mx-auto max-w-2xl rounded-3xl border border-border bg-secondary/40 p-10">
				<h2 class="text-3xl font-bold tracking-tight text-foreground">Get the source and make it yours.</h2>
				<p class="mt-3 text-muted-foreground">Buy once for Elements v1 access. Copy components into your app, vendor the workspace with git subtree, and keep the living docs close to the code.</p>
				<div class="mt-6 flex flex-wrap items-center justify-center gap-3">
					<ElButton size="lg">Get Source - £149 once</ElButton>
					<ElButton variant="secondary" size="lg" :as="'router-link'" :to="'/elements/components/button'">Try Open</ElButton>
				</div>
				<p class="mt-4 text-xs text-muted-foreground">14-day refund. No subscription required.</p>
			</div>
		</section>
	</ElementsLayout>
</template>
