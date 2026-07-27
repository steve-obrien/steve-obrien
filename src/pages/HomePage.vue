<script setup>
import { RouterLink } from 'vue-router';
import meImage from '../assets/me.jpeg';

const highlights = [
	{
		value: '20+ years',
		label: 'Engineering and building software',
	},
	{
		value: '18 years',
		label: 'Building and leading Newicon',
	},
	{
		value: '£2m',
		label: 'Combined company turnover',
	},
	{
		value: '2025',
		label: 'Successful acquisition',
	},
];

const workingPrinciples = [
	{
		number: '01',
		title: 'Build what is new',
		text: 'I excel at rapidly prototyping ideas that have not been done before, finding the working shape of a product while the problem is still ambiguous.',
	},
	{
		number: '02',
		title: 'Make it testable now',
		text: 'I turn difficult, uncertain work into something people can use, learn from, and improve—often moving from a big idea to what we can genuinely ship next week.',
	},
	{
		number: '03',
		title: 'Design for what comes next',
		text: 'I choose the simplest architecture that is right for today while preserving a clear path to the resilience, scale, and operational maturity the product will need tomorrow.',
	},
];

const currentWork = [
	{
		label: 'AI product · Search intelligence',
		title: 'GrowthScout',
		text: 'An AI-powered platform for turning website and search data into practical content decisions, combining analysis, planning, and intelligent workflows.',
		href: 'https://growthscout.io',
		external: true,
		linkLabel: 'Visit GrowthScout',
	},
	{
		label: 'Developer platform · Design systems',
		title: 'DOM Studio',
		text: 'A code-first UI system for Vue and Web Components, designed to give people and AI agents a shared, dependable contract for building interfaces.',
		href: 'https://getdom.studio',
		external: true,
		linkLabel: 'Visit DOM Studio',
	},
	{
		label: 'Research and development',
		title: 'Practical AI systems',
		text: 'Building application frameworks, agent runtimes, real-time collaborative tools, and systems informed by how artificial and biological intelligence learn.',
		href: '/projects',
		external: false,
		linkLabel: 'Explore projects',
	},
];

const selectedWriting = [
	{
		title: 'Defining intelligence',
		text: 'Why intelligence remains difficult to define—and why the definition matters as we build increasingly capable machines.',
		href: '/articles/defining-intelligence',
	},
	{
		title: 'Should you build an LLM from scratch?',
		text: 'Why most teams should start with hosted models, owned evaluation data, and open-weight experiments before training from scratch.',
		href: '/articles/building-llms-from-scratch',
	},
];
</script>

