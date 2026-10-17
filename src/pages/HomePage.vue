<script setup>
import { RouterLink } from 'vue-router';
import { defineAsyncComponent } from 'vue';
import { useTheme } from '../composable/useTheme.js';
import OverlordCore from '../cmp/OverlordCore.vue';
import FollowSignup from '../cmp/FollowSignup.vue';
import RotatingHeroWord from '../cmp/RotatingHeroWord.vue';
import { offerDescription } from './course/offer.js';
import meImage from '../assets/me.jpeg';
import bookCover from './projects/intelligence-book-mockup.webp';
import domStudioCard from './projects/dom_studio_card.png';

const { siteMode, ready } = useTheme();
const BlackHole = defineAsyncComponent(loadBlackHole);
const Planet = defineAsyncComponent(loadPlanet);
const HeroOrbs = defineAsyncComponent(loadHeroOrbs);

/** @returns {Promise<object>} Restores the original orb backdrop for Professional mode. */
function loadHeroOrbs() {
	return import('../cmp/HeroOrbs.vue');
}

/** @returns {Promise<object>} Loads the animated hero only for Space mode. */
function loadBlackHole() {
	return import('../cmp/BlackHole.vue');
}

/** @returns {Promise<object>} Loads decorative planets only for Space mode. */
function loadPlanet() {
	return import('../cmp/Planet.vue');
}

const heroWords = ['intelligence', 'software products', 'Ai brains', 'nerdy things', 'AI apps', 'companies'];

const focus = [
	{
		index: '01',
		label: 'Search intelligence',
		title: 'GrowthScout',
		href: 'https://growthscout.io',
		external: true,
		planet: { color: 'oklch(0.55 0.14 200)', glow: 'oklch(0.88 0.1 190)', banded: true },
	},
	{
		index: '02',
		label: 'Interface systems',
		title: 'DOM Studio',
		href: 'https://getdom.studio',
		external: true,
		planet: { color: 'oklch(0.5 0.17 285)', glow: 'oklch(0.82 0.12 300)', rings: true },
	},
	{
		index: '03',
		label: 'Research & writing',
		title: 'Intelligence',
		href: '#intelligence',
		external: false,
		planet: { color: 'oklch(0.62 0.16 50)', glow: 'oklch(0.9 0.1 80)', moon: true },
	},
];

const telemetry = [
	{ label: 'Base', value: 'Bristol, UK' },
	{ label: 'Experience', value: '20+ years' },
	{ label: 'Building', value: 'db3.ai · DOM Studio' },
];

const routes = [
	{
		audience: 'For your business',
		title: 'Build your software',
		text: 'Replace expensive SaaS tools with software built around what makes your business different. Your own software, AI integrations and data. You save money, or you don’t pay.',
		cta: 'See how it works',
		to: '/build-your-software',
		planet: { color: 'oklch(0.55 0.12 160)', glow: 'oklch(0.88 0.1 150)', moon: true },
	},
	{
		audience: 'For companies',
		title: 'Have AI built for you',
		text: 'db3 Labs builds working AI systems inside your business. We agree the outcomes up front and you pay for each one when it is delivered.',
		cta: 'db3 Labs',
		to: '/ai-development',
		planet: { color: 'oklch(0.62 0.16 50)', glow: 'oklch(0.9 0.1 80)', rings: true },
	},
	{
		audience: 'For teams',
		title: 'Learn to do it yourselves',
		text: offerDescription,
		cta: 'The course',
		to: '/course',
		planet: { color: 'oklch(0.55 0.14 200)', glow: 'oklch(0.88 0.1 190)', moon: true },
	},
	{
		audience: 'For developers',
		title: 'Build on db3.ai',
		text: 'An open-source TypeScript framework that brings models, authentication, queues, storage and AI into one runtime.',
		cta: 'db3.ai Framework',
		href: 'https://db3.ai/framework',
		planet: { color: 'oklch(0.5 0.17 285)', glow: 'oklch(0.82 0.12 300)', banded: true },
	},
];

