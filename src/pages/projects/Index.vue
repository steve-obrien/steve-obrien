<script setup>
import bookCover from './bookCover.png';
const projects = [
	{
		name: 'New Icon',
		blurb: 'Product engineering and strategy focused on practical software.',
		link: 'https://newicon.net',
		status: 'SOLD'
	},
	{
		name: 'Personal Lab',
		blurb: 'A sandbox for experiments in developer experience and AI tooling.',
		link: '#',
	},
	{
		name: 'Open Source Notes',
		blurb: 'Small utilities and patterns shared in public repositories.',
		link: '#',
	},
];

const cardClass = 'shadow-xl break-inside-avoid relative ring-1 ring-zinc-100 dark:ring-zinc-700 mr-6 block w-full bg-white dark:bg-zinc-800 rounded-3xl overflow-hidden cursor-pointer transform hover:scale-[1.03] group duration-300 ease-in-out hover:shadow-2xl';

</script>

<template>
	<SteveLayout bg-class="bg-gray-50 dark:bg-black">
		<section class="space-y-8">
			<div class="space-y-3">
				<p class="text-xs font-semibold uppercase tracking-[0.18em] text-skin-muted">Projects</p>
				<h1 class="text-4xl font-serif  font-light tracking-tight sm:text-5xl">Experiments and projects.</h1>
				<p class="max-w-3xl text-lg leading-relaxed text-skin-secondary">
					Things I am working on.
				</p>
			</div>
			<div class="columns-1 md:columns-2 gap-8 space-y-8">
				<a href="/course" :class="cardClass" style="backface-visibility:hidden; -webkit-backface-visibility:hidden;  ">
					<div class="p-7 relative">
						<p class="uppercase text-lightGray-500 font-bold text-xs">AI</p>
						<h3 class="mt-4 text-2xl md:text-3xl font-bold">Ai Coder Course</h3>
						<p class="mt-2 text-lg">Learn to code in weeks not years. Learn to build apps using AI. Learn advanced code and AI tools to make sure you stay ahead in the age of AI.</p>
					</div>
				</a>
				

				<a href="/elements" :class="cardClass" style="backface-visibility:hidden; -webkit-backface-visibility:hidden;  ">
					<div class="p-7 relative">
						<p class="uppercase text-lightGray-500 font-bold text-xs">Library</p>
						<h3 class="mt-4 text-2xl md:text-3xl font-bold">Elements</h3>
						<p class="mt-2 mb-0 text-lg">A component library for building interfaces. Built with Vue and Tailwind CSS. 
							Built for humans and AI.
						</p>
					</div>
				</a>

				<a :class="cardClass" style="backface-visibility:hidden; -webkit-backface-visibility:hidden;  ">
					<div class="p-7 relative">
						<p class="uppercase text-lightGray-500 font-bold text-xs">AI</p>
						<h3 class="mt-4 text-2xl md:text-3xl font-bold">Team AI</h3>
						<p class="mt-2 mb-0 ">Work with your team, store files and processes, train AI on your company data. Use AI to help your team work together more effectively. Create your companies repository of information that your own AI can use. </p>
					</div>
				</a>
				
				<a href="https://steve-98.kit.com/4b5ef441c9" :class="cardClass" style="backface-visibility:hidden; -webkit-backface-visibility:hidden;  ">
					<div class="relative">
						<img :src="bookCover" alt="picture of an app" class="w-full h-full object-cover dark:invert" />
						<div class="p-7 relative">
							<p class="uppercase text-lightGray-500 font-bold text-xs">Book</p>
							<h3 class="mt-4 text-2xl md:text-3xl font-bold">Human, Artificial and Future Intelligence</h3>
							<p class="mt-2 mb-0 text-lg">I've been working on a book on intelligence, what I have learnt about human intelligence, compared with artificial intelligence, as well as what advances in neuroscience could mean for the future of intelligence.  What is amusing is that we still don't really know precisely what intelligence is!</p>
						</div>
					</div>
				</a>
				
			</div>
		</section>
	</SteveLayout>
</template>
