<script setup>
import { RouterLink } from 'vue-router';
import Planet from '../../cmp/Planet.vue';

const pricingSteps = [
	{
		number: '01',
		title: 'Agree the outcomes',
		text: 'Before any work starts we agree what each outcome is, how we will measure it, how we will check it together and what it costs.',
	},
	{
		number: '02',
		title: 'Build it into real work',
		text: 'We build the system, test it with the people who will use it and put it into your existing operation.',
	},
	{
		number: '03',
		title: 'Check it, then pay',
		text: 'When an outcome meets the measure we agreed, you pay for it. If it does not, you don’t.',
	},
];

const implementationPhases = [
	{
		number: '01',
		title: 'Find the commercial leverage',
		text: 'Map your customer journey, evidence and constraints. Select the three opportunities most likely to create or protect revenue, and agree each one as an outcome.',
	},
	{
		number: '02',
		title: 'Build the working systems',
		text: 'Prototype quickly, test with the people who will use them, then integrate the strongest version into your existing operation.',
	},
	{
		number: '03',
		title: 'Prove and transfer',
		text: 'Measure each outcome against what we agreed, document the decisions and leave your team able to operate and improve what has been built.',
	},
];

const nativePhases = [
	{
		period: 'Days 1—15',
		title: 'Diagnose',
		text: 'Outcome: agreed commercial goals, a workflow baseline, the data reality and a prioritised map of where AI makes a material difference.',
	},
	{
		period: 'Days 16—45',
		title: 'Prove',
		text: 'Outcome: the first useful systems in real work, with human review, evaluation and clear measures of value.',
	},
	{
		period: 'Days 46—75',
		title: 'Expand',
		text: 'Outcome: what works extended into connected workflows, shared knowledge and repeatable ways of building with AI.',
	},
	{
		period: 'Days 76—90',
		title: 'Embed',
		text: 'Outcome: ownership transferred, practical governance in place and the next 12 months of change agreed.',
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
	<SteveLayout>
		<article>
			<header class="relative pb-20 pt-16 sm:pb-28 sm:pt-24">
				<div class="relative z-10 grid gap-14 lg:grid-cols-[1fr_0.46fr] lg:items-end">
					<div>
						<p class="labs-kicker">db3 Labs · Applied AI for established companies</p>
						<h1 class="mt-7 max-w-4xl text-[clamp(3.25rem,7.5vw,6.5rem)] font-medium leading-[0.95] tracking-[-0.055em]">
							Pay for outcomes,
							<span class="labs-gradient block">not hours.</span>
						</h1>
						<p class="mt-9 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl sm:leading-9">
							db3 Labs is the applied side of <a href="https://db3.ai" target="_blank" rel="noopener noreferrer" class="text-foreground underline decoration-border underline-offset-4 transition hover:decoration-foreground">db3.ai</a>, led by me. We build working AI systems inside established companies. We agree the outcomes before we start, and you pay for each one when it is delivered.
						</p>
						<div class="mt-10 flex flex-wrap gap-3">
							<a href="#offers" class="skin-action launch-button rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:scale-[1.02]">
								See the engagements
							</a>
							<a href="https://www.linkedin.com/in/stevenaobrien/" target="_blank" rel="noopener noreferrer" class="skin-card liquid-glass rounded-full px-6 py-3 text-sm font-semibold transition hover:scale-[1.02]">
								Start a conversation ↗
							</a>
						</div>
					</div>
					<div class="skin-card liquid-glass rounded-3xl p-6 sm:p-7">
						<p class="labs-kicker">How we work</p>
						<ul class="mt-6 space-y-4 text-sm font-medium">
							<li class="flex items-center gap-3"><span class="size-1.5 rounded-full bg-nova"></span>Priced per agreed outcome</li>
							<li class="flex items-center gap-3"><span class="size-1.5 rounded-full bg-plasma"></span>Led by Steve O’Brien throughout</li>
							<li class="flex items-center gap-3"><span class="size-1.5 rounded-full bg-nebula"></span>Strategy and hands-on engineering</li>
						</ul>
					</div>
				</div>
			</header>

			<section class="grid gap-10 border-y border-border py-20 sm:py-24 lg:grid-cols-[0.65fr_1.35fr]" aria-labelledby="problem-heading">
				<div>
					<p class="labs-kicker">Why outcomes</p>
					<h2 id="problem-heading" class="mt-4 text-3xl font-medium tracking-[-0.04em] sm:text-4xl">You take on enough risk already.</h2>
				</div>
				<div class="max-w-3xl space-y-5 text-lg leading-8 text-muted-foreground">
					<p>Most companies do not need another AI workshop. They need to decide where AI creates real value, build the right thing and make it dependable enough to become part of the business.</p>
					<p>Paying by the day rewards activity. Paying per outcome means we both care about the same thing: a system that works in your business and does what we said it would.</p>
				</div>
			</section>

			<section class="py-20 sm:py-24" aria-labelledby="pricing-heading">
				<div class="max-w-3xl">
					<p class="labs-kicker">How the pricing works</p>
					<h2 id="pricing-heading" class="mt-4 text-4xl font-medium tracking-[-0.045em] sm:text-5xl">Agreed up front. Paid on delivery.</h2>
				</div>
				<div class="mt-12 grid gap-5 lg:grid-cols-3">
					<article v-for="step in pricingSteps" :key="step.number" class="skin-card liquid-glass rounded-[2rem] p-7">
						<p class="font-mono text-xs text-nebula">{{ step.number }}</p>
						<h3 class="mt-6 text-xl font-semibold tracking-[-0.025em]">{{ step.title }}</h3>
						<p class="mt-3 leading-7 text-muted-foreground">{{ step.text }}</p>
					</article>
				</div>
				<p class="mt-6 max-w-3xl text-sm leading-6 text-muted-foreground">
					An outcome is specific and checkable: a system in live use that meets a measure we both signed off before work began. We agree outcomes the work can control. “Revenue up 20%” depends on too much else, while “qualified leads routed and answered within five minutes” does not.
				</p>
			</section>

			<section id="offers" class="scroll-mt-24 border-t border-border py-20 sm:py-28" aria-labelledby="offers-heading">
				<div class="max-w-3xl">
					<p class="labs-kicker">Choose the right depth</p>
					<h2 id="offers-heading" class="mt-4 text-4xl font-medium tracking-[-0.045em] sm:text-6xl">Two ways to start building.</h2>
				</div>

				<div class="mt-14 grid gap-6 lg:grid-cols-2">
					<article class="skin-card liquid-glass flex flex-col overflow-hidden rounded-[2rem]">
						<div class="border-b border-border p-7 sm:p-9">
							<div class="flex flex-wrap items-center justify-between gap-3">
								<p class="labs-kicker">Engagement 01 · Six weeks</p>
								<span class="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">3 outcomes</span>
							</div>
							<h3 class="mt-7 text-5xl font-medium leading-[0.95] tracking-[-0.055em] sm:text-6xl">Implement 3: Revenue</h3>
							<p class="mt-5 text-lg leading-8 text-muted-foreground">Select and implement three tightly scoped AI plays designed to create, convert or retain revenue.</p>
						</div>
						<div class="flex flex-1 flex-col p-7 sm:p-9">
							<p class="labs-kicker">What you get</p>
							<ul class="mt-6 space-y-4 text-sm leading-6">
								<li class="flex gap-3"><span class="font-mono text-muted-foreground" aria-hidden="true">01</span><span>Commercial opportunity and customer-journey mapping</span></li>
								<li class="flex gap-3"><span class="font-mono text-muted-foreground" aria-hidden="true">02</span><span>Three working AI implementations in your existing operation</span></li>
								<li class="flex gap-3"><span class="font-mono text-muted-foreground" aria-hidden="true">03</span><span>Evaluation, measurement and sensible human safeguards</span></li>
								<li class="flex gap-3"><span class="font-mono text-muted-foreground" aria-hidden="true">04</span><span>Technical handover, team walkthrough and 30 days of support</span></li>
							</ul>
							<div class="mt-auto pt-10">
								<div class="border-t border-border pt-7">
									<p class="text-sm text-muted-foreground">Pricing</p>
									<p class="mt-1 font-display text-3xl font-semibold tracking-[-0.04em]">Per outcome</p>
									<p class="mt-2 text-sm text-muted-foreground">Three outcomes, each priced before work starts and paid when delivered.</p>
								</div>
								<a href="https://www.linkedin.com/in/stevenaobrien/" target="_blank" rel="noopener noreferrer" class="skin-card liquid-glass mt-7 flex w-full items-center justify-between rounded-full px-6 py-3.5 text-sm font-semibold transition hover:scale-[1.01]">
									Discuss Implement 3 <span aria-hidden="true">↗</span>
								</a>
							</div>
						</div>
					</article>

					<article class="labs-featured flex flex-col overflow-hidden rounded-[2rem] border border-border">
						<div class="border-b border-border p-7 sm:p-9">
							<div class="flex flex-wrap items-center justify-between gap-3">
								<p class="labs-kicker">Engagement 02 · 90 days</p>
								<span class="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">4 outcomes</span>
							</div>
							<h3 class="mt-7 max-w-lg text-5xl font-medium leading-[0.95] tracking-[-0.055em] sm:text-6xl">The AI-Native Company</h3>
							<p class="mt-5 text-lg leading-8 text-muted-foreground">Install the first working version of an AI-native operating model—across customers, operations, knowledge and product.</p>
						</div>
						<div class="flex flex-1 flex-col p-7 sm:p-9">
							<p class="labs-kicker">What you get</p>
							<ul class="mt-6 space-y-4 text-sm leading-6">
								<li class="flex gap-3"><span class="font-mono text-muted-foreground" aria-hidden="true">01</span><span>AI opportunity map, priorities and 90-day transformation plan</span></li>
								<li class="flex gap-3"><span class="font-mono text-muted-foreground" aria-hidden="true">02</span><span>A portfolio of working systems around the highest-value priorities</span></li>
								<li class="flex gap-3"><span class="font-mono text-muted-foreground" aria-hidden="true">03</span><span>Shared knowledge, evaluation and governance foundations</span></li>
								<li class="flex gap-3"><span class="font-mono text-muted-foreground" aria-hidden="true">04</span><span>Team enablement and a board-ready roadmap for the next 12 months</span></li>
							</ul>
							<div class="mt-auto pt-10">
								<div class="border-t border-border pt-7">
									<p class="text-sm text-muted-foreground">Pricing</p>
									<p class="mt-1 font-display text-3xl font-semibold tracking-[-0.04em]">Per outcome</p>
									<p class="mt-2 text-sm text-muted-foreground">One outcome per stage, each priced before work starts and paid when delivered.</p>
								</div>
								<a href="https://www.linkedin.com/in/stevenaobrien/" target="_blank" rel="noopener noreferrer" class="skin-action launch-button mt-7 flex w-full items-center justify-between rounded-full px-6 py-3.5 text-sm font-semibold text-primary-foreground transition hover:scale-[1.01]">
									Discuss the 90 days <span aria-hidden="true">↗</span>
								</a>
							</div>
						</div>
					</article>
				</div>

				<p class="mt-6 max-w-3xl text-sm leading-6 text-muted-foreground">
					Both engagements assume one company, an available decision-maker and reasonable access to the people, systems and data involved. Third-party software, model usage and substantial new platform infrastructure are priced separately where required.
				</p>
			</section>

			<section class="border-y border-border py-20 sm:py-24" aria-labelledby="implement-heading">
				<div class="grid gap-12 lg:grid-cols-[0.62fr_1.38fr]">
					<div>
						<p class="labs-kicker">Inside Implement 3</p>
						<h2 id="implement-heading" class="mt-4 text-4xl font-medium leading-tight tracking-[-0.045em]">A deliberate path from opportunity to shipped value.</h2>
					</div>
					<div class="divide-y divide-border border-y border-border">
						<div v-for="phase in implementationPhases" :key="phase.number" class="grid gap-4 py-7 sm:grid-cols-[3rem_0.8fr_1.2fr] sm:gap-7">
							<span class="font-mono text-xs text-nebula">{{ phase.number }}</span>
							<h3 class="text-xl font-semibold tracking-[-0.025em]">{{ phase.title }}</h3>
							<p class="leading-7 text-muted-foreground">{{ phase.text }}</p>
						</div>
					</div>
				</div>
			</section>

			<section class="py-20 sm:py-28" aria-labelledby="native-heading">
				<div class="max-w-4xl">
					<p class="labs-kicker">Inside the 90 days</p>
					<h2 id="native-heading" class="mt-4 text-4xl font-medium leading-tight tracking-[-0.045em] sm:text-6xl">Change the operating system, not just the tools.</h2>
					<p class="mt-7 max-w-3xl text-lg leading-8 text-muted-foreground">Ninety days will not finish the AI transformation. It will create the priorities, working systems, internal capability and decision-making rhythm needed to make that transformation real. Each stage ends in an outcome you can check.</p>
				</div>
				<div class="skin-card liquid-glass mt-14 grid overflow-hidden rounded-[2rem] sm:grid-cols-2 lg:grid-cols-4">
					<article v-for="phase in nativePhases" :key="phase.period" class="border-b border-border p-7 last:border-b-0 sm:border-r lg:border-b-0 lg:last:border-r-0">
						<p class="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">{{ phase.period }}</p>
						<h3 class="mt-8 text-2xl font-semibold tracking-[-0.03em]">{{ phase.title }}</h3>
						<p class="mt-4 text-sm leading-6 text-muted-foreground">{{ phase.text }}</p>
					</article>
				</div>
			</section>

			<section class="skin-card liquid-glass rounded-[2rem] px-7 py-12 sm:px-12 sm:py-16" aria-labelledby="principles-heading">
				<div class="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
					<div>
						<p class="labs-kicker">Principles</p>
						<h2 id="principles-heading" class="mt-4 text-4xl font-medium leading-tight tracking-[-0.045em]">Practical by design.</h2>
					</div>
					<div class="grid gap-8 sm:grid-cols-3">
						<article v-for="(principle, index) in principles" :key="principle.title">
							<p class="font-mono text-xs text-nebula">0{{ index + 1 }}</p>
							<h3 class="mt-5 font-semibold">{{ principle.title }}</h3>
							<p class="mt-3 text-sm leading-6 text-muted-foreground">{{ principle.text }}</p>
						</article>
					</div>
				</div>
			</section>

			<section class="grid gap-12 border-b border-border py-20 sm:py-28 lg:grid-cols-[0.72fr_1.28fr]" aria-labelledby="fit-heading">
				<div>
					<p class="labs-kicker">Good fit</p>
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

			<section class="py-16" aria-labelledby="course-heading">
				<RouterLink to="/course" class="skin-card liquid-glass group flex flex-col gap-6 rounded-[2rem] p-7 sm:flex-row sm:items-center sm:p-9">
					<Planet color="oklch(0.55 0.14 200)" glow="oklch(0.88 0.1 190)" moon class="w-14 shrink-0" />
					<div class="flex-1">
						<p class="labs-kicker">Rather build it yourselves?</p>
						<h2 id="course-heading" class="mt-2 text-2xl font-semibold tracking-[-0.03em]">Learn to implement AI with your own team.</h2>
						<p class="mt-2 leading-7 text-muted-foreground">I implement one AI process for you, then one with you, and your team gains the skills to keep going.</p>
					</div>
					<span class="text-sm font-semibold transition-transform group-hover:translate-x-1">The course →</span>
				</RouterLink>
			</section>

			<section class="pb-8" aria-labelledby="start-heading">
				<div class="labs-cta relative overflow-hidden rounded-[2.5rem] border border-border px-7 py-14 sm:px-12 sm:py-20 lg:px-16">
					<div class="relative z-10 max-w-3xl">
						<p class="labs-kicker">Start with the business</p>
						<h2 id="start-heading" class="mt-5 text-4xl font-medium leading-tight tracking-[-0.05em] sm:text-6xl">Bring the goal. We’ll agree the outcomes.</h2>
						<p class="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground">The first conversation is a short fit check: what you want to change, why now and whether one of these engagements is the right way to do it.</p>
						<a href="https://www.linkedin.com/in/stevenaobrien/" target="_blank" rel="noopener noreferrer" class="skin-action launch-button mt-9 inline-flex items-center gap-6 rounded-full px-6 py-3.5 text-sm font-semibold text-primary-foreground transition hover:scale-[1.02]">
							Talk to Steve <span aria-hidden="true">↗</span>
						</a>
					</div>
				</div>
			</section>
		</article>
	</SteveLayout>
</template>

<style scoped>
.labs-kicker {
	font-family: var(--font-mono);
	font-size: 0.7rem;
	letter-spacing: 0.18em;
	text-transform: uppercase;
	color: var(--muted-foreground);
}

.labs-gradient {
	background: linear-gradient(100deg, var(--nova) 0%, var(--ember) 30%, var(--nebula) 65%, var(--plasma) 100%);
	background-clip: text;
	color: transparent;
	margin-bottom: -0.12em;
	padding-bottom: 0.12em;
}

.labs-featured {
	background:
		radial-gradient(circle at 88% 4%, color-mix(in oklch, var(--nova) 22%, transparent), transparent 26rem),
		radial-gradient(circle at 15% 100%, color-mix(in oklch, var(--nebula) 18%, transparent), transparent 24rem),
		color-mix(in oklch, var(--card) 70%, transparent);
	backdrop-filter: blur(18px);
}

.labs-cta {
	background:
		radial-gradient(circle at 90% 0%, color-mix(in oklch, var(--ember) 25%, transparent), transparent 30rem),
		radial-gradient(circle at 0% 100%, color-mix(in oklch, var(--nebula) 18%, transparent), transparent 26rem),
		#04050b;
}
</style>
