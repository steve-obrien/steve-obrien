<script setup>
import { computed, ref } from 'vue';
import { offerTerms, splitSaving } from './offer.js';

const monthlySpend = ref(5000);
const replaceablePercent = ref(80);

/** Monthly subscription cost the custom tools would replace, in pounds. */
const replacedSpend = computed(() => Math.round((Number(monthlySpend.value) || 0) * replaceablePercent.value / 100));

/** The split of the replaced spend between the client and Steve. */
const split = computed(() => splitSaving(replacedSpend.value));

/** Whether the replaced spend clears the offer's monthly minimum. */
const meetsMinimum = computed(() => replacedSpend.value >= offerTerms.minimumMonthlySpend);

/**
 * Formats a pound amount for display without pence.
 *
 * @param {number} value Amount in pounds.
 * @returns {string} The amount formatted as GBP, for example "£2,000".
 */
function formatPounds(value) {
	return new Intl.NumberFormat('en-GB', {
		style: 'currency',
		currency: 'GBP',
		maximumFractionDigits: 0,
	}).format(value);
}

const steps = [
	{
		number: '01',
		title: 'The software audit',
		text: 'We go through every subscription you pay for, who uses it and which parts they actually use. We agree in writing what you spend today. That number becomes the baseline.',
	},
	{
		number: '02',
		title: 'I build, you pay nothing',
		text: 'I build the replacement tools around how your team works, not how a vendor guessed it might. The build costs you nothing. That risk is mine.',
	},
	{
		number: '03',
		title: 'Run them side by side',
		text: 'Keep the old subscription while your team tries the new tool. I move your data across and fix what is wrong. You cancel when you are happy, not before.',
	},
	{
		number: '04',
		title: 'Cancel and share the saving',
		text: `Once the old subscription is gone, we split what you save ${offerTerms.sharePercent}/50 for ${offerTerms.termMonths} months. After that, the whole saving is yours.`,
	},
];

const included = [
	'Custom tools built for your team and your process',
	'Data moved across from the tools you are leaving',
	'Your own db3 Cloud workspace, with staging and production',
	'Hosting, security updates and backups',
	'Bug fixes, for as long as the agreement runs',
	'Small improvements as your team asks for them',
	'A walkthrough for the people who will use it every day',
	'Your data, exportable whenever you want it',
];

const goodFits = [
	'CRMs and sales pipelines charged per seat',
	'Project, task and job management tools',
	'Booking, scheduling and form builders',
	'Internal dashboards and reporting tools',
	'Niche industry software you use a fraction of',
	'Automation glue holding the other tools together',
];

const poorFits = [
	'Payroll, accounting ledgers and tax filing',
	'Email, phones and core infrastructure',
	'Regulated systems where the vendor carries the compliance',
	'Platforms you genuinely use most of and like',
];

const questions = [
	{
		question: 'What does “saving” mean, exactly?',
		answer: 'The cost of the subscriptions you cancel, minus what the new tools cost to host. If you cancel £4,000 a month of software and hosting costs £150, the saving is £3,850. We agree the baseline in writing before I build anything, so neither of us has to argue about it later.',
	},
	{
		question: 'What about AI usage?',
		answer: 'Some tools are better with AI inside them: reading documents, drafting replies, sorting enquiries. That usage is charged on top, at cost, and you can see it in db3 Cloud. Plenty of tools need none at all. I’ll tell you before I build which ones will use it and roughly what it will cost.',
	},
	{
		question: 'What if I don’t like what you build?',
		answer: 'Then you don’t cancel the old subscription, and you don’t pay me. You only start paying once you have switched something off. If you cancel and change your mind within 90 days, switch back and the fee for that tool stops.',
	},
	{
		question: 'Do I pay you forever?',
		answer: `No. The split runs for ${offerTerms.termMonths} months from the day each subscription is cancelled. After that you keep the full saving. If you want me to keep looking after it, we agree a small fixed maintenance fee. If you don’t, you take the code.`,
	},
	{
		question: 'Who owns the code?',
		answer: `You can use it from day one. Ownership passes to you at the end of the ${offerTerms.termMonths} months, or earlier if you buy out the remaining share. Your data is yours throughout, whatever happens.`,
	},
	{
		question: 'What if the vendor would have put its prices up?',
		answer: 'The baseline is fixed when we agree it. I don’t charge you more because a vendor would have raised its prices or because you would have added seats. That upside is yours.',
	},
	{
		question: 'What if we grow and need more?',
		answer: 'Small changes are part of the deal. That is why the minimum is £200 a month: it pays for the time to build and maintain small features. Bigger new work, the kind that would need its own project, I quote separately.',
	},
	{
		question: 'Can my team make changes themselves?',
		answer: 'Yes, if you want them to. Everything runs in db3 Cloud, so changes go to staging first and reach production only when someone approves them. Add the training and your team can build and change tools themselves, with that safety net in place.',
	},
	{
		question: 'Why would you take this risk?',
		answer: 'Because I think most companies are renting software they could own for less, and the only honest way to prove it is to be paid from the result. If I build something you don’t use, I have wasted my own time. That keeps me focused on what you actually need.',
	},
];
</script>