<template>
	<SteveLayout bg-class="home-page-background">
		<article class="mx-auto max-w-5xl">
			<header class="grid gap-12 border-b border-border pb-16 lg:grid-cols-[1.35fr_0.65fr] lg:items-center lg:pb-20">
				<div>
					<p class="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
						Steve O'Brien <span aria-hidden="true">·</span> Technical founder <span aria-hidden="true">·</span> Fractional CTO <span aria-hidden="true">·</span> AI systems architect
					</p>
					<p class="mt-5 flex items-center gap-3 text-muted-foreground">
						<span aria-hidden="true" class="h-px w-8 bg-foreground/25"></span>
						<span class="font-serif text-xl italic tracking-tight sm:text-2xl">Build the future</span>
					</p>
					<h1 class="mt-5 font-serif text-4xl font-light leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.45rem]">
						Steve O'Brien: Engineer, Founder, Practical AI Systems Leader
					
					</h1>
					<p class="mt-8 max-w-3xl text-lg leading-8 text-muted-foreground">
						I've spent two decades building real-world software systems. Today I turn ambitious, ambiguous ideas into practical AI systems—combining rapid prototyping with insights from artificial and biological intelligence, and architecture that can scale when the evidence demands it.
					</p>
					<div class="mt-9 flex flex-wrap gap-3">
						<RouterLink
							to="/cv"
							class="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
						>
							View executive CV
						</RouterLink>
						<a
							href="https://www.linkedin.com/in/stevenaobrien/"
							target="_blank"
							rel="noopener noreferrer"
							class="rounded-full border border-border px-6 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
						>
							Connect on LinkedIn
						</a>
					</div>
				</div>

				<div class="mx-auto w-full max-w-sm lg:max-w-none">
					<div class="overflow-hidden rounded-[2rem] border border-border bg-card p-3 shadow-2xl shadow-foreground/5">
						<img
							:src="meImage"
							alt="Steve O'Brien"
							class="aspect-square w-full rounded-[1.45rem] object-cover grayscale"
						/>
					</div>
					<p class="mt-4 text-center text-sm leading-6 text-muted-foreground lg:text-left">
						Based in Bristol, working with founders and teams on difficult technology and product challenges.
					</p>
				</div>
			</header>

			<section class="border-b border-border py-12" aria-label="Career highlights">
				<div class="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
					<div v-for="highlight in highlights" :key="highlight.label" class="bg-card p-6">
						<strong class="block font-serif text-3xl font-light">{{ highlight.value }}</strong>
						<span class="mt-2 block text-sm leading-6 text-muted-foreground">{{ highlight.label }}</span>
					</div>
				</div>
			</section>

			<section class="grid gap-10 border-b border-border py-16 lg:grid-cols-[0.7fr_1.3fr]" aria-labelledby="founder-heading">
				<div>
					<p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Builder and founder</p>
					<h2 id="founder-heading" class="mt-4 font-serif text-4xl font-light leading-tight">Strategy grounded in doing the work.</h2>
				</div>
				<div class="space-y-5 text-lg leading-8 text-muted-foreground">
					<p>
						I founded Newicon and spent 18 years building the company to £1.5m turnover alongside a £0.5m digital marketing business that became Flex Digital. I led as CEO and CTO while staying close to architecture, software, product, clients, and delivery through to Newicon’s acquisition in 2025.
					</p>
					<p>
						I have built capable application frameworks from scratch, including systems that powered regulated financial services products such as the Hartley pension portal. My preferred stacks today are Vue with Node.js and Fastify, or Laravel for PHP, backed by PostgreSQL or MariaDB—but the durable advantage is a command of fundamentals, not attachment to a particular framework.
					</p>
				</div>
			</section>

			<section class="border-b border-border py-16" aria-labelledby="approach-heading">
				<div class="max-w-2xl">
					<p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">How I work</p>
					<h2 id="approach-heading" class="mt-4 font-serif text-4xl font-light leading-tight sm:text-5xl">From ambiguity to something real.</h2>
				</div>
				<div class="mt-10 grid gap-5 lg:grid-cols-3">
					<article v-for="principle in workingPrinciples" :key="principle.number" class="rounded-2xl border border-border bg-card p-6">
						<p class="text-xs font-semibold tracking-[0.16em] text-muted-foreground">{{ principle.number }}</p>
						<h3 class="mt-8 text-xl font-semibold">{{ principle.title }}</h3>
						<p class="mt-3 leading-7 text-muted-foreground">{{ principle.text }}</p>
					</article>
				</div>
			</section>

			<section id="current-work" class="border-b border-border py-16" aria-labelledby="current-work-heading">
				<div class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
					<div class="max-w-2xl">
						<p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Current work</p>
						<h2 id="current-work-heading" class="mt-4 font-serif text-4xl font-light leading-tight sm:text-5xl">Systems I’m building now.</h2>
					</div>
					<RouterLink to="/projects" class="text-sm font-semibold underline decoration-border underline-offset-4 hover:decoration-foreground">
						View all projects
					</RouterLink>
				</div>
				<div class="mt-10 grid gap-6 lg:grid-cols-3">
					<article v-for="project in currentWork" :key="project.title" class="flex min-h-72 flex-col border-t-2 border-foreground pt-5">
						<p class="text-xs font-semibold uppercase leading-5 tracking-[0.14em] text-muted-foreground">{{ project.label }}</p>
						<h3 class="mt-5 font-serif text-3xl font-light">{{ project.title }}</h3>
						<p class="mt-4 leading-7 text-muted-foreground">{{ project.text }}</p>
						<a
							v-if="project.external"
							:href="project.href"
							target="_blank"
							rel="noopener noreferrer"
							class="mt-auto pt-8 text-sm font-semibold underline decoration-border underline-offset-4 hover:decoration-foreground"
						>
							{{ project.linkLabel }}
						</a>
						<RouterLink
							v-else
							:to="project.href"
							class="mt-auto pt-8 text-sm font-semibold underline decoration-border underline-offset-4 hover:decoration-foreground"
						>
							{{ project.linkLabel }}
						</RouterLink>
					</article>
				</div>
			</section>

			<section class="py-16" aria-labelledby="writing-heading">
				<div class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
					<div class="max-w-2xl">
						<p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Selected writing</p>
						<h2 id="writing-heading" class="mt-4 font-serif text-4xl font-light leading-tight sm:text-5xl">Thinking in public.</h2>
					</div>
					<RouterLink to="/articles" class="text-sm font-semibold underline decoration-border underline-offset-4 hover:decoration-foreground">
						Read all articles
					</RouterLink>
				</div>
				<div class="mt-10 divide-y divide-border border-y border-border">
					<RouterLink
						v-for="article in selectedWriting"
						:key="article.title"
						:to="article.href"
						class="group grid gap-3 py-7 sm:grid-cols-[0.8fr_1.2fr] sm:gap-8"
					>
						<h3 class="font-serif text-2xl font-light group-hover:underline group-hover:decoration-border group-hover:underline-offset-4">{{ article.title }}</h3>
						<p class="leading-7 text-muted-foreground">{{ article.text }}</p>
					</RouterLink>
				</div>
			</section>

			<section class="rounded-3xl bg-primary px-7 py-10 text-primary-foreground sm:px-10 sm:py-12" aria-labelledby="contact-heading">
				<p class="text-xs font-semibold uppercase tracking-[0.2em] opacity-70">Work together</p>
				<div class="mt-5 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
					<div class="max-w-2xl">
						<h2 id="contact-heading" class="font-serif text-3xl font-light sm:text-4xl">Have something difficult to build?</h2>
						<p class="mt-4 text-lg leading-8 opacity-75">
							I work with founders and teams who need experienced technical leadership and someone ready to get close to the product and code.
						</p>
					</div>
					<RouterLink to="/cv" class="shrink-0 rounded-full bg-primary-foreground px-6 py-3 text-center text-sm font-semibold text-primary">
						View my executive CV
					</RouterLink>
				</div>
			</section>
		</article>
	</SteveLayout>
</template>

<style scoped>
.home-page-background {
	background:
		radial-gradient(circle at 78% 8%, color-mix(in oklch, var(--foreground) 5%, transparent), transparent 26rem),
		var(--background);
}
</style>
