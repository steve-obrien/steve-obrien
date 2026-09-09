<script setup>
const implementationPhases = [
	{
		number: '01',
		title: 'Find the commercial leverage',
		text: 'Map your customer journey, evidence and constraints. Select the three opportunities most likely to create or protect revenue.',
	},
	{
		number: '02',
		title: 'Build the working systems',
		text: 'Prototype quickly, test with the people who will use them, then integrate the strongest version into your existing operation.',
	},
	{
		number: '03',
		title: 'Prove and transfer',
		text: 'Add measurement, document the decisions and leave your team able to operate, evaluate and improve what has been built.',
	},
];

const nativePhases = [
	{
		period: 'Days 1—15',
		title: 'Diagnose',
		text: 'Establish the commercial goals, workflow baseline, data reality and the places AI can make a material difference.',
	},
	{
		period: 'Days 16—45',
		title: 'Prove',
		text: 'Put the first useful systems into real work, with human review, evaluation and clear measures of value.',
	},
	{
		period: 'Days 46—75',
		title: 'Expand',
		text: 'Extend what works into connected workflows, shared knowledge and repeatable ways of building with AI.',
	},
	{
		period: 'Days 76—90',
		title: 'Embed',
		text: 'Transfer ownership, set practical governance and agree the next 12 months of product and operational change.',
	},
];

const principles = [
	{
		title: 'Working software, not theatre',
		text: 'The output is something your team and customers can use—not a strategy deck full of hypothetical use cases.',
	},
	{
		title: 'Commercial value first',
		text: 'We start with the customer and the economics, then decide where models, agents or automation genuinely help.',
	},
	{
		title: 'Built with your team',
		text: 'Decisions, safeguards and technical knowledge stay inside the business, so progress continues after the engagement.',
	},
];
</script>

