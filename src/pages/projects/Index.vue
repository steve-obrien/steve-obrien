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

</script>

<template>
	<SteveLayout bg-class="bg-gray-50 dark:bg-black">
		<section class="space-y-8">
			<div class="space-y-3">
				<p class="text-xs font-semibold uppercase tracking-[0.18em] text-skin-muted">Projects</p>
				<h1 class="text-4xl font-semibold tracking-tight sm:text-5xl">Selected work</h1>
				<p class="max-w-3xl text-lg leading-relaxed text-skin-secondary">
					A concise set of projects that represent what I care about building.
				</p>
			</div>
			<div class="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-8">
				<a href="/course" class="shadow-xl relative ring-1 ring-zinc-100 dark:ring-zinc-900 dark:zinc-ring-900 mr-6 block w-full h-[450px] sm:h-[500px] bg-white dark:bg-zinc-800 rounded-3xl overflow-hidden cursor-pointer transform hover:scale-[1.03] group duration-300 ease-in-out hover:shadow-2xl" style="backface-visibility:hidden; -webkit-backface-visibility:hidden;  ">
					<div class="p-7 absolute top-0 z-20 left-0 right-0">
						<p class="uppercase text-lightGray-500 font-bold text-xs mb-0">AI</p>
						<h3 class="mt-4 text-2xl md:text-3xl font-bold  mb-0">Ai Coder Course</h3>
						<p class="mt-2 mb-0">Learn to code in weeks not years. Learn to build apps using AI. Learn advanced code and AI tools to make sure you stay ahead in the age of AI.</p>
					</div>
				</a>
				<a class="shadow-xl relative ring-zinc-100 mr-6 block w-full h-[450px] sm:h-[500px] bg-white dark:bg-zinc-800 rounded-3xl overflow-hidden border-white transform hover:scale-[1.03] group duration-300 ease-in-out hover:shadow-2xl" style="backface-visibility:hidden; -webkit-backface-visibility:hidden;  ">
					<div class="p-7 top-0 z-20 left-0 right-0">
						<p class="uppercase text-lightGray-500 font-bold text-xs mb-0"></p>
						<h3 class="mt-4 text-2xl md:text-3xl font-bold text-gray-900 mb-0">Team AI</h3>
						<p class="mt-2 mb-0 ">Work with your team, store files and processes, train AI on your company data. Use AI to help your team work together more effectively. Create your companies repository of information that your own AI can use. </p>
					</div>
				</a>
				<a class="shadow-xl relative ring-zinc-100 mr-6 block w-full min-h-full bg-white dark:bg-zinc-800 rounded-3xl overflow-hidden border-white transform hover:scale-[1.03] group duration-300 ease-in-out hover:shadow-2xl" style="backface-visibility:hidden; -webkit-backface-visibility:hidden;  ">
					<div class="p-7 top-0 z-20 left-0 right-0">
						<p class="uppercase text-lightGray-500 font-bold text-xs mb-0"></p>
						<h3 class="mt-4 text-2xl md:text-3xl font-bold text-gray-900 mb-0">Human, Artificial and Future Intelligence</h3>
						<img :src="bookCover" alt="picture of an app" class="w-full h-full object-cover" />
						<p class="mt-2 mb-0 text-lg">I've been working on a book on intelligence, what I have learnt about human intelligence, compared with artificial intelligence, as well as what advances in neuroscience could mean for the future of intelligence.  What is amusing is that we still don't really know precisely what intelligence is!</p>
					</div>
				</a>
			</div>
		</section>
	</SteveLayout>
</template>
