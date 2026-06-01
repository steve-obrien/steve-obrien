<template>
	<div class="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100 antialiased selection:bg-cyan-300 selection:text-slate-950">
		<div class="pointer-events-none absolute inset-0 -z-10">
			<div class="absolute left-1/2 top-0 h-[44rem] w-[44rem] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl" />
			<div class="absolute right-[-8rem] top-[30rem] h-[30rem] w-[30rem] rounded-full bg-fuchsia-500/10 blur-3xl" />
			<div class="absolute bottom-0 left-[-10rem] h-[36rem] w-[36rem] rounded-full bg-emerald-500/10 blur-3xl" />
		</div>
		<header class="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
			<div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
				<a href="#" class="group flex items-center gap-3">
					<span class="grid size-10 place-items-center rounded-2xl bg-cyan-300 font-black text-slate-950 shadow-lg shadow-cyan-300/20 transition group-hover:rotate-3">E</span>
					<span class="flex flex-col leading-none">
						<span class="text-sm font-semibold tracking-wide text-white">Elemenvts Lab</span>
						<span class="text-xs text-slate-400">Template stress test</span>
					</span>
				</a>
				<nav class="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 md:flex" aria-label="Main navigation">
					<a v-for="item in nav" :key="item.href" :href="item.href" class="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white">{{ item.label }}</a>
				</nav>
				<div class="flex items-center gap-3">
					<button class="hidden rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 sm:inline-flex">View docs</button>
					<button class="rounded-full bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-200">Start edviting</button>
				</div>
			</div>
		</header>
		<main>
			<section id="hero" class="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-28">
				<div class="max-w-3xl">
					<div class="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm text-cyan-100">
						<span class="size-2 rounded-full bg-cyan-300" />
						Designed for nestedf template editor testingv
					</div>
					<h1 class="text-balance text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">Navigate complex HTML</h1>
					<p class="mt-6 max-w-2xl text-pretty text-lg leading-8 text-slate-300">This component includes repeated cards, responsive grids, nested forms, pricing sections, accordions, tables, and Vue-rendered lists so you can test editing classes, attributes, and text content.</p>
					<div class="mt-8 flex flex-col gap-3 sm:flex-row">
						<a href="#builder" class="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 font-bold text-slate-950 shadow-xl shadow-white/10 transition hover:-translate-y-0.5 hover:bg-slate-100">Explore builder</a>
						<a href="#components" class="inline-flex items-center justify-center rounded-2xl border border-white/10 px-6 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/10">Inspect components</a>
					</div>
				</div>
				<aside class="relative rounded-[2rem] border border-white/10 bg-white/[0.04] p-3 shadow-2xl shadow-black/40">
					<div class="rounded-[1.5rem] border border-white/10 bg-slate-900 p-4">
						<div class="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
							<div>
								<p class="text-xs uppercase tracking-[0.3em] text-cyan-200">Live component</p>
								<h2 class="mt-1 font-bold text-white">Section hierarchy</h2>
							</div>
							<div class="flex gap-1.5">
								<span class="size-3 rounded-full bg-red-400" />
								<span class="size-3 rounded-full bg-amber-400" />
								<span class="size-3 rounded-full bg-emerald-400" />
							</div>
						</div>
						<div class="space-y-3">
							<article v-for="node in structure" :key="node.name" class="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
								<div class="flex items-center justify-between gap-4">
									<div>
										<h3 class="font-semibold text-white">{{ node.name }}</h3>
										<p class="text-sm text-slate-400">{{ node.children }} child nodes</p>
									</div>
									<span class="rounded-full bg-cyan-300/10 px-2.5 py-1 text-xs font-semibold text-cyan-200">{{ node.depth }} deep</span>
								</div>
								<div class="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
									<div class="h-full rounded-full bg-cyan-300" :style="{ width: node.score + '%' }" />
								</div>
							</article>
						</div>
					</div>
				</aside>
			</section>
			<section id="stats" class="border-y border-white/10 bg-white/[0.03]">
				<div class="mx-auto grid max-w-7xl grid-cols-2 gap-px px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
					<div v-for="stat in stats" :key="stat.label" class="rounded-3xl bg-slate-950/50 p-6 text-center">
						<p class="text-4xl font-black text-white">{{ stat.value }}</p>
						<p class="mt-2 text-sm text-slate-400">{{ stat.label }}</p>
					</div>
				</div>
			</section>
			<section id="builder" class="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
				<div class="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
					<div class="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 lg:sticky lg:top-24 lg:self-start">
						<p class="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-200">Builder panel</p>
						<h2 class="mt-3 text-3xl font-black text-white">Nested controls with editable labels</h2>
						<p class="mt-4 text-slate-300">Use this area to test form navigation, repeated labels, nested wrappers, utility classes, and responsive layout edits.</p>
						<form class="mt-8 space-y-6">
							<fieldset class="rounded-3xl border border-white/10 p-5">
								<legend class="px-2 text-sm font-bold text-white">Content settings</legend>
								<div class="grid gap-4 sm:grid-cols-2">
									<label class="block">
										<span class="text-sm text-slate-300">Hero heading</span>
										<input class="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-300" value="Nested HTML editor">
									</label>
									<label class="block">
										<span class="text-sm text-slate-300">CTA text</span>
										<input class="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-300" value="Publish changes">
									</label>
								</div>
							</fieldset>
							<fieldset class="rounded-3xl border border-white/10 p-5">
								<legend class="px-2 text-sm font-bold text-white">Visual settings</legend>
								<div class="space-y-4">
									<label v-for="option in options" :key="option.id" class="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:bg-white/[0.06]">
										<input type="checkbox" class="mt-1 size-4 rounded border-white/20 bg-slate-950 accent-cyan-300" :checked="option.checked">
										<span>
											<span class="block font-semibold text-white">{{ option.label }}</span>
											<span class="mt-1 block text-sm text-slate-400">{{ option.description }}</span>
										</span>
									</label>
								</div>
							</fieldset>
						</form>
					</div>
					<div class="space-y-6">
						<article v-for="card in cards" :key="card.title" class="group rounded-[2rem] border border-white/10 bg-white/[0.04] p-3 transition hover:border-cyan-300/40">
							<div class="grid gap-6 rounded-[1.5rem] bg-slate-900 p-6 md:grid-cols-[auto_1fr_auto] md:items-center">
								<div class="grid size-14 place-items-center rounded-2xl bg-cyan-300/10 text-2xl">{{ card.icon }}</div>
								<div>
									<p class="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">{{ card.kicker }}</p>
									<h3 class="mt-2 text-2xl font-black text-white">{{ card.title }}</h3>
									<p class="mt-2 text-slate-400">{{ card.text }}</p>
									<div class="mt-4 flex flex-wrap gap-2">
										<span v-for="tag in card.tags" :key="tag" class="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">{{ tag }}</span>
									</div>
								</div>
								<button class="rounded-2xl border border-white/10 px-4 py-3 text-sm font-bold text-white transition group-hover:bg-cyan-300 group-hover:text-slate-950">Edit block</button>
							</div>
						</article>
					</div>
				</div>
			</section>
			<section id="components" class="bg-slate-900/60 py-20">
				<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div class="max-w-3xl">
						<p class="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-200">Component library</p>
						<h2 class="mt-3 text-4xl font-black text-white">Cards, tables, accordions, badges, and nested media objects.</h2>
					</div>
					<div class="mt-10 grid gap-6 lg:grid-cols-3">
						<article class="rounded-[2rem] border border-white/10 bg-slate-950 p-6 lg:col-span-2">
							<header class="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center">
								<div>
									<h3 class="text-2xl font-black text-white">Project table</h3>
									<p class="mt-1 text-slate-400">Complex rows with nested actions and status badges.</p>
								</div>
								<button class="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-slate-950">Add row</button>
							</header>
							<div class="mt-6 overflow-hidden rounded-3xl border border-white/10">
								<table class="w-full border-collapse text-left text-sm">
									<thead class="bg-white/[0.04] text-slate-300">
										<tr>
											<th class="px-4 py-3 font-semibold">Name</th>
											<th class="px-4 py-3 font-semibold">Owner</th>
											<th class="px-4 py-3 font-semibold">Status</th>
											<th class="px-4 py-3 font-semibold">Actions</th>
										</tr>
									</thead>
									<tbody class="divide-y divide-white/10">
										<tr v-for="project in projects" :key="project.name" class="hover:bg-white/[0.03]">
											<td class="px-4 py-4">
												<div class="flex items-center gap-3">
													<span class="grid size-9 place-items-center rounded-xl bg-cyan-300/10 font-bold text-cyan-100">{{ project.initial }}</span>
													<span>
														<span class="block font-semibold text-white">{{ project.name }}</span>
														<span class="block text-xs text-slate-500">{{ project.type }}</span>
													</span>
												</div>
											</td>
											<td class="px-4 py-4 text-slate-300">{{ project.owner }}</td>
											<td class="px-4 py-4">
												<span class="rounded-full px-2.5 py-1 text-xs font-bold" :class="project.badge">{{ project.status }}</span>
											</td>
											<td class="px-4 py-4">
												<button class="text-cyan-200 hover:text-cyan-100">Open</button>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</article>
						<aside class="rounded-[2rem] border border-white/10 bg-slate-950 p-6">
							<h3 class="text-2xl font-black text-white">Accordion test</h3>
							<div class="mt-6 divide-y divide-white/10 rounded-3xl border border-white/10">
								<details v-for="faq in faqs" :key="faq.q" class="group p-4" :open="faq.open">
									<summary class="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-white">
										<p>{{ faq.q }}</p>
										<span class="transition group-open:rotate-45">+</span>
									</summary>
									<p class="mt-3 text-sm leading-6 text-slate-400">{{ faq.a }}</p>
								</details>
							</div>
						</aside>
					</div>
				</div>
			</section>
			<section id="pricing" class="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
				<div class="text-center">
					<p class="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-200">Pricing layout</p>
					<h2 class="mt-3 text-4xl font-black text-white">Three editable pricing cards with nested feature lists.</h2>
				</div>
				<div class="mt-10 grid gap-6 lg:grid-cols-3">
					<article v-for="plan in plans" :key="plan.name" class="rounded-[2rem] border p-6" :class="plan.highlight ? 'border-cyan-300 bg-cyan-300 text-slate-950 shadow-2xl shadow-cyan-300/20' : 'border-white/10 bg-white/[0.04] text-white'">
						<div class="flex items-start justify-between gap-4">
							<div>
								<h3 class="text-2xl font-black">{{ plan.name }}</h3>
								<p class="mt-2 text-sm" :class="plan.highlight ? 'text-slate-700' : 'text-slate-400'">{{ plan.description }}</p>
							</div>
							<span v-if="plan.highlight" class="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-white">Popular</span>
						</div>
						<p class="mt-8">
							<span class="text-5xl font-black">{{ plan.price }}</span>
							<span class="text-sm">/ month</span>
						</p>
						<ul class="mt-8 space-y-3">
							<li v-for="feature in plan.features" :key="feature" class="flex gap-3 text-sm">
								<span class="mt-0.5">✓</span>
								<span>{{ feature }}</span>
							</li>
						</ul>
						<button class="mt-8 w-full rounded-2xl px-5 py-3 font-bold" :class="plan.highlight ? 'bg-slate-950 text-white' : 'bg-white text-slate-950'">Choose {{ plan.name }}</button>
					</article>
				</div>
			</section>
		</main>
		<footer class="border-t border-white/10 bg-slate-950 px-4 py-10 sm:px-6 lg:px-8">
			<div class="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1fr_auto] md:items-center">
				<div>
					<h2 class="text-xl font-black text-white">Elements Lab</h2>
					<p class="mt-2 max-w-xl text-sm text-slate-400">A deliberately complex Vue component for testing class editing, text changes, DOM traversal, and Vue template rendering inside the body tag.</p>
				</div>
				<div class="flex flex-wrap gap-3 text-sm text-slate-400">
					<a href="#hero" class="hover:text-white">Hero</a>
					<a href="#builder" class="hover:text-white">Builder</a>
					<a href="#components" class="hover:text-white">Components</a>
					<a href="#pricing" class="hover:text-white">Pricing</a>
				</div>
			</div>
		</footer>
	</div>