<template>
	<SteveLayout bg-class="offers-page-background">
		<article>
			<header class="relative overflow-hidden border-b border-border pb-20 pt-16 sm:pb-28 sm:pt-24">
				<div class="offers-glow" aria-hidden="true"></div>
				<div class="relative z-10 grid gap-14 lg:grid-cols-[1fr_0.46fr] lg:items-end">
					<div>
						<p class="offers-kicker">AI development offers</p>
						<h1 class="mt-7 max-w-4xl text-[clamp(3.5rem,8vw,7rem)] font-medium leading-[0.92] tracking-[-0.065em]">
							Make AI pay
							<span class="offers-gradient block">its way.</span>
						</h1>
						<p class="mt-9 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl sm:leading-9">
							Two founder-led engagements for established companies ready to turn AI ambition into useful systems, stronger customer experiences and measurable commercial value.
						</p>
						<div class="mt-10 flex flex-wrap gap-3">
							<a href="#offers" class="rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:scale-[1.02]">
								Explore the offers
							</a>
							<a href="https://www.linkedin.com/in/stevenaobrien/" target="_blank" rel="noopener noreferrer" class="rounded-full border border-border bg-background/60 px-6 py-3 text-sm font-semibold backdrop-blur transition hover:border-foreground/30 hover:bg-secondary">
								Start a conversation ↗
							</a>
						</div>
					</div>
					<div class="border-l border-border pl-6 sm:pl-8">
						<p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">How I work</p>
						<ul class="mt-6 space-y-4 text-sm font-medium">
							<li class="flex items-center gap-3"><span class="size-1.5 rounded-full bg-emerald-500"></span>Founder-led throughout</li>
							<li class="flex items-center gap-3"><span class="size-1.5 rounded-full bg-emerald-500"></span>Strategy and hands-on engineering</li>
							<li class="flex items-center gap-3"><span class="size-1.5 rounded-full bg-emerald-500"></span>Designed around your real operation</li>
						</ul>
					</div>
				</div>
			</header>

			<section class="grid gap-10 border-b border-border py-20 sm:py-24 lg:grid-cols-[0.65fr_1.35fr]" aria-labelledby="problem-heading">
				<div>
					<p class="offers-kicker">The opportunity</p>
					<h2 id="problem-heading" class="mt-4 text-3xl font-medium tracking-[-0.04em] sm:text-4xl">From possibility to operating advantage.</h2>
				</div>
				<div class="max-w-3xl space-y-5 text-lg leading-8 text-muted-foreground">
					<p>Most companies do not need another AI workshop. They need to decide where AI creates real value, build the right thing and make it dependable enough to become part of the business.</p>
					<p>These offers create two clear ways to do that: start with three commercially focused implementations, or use 90 days to establish the first working version of an AI-native company.</p>
				</div>
			</section>

			<section id="offers" class="scroll-mt-8 py-20 sm:py-28" aria-labelledby="offers-heading">
				<div class="max-w-3xl">
					<p class="offers-kicker">Choose the right depth</p>
					<h2 id="offers-heading" class="mt-4 text-4xl font-medium tracking-[-0.045em] sm:text-6xl">Two ways to start building.</h2>
				</div>

				<div class="mt-14 grid gap-6 lg:grid-cols-2">
					<article class="offer-card flex flex-col overflow-hidden rounded-[2rem] border border-border bg-card">
						<div class="border-b border-border p-7 sm:p-9">
							<div class="flex flex-wrap items-center justify-between gap-3">
								<p class="offers-kicker">Offer 01 · Six weeks</p>
								<span class="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">Focused start</span>
							</div>
							<h3 class="mt-7 text-5xl font-medium leading-[0.95] tracking-[-0.055em] sm:text-6xl">Implement 3: Revenue</h3>
							<p class="mt-5 text-lg leading-8 text-muted-foreground">Select and implement three tightly scoped AI plays designed to create, convert or retain revenue.</p>
						</div>
						<div class="flex flex-1 flex-col p-7 sm:p-9">
							<p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">What you get</p>
							<ul class="mt-6 space-y-4 text-sm leading-6">
								<li class="flex gap-3"><span aria-hidden="true">01</span><span>Commercial opportunity and customer-journey mapping</span></li>
								<li class="flex gap-3"><span aria-hidden="true">02</span><span>Three working AI implementations in your existing operation</span></li>
								<li class="flex gap-3"><span aria-hidden="true">03</span><span>Evaluation, measurement and sensible human safeguards</span></li>
								<li class="flex gap-3"><span aria-hidden="true">04</span><span>Technical handover, team walkthrough and 30 days of support</span></li>
							</ul>
							<div class="mt-auto pt-10">
								<div class="border-t border-border pt-7">
									<p class="text-sm text-muted-foreground">Fixed engagement</p>
									<p class="mt-1 text-4xl font-semibold tracking-[-0.04em]">£18,000 <span class="text-base font-medium text-muted-foreground">+ VAT</span></p>
									<p class="mt-2 text-sm text-muted-foreground">50% to start · 50% on completion</p>
								</div>
								<a href="https://www.linkedin.com/in/stevenaobrien/" target="_blank" rel="noopener noreferrer" class="mt-7 flex w-full items-center justify-between rounded-full bg-foreground px-6 py-3.5 text-sm font-semibold text-background transition hover:scale-[1.01]">
									Discuss Implement 3 <span aria-hidden="true">↗</span>
								</a>
							</div>
						</div>
					</article>

					<article class="offer-card offer-card-featured flex flex-col overflow-hidden rounded-[2rem] bg-[#080b11] text-white">
						<div class="border-b border-white/10 p-7 sm:p-9">
							<div class="flex flex-wrap items-center justify-between gap-3">
								<p class="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">Offer 02 · 90 days</p>
								<span class="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">Company-wide</span>
							</div>
							<h3 class="mt-7 max-w-lg text-5xl font-medium leading-[0.95] tracking-[-0.055em] sm:text-6xl">The AI-Native Company</h3>
							<p class="mt-5 text-lg leading-8 text-white/60">Install the first working version of an AI-native operating model—across customers, operations, knowledge and product.</p>
						</div>
						<div class="flex flex-1 flex-col p-7 sm:p-9">
							<p class="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">What you get</p>
							<ul class="mt-6 space-y-4 text-sm leading-6 text-white/85">
								<li class="flex gap-3"><span class="text-white/40" aria-hidden="true">01</span><span>AI opportunity map, priorities and 90-day transformation plan</span></li>
								<li class="flex gap-3"><span class="text-white/40" aria-hidden="true">02</span><span>A portfolio of working systems around the highest-value priorities</span></li>
								<li class="flex gap-3"><span class="text-white/40" aria-hidden="true">03</span><span>Shared knowledge, evaluation and governance foundations</span></li>
								<li class="flex gap-3"><span class="text-white/40" aria-hidden="true">04</span><span>Team enablement and a board-ready roadmap for the next 12 months</span></li>
							</ul>
							<div class="mt-auto pt-10">
								<div class="border-t border-white/10 pt-7">
									<p class="text-sm text-white/50">Fixed 90-day programme</p>
									<p class="mt-1 text-4xl font-semibold tracking-[-0.04em]">£48,000 <span class="text-base font-medium text-white/50">+ VAT</span></p>
									<p class="mt-2 text-sm text-white/50">Three monthly payments of £16,000</p>
								</div>
								<a href="https://www.linkedin.com/in/stevenaobrien/" target="_blank" rel="noopener noreferrer" class="mt-7 flex w-full items-center justify-between rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-black transition hover:scale-[1.01]">
									Discuss the 90 days <span aria-hidden="true">↗</span>
								</a>
							</div>
						</div>
					</article>
				</div>

				<p class="mt-6 max-w-3xl text-sm leading-6 text-muted-foreground">
					Both prices assume one company, an available decision-maker and reasonable access to the people, systems and data involved. Third-party software, model usage and substantial new platform infrastructure are priced separately where required.
				</p>
			</section>

			<section class="border-y border-border py-20 sm:py-24" aria-labelledby="implement-heading">
				<div class="grid gap-12 lg:grid-cols-[0.62fr_1.38fr]">
					<div>
						<p class="offers-kicker">Inside Implement 3</p>
						<h2 id="implement-heading" class="mt-4 text-4xl font-medium leading-tight tracking-[-0.045em]">A deliberate path from opportunity to shipped value.</h2>
					</div>
					<div class="divide-y divide-border border-y border-border">
						<div v-for="phase in implementationPhases" :key="phase.number" class="grid gap-4 py-7 sm:grid-cols-[3rem_0.8fr_1.2fr] sm:gap-7">
							<span class="text-xs font-semibold text-muted-foreground">{{ phase.number }}</span>
							<h3 class="text-xl font-semibold tracking-[-0.025em]">{{ phase.title }}</h3>
							<p class="leading-7 text-muted-foreground">{{ phase.text }}</p>
						</div>
					</div>
				</div>
			</section>

			<section class="py-20 sm:py-28" aria-labelledby="native-heading">
				<div class="max-w-4xl">
					<p class="offers-kicker">Inside the 90 days</p>
					<h2 id="native-heading" class="mt-4 text-4xl font-medium leading-tight tracking-[-0.045em] sm:text-6xl">Change the operating system, not just the tools.</h2>
					<p class="mt-7 max-w-3xl text-lg leading-8 text-muted-foreground">Ninety days will not finish the AI transformation. It will create the priorities, working systems, internal capability and decision-making rhythm needed to make that transformation real.</p>
				</div>
				<div class="mt-14 grid gap-px overflow-hidden rounded-[2rem] border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
					<article v-for="phase in nativePhases" :key="phase.period" class="bg-card p-7">
						<p class="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{{ phase.period }}</p>
						<h3 class="mt-8 text-2xl font-semibold tracking-[-0.03em]">{{ phase.title }}</h3>
						<p class="mt-4 text-sm leading-6 text-muted-foreground">{{ phase.text }}</p>
					</article>
				</div>
			</section>

			<section class="rounded-[2rem] bg-secondary px-7 py-12 sm:px-12 sm:py-16" aria-labelledby="principles-heading">
				<div class="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
					<div>
						<p class="offers-kicker">Principles</p>
						<h2 id="principles-heading" class="mt-4 text-4xl font-medium leading-tight tracking-[-0.045em]">Practical by design.</h2>
					</div>
					<div class="grid gap-8 sm:grid-cols-3">
						<article v-for="(principle, index) in principles" :key="principle.title">
							<p class="text-xs font-semibold text-muted-foreground">0{{ index + 1 }}</p>
							<h3 class="mt-5 font-semibold">{{ principle.title }}</h3>
							<p class="mt-3 text-sm leading-6 text-muted-foreground">{{ principle.text }}</p>
						</article>
					</div>
				</div>
			</section>

			<section class="grid gap-12 border-b border-border py-20 sm:py-28 lg:grid-cols-[0.72fr_1.28fr]" aria-labelledby="fit-heading">
				<div>
					<p class="offers-kicker">Good fit</p>
					<h2 id="fit-heading" class="mt-4 text-4xl font-medium leading-tight tracking-[-0.045em]">Built for companies ready to act.</h2>
				</div>
				<div class="grid gap-8 sm:grid-cols-2">
					<div>
						<h3 class="font-semibold">This is likely right if…</h3>
						<ul class="mt-5 space-y-4 text-sm leading-6 text-muted-foreground">
							<li>You have customers, operating data and a meaningful commercial goal.</li>
							<li>Leadership can make decisions and give the work visible backing.</li>
							<li>You want senior thinking paired with hands-on implementation.</li>
						</ul>
					</div>
					<div>
						<h3 class="font-semibold">It is probably not right if…</h3>
						<ul class="mt-5 space-y-4 text-sm leading-6 text-muted-foreground">
							<li>You only need a generic AI training day or a list of ideas.</li>
							<li>No one can own the change once the engagement ends.</li>
							<li>The brief is to remove people without redesigning the work responsibly.</li>
						</ul>
					</div>
				</div>
			</section>

			<section class="py-20 sm:py-28" aria-labelledby="start-heading">
				<div class="relative overflow-hidden rounded-[2.5rem] bg-[#080b11] px-7 py-14 text-white sm:px-12 sm:py-20 lg:px-16">
					<div class="cta-glow" aria-hidden="true"></div>
					<div class="relative z-10 max-w-3xl">
						<p class="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Start with the business</p>
						<h2 id="start-heading" class="mt-5 text-4xl font-medium leading-tight tracking-[-0.05em] sm:text-6xl">Bring the goal. We’ll find the right first move.</h2>
						<p class="mt-7 max-w-2xl text-lg leading-8 text-white/60">The first conversation is a short fit check: what you want to change, why now and whether one of these offers is the right way to do it.</p>
						<a href="https://www.linkedin.com/in/stevenaobrien/" target="_blank" rel="noopener noreferrer" class="mt-9 inline-flex items-center gap-6 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-black transition hover:scale-[1.02]">
							Talk to Steve <span aria-hidden="true">↗</span>
						</a>
					</div>
				</div>
			</section>
		</article>
	</SteveLayout>