const selectedWriting = [
	{
		title: 'Building a tiny language model from scratch',
		text: 'A hands-on, 19-part exploration of the Transformer—from tokenisation and attention through training, ablation, and generation.',
		href: '/articles/building-a-tiny-language-model-from-scratch',
	},
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
	<SteveLayout>
		<article>
			<header class="hero relative flex min-h-[86vh] items-center py-24 sm:py-32">
				<HeroOrbs v-if="ready && siteMode === 'professional'" class="professional-orbs" />
				<BlackHole v-if="ready && siteMode === 'space'" />
				<OverlordCore v-if="siteMode === 'ai-overlord'" />
				<div class="relative z-10 max-w-4xl">
					<p class="flex items-center gap-3 font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
						<span class="signal-dot" aria-hidden="true"></span>
						Steve O’Brien · Founder, engineer &amp; author
					</p>
					<h1 class="mt-8 max-w-4xl text-[clamp(3.2rem,8.5vw,7.25rem)] font-medium leading-[0.95] tracking-[-0.05em]">
						Building useful
						<span v-if="siteMode === 'professional'" class="hero-gradient block">intelligence.</span>
						<RotatingHeroWord v-else :words="heroWords" class="hero-gradient block" />
					</h1>
					<p class="mt-10 max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl sm:leading-9">
						I build products, companies and technical systems at the edge of AI. Turning difficult ideas into things people can actually use.
					</p>
					<div class="mt-10 max-w-xl">
						<p class="text-sm font-medium text-foreground">Follow the work: new writing, progress on the book and what I’m building.</p>
						<FollowSignup id="hero-follow" class="mt-4" />
						<a href="#work-with-me" class="mt-5 inline-flex text-sm font-semibold text-muted-foreground transition hover:text-foreground">Or work with me ↓</a>
					</div>
					<dl class="mt-16 flex flex-wrap gap-x-10 gap-y-4 font-mono text-[0.7rem] uppercase tracking-[0.18em]">
						<div v-for="item in telemetry" :key="item.label">
							<dt class="text-muted-foreground/70">{{ item.label }}</dt>
							<dd class="mt-1 text-foreground">{{ item.value }}</dd>
						</div>
					</dl>
				</div>
			</header>

			<section class="skin-card liquid-glass grid overflow-hidden rounded-3xl sm:grid-cols-3" aria-label="Current focus">
				<a
					v-for="item in focus"
					:key="item.title"
					:href="item.href"
					:target="item.external ? '_blank' : undefined"
					:rel="item.external ? 'noopener noreferrer' : undefined"
					class="group flex items-center gap-5 border-b border-border p-6 last:border-b-0 sm:border-r sm:border-b-0 sm:last:border-r-0"
				>
					<Planet v-if="ready && siteMode === 'space'" v-bind="item.planet" class="w-12 shrink-0 transition-transform duration-700 group-hover:scale-110" />
					<div class="min-w-0 flex-1">
						<p class="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">{{ item.index }} · {{ item.label }}</p>
						<p class="mt-2 flex items-center justify-between font-display text-lg font-semibold">
							{{ item.title }}
							<span class="transition-transform group-hover:translate-x-1">{{ item.external ? '↗' : '↓' }}</span>
						</p>
					</div>
				</a>
			</section>

			<section class="py-24 sm:py-32" aria-labelledby="projects-heading">
				<div class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<p class="section-label">Selected systems</p>
						<h2 id="projects-heading" class="mt-4 text-4xl font-medium tracking-[-0.04em] sm:text-6xl">Ideas made operational.</h2>
					</div>
					<RouterLink to="/projects" class="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground transition hover:text-foreground">All projects →</RouterLink>
				</div>

				<div class="mt-14 grid gap-6 lg:grid-cols-2">
					<a href="https://growthscout.io" target="_blank" rel="noopener noreferrer" class="product-card group overflow-hidden rounded-[2rem] border border-border bg-card/60 backdrop-blur">
						<div class="growth-visual relative aspect-4/3 overflow-hidden p-7 sm:p-10">
							<div class="relative z-10 flex items-center justify-between font-mono text-[0.68rem] uppercase tracking-[0.18em] text-white/60">
								<span>GrowthScout</span>
								<span>Live product ↗</span>
							</div>
							<div class="growth-planet absolute top-[20%] right-[12%] sm:top-[10%] w-[32%]">
								<Planet v-if="ready && siteMode === 'space'" color="oklch(0.55 0.14 200)" glow="oklch(0.88 0.1 190)" banded rings />
							</div>
							<div class="absolute inset-x-7 bottom-7 z-10 sm:inset-x-10 sm:bottom-10">
								<p class="max-w-sm font-display text-3xl font-medium leading-tight tracking-[-0.04em] sm:text-5xl">From search data to clear decisions.</p>
							</div>
						</div>
						<div class="border-t border-border p-7 sm:p-9">
							<p class="max-w-xl leading-7 text-muted-foreground">AI-powered search intelligence that turns evidence into practical content strategy and action.</p>
						</div>
					</a>

					<a href="https://getdom.studio" target="_blank" rel="noopener noreferrer" class="product-card group overflow-hidden rounded-[2rem] border border-border bg-card/60 backdrop-blur">
						<div class="aspect-4/3 overflow-hidden bg-[#050817]">
							<img :src="domStudioCard" alt="DOM Studio interface system" class="size-full object-cover transition duration-700 group-hover:scale-[1.025]" />
						</div>
						<div class="p-7 sm:p-9">
							<div class="flex items-center justify-between">
								<h3 class="text-2xl font-semibold tracking-[-0.03em]">DOM Studio</h3>
								<span aria-hidden="true">↗</span>
							</div>
							<p class="mt-3 max-w-xl leading-7 text-muted-foreground">A code-first UI system giving people and AI agents a shared contract for dependable interfaces.</p>
						</div>
					</a>
				</div>
			</section>

			<section id="intelligence" class="book-panel relative overflow-hidden rounded-[2.5rem] border border-border text-white" aria-labelledby="book-heading">
				<div v-if="siteMode === 'space'" class="book-star" aria-hidden="true"></div>
				<div v-if="siteMode === 'space'" class="book-orbit book-orbit-1" aria-hidden="true"></div>
				<div v-if="siteMode === 'space'" class="book-orbit book-orbit-2" aria-hidden="true"></div>
				<div class="relative grid items-center gap-10 px-7 py-12 sm:px-12 sm:py-16 lg:grid-cols-[0.9fr_1.1fr] lg:px-16 lg:py-20">
					<div class="order-2 lg:order-1">
						<p class="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-nova">Book in progress</p>
						<h2 id="book-heading" class="mt-6 max-w-2xl text-4xl font-medium leading-[0.98] tracking-tighter sm:text-6xl">
							Human, artificial and future intelligence.
						</h2>
						<p class="mt-7 max-w-xl text-lg leading-8 text-white/65">
							An investigation into how minds work, how machines think, and what neuroscience may reveal about the future of intelligence.
						</p>
						<div class="mt-10 grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-3">
							<div v-for="(part, index) in ['Human', 'Artificial', 'Future']" :key="part" class="bg-black/40 p-5">
								<p class="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-white/40">0{{ index + 1 }}</p>
								<p class="mt-5 font-display font-medium">{{ part }}</p>
							</div>
						</div>
						<a href="https://steve-98.kit.com/4b5ef441c9" target="_blank" rel="noopener noreferrer" class="skin-action launch-button mt-9 inline-flex rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:scale-[1.02]">
							Follow the book
						</a>
					</div>
					<div class="order-1 flex justify-center lg:order-2 lg:justify-end">
						<img :src="bookCover" alt="Intelligence: Human, Artificial, Future by Steve O’Brien" class="book-cover w-full max-w-sm" />
					</div>
				</div>
			</section>

			<section class="py-24 sm:py-32" aria-labelledby="writing-heading">
				<div class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<p class="section-label">Ideas</p>
						<h2 id="writing-heading" class="mt-4 text-4xl font-medium tracking-[-0.04em] sm:text-6xl">Thinking in public.</h2>
					</div>
					<RouterLink to="/articles" class="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground transition hover:text-foreground">All writing →</RouterLink>
				</div>
				<div class="mt-12 divide-y divide-border border-y border-border">
					<RouterLink v-for="(article, index) in selectedWriting" :key="article.title" :to="article.href" class="group grid gap-4 py-8 sm:grid-cols-[3rem_0.8fr_1.2fr] sm:items-start sm:gap-8">
						<span class="pt-2 font-mono text-xs text-nebula">0{{ index + 1 }}</span>
						<h3 class="text-2xl font-semibold tracking-[-0.03em] transition group-hover:text-nova">{{ article.title }}</h3>
						<p class="leading-7 text-muted-foreground">{{ article.text }}</p>
					</RouterLink>
				</div>
			</section>

			<section id="work-with-me" class="scroll-mt-24 border-t border-border py-24 sm:py-32" aria-labelledby="work-heading">
				<div class="max-w-3xl">
					<p class="section-label">Work with me</p>
					<h2 id="work-heading" class="mt-4 text-4xl font-medium tracking-[-0.04em] sm:text-6xl">Find your way in.</h2>
					<p class="mt-6 text-lg leading-8 text-muted-foreground">Pick the one that matches what you need.</p>
				</div>
				<div class="mt-14 grid gap-5 lg:grid-cols-2">
					<component
						:is="route.to ? RouterLink : 'a'"
						v-for="route in routes"
						:key="route.title"
						:to="route.to"
						:href="route.to || route.href"
						:target="route.href ? '_blank' : undefined"
						:rel="route.href ? 'noopener noreferrer' : undefined"
						class="skin-card liquid-glass group flex flex-col rounded-[2rem] p-7 transition hover:-translate-y-1 sm:p-8"
					>
						<div class="flex items-start justify-between gap-4">
							<p class="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">{{ route.audience }}</p>
							<Planet v-if="ready && siteMode === 'space'" v-bind="route.planet" class="w-11 shrink-0 transition-transform duration-700 group-hover:scale-110" />
						</div>
						<h3 class="mt-8 text-2xl font-semibold tracking-[-0.03em]">{{ route.title }}</h3>
						<p class="mt-3 flex-1 leading-7 text-muted-foreground">{{ route.text }}</p>
						<p class="mt-8 flex items-center justify-between border-t border-border pt-5 text-sm font-semibold">
							{{ route.cta }}
							<span class="transition-transform group-hover:translate-x-1" aria-hidden="true">{{ route.href ? '↗' : '→' }}</span>
						</p>
					</component>
				</div>
			</section>

			<section class="py-24 sm:py-32" aria-labelledby="companies-heading">
				<div class="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
					<div>
						<p class="section-label">Companies</p>
						<h2 id="companies-heading" class="mt-4 text-4xl font-medium leading-tight tracking-[-0.04em] sm:text-5xl">Built for the long term.</h2>
					</div>
					<div class="divide-y divide-border border-y border-border">
						<a href="https://newicon.net" target="_blank" rel="noopener noreferrer" class="group grid gap-5 py-8 sm:grid-cols-[3.5rem_1fr_auto] sm:items-center">
							<Planet v-if="ready && siteMode === 'space'" color="oklch(0.55 0.12 160)" glow="oklch(0.88 0.1 150)" moon :orbit="18" class="hidden w-10 sm:block" />
							<div>
								<p class="font-display text-2xl font-semibold tracking-[-0.03em]">Newicon</p>
								<p class="mt-2 leading-7 text-muted-foreground">Founded and led for 18 years. Product engineering, complex software and digital transformation.</p>
							</div>
							<div class="text-left sm:text-right">
								<p class="font-mono text-xs uppercase tracking-[0.14em] text-nova">Acquired 2025</p>
								<p class="mt-1 text-sm text-muted-foreground">View company ↗</p>
							</div>
						</a>
						<a href="https://flex-digital.net" target="_blank" rel="noopener noreferrer" class="group grid gap-5 py-8 sm:grid-cols-[3.5rem_1fr_auto] sm:items-center">
							<Planet v-if="ready && siteMode === 'space'" color="oklch(0.55 0.18 350)" glow="oklch(0.85 0.1 10)" class="hidden w-8 justify-self-center sm:block" />
							<div>
								<p class="font-display text-2xl font-semibold tracking-[-0.03em]">Flex Digital</p>
								<p class="mt-2 leading-7 text-muted-foreground">A specialist digital marketing company built alongside Newicon.</p>
							</div>
							<p class="text-sm text-muted-foreground sm:text-right">View company ↗</p>
						</a>
					</div>
				</div>
			</section>

			<section class="grid gap-14 border-y border-border py-24 sm:py-32 lg:grid-cols-[1fr_1.2fr]" aria-labelledby="about-heading">
				<div class="hud-frame relative">
					<img :src="meImage" alt="Steve O’Brien" class="aspect-4/3 w-full rounded-[1.5rem] object-cover grayscale" />
					<div class="absolute inset-0 rounded-[1.5rem] bg-linear-to-t from-nebula/25 via-transparent to-plasma/10 mix-blend-screen"></div>
					<p class="skin-card liquid-glass absolute bottom-4 left-4 rounded-full px-3 py-1.5 text-xs font-medium text-foreground">Founder · Engineer · Author</p>
				</div>
				<div class="flex flex-col justify-center">
					<p class="section-label">Steve O’Brien</p>
					<h2 id="about-heading" class="mt-4 text-4xl font-medium leading-tight tracking-[-0.04em] sm:text-5xl">Founder experience. Engineer’s instinct.</h2>
					<p class="mt-7 text-lg leading-8 text-muted-foreground">
						I’ve spent more than two decades building software and companies, from first prototype to scaled operation. Today I work on practical AI products, developer systems, and the deeper question of what intelligence actually is.
					</p>
					<p class="mt-5 text-lg leading-8 text-muted-foreground">
						Based in Bristol, I stay close to the architecture, product and code—especially when the problem is still ambiguous.
					</p>
					<div class="mt-8 flex flex-wrap items-center gap-6 text-sm font-semibold">
						<a href="https://www.linkedin.com/in/stevenaobrien/" target="_blank" rel="noopener noreferrer" class="transition hover:text-plasma">LinkedIn ↗</a>
						<RouterLink to="/cv" class="text-muted-foreground transition hover:text-foreground">Professional history →</RouterLink>
					</div>
				</div>
			</section>


			<section id="follow" class="skin-card liquid-glass mt-24 mb-4 scroll-mt-24 rounded-[2.5rem] px-7 py-14 sm:px-12 sm:py-16" aria-labelledby="follow-heading">
				<div class="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
					<div>
						<p class="section-label">Follow along</p>
						<h2 id="follow-heading" class="mt-4 text-4xl font-medium leading-tight tracking-[-0.04em] sm:text-5xl">Learn what I learn, as I learn it.</h2>
						<p class="mt-6 text-lg leading-8 text-muted-foreground">New writing on AI and intelligence, progress on the book, and what I’m building with db3.ai.</p>
					</div>
					<FollowSignup id="footer-follow" />
				</div>
			</section>
		</article>
	</SteveLayout>
</template>

<style scoped>
.hero-gradient {
	background: linear-gradient(100deg, var(--nova) 0%, var(--ember) 30%, var(--nebula) 65%, var(--plasma) 100%);
	background-clip: text;
	color: transparent;
	margin-bottom: -0.15em;
	padding-bottom: 0.15em;
}

.signal-dot {
	width: 0.45rem;
	height: 0.45rem;
	border-radius: 999px;
	background: var(--plasma);
	box-shadow: 0 0 0 0 color-mix(in oklch, var(--plasma) 60%, transparent);
	animation: signal-pulse 2.4s ease-out infinite;
}

@keyframes signal-pulse {
	70% {
		box-shadow: 0 0 0 0.6rem transparent;
	}
	100% {
		box-shadow: 0 0 0 0 transparent;
	}
}

.section-label {
	font-family: var(--font-mono);
	font-size: 0.7rem;
	letter-spacing: 0.2em;
	text-transform: uppercase;
	color: var(--muted-foreground);
}

.product-card {
	transition:
		transform 500ms cubic-bezier(0.16, 1, 0.3, 1),
		box-shadow 500ms cubic-bezier(0.16, 1, 0.3, 1),
		border-color 500ms;
}

.product-card:hover {
	transform: translateY(-4px);
	border-color: color-mix(in oklch, var(--nebula) 40%, transparent);
	box-shadow: 0 30px 80px -35px color-mix(in oklch, var(--nebula) 55%, transparent);
}

.growth-visual {
	color: white;
	background:
		radial-gradient(circle at 75% 35%, rgb(60 200 220 / 22%), transparent 40%),
		radial-gradient(circle at 20% 90%, rgb(140 90 255 / 18%), transparent 45%),
		#05070f;
}

.growth-planet {
	transition: transform 900ms cubic-bezier(0.16, 1, 0.3, 1);
}

.product-card:hover .growth-planet {
	transform: scale(1.06) rotate(-6deg);
}

.book-panel {
	background:
		radial-gradient(ellipse at 85% 50%, rgb(255 170 80 / 18%), transparent 55%),
		#04050b;
	box-shadow: 0 50px 100px -60px rgb(0 0 0 / 80%);
}

.book-star {
	position: absolute;
	top: 50%;
	right: 18%;
	width: 26rem;
	aspect-ratio: 1;
	translate: 50% -50%;
	border-radius: 999px;
	background: radial-gradient(circle, rgb(255 236 200 / 55%) 0%, rgb(255 160 70 / 22%) 25%, transparent 60%);
	filter: blur(6px);
	animation: star-breathe 8s ease-in-out infinite alternate;
}

.book-orbit {
	position: absolute;
	top: 50%;
	right: 18%;
	border: 1px solid rgb(255 255 255 / 8%);
	border-radius: 999px;
	translate: 50% -50%;
}

.book-orbit-1 {
	width: 38rem;
	aspect-ratio: 1;
}

.book-orbit-2 {
	width: 58rem;
	aspect-ratio: 1;
	border-style: dashed;
	border-color: rgb(255 255 255 / 6%);
}

@keyframes star-breathe {
	to {
		scale: 1.12;
		opacity: 0.8;
	}
}

.book-cover {
	filter: drop-shadow(0 35px 45px rgb(0 0 0 / 70%));
	transform: perspective(1000px) rotateY(-5deg) rotateX(2deg);
	transition: transform 700ms cubic-bezier(0.16, 1, 0.3, 1);
}

.book-panel:hover .book-cover {
	transform: perspective(1000px) rotateY(-2deg) rotateX(1deg) translateY(-4px);
}

/* Corner brackets like a targeting reticle. */
.hud-frame::before,
.hud-frame::after {
	content: '';
	position: absolute;
	width: 2rem;
	height: 2rem;
	border: 1px solid var(--plasma);
	pointer-events: none;
}

.hud-frame::before {
	top: -0.6rem;
	left: -0.6rem;
	border-right: 0;
	border-bottom: 0;
}

.hud-frame::after {
	right: -0.6rem;
	bottom: -0.6rem;
	border-top: 0;
	border-left: 0;
}

@media (prefers-reduced-motion: reduce) {
	.product-card,
	.growth-planet,
	.book-cover {
		transition: none;
	}

	.signal-dot,
	.book-star {
		animation: none;
	}
}
</style>
