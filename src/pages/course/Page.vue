<template>
	<main class="min-h-screen bg-[#f7f5f0] text-zinc-950">
		<section class="relative overflow-hidden border-b border-zinc-200">
			<div class="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.08),transparent_35%),radial-gradient(circle_at_20%_20%,rgba(0,0,0,0.05),transparent_30%)]"></div>

			<header class="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
				<a href="#" class="flex items-center gap-3">
					<span class="grid h-9 w-9 place-items-center rounded-full border border-zinc-900 font-serif text-lg italic">S</span>
					<span class="text-sm font-medium tracking-tight">Steve O’Brien</span>
				</a>

				<nav class="hidden items-center gap-8 text-sm text-zinc-700 md:flex">
					<a href="#why" class="hover:text-zinc-950">Why now</a>
					<a href="#curriculum" class="hover:text-zinc-950">Curriculum</a>
					<a href="#faq" class="hover:text-zinc-950">FAQ</a>
				</nav>

				<a href="#waitlist" class="rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800">
					Join waitlist
				</a>
			</header>

			<div class="mx-auto grid max-w-7xl gap-16 px-6 pb-24 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-32 lg:pt-24">
				<div class="max-w-3xl">
					<p class="mb-6 inline-flex rounded-full border border-zinc-300 bg-white/60 px-4 py-2 text-sm text-zinc-700 backdrop-blur">
						A beginner course for the AI software era
					</p>

					<h1 class="text-5xl font-semibold tracking-tight text-zinc-950 md:text-7xl">
						Develop the creative skills to build in the AI era.
					</h1>

					<p class="mt-8 max-w-2xl text-xl leading-8 text-zinc-700">
						Learn how to turn ideas into useful apps, tools, and prototypes — without starting with years of computer science theory.
					</p>

					<div class="mt-10 flex flex-col gap-4 sm:flex-row">
						<a href="#waitlist" class="rounded-full bg-zinc-950 px-7 py-4 text-center text-sm font-semibold text-white transition hover:bg-zinc-800">
							Join the waiting list
						</a>
						<a href="#curriculum" class="rounded-full border border-zinc-300 bg-white/70 px-7 py-4 text-center text-sm font-semibold text-zinc-950 transition hover:bg-white">
							See what you’ll learn
						</a>
					</div>

					<p class="mt-8 max-w-xl text-sm leading-6 text-zinc-600">
						Built by a software engineer and founder who spent 18 years building real software for clients, teams, and businesses before selling Newicon.
					</p>
				</div>

				<div class="relative">
					<div class="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-2xl shadow-zinc-900/10">
						<div class="rounded-[1.5rem] bg-zinc-950 p-5 text-white">
							<div class="mb-8 flex items-center gap-2">
								<span class="h-3 w-3 rounded-full bg-red-400"></span>
								<span class="h-3 w-3 rounded-full bg-yellow-400"></span>
								<span class="h-3 w-3 rounded-full bg-green-400"></span>
							</div>

							<div class="space-y-4 font-mono text-sm text-zinc-300">
								<p><span class="text-emerald-300">idea</span> = "I want to build a booking app"</p>
								<p><span class="text-sky-300">ai.prompt</span>(idea)</p>
								<p><span class="text-purple-300">builder</span>.designDatabase()</p>
								<p><span class="text-purple-300">builder</span>.createInterface()</p>
								<p><span class="text-purple-300">builder</span>.testAndImprove()</p>
								<p class="text-white">ship(app)</p>
							</div>
						</div>

						<div class="mt-5 grid gap-4 sm:grid-cols-3">
							<div class="rounded-2xl bg-zinc-100 p-4">
								<p class="text-2xl font-semibold">01</p>
								<p class="mt-2 text-sm text-zinc-600">Think in systems</p>
							</div>
							<div class="rounded-2xl bg-zinc-100 p-4">
								<p class="text-2xl font-semibold">02</p>
								<p class="mt-2 text-sm text-zinc-600">Build with AI</p>
							</div>
							<div class="rounded-2xl bg-zinc-100 p-4">
								<p class="text-2xl font-semibold">03</p>
								<p class="mt-2 text-sm text-zinc-600">Ship real tools</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<section id="why" class="mx-auto max-w-7xl px-6 py-24 lg:px-8">
			<div class="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
				<div>
					<p class="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">The idea</p>
					<h2 class="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">Build first. Learn theory when it becomes useful.</h2>
				</div>

				<div class="space-y-6 text-lg leading-8 text-zinc-700">
					<p>
						Most people are taught coding backwards: syntax, rules, abstract theory, then eventually a project. That can work, but it kills momentum for many beginners.
					</p>
					<p>
						This course starts with making things. You’ll learn the foundations that matter — data, logic, interfaces, APIs, prompts, debugging, and software structure — while building useful apps with AI as your creative partner.
					</p>
					<p>
						Computer science still matters. But it becomes far easier to understand once you have already felt the pain of building something real.
					</p>
				</div>
			</div>
		</section>

		<section class="bg-zinc-950 py-24 text-white">
			<div class="mx-auto max-w-7xl px-6 lg:px-8">
				<div class="max-w-3xl">
					<p class="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-400">Who it’s for</p>
					<h2 class="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">For people who want to create, not just consume.</h2>
				</div>

				<div class="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
					<Card title="Complete beginners" text="You have ideas but no coding background." />
					<Card title="Founders" text="You want to prototype before hiring a team." />
					<Card title="Product people" text="You want to communicate better with developers." />
					<Card title="Curious professionals" text="You want practical AI skills that create real leverage." />
				</div>
			</div>
		</section>

		<section id="curriculum" class="mx-auto max-w-7xl px-6 py-24 lg:px-8">
			<div class="max-w-3xl">
				<p class="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">What you’ll learn</p>
				<h2 class="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">A practical foundation for modern software creation.</h2>
			</div>

			<div class="mt-14 grid gap-5 lg:grid-cols-3">
				<Module number="01" title="Think like a builder" text="Break ideas into screens, data, flows, actions, and outcomes." />
				<Module number="02" title="Use AI properly" text="Prompt, iterate, review, test, and avoid blindly trusting generated code." />
				<Module number="03" title="Understand app structure" text="Learn what front ends, back ends, databases, APIs, and hosting actually do." />
				<Module number="04" title="Design simple interfaces" text="Create useful screens, forms, dashboards, and workflows." />
				<Module number="05" title="Debug and improve" text="Learn how to find problems, ask better questions, and fix broken features." />
				<Module number="06" title="Ship a real project" text="Finish with a working app you can show, test, and improve." />
			</div>
		</section>

		<section class="border-y border-zinc-200 bg-white py-24">
			<div class="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:px-8">
				<div>
					<p class="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">The story</p>
					<h2 class="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">I learnt by building before I understood the theory.</h2>
				</div>

				<div class="space-y-6 text-lg leading-8 text-zinc-700">
					<p>
						I was exposed to computer science early, but most of it only became useful much later. What really taught me software was building things, breaking them, fixing them, and slowly understanding the deeper principles behind the work.
					</p>
					<p>
						After years building apps and systems for clients, I learnt that software is not just code. It is creativity, structure, communication, judgement, and the ability to turn vague ideas into working systems.
					</p>
					<p>
						AI now gives beginners a radically better starting point. The goal is not to skip understanding. The goal is to build earlier, learn faster, and develop better judgement as you go.
					</p>
				</div>
			</div>
		</section>

		<section id="waitlist" class="mx-auto max-w-3xl px-6 py-24 text-center lg:px-8">
			<p class="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">Join the waitlist</p>
			<h2 class="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">Be first to hear when the course opens.</h2>
			<p class="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-700">
				Join the early list and help shape the first version. Tell me what you want to build and I’ll use that to shape the course projects.
			</p>

			<form class="mt-10 rounded-[2rem] border border-zinc-200 bg-white p-4 shadow-xl shadow-zinc-900/5" @submit.prevent="submitForm">
				<div class="grid gap-3 sm:grid-cols-[1fr_auto]">
					<input
					v-model="email"
					type="email"
					required
					placeholder="Your email address"
					class="w-full rounded-full border border-zinc-200 bg-zinc-50 px-5 py-4 text-base outline-none transition focus:border-zinc-900 focus:bg-white" />
					<button type="submit" class="rounded-full bg-zinc-950 px-7 py-4 text-sm font-semibold text-white transition hover:bg-zinc-800">
						Join waitlist
					</button>
				</div>

				<textarea
				v-model="idea"
				placeholder="Optional: what would you like to build?"
				class="mt-3 min-h-28 w-full rounded-3xl border border-zinc-200 bg-zinc-50 px-5 py-4 text-base outline-none transition focus:border-zinc-900 focus:bg-white"></textarea>

				<p v-if="submitted" class="mt-4 text-sm font-medium text-zinc-700">
					You’re on the list. I’ll share updates when the first version is ready.
				</p>
			</form>
		</section>

		<section id="faq" class="mx-auto max-w-4xl px-6 pb-24 lg:px-8">
			<h2 class="text-3xl font-semibold tracking-tight md:text-4xl">Questions</h2>
			<div class="mt-8 divide-y divide-zinc-200 border-y border-zinc-200">
				<Faq question="Do I need coding experience?" answer="No. The course is designed for complete beginners, but it will not pretend coding has no complexity. The aim is to make the complexity approachable by building real things early." />
				<Faq question="Is this just vibe coding?" answer="No. AI will be used heavily, but the course focuses on judgement: understanding what AI gives you, testing it, improving it, and learning the foundations behind the work." />
				<Faq question="Will I learn computer science?" answer="You’ll learn the parts that become useful when building apps: data, logic, state, APIs, databases, debugging, structure, and trade-offs. The deeper theory can come later." />
				<Faq question="What will I build?" answer="The first version will focus on practical web apps: forms, dashboards, data-driven tools, simple automations, and AI-assisted interfaces." />
			</div>
		</section>
	</main>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')
