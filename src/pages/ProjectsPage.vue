<script setup>
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
	<SteveLayout bg-class="bg-gray-50 dark:bg-gray-900" >
		<section class="space-y-8">
			<div class="space-y-3">
				<p class="text-xs font-semibold uppercase tracking-[0.18em] text-skin-muted">Projects</p>
				<h1 class="text-4xl font-semibold tracking-tight sm:text-5xl">Selected work</h1>
				<p class="max-w-3xl text-lg leading-relaxed text-skin-secondary">
					A concise set of projects that represent what I care about building.
				</p>
			</div>
			<div class="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-8">
				<article>
					<a href="https://newicon.net" target="newicon" rel="noopener noreferrer" class="shadow-xl ring-1 ring-zinc-100 mr-6 block w-full h-[450px] sm:h-[500px] bg-white rounded-2xl overflow-hidden border-white cursor-pointer relative transform hover:scale-[1.03] group duration-300 ease-in-out hover:shadow-2xl" style="backface-visibility:hidden; -webkit-backface-visibility:hidden;  ">
						<div class="p-7 absolute top-0 z-20 left-0 right-0">
							<h3 class="mt-4 text-2xl md:text-3xl font-bold text-gray-900 mb-0">New Icon</h3>
							<p class="mt-2 mb-0  text-gray-800">A software development and consulting company.</p>
						</div>
					</a>
				</article>
				<article>
					<a href="https://flex-digital.net" target="flexdigital" rel="noopener noreferrer" class="shadow-xl ring-1 ring-zinc-100 mr-6 block w-full h-[450px] sm:h-[500px] bg-white rounded-2xl overflow-hidden border-white cursor-pointer relative transform hover:scale-[1.03] group duration-300 ease-in-out hover:shadow-2xl" style="backface-visibility:hidden; -webkit-backface-visibility:hidden;  ">
						<div class="p-7 absolute top-0 z-20 left-0 right-0">
							<h3 class="mt-4 text-2xl md:text-3xl font-bold text-gray-900 mb-0">Flex Digital</h3>
							<p class="mt-2 mb-0 text-xs md:text-sm text-gray-500">A technology marketing company specialising in construction and hospitality.</p>
						</div>
					</a>
				</article>
			</div>
		</section>
	</SteveLayout>
</template>