<template>
	<SteveLayout bg-class="swap-page-background">
		<article>
			<header class="relative overflow-hidden border-b border-border pb-20 pt-16 sm:pb-28 sm:pt-24">
				<div class="swap-glow" aria-hidden="true"></div>
				<div class="relative z-10 grid gap-14 lg:grid-cols-[1fr_0.46fr] lg:items-end">
					<div>
						<p class="swap-kicker">The Subscription Swap · {{ offerTerms.pilotPlaces }} pilot places</p>
						<h1 class="mt-7 max-w-4xl text-[clamp(3.5rem,8vw,7rem)] font-medium leading-[0.92] tracking-[-0.065em]">
							Stop renting
							<span class="swap-gradient block">your software.</span>
						</h1>
						<p class="mt-9 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl sm:leading-9">
							I’ll build you your own tools to replace the subscriptions you pay for every month. It costs you nothing to build. You pay me half of what you save, and only once you’ve cancelled the old one.
						</p>
						<div class="mt-10 flex flex-wrap gap-3">
							<a href="#calculator" class="rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:scale-[1.02]">
								Work out your saving
							</a>
							<a href="https://www.linkedin.com/in/stevenaobrien/" target="_blank" rel="noopener noreferrer" class="rounded-full border border-border bg-background/60 px-6 py-3 text-sm font-semibold backdrop-blur transition hover:border-foreground/30 hover:bg-secondary">
								Apply for a pilot place ↗
							</a>
						</div>
					</div>
					<div class="border-l border-border pl-6 sm:pl-8">
						<p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">The deal</p>
						<ul class="mt-6 space-y-4 text-sm font-medium">
							<li class="flex items-center gap-3"><span class="size-1.5 rounded-full bg-emerald-500"></span>£0 to build</li>
							<li class="flex items-center gap-3"><span class="size-1.5 rounded-full bg-emerald-500"></span>Paid only from what you save</li>
							<li class="flex items-center gap-3"><span class="size-1.5 rounded-full bg-emerald-500"></span>Nothing due until you cancel</li>
							<li class="flex items-center gap-3"><span class="size-1.5 rounded-full bg-emerald-500"></span>The full saving is yours after {{ offerTerms.termMonths }} months</li>
						</ul>
					</div>
				</div>
			</header>

			<section class="grid gap-10 border-b border-border py-20 sm:py-24 lg:grid-cols-[0.65fr_1.35fr]" aria-labelledby="problem-heading">
				<div>
					<p class="swap-kicker">The problem</p>
					<h2 id="problem-heading" class="mt-4 text-3xl font-medium tracking-[-0.04em] sm:text-4xl">Nobody decides to spend £5,000 a month on software.</h2>
				</div>
				<div class="max-w-3xl space-y-5 text-lg leading-8 text-muted-foreground">
					<p>It happens one seat at a time. A CRM bought for three salespeople now bills for forty people, most of whom log in to check one screen. A project tool, a form builder, a booking system and an automation service sit in the middle to stop the others falling out with each other. Every renewal costs a little more.</p>
					<p>And after all that, the software still doesn’t quite fit. Your team works around it. The spreadsheet they keep on the side is the real system.</p>
					<p>You are paying for an aeroplane when all you needed was a fan.</p>
				</div>
			</section>

			<section class="grid gap-10 border-b border-border py-20 sm:py-24 lg:grid-cols-[0.65fr_1.35fr]" aria-labelledby="why-now-heading">
				<div>
					<p class="swap-kicker">Why now</p>
					<h2 id="why-now-heading" class="mt-4 text-3xl font-medium tracking-[-0.04em] sm:text-4xl">Two years ago, this would have been a bad idea.</h2>
				</div>
				<div class="max-w-3xl space-y-5 text-lg leading-8 text-muted-foreground">
					<p>Building your own software used to be slow and expensive, so renting it made sense. Buy rather than build was the right call for almost everything outside your core business.</p>
					<p>AI has changed the maths. I have been building software for more than twenty years, and I can now build and maintain a focused tool in a fraction of the time it used to take. A tool that does exactly what your team needs, and nothing it doesn’t, is now cheaper to own than to rent.</p>
					<p>I’m confident enough in that to do the work for free and be paid from the saving.</p>
				</div>
			</section>

			<section class="py-20 sm:py-28" aria-labelledby="how-heading">
				<div class="max-w-3xl">
					<p class="swap-kicker">How it works</p>
					<h2 id="how-heading" class="mt-4 text-4xl font-medium tracking-[-0.045em] sm:text-6xl">You only pay once the old bill has gone.</h2>
				</div>
				<div class="mt-14 grid gap-px overflow-hidden rounded-[2rem] border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
					<article v-for="step in steps" :key="step.number" class="bg-card p-7">
						<p class="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{{ step.number }}</p>
						<h3 class="mt-8 text-2xl font-semibold tracking-[-0.03em]">{{ step.title }}</h3>
						<p class="mt-4 text-sm leading-6 text-muted-foreground">{{ step.text }}</p>
					</article>
				</div>
			</section>

			<section id="calculator" class="scroll-mt-8 border-y border-border py-20 sm:py-24" aria-labelledby="calculator-heading">
				<div class="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
					<div>
						<p class="swap-kicker">Your numbers</p>
						<h2 id="calculator-heading" class="mt-4 text-4xl font-medium leading-tight tracking-[-0.045em]">Work out what you would keep.</h2>
						<p class="mt-6 text-lg leading-8 text-muted-foreground">A rough guide. The real numbers come from the audit, where we agree the baseline together.</p>
						<div class="mt-10 space-y-8">
							<label class="block">
								<span class="text-sm font-semibold">Monthly software subscriptions</span>
								<span class="mt-3 flex items-center rounded-2xl border border-border bg-card px-4 focus-within:border-foreground/40">
									<span class="text-muted-foreground" aria-hidden="true">£</span>
									<input v-model.number="monthlySpend" type="number" min="0" step="100" inputmode="numeric" class="w-full bg-transparent px-2 py-3 text-lg font-semibold outline-none" />
								</span>
							</label>
							<label class="block">
								<span class="flex items-center justify-between text-sm font-semibold">
									<span>How much of that could we replace?</span>
									<span>{{ replaceablePercent }}%</span>
								</span>
								<input v-model.number="replaceablePercent" type="range" min="10" max="100" step="5" class="mt-4 w-full accent-foreground" />
							</label>
						</div>
					</div>
					<div class="swap-result relative overflow-hidden rounded-[2rem] bg-[#080b11] p-7 text-white sm:p-10">
						<p class="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">Each month</p>
						<div class="mt-6 grid gap-6 sm:grid-cols-3">
							<div>
								<p class="text-sm text-white/50">Subscriptions cancelled</p>
								<p class="mt-1 text-3xl font-semibold tracking-[-0.04em]">{{ formatPounds(split.saving) }}</p>
							</div>
							<div>
								<p class="text-sm text-white/50">You keep</p>
								<p class="mt-1 text-3xl font-semibold tracking-[-0.04em] text-emerald-300">{{ formatPounds(split.clientShare) }}</p>
							</div>
							<div>
								<p class="text-sm text-white/50">You pay me</p>
								<p class="mt-1 text-3xl font-semibold tracking-[-0.04em]">{{ formatPounds(split.steveShare) }}</p>
							</div>
						</div>
						<div class="mt-10 grid gap-6 border-t border-white/10 pt-8 sm:grid-cols-2">
							<div>
								<p class="text-sm text-white/50">You keep over the first {{ offerTerms.termMonths }} months</p>
								<p class="mt-1 text-4xl font-semibold tracking-[-0.04em]">{{ formatPounds(split.clientOverTerm) }}</p>
							</div>
							<div>
								<p class="text-sm text-white/50">You keep every month after that</p>
								<p class="mt-1 text-4xl font-semibold tracking-[-0.04em]">{{ formatPounds(split.clientAfterTerm) }}</p>
							</div>
						</div>
						<p class="mt-8 text-sm leading-6 text-white/50">
							<template v-if="meetsMinimum">Build cost to you: £0. Savings are measured after hosting. AI usage, where a tool needs it, is charged on top at cost.</template>
							<template v-else>Below the £{{ offerTerms.minimumMonthlySpend }} a month minimum. Under that, there isn’t enough in it to build and maintain the tools properly.</template>
						</p>
					</div>
				</div>
			</section>

			<section class="grid gap-10 border-b border-border py-20 sm:py-24 lg:grid-cols-[0.65fr_1.35fr]" aria-labelledby="platform-heading">
				<div>
					<p class="swap-kicker">Built on db3.ai</p>
					<h2 id="platform-heading" class="mt-4 text-3xl font-medium tracking-[-0.04em] sm:text-4xl">Your software, somewhere you can see it.</h2>
				</div>
				<div class="max-w-3xl">
					<div class="space-y-5 text-lg leading-8 text-muted-foreground">
						<p>I build every tool on <a href="https://db3.ai" target="_blank" rel="noopener noreferrer" class="font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground">db3.ai</a>, and it runs in your own db3 Cloud workspace. You are not swapping one black box for another.</p>
						<p>Every change goes to staging first. You try it, and it only reaches production when you approve it. If something is wrong, it rolls back. All of that happens in a screen your team can use, not a terminal they can’t.</p>
					</div>
					<div class="mt-10 rounded-[1.5rem] border border-border bg-card p-7">
						<div class="flex flex-wrap items-center justify-between gap-3">
							<h3 class="text-xl font-semibold tracking-[-0.025em]">Optional: train your team</h3>
							<span class="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">Priced separately</span>
						</div>
						<p class="mt-4 leading-7 text-muted-foreground">AI-generated software is only as safe as the people steering it. The training teaches your staff how it is built, how to ask for changes that work, and how to move them from staging to production without breaking anything. It is not required. It is worth it if you want to own the process as well as the code.</p>
					</div>
				</div>
			</section>

			<section class="grid gap-12 py-20 sm:py-28 lg:grid-cols-[0.72fr_1.28fr]" aria-labelledby="guarantee-heading">
				<div>
					<p class="swap-kicker">The guarantee</p>
					<h2 id="guarantee-heading" class="mt-4 text-4xl font-medium leading-tight tracking-[-0.045em]">You never pay for something you haven’t switched off.</h2>
				</div>
				<div class="max-w-3xl space-y-5 text-lg leading-8 text-muted-foreground">
					<p>If what I build isn’t good enough, keep paying your current supplier and walk away. You owe me nothing. I have lost my time, you have lost nothing.</p>
					<p>If you cancel and then regret it, you have {{ offerTerms.switchBackDays }} days to switch back. The fee for that tool stops the month you do. No argument.</p>
					<p class="text-foreground">The only way I get paid is if you are already saving money.</p>
				</div>
			</section>

			<section class="rounded-[2rem] bg-secondary px-7 py-12 sm:px-12 sm:py-16" aria-labelledby="included-heading">
				<div class="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
					<div>
						<p class="swap-kicker">What’s included</p>
						<h2 id="included-heading" class="mt-4 text-4xl font-medium leading-tight tracking-[-0.045em]">Built, moved and looked after.</h2>
					</div>
					<ul class="grid gap-x-8 gap-y-5 sm:grid-cols-2">
						<li v-for="(item, index) in included" :key="item" class="flex gap-4 text-sm leading-6">
							<span class="text-xs font-semibold text-muted-foreground" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
							<span>{{ item }}</span>
						</li>
					</ul>
				</div>
			</section>

			<section class="grid gap-12 border-b border-border py-20 sm:py-28 lg:grid-cols-[0.72fr_1.28fr]" aria-labelledby="fit-heading">
				<div>
					<p class="swap-kicker">Good fit</p>
					<h2 id="fit-heading" class="mt-4 text-4xl font-medium leading-tight tracking-[-0.045em]">Not every subscription should go.</h2>
					<p class="mt-6 text-lg leading-8 text-muted-foreground">Pragmatic, not dogmatic. Some software is worth every penny, and I’ll tell you which.</p>
				</div>
				<div class="grid gap-8 sm:grid-cols-2">
					<div>
						<h3 class="font-semibold">Good candidates</h3>
						<ul class="mt-5 space-y-4 text-sm leading-6 text-muted-foreground">
							<li v-for="item in goodFits" :key="item">{{ item }}</li>
						</ul>
					</div>
					<div>
						<h3 class="font-semibold">Usually worth keeping</h3>
						<ul class="mt-5 space-y-4 text-sm leading-6 text-muted-foreground">
							<li v-for="item in poorFits" :key="item">{{ item }}</li>
						</ul>
					</div>
				</div>
			</section>

			<section class="py-20 sm:py-28" aria-labelledby="questions-heading">
				<div class="grid gap-12 lg:grid-cols-[0.62fr_1.38fr]">
					<div>
						<p class="swap-kicker">Straight answers</p>
						<h2 id="questions-heading" class="mt-4 text-4xl font-medium leading-tight tracking-[-0.045em]">The questions you should ask.</h2>
					</div>
					<div class="divide-y divide-border border-y border-border">
						<details v-for="item in questions" :key="item.question" class="group py-6">
							<summary class="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-semibold tracking-[-0.02em]">
								{{ item.question }}
								<span class="text-muted-foreground transition group-open:rotate-45" aria-hidden="true">+</span>
							</summary>
							<p class="mt-4 max-w-2xl leading-7 text-muted-foreground">{{ item.answer }}</p>
						</details>
					</div>
				</div>
			</section>

			<section class="pb-20 sm:pb-28" aria-labelledby="start-heading">
				<div class="relative overflow-hidden rounded-[2.5rem] bg-[#080b11] px-7 py-14 text-white sm:px-12 sm:py-20 lg:px-16">
					<div class="cta-glow" aria-hidden="true"></div>
					<div class="relative z-10 max-w-3xl">
						<p class="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">{{ offerTerms.pilotPlaces }} pilot places</p>
						<h2 id="start-heading" class="mt-5 text-4xl font-medium leading-tight tracking-[-0.05em] sm:text-6xl">Bring me your software bill.</h2>
						<p class="mt-7 max-w-2xl text-lg leading-8 text-white/60">I’m paying for every build with my own time, so I can only take on {{ offerTerms.pilotPlaces }} companies to start. Send me a list of what you pay for each month. If I can’t save you at least £{{ offerTerms.minimumMonthlySpend }} a month, I’ll tell you, and you’ll still know where your money goes.</p>
						<a href="https://www.linkedin.com/in/stevenaobrien/" target="_blank" rel="noopener noreferrer" class="mt-9 inline-flex items-center gap-6 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-black transition hover:scale-[1.02]">
							Apply for a pilot place <span aria-hidden="true">↗</span>
						</a>
					</div>
				</div>
			</section>
		</article>
	</SteveLayout>
</template>

<style scoped>
.swap-page-background {
	background:
		radial-gradient(circle at 82% 7%, color-mix(in oklch, var(--foreground) 5%, transparent), transparent 30rem),
		var(--background);
}

.swap-kicker {
	font-size: 0.75rem;
	font-weight: 600;
	letter-spacing: 0.18em;
	text-transform: uppercase;
	color: var(--muted-foreground);
}

.swap-gradient {
	background: linear-gradient(105deg, var(--foreground) 5%, color-mix(in oklch, var(--foreground) 40%, #2a9d8f) 55%, #34d399);
	background-clip: text;
	color: transparent;
	margin-bottom: -0.12em;
	padding-bottom: 0.12em;
}

.swap-glow {
	position: absolute;
	top: 2rem;
	right: -8rem;
	width: min(45rem, 75vw);
	aspect-ratio: 1;
	border-radius: 999px;
	background: radial-gradient(circle, rgb(52 211 153 / 12%), rgb(42 157 143 / 4%) 42%, transparent 70%);
	filter: blur(10px);
	pointer-events: none;
}

.swap-result {
	background:
		radial-gradient(circle at 88% 4%, rgb(52 211 153 / 22%), transparent 24rem),
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
