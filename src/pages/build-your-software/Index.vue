<script setup>
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { remainingSlots, savingsShare } from './offer.js';

const monthlySaving = ref(2000);
const fee = computed(calculateFee);
const retainedSaving = computed(calculateRetainedSaving);
const currencyFormatter = new Intl.NumberFormat('en-GB', {
	style: 'currency',
	currency: 'GBP',
	maximumFractionDigits: 0,
});

/** @returns {number} Steve’s monthly share of the illustrative SaaS saving, in pounds. */
function calculateFee() {
	return monthlySaving.value * savingsShare;
}

/** @returns {number} The monthly saving the client keeps after Steve’s fee, in pounds. */
function calculateRetainedSaving() {
	return monthlySaving.value - fee.value;
}

/**
 * Formats the calculator’s whole-pound amounts consistently for British readers.
 * @param {number} amount Amount in pounds.
 * @returns {string} A formatted GBP amount.
 */
function formatPounds(amount) {
	return currencyFormatter.format(amount);
}

const steps = [
	{
		number: '01',
		title: 'Show me what you pay for.',
		text: 'We look at your subscriptions, the parts your team actually uses and the workarounds they have built around them. That tells us what is worth replacing.',
	},
	{
		number: '02',
		title: 'Agree the software and the saving.',
		text: 'We define what the replacement needs to do and how we will measure the saving. We agree the fee arrangement, running costs and support before the build starts.',
	},
	{
		number: '03',
		title: 'Build it around your team.',
		text: 'I build the software, work through the data you need to bring across and test it with the people who will use it. We plan the switch together.',
	},
	{
		number: '04',
		title: 'Make it more useful over time.',
		text: 'Once the core works, we can add custom automations, connect other systems and improve the parts that slow people down. You decide what we build next.',
	},
];

const examples = [
	{ title: 'Sales and customer tools', text: 'Your pipeline, customer records and follow-ups, built around the way you sell.' },
	{ title: 'Jobs and projects', text: 'Quoting, scheduling, approvals and handovers in one place.' },
	{ title: 'Reporting and operations', text: 'The dashboards, forms and internal tools your team needs to do its work.' },
];

const questions = [
	{
		question: 'What is db3.ai?',
		paragraphs: [
			'db3.ai is an open-source framework for collaborative AI and human software development. It gives us a shared foundation for building your software, connecting your data and adding AI integrations.',
			'AI helps with the work. People bring the business knowledge, set the boundaries and remain responsible for the decisions. The code is open to inspect and extend, so we can keep developing your software as your business changes.',
		],
		link: { href: 'https://db3.ai', label: 'Explore db3.ai' },
	},
	{
		question: 'Is it secure?',
		paragraphs: [
			'I know how to build secure software, and I know there is no such thing as a perfect system. I’ve spent 18 years building systems from banking pension portals to aerospace measurement apps, and helping companies secure their systems and resolve hacking incidents.',
			'I’m a member of OpenAI’s Daybreak programme. I use a physical hardware key to access its latest security AI, which I use to scan code throughout development and surface potential issues before changes go live. That adds another layer of confidence when working with AI-generated code.',
			'The AI works within boundaries I set and review. Its output still needs testing, human judgement and careful release decisions. Security scans help us find problems; they cannot promise that every problem has been found.',
		],
	},
	{
		question: 'Would you replace every subscription?',
		answer: 'No. Some tools are good value, and some do difficult specialist work that is better left to the people who maintain them. We start where the cost is high, the need is clear and a focused replacement makes sense.',
	},
	{
		question: 'When do I pay?',
		answer: 'You only pay me when the replacement saves you money. My fee is half of the saving we achieve: if we save £2,000 a month, you keep £1,000 and pay me £1,000. No saving means no fee. We agree the existing bills, running costs, payment period and support before work starts.',
	},
	{
		question: 'Is it our software?',
		answer: 'Yes. Your own software, your own AI integrations and your own data. I build on db3.ai, an open-source framework, so the foundation can be inspected and extended. We agree the code handover and ownership terms as part of the project, so you know exactly what you are getting.',
	},
	{
		question: 'Can we add AI and automations later?',
		answer: 'Yes. We can connect it to other systems, automate repetitive work and add AI where it helps. For example, a new enquiry could create a customer record, prepare a draft quote and send it to someone for approval. We agree the scope and cost of further work as we go.',
	},
];
</script>

