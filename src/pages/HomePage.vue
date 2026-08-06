<script setup>
import { RouterLink } from 'vue-router';
import HeroOrbs from '../cmp/HeroOrbs.vue';
import RotatingHeroWord from '../cmp/RotatingHeroWord.vue';
import meImage from '../assets/me.jpeg';
import bookCover from './projects/bookCover3.png';
import domStudioCard from './projects/dom_studio_card.png';

const heroWords = ['intelligence', 'software products', 'Ai brains', 'nerdy things', 'interpretive dance', 'companies'];

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
	<SteveLayout bg-class="home-page-background">
		<article>
			<header class="hero relative flex min-h-[74vh] items-center border-b border-border py-24 sm:py-32">
				<HeroOrbs />
				<div class="relative z-10 max-w-5xl">
					<p class="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
						<span class="size-1.5 rounded-full bg-emerald-500"></span>
						Steve O’Brien · Founder, engineer &amp; author
					</p>
					<h1 class="mt-8 max-w-5xl text-[clamp(3.5rem,9vw,7.5rem)] font-medium leading-none tracking-[-0.065em]">
						Building useful
						<RotatingHeroWord :words="heroWords" class="hero-gradient block" />
					</h1>
					<p class="mt-10 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl sm:leading-9">
						I build products, companies and technical systems at the edge of AI. Turning difficult ideas into things people can actually use.
					</p>
					<div class="mt-10 flex flex-wrap gap-3">
						<RouterLink to="/projects" class="origin-left rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:scale-[1.02]">
							Explore the work
						</RouterLink>
						<a href="#intelligence" class="rounded-full border border-border bg-background/60 px-6 py-3 text-sm font-semibold backdrop-blur transition hover:border-foreground/30 hover:bg-secondary">
							The intelligence project
						</a>
					</div>
				</div>
			</header>

			<section class="grid border-b border-border sm:grid-cols-3" aria-label="Current focus">
				<a href="https://growthscout.io" target="_blank" rel="noopener noreferrer" class="group border-b border-border py-7 sm:border-r sm:border-b-0 sm:px-7 first:pl-0">
					<p class="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">01 · Search intelligence</p>
					<p class="mt-3 flex items-center justify-between text-lg font-semibold">
						GrowthScout <span class="transition-transform group-hover:translate-x-1">↗</span>
					</p>
				</a>
				<a href="https://getdom.studio" target="_blank" rel="noopener noreferrer" class="group border-b border-border py-7 sm:border-r sm:border-b-0 sm:px-7">
					<p class="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">02 · Interface systems</p>
					<p class="mt-3 flex items-center justify-between text-lg font-semibold">
						DOM Studio <span class="transition-transform group-hover:translate-x-1">↗</span>
					</p>
				</a>
				<a href="#intelligence" class="group py-7 sm:pl-7">
					<p class="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">03 · Research &amp; writing</p>
					<p class="mt-3 flex items-center justify-between text-lg font-semibold">
						Intelligence <span class="transition-transform group-hover:translate-x-1">↓</span>
					</p>
				</a>
			</section>

			<section class="py-24 sm:py-32" aria-labelledby="projects-heading">
				<div class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<p class="section-label">Selected systems</p>
						<h2 id="projects-heading" class="mt-4 text-4xl font-medium tracking-[-0.04em] sm:text-6xl">Ideas made operational.</h2>
					</div>
					<RouterLink to="/projects" class="text-sm font-semibold text-muted-foreground transition hover:text-foreground">All projects →</RouterLink>
				</div>

				<div class="mt-14 grid gap-6 lg:grid-cols-2">
					<a href="https://growthscout.io" target="_blank" rel="noopener noreferrer" class="product-card group overflow-hidden rounded-[2rem] border border-white/10 bg-[#080b11] text-white">
						<div class="growth-visual relative aspect-4/3 overflow-hidden p-7 sm:p-10">
							<div class="relative z-10 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-white/55">
								<span>GrowthScout</span>
								<span>Live product ↗</span>
							</div>
							<div class="growth-rings" aria-hidden="true"></div>
							<div class="absolute inset-x-7 bottom-7 z-10 sm:inset-x-10 sm:bottom-10">
								<p class="max-w-sm text-3xl font-medium leading-tight tracking-[-0.04em] sm:text-5xl">From search data to clear decisions.</p>
							</div>
						</div>
						<div class="border-t border-white/10 p-7 sm:p-9">
							<p class="max-w-xl leading-7 text-white/60">AI-powered search intelligence that turns evidence into practical content strategy and action.</p>
						</div>
					</a>

					<a href="https://getdom.studio" target="_blank" rel="noopener noreferrer" class="product-card group overflow-hidden rounded-[2rem] border border-border bg-card">
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

			<section id="intelligence" class="book-panel overflow-hidden rounded-[2.5rem] bg-[#080808] text-white" aria-labelledby="book-heading">
				<div class="grid items-center gap-10 px-7 py-12 sm:px-12 sm:py-16 lg:grid-cols-[0.9fr_1.1fr] lg:px-16 lg:py-20">
					<div class="order-2 lg:order-1">
						<p class="text-xs font-semibold uppercase tracking-[0.2em] text-[#d7a72f]">Book in progress</p>
						<h2 id="book-heading" class="mt-6 max-w-2xl text-4xl font-medium leading-[0.98] tracking-tighter sm:text-6xl">
							Human, artificial and future intelligence.
						</h2>
						<p class="mt-7 max-w-xl text-lg leading-8 text-white/60">
							An investigation into how minds work, how machines think, and what neuroscience may reveal about the future of intelligence.
						</p>
						<div class="mt-10 grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-3">
							<div class="bg-[#111] p-5">
								<p class="text-xs uppercase tracking-[0.16em] text-white/40">01</p>
								<p class="mt-5 font-medium">Human</p>
							</div>
							<div class="bg-[#111] p-5">
								<p class="text-xs uppercase tracking-[0.16em] text-white/40">02</p>
								<p class="mt-5 font-medium">Artificial</p>
							</div>
							<div class="bg-[#111] p-5">
								<p class="text-xs uppercase tracking-[0.16em] text-white/40">03</p>
								<p class="mt-5 font-medium">Future</p>
							</div>
						</div>
						<a href="https://steve-98.kit.com/4b5ef441c9" target="_blank" rel="noopener noreferrer" class="mt-9 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.02]">
							Follow the book
						</a>
					</div>
					<div class="order-1 flex justify-center lg:order-2 lg:justify-end">
						<img :src="bookCover" alt="Intelligence: Human, Artificial, Future by Steve O’Brien" class="book-cover w-full max-w-sm" />
					</div>
				</div>
			</section>

			<section class="border-b border-border py-24 sm:py-32" aria-labelledby="companies-heading">
				<div class="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
					<div>
						<p class="section-label">Companies</p>
						<h2 id="companies-heading" class="mt-4 text-4xl font-medium leading-tight tracking-[-0.04em] sm:text-5xl">Built for the long term.</h2>
					</div>
					<div class="divide-y divide-border border-y border-border">
						<a href="https://newicon.net" target="_blank" rel="noopener noreferrer" class="group grid gap-5 py-8 sm:grid-cols-[1fr_auto] sm:items-center">
							<div>
								<p class="text-2xl font-semibold tracking-[-0.03em]">Newicon</p>
								<p class="mt-2 leading-7 text-muted-foreground">Founded and led for 18 years. Product engineering, complex software and digital transformation.</p>
							</div>
							<div class="text-left sm:text-right">
								<p class="text-sm font-semibold">Acquired 2025</p>
								<p class="mt-1 text-sm text-muted-foreground">View company ↗</p>
							</div>
						</a>
						<a href="https://flex-digital.net" target="_blank" rel="noopener noreferrer" class="group grid gap-5 py-8 sm:grid-cols-[1fr_auto] sm:items-center">
							<div>
								<p class="text-2xl font-semibold tracking-[-0.03em]">Flex Digital</p>
								<p class="mt-2 leading-7 text-muted-foreground">A specialist digital marketing company built alongside Newicon.</p>
							</div>
							<p class="text-sm font-semibold text-muted-foreground sm:text-right">View company ↗</p>
						</a>
					</div>
				</div>
			</section>

			<section class="grid gap-14 border-b border-border py-24 sm:py-32 lg:grid-cols-[1fr_1.2fr]" aria-labelledby="about-heading">
				<div class="relative">
					<img :src="meImage" alt="Steve O’Brien" class="aspect-4/3 w-full rounded-[2rem] object-cover grayscale" />
					<div class="absolute inset-0 rounded-[2rem] bg-linear-to-t from-black/20 to-transparent"></div>
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
						<a href="https://www.linkedin.com/in/stevenaobrien/" target="_blank" rel="noopener noreferrer" class="transition hover:text-muted-foreground">LinkedIn ↗</a>
						<RouterLink to="/cv" class="text-muted-foreground transition hover:text-foreground">Professional history →</RouterLink>
					</div>
				</div>
			</section>

			<section class="py-24 sm:py-32" aria-labelledby="writing-heading">
				<div class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<p class="section-label">Ideas</p>
						<h2 id="writing-heading" class="mt-4 text-4xl font-medium tracking-[-0.04em] sm:text-6xl">Thinking in public.</h2>
					</div>
					<RouterLink to="/articles" class="text-sm font-semibold text-muted-foreground transition hover:text-foreground">All writing →</RouterLink>
				</div>
				<div class="mt-12 divide-y divide-border border-y border-border">
					<RouterLink v-for="(article, index) in selectedWriting" :key="article.title" :to="article.href" class="group grid gap-4 py-8 sm:grid-cols-[3rem_0.8fr_1.2fr] sm:items-start sm:gap-8">
						<span class="text-xs font-medium text-muted-foreground">0{{ index + 1 }}</span>
						<h3 class="text-2xl font-semibold tracking-[-0.03em] transition group-hover:text-muted-foreground">{{ article.title }}</h3>
						<p class="leading-7 text-muted-foreground">{{ article.text }}</p>
					</RouterLink>
				</div>
			</section>
		</article>
	</SteveLayout>
