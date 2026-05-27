<script setup>
import bookCover from './bookCover.png';
import elementsLogo from './elements_card.png';

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

					<a href="/elements" :class="cardClass">
						<div class="relative">
							<img :src="elementsLogo" alt="Elements Ui Framework" class="h-full w-full object-cover" />
						</div>
					</a>

					<a href="/course" :class="cardClass">
						<div class="relative p-7">
							<p class="text-xs font-bold uppercase text-muted-foreground">AI</p>
							<h3 class="mt-4 text-2xl font-bold md:text-3xl">Ai Coder Course</h3>
							<p class="mt-2 text-lg">Learn to code in weeks not years. Learn to build apps using AI. Learn advanced code and AI tools to make sure you stay ahead in the age of AI.</p>
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
					

					<a href="https://steve-98.kit.com/4b5ef441c9" :class="cardClass">
						<div class="relative">
							<img :src="bookCover" alt="picture of an app" class="h-full w-full object-cover dark:invert" />
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