</template>

<script setup>
const nav = [
  { label: 'Hero', href: '#hero' },
  { label: 'Builder', href: '#builder' },
  { label: 'Components', href: '#components' },
  { label: 'Pricing', href: '#pricing' }
];

const structure = [
  { name: 'Header / Nav', children: 18, depth: 5, score: 62 },
  { name: 'Hero / Aside', children: 34, depth: 8, score: 82 },
  { name: 'Builder Form', children: 46, depth: 10, score: 91 },
  { name: 'Pricing Cards', children: 27, depth: 7, score: 74 }
];

const stats = [
  { value: '140+', label: 'DOM nodes' },
  { value: '70+', label: 'Tailwind classes' },
  { value: '9', label: 'Repeated blocks' },
  { value: '4', label: 'Deep sections' }
];

const options = [
  { id: 1, label: 'Show responsive wrappers', description: 'Useful for testing nested layout class editing.', checked: true },
  { id: 2, label: 'Enable dark surface blocks', description: 'Checks whether theme classes are easy to inspect.', checked: true },
  { id: 3, label: 'Expose repeated children', description: 'Good for testing batch selection and duplicated structures.', checked: false }
];

const cards = [
  { icon: '◫', kicker: 'Layout', title: 'Nested responsive grid', text: 'A card inside an article inside a section inside a main layout container.', tags: ['grid', 'article', 'responsive'] },
  { icon: '✎', kicker: 'Editing', title: 'Inline text and utility classes', text: 'Change headings, paragraphs, badges, buttons, and class-heavy wrappers.', tags: ['text', 'classes', 'badges'] },
  { icon: '⚙', kicker: 'Dynamic', title: 'Vue-rendered repeated content', text: 'Lists, tables, pricing cards, and accordions are generated from Vue data.', tags: ['vue', 'v-for', 'state'] }
];