<template>
	<SteveLayout>
		<article>
			<header class="grid gap-12 border-b border-border py-16 sm:py-24 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-14">
				<div class="min-w-0">
					<div class="flex flex-wrap items-center gap-3">
						<p class="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">Build your software</p>
						<p class="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground">Only {{ remainingSlots }} slots left</p>
					</div>
					<h1 class="mt-6 text-[clamp(2.5rem,5.8vw,5rem)] font-medium leading-[1.06] tracking-[-0.05em]">You save money.<br /><span class="text-nova">Or you don’t pay.</span></h1>
					<p class="mt-7 max-w-xl text-lg leading-8 text-muted-foreground">I build you bespoke software to replace expensive SaaS tools. Your own software you control, your own AI integrations and your own data. Built around your company’s knowledge and processes.</p>
					<p class="mt-4 max-w-xl leading-7 text-muted-foreground">If I save you £2,000 a month, you keep £1,000 and pay me £1,000. You get your own software, which we can add custom automations to over time. If there’s no saving, there’s no fee.</p>
					<a href="https://www.linkedin.com/in/stevenaobrien/" target="_blank" rel="noopener noreferrer" class="launch-button skin-action mt-8 inline-flex items-center gap-5 rounded-full px-6 py-3.5 text-sm font-semibold transition hover:-translate-y-0.5">
						Let’s look at your software bill <span aria-hidden="true">↗</span>
					</a>
				</div>

				<section class="skin-card liquid-glass min-w-0 rounded-[2rem] p-6 sm:p-8" aria-labelledby="saving-heading">
					<h2 id="saving-heading" class="text-xl font-semibold tracking-[-0.025em]">See what you could save.</h2>
					<p class="mt-2 text-sm leading-6 text-muted-foreground">Move the slider to try your numbers.</p>
					<label for="monthly-saving" class="mt-8 block text-sm font-medium">Monthly SaaS saving</label>
					<output for="monthly-saving" class="mt-2 block text-4xl font-semibold tabular-nums tracking-[-0.04em]">{{ monthlySaving > 10000 ? '£10,000+' : formatPounds(monthlySaving) }}<span class="ml-2 text-sm font-normal text-muted-foreground">/ month</span></output>
					<!-- The final step represents any saving above £10,000. -->
					<input id="monthly-saving" v-model.number="monthlySaving" type="range" min="2000" max="10100" step="100" :aria-valuetext="monthlySaving > 10000 ? 'More than £10,000 per month' : `${formatPounds(monthlySaving)} per month`" class="mt-5 block h-6 w-full cursor-pointer accent-primary" />
					<div class="mt-1 flex justify-between text-xs text-muted-foreground" aria-hidden="true"><span>£2,000</span><span>£10,000+</span></div>
					<div class="mt-8 border-t border-border pt-7" aria-live="polite" aria-atomic="true">
						<a v-if="monthlySaving > 10000" href="https://www.linkedin.com/in/stevenaobrien/" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-3 text-3xl font-semibold tracking-[-0.04em] text-nova underline underline-offset-4">Discuss <span aria-hidden="true">↗</span></a>
						<dl v-else class="grid grid-cols-2 gap-4">
							<div class="min-w-0">
								<dt class="text-sm text-muted-foreground">You keep</dt>
								<dd class="mt-2 break-all text-[clamp(1.5rem,3vw,2.25rem)] font-semibold tabular-nums tracking-[-0.04em] text-nova">{{ formatPounds(retainedSaving) }}</dd>
							</div>
							<div class="min-w-0">
								<dt class="text-sm text-muted-foreground">My fee</dt>
								<dd class="mt-2 break-all text-[clamp(1.5rem,3vw,2.25rem)] font-semibold tabular-nums tracking-[-0.04em]">{{ formatPounds(fee) }}</dd>
							</div>
						</dl>
					</div>
					<p class="mt-6 border-t border-border pt-5 text-sm font-medium">Your own software. No saving, no fee.</p>
					<p class="mt-3 text-xs leading-5 text-muted-foreground">An illustration, not a quote. We agree the saving after allowing for running costs, and set out the payment period and support before we start.</p>
				</section>
			</header>

			<section class="grid gap-8 border-b border-border py-16 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16" aria-labelledby="fit-heading">
				<h2 id="fit-heading" class="text-3xl font-medium tracking-[-0.04em] sm:text-4xl">To be unique, you need unique software.</h2>
				<div class="space-y-5 text-lg leading-8 text-muted-foreground">
					<p>I’ve been building bespoke software for companies for over 18 years. I’m convinced that, in the future, every company will need its own software: its unique knowledge and processes built into the way it works.</p>
					<p>Why keep moulding your business around someone else’s tools, where all your competitors are too? The way you quote, make decisions and look after customers is part of what makes your company different. Your software should reflect that.</p>
					<p>Now, finally, I believe we can do this at scale. With db3.ai and AI-assisted coding, I can build focused replacements quickly, reuse the foundations and spend more time on what makes your business unique.</p>
					<p>Keep the subscriptions that earn their place. Let’s start where your own software can save you money, then build on it over time.</p>
				</div>
			</section>

			<section class="border-b border-border py-16 sm:py-20" aria-labelledby="ownership-heading">
				<h2 id="ownership-heading" class="text-3xl font-medium tracking-[-0.04em] sm:text-4xl">Yours to control.</h2>
				<div class="mt-10 grid gap-8 lg:grid-cols-3">
					<div>
						<h3 class="text-xl font-semibold tracking-[-0.025em]">Your own software.</h3>
						<p class="mt-3 leading-7 text-muted-foreground">Built around your process. You decide what it does, what changes and what we build next.</p>
					</div>
					<div>
						<h3 class="text-xl font-semibold tracking-[-0.025em]">Your own AI integrations.</h3>
						<p class="mt-3 leading-7 text-muted-foreground">Connect AI to your knowledge and workflows. You choose what it can do and where a person needs to make the decision.</p>
					</div>
					<div>
						<h3 class="text-xl font-semibold tracking-[-0.025em]">Your own data.</h3>
						<p class="mt-3 leading-7 text-muted-foreground">Your business knowledge belongs to you. You control who can access it and how it is used.</p>
					</div>
				</div>
				<p class="mt-10 max-w-3xl border-t border-border pt-6 leading-7 text-muted-foreground">Built on <a href="https://db3.ai/framework" target="_blank" rel="noopener noreferrer" class="font-semibold text-foreground underline underline-offset-4">db3.ai, an open-source framework</a>. The code can be inspected and extended, giving you a foundation you can keep building on as your business changes.</p>
			</section>

			<section class="py-16 sm:py-20" aria-labelledby="how-heading">
				<p class="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">How we work</p>
				<h2 id="how-heading" class="mt-4 text-3xl font-medium tracking-[-0.04em] sm:text-4xl">Start with the bill. Build what is useful.</h2>
				<ol class="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
					<li v-for="step in steps" :key="step.number" class="border-t border-border pt-6">
						<p class="font-mono text-xs text-nova" aria-hidden="true">{{ step.number }}</p>
						<h3 class="mt-4 text-xl font-semibold tracking-[-0.025em]">{{ step.title }}</h3>
						<p class="mt-3 leading-7 text-muted-foreground">{{ step.text }}</p>
					</li>
				</ol>
			</section>

			<section class="border-y border-border py-16 sm:py-20" aria-labelledby="examples-heading">
				<h2 id="examples-heading" class="text-3xl font-medium tracking-[-0.04em] sm:text-4xl">A few places we could start.</h2>
				<div class="mt-10 grid gap-8 lg:grid-cols-3">
					<div v-for="example in examples" :key="example.title">
						<h3 class="text-xl font-semibold tracking-[-0.025em]">{{ example.title }}</h3>
						<p class="mt-3 leading-7 text-muted-foreground">{{ example.text }}</p>
					</div>
				</div>
			</section>

			<section class="grid gap-8 py-16 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16" aria-labelledby="questions-heading">
				<h2 id="questions-heading" class="text-3xl font-medium tracking-[-0.04em] sm:text-4xl">A few sensible questions.</h2>
				<div class="min-w-0 divide-y divide-border border-y border-border">
					<details v-for="item in questions" :key="item.question" class="group py-5">
						<summary class="flex cursor-pointer list-none items-center justify-between gap-6 font-semibold">
							{{ item.question }}<span class="text-muted-foreground transition group-open:rotate-45" aria-hidden="true">+</span>
						</summary>
						<div class="mt-4 space-y-4 leading-7 text-muted-foreground">
							<p v-for="paragraph in item.paragraphs || [item.answer]" :key="paragraph">{{ paragraph }}</p>
							<a v-if="item.link" :href="item.link.href" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 font-semibold text-foreground underline underline-offset-4">{{ item.link.label }} <span aria-hidden="true">↗</span></a>
						</div>
					</details>
				</div>
			</section>

			<section class="skin-card liquid-glass rounded-[2rem] p-7 sm:p-12" aria-labelledby="start-heading">
				<p class="text-sm font-semibold text-nova">Only {{ remainingSlots }} slots left</p>
				<h2 id="start-heading" class="mt-4 text-3xl font-medium tracking-[-0.04em] sm:text-5xl">Show me your software bill.</h2>
				<p class="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">Send me what you pay for, roughly what it costs and what your team needs it to do. I’ll tell you where I think bespoke software could make sense.</p>
				<a href="https://www.linkedin.com/in/stevenaobrien/" target="_blank" rel="noopener noreferrer" class="launch-button skin-action mt-7 inline-flex items-center gap-5 rounded-full px-6 py-3.5 text-sm font-semibold transition hover:-translate-y-0.5">Talk to me on LinkedIn <span aria-hidden="true">↗</span></a>
				<p class="mt-7 text-sm leading-6 text-muted-foreground">Looking for AI implementation inside your existing business? <RouterLink to="/ai-development" class="font-semibold text-foreground underline underline-offset-4">See the AI offers →</RouterLink></p>
			</section>
		</article>
	</SteveLayout>
</template>