</template>

<style scoped>
.offers-page-background {
	background:
		radial-gradient(circle at 82% 7%, color-mix(in oklch, var(--foreground) 5%, transparent), transparent 30rem),
		var(--background);
}

.offers-kicker {
	font-size: 0.75rem;
	font-weight: 600;
	letter-spacing: 0.18em;
	text-transform: uppercase;
	color: var(--muted-foreground);
}

.offers-gradient {
	background: linear-gradient(105deg, var(--foreground) 5%, color-mix(in oklch, var(--foreground) 40%, #6577ff) 58%, #2a9d8f);
	background-clip: text;
	color: transparent;
	margin-bottom: -0.12em;
	padding-bottom: 0.12em;
}

.offers-glow {
	position: absolute;
	top: 2rem;
	right: -8rem;
	width: min(45rem, 75vw);
	aspect-ratio: 1;
	border-radius: 999px;
	background: radial-gradient(circle, rgb(101 119 255 / 12%), rgb(42 157 143 / 4%) 42%, transparent 70%);
	filter: blur(10px);
	pointer-events: none;
}

.offer-card {
	box-shadow: 0 30px 90px -55px rgb(0 0 0 / 35%);
}

.offer-card-featured {
	background:
		radial-gradient(circle at 88% 4%, rgb(101 119 255 / 28%), transparent 26rem),
		radial-gradient(circle at 20% 100%, rgb(42 157 143 / 12%), transparent 24rem),
		#080b11;
}

.cta-glow {
	position: absolute;
	top: -15rem;
	right: -8rem;
	width: 38rem;
	aspect-ratio: 1;
	border: 1px solid rgb(255 255 255 / 12%);
	border-radius: 999px;
	box-shadow:
		0 0 0 5rem rgb(255 255 255 / 3%),
		0 0 0 10rem rgb(255 255 255 / 2%);
}
</style>
