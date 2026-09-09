<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { findMantra, mantraGroups, mantras } from './mantras';

const props = defineProps({
	slug: {
		type: String,
		default: '',
	},
});

/**
 * The mantra expanded by the current shareable detail route.
 */
const activeMantra = computed(() => findMantra(props.slug));

/**
 * The mantra that follows the expanded entry in the complete sequence.
 */
const nextMantra = computed(() => {
	if (!activeMantra.value) return mantras[0];
	const index = mantras.findIndex((mantra) => mantra.slug === activeMantra.value.slug);
	return mantras[index + 1] || mantras[0];
});
</script>

<template>
	<SteveLayout bg-class="bg-background">
		<article class="mx-auto max-w-5xl pb-12 pt-14 sm:pt-24">
			<header class="max-w-4xl border-b border-border pb-16 sm:pb-24">
				<p class="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
					Working principles · 01—{{ String(mantras.length).padStart(2, '0') }}
				</p>
				<h1 class="mt-7 max-w-4xl font-serif text-[clamp(4.5rem,14vw,10rem)] font-normal leading-[0.78] tracking-[-0.065em] text-foreground">
					Mantras.
				</h1>
				<p class="mt-12 max-w-2xl text-xl leading-9 text-foreground sm:text-2xl sm:leading-10">
					Hard-won mantras shaped through experience: building Newicon, working with teams and pursuing personal projects.
				</p>
				<p class="mt-6 max-w-2xl text-base leading-7 text-muted-foreground">
					Some are original, some are borrowed or adapted from people and companies I admire. They are not commandments. They are prompts: useful ways to challenge an assumption, unlock a conversation or find a better next step.
				</p>
			</header>

			<section
				v-for="group in mantraGroups"
				:key="group.slug"
				:aria-labelledby="`${group.slug}-heading`"
				class="grid border-b border-border py-14 sm:py-20 lg:grid-cols-[15rem_1fr] lg:gap-12"
			>
				<div>
					<p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
						{{ String(group.mantras[0].number).padStart(2, '0') }}—{{ String(group.mantras[group.mantras.length - 1].number).padStart(2, '0') }}
					</p>
					<h2 :id="`${group.slug}-heading`" class="mt-3 max-w-48 text-lg font-semibold leading-6 tracking-[-0.02em]">
						{{ group.title }}
					</h2>
				</div>

				<ol :start="group.mantras[0].number" class="mt-8 divide-y divide-border border-y border-border lg:mt-0">
					<li v-for="mantra in group.mantras" :key="mantra.slug">
						<article
							v-if="activeMantra?.slug === mantra.slug"
							:id="mantra.slug"
							class="-mx-4 bg-secondary px-4 py-8 sm:-mx-8 sm:px-8 sm:py-10"
							:aria-labelledby="`${mantra.slug}-title`"
						>
							<div class="grid gap-6 sm:grid-cols-[4rem_1fr]">
								<p class="font-serif text-2xl text-muted-foreground" aria-hidden="true">
									{{ String(mantra.number).padStart(2, '0') }}.
								</p>
								<div>
									<h3 :id="`${mantra.slug}-title`" class="max-w-3xl font-serif text-4xl font-normal leading-[1.05] tracking-[-0.035em] sm:text-6xl">
										{{ mantra.title }}
									</h3>
									<div class="mt-8 max-w-2xl space-y-5 text-lg leading-8 text-foreground/85">
										<p v-for="paragraph in mantra.body" :key="paragraph">{{ paragraph }}</p>
										<ul v-if="mantra.points" class="ml-5 list-disc space-y-3 marker:text-muted-foreground">
											<li v-for="point in mantra.points" :key="point" class="pl-2">{{ point }}</li>
										</ul>
										<p v-for="link in mantra.links" :key="link.href">
											<a :href="link.href" target="_blank" rel="noopener noreferrer" class="font-semibold underline decoration-border underline-offset-4 transition hover:decoration-foreground">
												{{ link.label }} ↗
											</a>
										</p>
									</div>
									<RouterLink to="/mantras" class="mt-8 inline-flex text-sm font-semibold text-muted-foreground transition hover:text-foreground">
										Close mantra ↑
									</RouterLink>
								</div>
							</div>
						</article>

						<RouterLink
							v-else
							:to="{ path: `/mantras/${mantra.slug}`, hash: `#${mantra.slug}` }"
							class="group grid gap-3 py-5 sm:grid-cols-[4rem_1fr_auto] sm:items-baseline sm:gap-6"
						>
							<span class="font-serif text-lg text-muted-foreground">{{ String(mantra.number).padStart(2, '0') }}.</span>
							<span class="font-serif text-2xl leading-tight tracking-[-0.02em] sm:text-3xl">{{ mantra.title }}</span>
							<span class="hidden text-muted-foreground transition-transform group-hover:translate-x-1 sm:inline" aria-hidden="true">→</span>
						</RouterLink>
					</li>
				</ol>
			</section>

			<nav v-if="activeMantra && nextMantra" aria-label="Next mantra" class="pt-14 sm:pt-20">
				<p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Next mantra</p>
				<RouterLink
					:to="{ path: `/mantras/${nextMantra.slug}`, hash: `#${nextMantra.slug}` }"
					class="group mt-5 flex max-w-3xl items-end justify-between gap-8 font-serif text-4xl leading-tight tracking-[-0.035em] sm:text-6xl"
				>
					<span>{{ nextMantra.title }}</span>
					<span class="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-2" aria-hidden="true">→</span>
				</RouterLink>
			</nav>
		</article>
	</SteveLayout>
</template>
