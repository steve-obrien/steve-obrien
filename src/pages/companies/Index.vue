<script setup>

import newicon from './newicon.svg';
import newiconBg from './newiconBg.png';
import NewiconLogo from './NewiconLogo.vue';
import flexLogo from './flexLogo.png';

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
	<SteveLayout bg-class="bg-gray-50 dark:bg-gray-900">
		<section class="space-y-8">
			<div class="space-y-3">
				<p class="text-xs font-semibold uppercase tracking-[0.18em] text-skin-muted">Companies</p>
				<h1 class="text-4xl font-medium tracking-tight sm:text-5xl font-serif">Building &amp; scaling.</h1>
				<p class="max-w-3xl text-lg leading-relaxed text-skin-secondary">
					A selection of companies I have founded, led, advised and currently or previously been involved with.
				</p>
			</div>
			<div class="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-8">
				<a href="https://flex-digital.net" target="flexdigital" rel="noopener noreferrer" class="shadow-xl ring-1 ring-zinc-700 mr-6 block w-full bg-black dark:bg-black  rounded-2xl overflow-hidden border-white cursor-pointer relative transform hover:scale-[1.03] group duration-300 ease-in-out hover:shadow-2xl" style="backface-visibility:hidden; -webkit-backface-visibility:hidden;  ">
					<div class="p-7 relative top-0 z-20 left-0 right-0 v-stack h-full">
						<div class="bg-black p-5 aspect-4/3 w-full flex items-center justify-center">
							<img :src="flexLogo" alt="Flex Digital" class="w-full h-auto " />
						</div>
						<!-- <div class="flex-spacer"></div> -->
						<h3 class="mt-4 text-2xl md:text-3xl font-bold text-white mb-0">Flex Digital</h3>
						<p class="mt-2 mb-0 text-white text-lg">A digital marketing company specialising in online marketing SEO, PPC and social for the construction clients.</p>
						<div class="absolute top-0 right-0  text-lg p-4 text-white">
							<svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="none">
								<path fill="currentColor" d="M18.707 1a1 1 0 0 0-1-1h-9a1 1 0 0 0 0 2h8v8a1 1 0 1 0 2 0zm-18 17 .707.707 17-17L17.707 1 17 .293l-17 17z" />
							</svg>
						</div>
					</div>
				</a>
				<a href="https://newicon.net" target="newicon" rel="noopener noreferrer" class="shadow-xl bg-black text-white ring-1 ring-zinc-100 dark:ring-zinc-900 mr-6 block w-full rounded-2xl overflow-hidden border-white cursor-pointer relative transform hover:scale-[1.03] group duration-300 ease-in-out hover:shadow-2xl" style="backface-visibility:hidden; -webkit-backface-visibility:hidden;  ">
					<div class="p-7 relative top-0 z-20 left-0 right-0 v-stack h-full">
						<div class="p-5 aspect-4/3 w-full flex items-center justify-center">
							<NewiconLogo class="w-[200px] text-white " />
						</div>
						<!-- <div class="flex-spacer"></div> -->
						<h3 class="mt-4 text-2xl md:text-3xl font-bold  mb-0">New Icon</h3>
						<p class="mt-2 mb-0 text-lg">A software development and consulting company.</p>
						<p class="mt-2 mb-0 text-lg">Complex software engineering and digital transformation.
							Built over 18 years. Successfully acquired.</p>
					</div>
					<div class="absolute top-0 left-0 right-0  bottom-0">
						<img :src="newiconBg" alt="picture of an app" class="w-full h-full object-cover" />
					</div>
					<div class="absolute top-[50%] left-0 right-0  bottom-0 bg-linear-to-b from-transparent to-black">
					</div>
					<div class="absolute top-0 right-0 p-4">
						<svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="none">
							<path fill="#fff" d="M18.707 1a1 1 0 0 0-1-1h-9a1 1 0 0 0 0 2h8v8a1 1 0 1 0 2 0zm-18 17 .707.707 17-17L17.707 1 17 .293l-17 17z" />
						</svg>
					</div>
				</a>
			</div>
		</section>
	</SteveLayout>
</template>
