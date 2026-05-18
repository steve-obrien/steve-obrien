<script setup>
const experiments = [
	{
		title: 'Realtime AI Tools',
		description: 'Prototyping low-latency interfaces for collaborative software.',
		status: 'Active',
	},
];
</script>

<template>
	<SteveLayout>
		<section class="space-y-8">
			<div class="space-y-3">
				<p class="text-xs font-semibold uppercase tracking-[0.18em] text-skin-muted">Experiments</p>
				<h1 class="text-4xl font-semibold tracking-tight sm:text-5xl">What I'm testing</h1>
				<p class="max-w-3xl text-lg leading-relaxed text-skin-secondary">
					A running list of ideas and prototypes. Fast feedback over polish.
				</p>
			</div>
			<div class="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-8">
				<article>
					<a href="/course" class="shadow-xl ring-1 ring-zinc-100 dark:ring-zinc-900 dark:zinc-ring-900 mr-6 block w-full h-[450px] sm:h-[500px] bg-white dark:bg-zinc-800 rounded-3xl overflow-hidden cursor-pointer relative transform hover:scale-[1.03] group duration-300 ease-in-out hover:shadow-2xl" style="backface-visibility:hidden; -webkit-backface-visibility:hidden;  ">

						<div class="p-7 absolute top-0 z-20 left-0 right-0">
							<p class="uppercase text-lightGray-500 font-bold text-xs mb-0"></p>
							<h3 class="mt-4 text-2xl md:text-3xl font-bold  mb-0">Ai Coder Course</h3>
							<p class="mt-2 mb-0 ">Learn to code in weeks not years. Learn to build apps using AI. Learn advanced code and AI tools to make sure you stay ahead in the age of AI.</p>
						</div>
					</a>
				</article>
				<article>
					<a class="shadow-xl ring-zinc-100 mr-6 block w-full h-[450px] sm:h-[500px] bg-white dark:bg-zinc-800 rounded-3xl overflow-hidden border-white  relative transform hover:scale-[1.03] group duration-300 ease-in-out hover:shadow-2xl" style="backface-visibility:hidden; -webkit-backface-visibility:hidden;  ">
						<div class="p-7 absolute top-0 z-20 left-0 right-0">
							<p class="uppercase text-lightGray-500 font-bold text-xs mb-0"></p>
							<h3 class="mt-4 text-2xl md:text-3xl font-bold text-gray-900 mb-0">Team AI</h3>
							<p class="mt-2 mb-0 ">Work with your team, store files and processes, train AI on your company data. Use AI to help your team work together more effectively. Create your companies repository of information that your own AI can use. </p>
						</div>
					</a>
				</article>
			</div>
		</section>
	</SteveLayout>
</template>