const projects = [
  { initial: 'A', name: 'Architecture Canvas', type: 'Workshop tool', owner: 'Steve', status: 'Live', badge: 'bg-emerald-300/15 text-emerald-200' },
  { initial: 'B', name: 'Brief Generator', type: 'AI workflow', owner: 'Product', status: 'Draft', badge: 'bg-amber-300/15 text-amber-200' },
  { initial: 'C', name: 'Component Inspector', type: 'Editor test', owner: 'Design', status: 'Testing', badge: 'bg-cyan-300/15 text-cyan-200' }
];

const faqs = [
  { q: 'Can I edit deeply nested text?', a: 'Yes. This template deliberately repeats labels, descriptions, buttons, and headings across several nested structures.', open: true },
  { q: 'Can I test utility class changes?', a: 'Yes. Most elements include multiple Tailwind classes across spacing, colour, typography, layout, borders, and states.', open: false },
  { q: 'Does this include dynamic content?', a: 'Yes. Vue renders several arrays using v-for, including cards, stats, table rows, FAQs, and pricing plans.', open: false }
];

const plans = [
  { name: 'Starter', description: 'For basic editor tests.', price: '£19', highlight: false, features: ['Static HTML sections', 'Responsive card layout', 'Editable buttons'] },
  { name: 'Studio', description: 'For serious nested editing.', price: '£49', highlight: true, features: ['Vue-rendered lists', 'Nested forms', 'Complex tables', 'Reusable cards'] },
  { name: 'Scale', description: 'For large page workflows.', price: '£99', highlight: false, features: ['Multiple layout regions', 'Deep component trees', 'Batch text editing'] }
];
</script>