const idea = ref('')
const submitted = ref(false)

function submitForm() {
	// Replace this with your real waitlist endpoint, ConvertKit form, Mailchimp form,
	// Supabase insert, or server action.
	console.log('Waitlist signup:', {
		email: email.value,
		idea: idea.value,
	})

	submitted.value = true
	email.value = ''
	idea.value = ''
}
</script>

<script>
export default {
	components: {
		Card: {
			props: ['title', 'text'],
			template: `
		  <article class="rounded-[2rem] border border-white/10 bg-white/5 p-6">
			<h3 class="text-lg font-semibold text-white">{{ title }}</h3>
			<p class="mt-3 text-sm leading-6 text-zinc-400">{{ text }}</p>
		  </article>
		`,
		},
		Module: {
			props: ['number', 'title', 'text'],
			template: `
		  <article class="rounded-[2rem] border border-zinc-200 bg-white p-7 shadow-lg shadow-zinc-900/5">
			<p class="text-sm font-semibold text-zinc-400">{{ number }}</p>
			<h3 class="mt-8 text-2xl font-semibold tracking-tight">{{ title }}</h3>
			<p class="mt-4 leading-7 text-zinc-600">{{ text }}</p>
		  </article>
		`,
		},
		Faq: {
			props: ['question', 'answer'],
			template: `
		  <details class="group py-6">
			<summary class="flex cursor-pointer list-none items-center justify-between gap-6 text-left text-lg font-semibold">
			  {{ question }}
			  <span class="text-2xl leading-none transition group-open:rotate-45">+</span>
			</summary>
			<p class="mt-4 max-w-3xl leading-7 text-zinc-600">{{ answer }}</p>
		  </details>
		`,
		},
	},
}
</script>