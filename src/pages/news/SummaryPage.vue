<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import {
	getNewsFeedAdjacent,
	getNewsFeedByDate,
	getNewsItemByDateAndSlug,
	getNewsItemPath,
} from './dailyNews';

const props = defineProps({
	date: {
		type: String,
		required: true,
	},
	slug: {
		type: String,
		required: true,
	},
});

const formatter = new Intl.DateTimeFormat('en-GB', {
	day: 'numeric',
	month: 'long',
	year: 'numeric',
});

const feed = computed(() => getNewsFeedByDate(props.date));
const item = computed(() => getNewsItemByDateAndSlug(props.date, props.slug));
const adjacent = computed(() => getNewsFeedAdjacent(props.date));

const pageStyle = computed(() => ({
	'--summary-gradient': item.value?.gradient,
	'--summary-accent': item.value?.accent,
}));

const itemNav = computed(() => {
	if (!feed.value || !item.value) {
		return {
			previous: null,
			next: null,
		};
	}

	const index = feed.value.items.findIndex((candidate) => candidate.id === item.value.id);
	return {
		previous: feed.value.items[index - 1] || null,
		next: feed.value.items[index + 1] || null,
	};
});

const pillLinkClasses = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.055] px-4 py-3 text-xs font-extrabold uppercase tracking-[0.08em] text-white/75 no-underline transition hover:border-white/35 hover:bg-white/[0.095] hover:text-white';
const disabledPillClasses = `${pillLinkClasses} opacity-40 hover:border-white/15 hover:bg-white/[0.055] hover:text-white/75`;
</script>

<template>
	<SteveLayout bg-class="news-summary-bg">
		<article v-if="feed && item" class="news-summary -mt-10 grid gap-6 max-sm:-mt-14 md:gap-7" :style="pageStyle">
			<RouterLink :class="`${pillLinkClasses} w-fit`" :to="`/news/${feed.date}`">
				<span aria-hidden="true"><-</span>
				<span>{{ formatter.format(new Date(feed.generatedAt)) }} feed</span>
			</RouterLink>

			<header class="news-summary-hero grid overflow-hidden rounded-3xl border border-white/15 shadow-[0_1.5rem_4.5rem_rgba(0,0,0,0.34)] max-sm:rounded-[1.1rem] md:grid-cols-[minmax(0,1fr)_minmax(22rem,0.72fr)]">
				<div class="flex min-h-[27rem] flex-col justify-end gap-4 p-[clamp(1.25rem,4vw,2rem)] max-sm:min-h-0">
					<div class="news-summary-meta flex flex-wrap items-center gap-2 text-xs font-extrabold uppercase leading-snug tracking-[0.1em]">
						<span>{{ item.category }}</span>
						<span aria-hidden="true">/</span>
						<time :datetime="item.publishedAt">{{ formatter.format(new Date(item.publishedAt)) }}</time>
					</div>
					<h1 class="m-0 font-serif text-[clamp(2.75rem,8vw,6.7rem)] font-normal leading-[0.94] tracking-normal text-white max-sm:leading-none">
						{{ item.title }}
					</h1>
					<p class="m-0 max-w-2xl text-[1.08rem] leading-8 text-white/75">
						{{ item.summary.deck }}
					</p>
				</div>

				<div class="news-summary-image-wrap relative min-h-80 overflow-hidden md:min-h-[36rem] md:border-l md:border-white/10">
					<img class="block size-full object-cover" :src="item.image" :alt="item.imageAlt" />
				</div>
			</header>

			<div class="grid items-start gap-5 md:grid-cols-[minmax(0,1fr)_minmax(18rem,0.34fr)] md:gap-7">
				<section class="grid gap-5 text-[clamp(1.05rem,1.6vw,1.2rem)] leading-8 text-white/80">
					<p v-for="paragraph in item.summary.paragraphs" :key="paragraph">
						{{ paragraph }}
					</p>
				</section>

				<aside class="grid gap-4">
					<div class="rounded-2xl border border-white/15 bg-white/[0.055] p-5">
						<h2 class="news-summary-panel-title mb-4 mt-0 text-xs font-extrabold uppercase tracking-[0.1em]">
							Signals
						</h2>
						<ul class="m-0 grid gap-3 pl-4 leading-6 text-white/75">
							<li v-for="takeaway in item.summary.takeaways" :key="takeaway">
								{{ takeaway }}
							</li>
						</ul>
					</div>

					<a class="grid gap-1 rounded-2xl border border-white/15 bg-white/[0.055] p-5 text-white/75 no-underline transition hover:border-white/35 hover:bg-white/[0.095] hover:text-white" :href="item.sourceUrl" target="_blank" rel="noreferrer">
						<span class="text-xs font-extrabold uppercase tracking-[0.1em] text-white/60">Original source</span>
						<strong class="text-lg font-bold text-white">{{ item.sourceName }}</strong>
					</a>
				</aside>
			</div>

			<nav class="grid grid-cols-1 items-center gap-3 pt-4 md:grid-cols-[1fr_auto_1fr]" aria-label="News summary navigation">
				<RouterLink
					v-if="itemNav.previous"
					:class="pillLinkClasses"
					:to="getNewsItemPath(feed, itemNav.previous)"
				>
					<span aria-hidden="true"><-</span>
					<span>{{ itemNav.previous.category }}</span>
				</RouterLink>
				<span v-else :class="disabledPillClasses">
					<span aria-hidden="true"><-</span>
					<span>Previous summary</span>
				</span>

				<div class="flex flex-wrap justify-center gap-3">
					<RouterLink v-if="adjacent.previous" :class="pillLinkClasses" :to="`/news/${adjacent.previous.date}`">Older day</RouterLink>
					<RouterLink v-if="adjacent.next" :class="pillLinkClasses" :to="`/news/${adjacent.next.date}`">Newer day</RouterLink>
				</div>

				<RouterLink
					v-if="itemNav.next"
					:class="pillLinkClasses"
					:to="getNewsItemPath(feed, itemNav.next)"
				>
					<span>{{ itemNav.next.category }}</span>
					<span aria-hidden="true">-></span>
				</RouterLink>
				<span v-else :class="disabledPillClasses">
					<span>Next summary</span>
					<span aria-hidden="true">-></span>
				</span>
			</nav>
		</article>

		<section v-else class="-mt-10 grid gap-4 text-white">
			<p>That generated summary is not in this feed.</p>
			<RouterLink class="text-white" to="/news">Back to latest news</RouterLink>
		</section>
	</SteveLayout>
</template>

<style scoped>
:global(.news-summary-bg) {
	background:
		radial-gradient(circle at 12% 6%, rgba(45, 212, 191, 0.1), transparent 26rem),
		radial-gradient(circle at 82% 10%, rgba(96, 165, 250, 0.1), transparent 32rem),
		#05070d;
	color: white;
}

.news-summary-hero {
	background:
		linear-gradient(180deg, rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0)),
		var(--summary-gradient);
}

.news-summary-meta {
	color: color-mix(in srgb, var(--summary-accent) 70%, white 30%);
}

.news-summary-image-wrap::after {
	position: absolute;
	inset: 0;
	background: linear-gradient(180deg, transparent 45%, rgba(0, 0, 0, 0.42));
	content: "";
}

.news-summary p {
	margin: 0;
}

.news-summary-panel-title {
	color: color-mix(in srgb, var(--summary-accent) 68%, white 32%);
}
</style>
