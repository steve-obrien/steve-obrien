<script setup>
import intelligenceBookCover from './intelligence-book-mockup.webp';
import domStudioCard from './dom_studio_card.png';
import { implementationSteps, offerTitle } from '../course/offer.js';

// const cardClass = 'relative block w-full overflow-hidden rounded-3xl bg-card text-card-foreground shadow-xl ring-1 ring-border transition-[box-shadow,transform] duration-300 ease-in-out [backface-visibility:hidden] [-webkit-backface-visibility:hidden] hover:scale-[1.03] hover:shadow-2xl';
const cardClass = 'shadow-xl break-inside-avoid relative ring-1 ring-border mr-6 block w-full bg-card text-card-foreground rounded-3xl overflow-hidden cursor-pointer transform hover:scale-[1.03] group duration-300 ease-in-out hover:shadow-2xl backface-hidden'
</script>

<template>
	<SteveLayout bg-class="bg-secondary">
		<section class="space-y-8">
			<div class="space-y-3">
				<p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Projects</p>
				<h1 class="text-4xl font-serif  font-light tracking-tight sm:text-5xl">Experiments and projects.</h1>
				<p class="max-w-3xl text-lg leading-relaxed text-muted-foreground">
					Things I am working on.
				</p>
			</div>
			<div class="grid gap-8 md:grid-cols-2">
				<div class="space-y-8">

					<a href="https://db3.ai" target="_blank" rel="noopener noreferrer" :class="cardClass" class="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground">
						<div class="relative overflow-hidden bg-[#fdfcfb] p-7 text-[oklch(0.19_0.018_258)] dark:bg-[oklch(0.155_0.028_247)] dark:text-[oklch(0.95_0.012_75)]">
							<div class="flex items-center justify-between gap-4">
								<span class="text-5xl font-extrabold tracking-[-0.035em] text-[oklch(0.64_0.208_29)] dark:text-[oklch(0.7_0.19_28)]">db3.ai</span>
								<span class="text-2xl text-[oklch(0.64_0.208_29)] transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 dark:text-[oklch(0.7_0.19_28)]" aria-hidden="true">↗</span>
							</div>
							<p class="mt-8 text-xs font-bold uppercase tracking-wider text-[oklch(0.5_0.018_258)] dark:text-[oklch(0.72_0.022_238)]">Framework <span class="mx-1" aria-hidden="true">|</span> Studio <span class="mx-1" aria-hidden="true">|</span> Cloud</p>
							<h3 class="mt-3 text-2xl/[1.35] font-semibold tracking-[-0.052em] md:text-3xl/[1.35]">The TypeScript framework for apps with AI.</h3>
							<p class="mt-3 mb-0 text-lg text-[oklch(0.5_0.018_258)] dark:text-[oklch(0.72_0.022_238)]">Shared foundations for data, users, permissions and AI. The roadmap adds Studio for visual app development and Cloud for publishing and hosting.</p>
						</div>
					</a>

					<a href="https://getdom.studio" :class="cardClass">
						<div class="relative">
							<img :src="domStudioCard" alt="DOM Studio interface kit" class="h-full w-full object-cover" />
						</div>
					</a>

					<a href="/course" :class="cardClass" class="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground">
						<div class="relative p-7">
							<p class="text-xs font-bold uppercase text-muted-foreground">AI offer</p>
							<h3 class="mt-4 text-2xl font-bold md:text-3xl">{{ offerTitle }}</h3>
							<ol class="mt-6 space-y-4">
								<li v-for="step in implementationSteps" :key="step.number" class="flex gap-4">
									<span class="pt-1 text-xs font-semibold text-muted-foreground" aria-hidden="true">{{ step.number }}</span>
									<span class="text-lg leading-7">{{ step.title }}</span>
								</li>
							</ol>
							<p class="mt-6 border-t border-border pt-5 leading-7 text-muted-foreground">Includes three courses and access to the Skool community.</p>
							<span class="mt-5 inline-flex items-center gap-2 text-sm font-semibold">Explore the offer <span aria-hidden="true">→</span></span>
						</div>
					</a>

					<a :class="cardClass">
						<div class="relative p-7">
							<p class="text-xs font-bold uppercase text-muted-foreground">AI</p>
							<h3 class="mt-4 text-2xl font-bold md:text-3xl">Team AI</h3>
							<p class="mt-2 mb-0">Work with your team, store files and processes, train AI on your company data. Use AI to help your team work together more effectively. Create your companies repository of information that your own AI can use. </p>
						</div>
					</a>
				</div>

				<div class="space-y-8">
					<a href="https://growthscout.io" target="_blank" rel="noopener noreferrer" :class="cardClass">
						<div class="relative overflow-hidden bg-[#091b2e] p-7 text-slate-100">
							<div class="absolute -right-16 -top-20 size-64 rounded-full border border-[#fc7b1e]/20"></div>
							<div class="absolute -right-8 -top-10 size-40 rounded-full border border-slate-100/10"></div>
							<div class="relative">
								<div class="flex items-center gap-3">
									<span class="relative grid size-10 place-items-center rounded-full border-2 border-slate-100" aria-hidden="true">
										<span class="absolute -top-1.5 size-2.5 rounded-full bg-[#fc7b1e]"></span>
										<span class="size-3 rounded-full bg-slate-100"></span>
									</span>
									<span class="text-2xl font-semibold">Growth<span class="text-[#fc7b1e]">Scout</span></span>
								</div>
								<p class="mt-8 text-xs font-bold uppercase tracking-wider text-[#fc7b1e]">AI-powered SEO</p>
								<h3 class="mt-3 text-2xl font-bold md:text-3xl">Grow organic traffic on autopilot.</h3>
								<p class="mt-3 mb-0 text-lg text-slate-300">GrowthScout learns your business, uncovers keyword opportunities, and plans, writes and publishes strategic SEO content.</p>
							</div>
						</div>
					</a>

					<a href="https://steve-98.kit.com/4b5ef441c9" :class="cardClass">
						<div class="relative">
							<img
								:src="intelligenceBookCover"
								alt="Intelligence: Human, Artificial, Future by Steve O’Brien"
								width="1024"
								height="1536"
								loading="lazy"
								decoding="async"
								class="block h-auto w-full object-contain"
							/>
							<div class="relative p-7">
								<p class="text-xs font-bold uppercase text-muted-foreground">Book</p>
								<h3 class="mt-4 text-2xl font-bold md:text-3xl">Human, Artificial and Future Intelligence</h3>
								<p class="mt-2 mb-0 text-lg">I've been working on a book on intelligence, what I have learnt about human intelligence, compared with artificial intelligence, as well as what advances in neuroscience could mean for the future of intelligence.  What is amusing is that we still don't really know precisely what intelligence is!</p>
							</div>
						</div>
					</a>
				</div>
			</div>
		</section>
	</SteveLayout>
</template>