</template>

<style scoped>
.home-page-background {
	background:
		radial-gradient(circle at 82% 7%, color-mix(in oklch, var(--foreground) 4%, transparent), transparent 30rem),
		var(--background);
}

.hero-gradient {
	background: linear-gradient(105deg, var(--foreground) 5%, color-mix(in oklch, var(--foreground) 42%, #6577ff) 60%, #2a9d8f);
	background-clip: text;
	color: transparent;
	margin-bottom: -0.15em;
	padding-bottom: 0.15em;
}

.section-label {
	font-size: 0.75rem;
	font-weight: 600;
	letter-spacing: 0.18em;
	text-transform: uppercase;
	color: var(--muted-foreground);
}

.product-card {
	transition:
		transform 500ms cubic-bezier(0.16, 1, 0.3, 1),
		box-shadow 500ms cubic-bezier(0.16, 1, 0.3, 1);
}

.product-card:hover {
	transform: translateY(-4px);
	box-shadow: 0 30px 80px -35px rgb(0 0 0 / 35%);
}

.growth-visual {
	background:
		radial-gradient(circle at 82% 22%, rgb(94 113 255 / 38%), transparent 25%),
		radial-gradient(circle at 60% 70%, rgb(0 191 166 / 20%), transparent 36%),
		#080b11;
}

.growth-rings {
	position: absolute;
	top: 18%;
	right: -12%;
	width: 72%;
	aspect-ratio: 1;
	border: 1px solid rgb(255 255 255 / 16%);
	border-radius: 999px;
	box-shadow:
		0 0 0 3rem rgb(255 255 255 / 3%),
		0 0 0 6rem rgb(255 255 255 / 2%);
	transition: transform 900ms cubic-bezier(0.16, 1, 0.3, 1);
}

.product-card:hover .growth-rings {
	transform: scale(1.06) rotate(8deg);
}

.book-panel {
	box-shadow: 0 50px 100px -60px rgb(0 0 0 / 70%);
}

.book-cover {
	filter: drop-shadow(0 35px 45px rgb(0 0 0 / 55%));
	transform: perspective(1000px) rotateY(-5deg) rotateX(2deg);
	transition: transform 700ms cubic-bezier(0.16, 1, 0.3, 1);
}

.book-panel:hover .book-cover {
	transform: perspective(1000px) rotateY(-2deg) rotateX(1deg) translateY(-4px);
}

@media (prefers-reduced-motion: reduce) {
	.product-card,
	.growth-rings,
	.book-cover {
		transition: none;
	}
}
</style>
