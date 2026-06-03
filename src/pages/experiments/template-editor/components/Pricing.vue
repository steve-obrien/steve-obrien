<template>
	<section id="pricing" class="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
		<div class="text-center">
			<p class="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-200">Pricing layout</p>
			<h2 class="mt-3 text-4xl font-black text-white">Three editable pricing cards with nested feature lists.</h2>
		</div>
		<div class="mt-10 grid gap-6 lg:grid-cols-3">
			<article v-for="plan in plans" :key="plan.name" class="rounded-[2rem] border p-6" :class="plan.highlight ? 'border-cyan-300 bg-cyan-300 text-slate-950 shadow-2xl shadow-cyan-300/20' : 'border-white/10 bg-white/[0.04] text-white'">
				<div class="flex items-start justify-between gap-4">
					<div>
						<h3 class="text-2xl font-black">{{ plan.name }}</h3>
						<p class="mt-2 text-sm" :class="plan.highlight ? 'text-slate-700' : 'text-slate-400'">{{ plan.description }}</p>
					</div>
					<span v-if="plan.highlight" class="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-white">Popular</span>
				</div>
				<p class="mt-8">
					<span class="text-5xl font-black">{{ plan.price }}</span>
					<span class="text-sm">/ month</span>
				</p>
				<ul class="mt-8 space-y-3">
					<li v-for="feature in plan.features" :key="feature" class="flex gap-3 text-sm">
						<span class="mt-0.5">✓</span>
						<span>{{ feature }}</span>
					</li>
				</ul>
				<button class="mt-8 w-full rounded-2xl px-5 py-3 font-bold" :class="plan.highlight ? 'bg-slate-950 text-white' : 'bg-white text-slate-950'">Choose {{ plan.name }}</button>
			</article>
		</div>
	</section>
</template>

<script setup>
const props = defineProps({
	plans: Array,
	default: () => {
		return [
			{name: "basic"}
		]
	}
});
</script>
