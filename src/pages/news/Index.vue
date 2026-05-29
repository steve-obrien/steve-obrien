<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import NewsCard from './components/NewsCard.vue';
import {
	getLatestNewsFeed,
	getNewsFeedAdjacent,
	getNewsFeedByDate,
	getNewsItemPath,
} from './dailyNews';

const props = defineProps({
	date: {
		type: String,
		default: '',
	},
});

const formatter = new Intl.DateTimeFormat('en-GB', {
	day: 'numeric',
	month: 'long',
	year: 'numeric',
});

const feed = computed(() => getNewsFeedByDate(props.date) || getLatestNewsFeed());
const generatedLabel = computed(() => formatter.format(new Date(feed.value.generatedAt)));
const articles = computed(() => feed.value.items.slice(0, feed.value.limit));
const adjacent = computed(() => getNewsFeedAdjacent(feed.value.date));
const dayLinkClasses = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.055] px-4 py-3 text-xs font-extrabold uppercase leading-tight tracking-[0.08em] text-white/75 no-underline transition hover:border-white/35 hover:bg-white/[0.095] hover:text-white';
const dayCurrentClasses = `${dayLinkClasses} min-w-44 text-white`;
const dayDisabledClasses = `${dayLinkClasses} opacity-40 hover:border-white/15 hover:bg-white/[0.055] hover:text-white/75`;
</script>

<template>
	<SteveLayout bg-class="news-page-bg" data-theme="dark">
		<section class="relative -mt-10 grid gap-8 pb-8 max-sm:-mt-14 max-sm:gap-6 md:gap-10">
			<header class="grid gap-5 pb-3 md:grid-cols-[minmax(9rem,0.28fr)_minmax(0,1fr)] md:items-end">
				<div class="flex flex-wrap items-center gap-2.5 text-xs font-extrabold uppercase leading-snug tracking-[0.16em] text-white/60 md:self-start md:pt-3">
					<span>Daily feed</span>
					<span aria-hidden="true">/</span>
					<time :datetime="feed.generatedAt">{{ generatedLabel }}</time>
				</div>
				<div class="grid max-w-[54rem] gap-4">
					<h1 class="m-0 font-serif text-5xl font-normal leading-none tracking-normal text-white sm:text-[clamp(3.2rem,8vw,7rem)] sm:leading-[0.95]">
						AI, brain science, and agentic engineering worth tracking.
					</h1>
					<p class="m-0 max-w-2xl text-base leading-7 text-white/65 sm:text-lg sm:leading-8">
						{{ feed.description }}
					</p>
				</div>
			</header>

			<nav class="grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto_1fr]" aria-label="Daily news feed navigation">
				<RouterLink
					v-if="adjacent.previous"
					:class="dayLinkClasses"
					:to="`/news/${adjacent.previous.date}`"
				>
					<span aria-hidden="true"><-</span>
					<span>{{ formatter.format(new Date(adjacent.previous.generatedAt)) }}</span>
				</RouterLink>
				<span v-else :class="dayDisabledClasses">
					<span aria-hidden="true"><-</span>
					<span>Older feed</span>
				</span>

				<RouterLink :class="`${dayCurrentClasses} max-sm:order-first`" :to="`/news/${feed.date}`">
					{{ generatedLabel }}
				</RouterLink>

				<RouterLink
					v-if="adjacent.next"
					:class="dayLinkClasses"
					:to="`/news/${adjacent.next.date}`"
				>
					<span>{{ formatter.format(new Date(adjacent.next.generatedAt)) }}</span>
					<span aria-hidden="true">-></span>
				</RouterLink>
				<span v-else :class="dayDisabledClasses">
					<span>Newer feed</span>
					<span aria-hidden="true">-></span>
				</span>
			</nav>

			<div class="grid gap-5 md:grid-cols-2 md:gap-6 min-[1160px]:grid-cols-3">
				<NewsCard
					v-for="(item, index) in articles"
					:key="item.id"
					:item="item"
					:featured="index === 0"
					:to="getNewsItemPath(feed, item)"
				/>
			</div>
		</section>
	</SteveLayout>
</template>

<style scoped>
:global(.news-page-bg) {
	background:
		radial-gradient(circle at 18% 8%, rgba(45, 212, 191, 0.12), transparent 28rem),
		radial-gradient(circle at 84% 14%, rgba(96, 165, 250, 0.12), transparent 30rem),
		#05070d;
	color: white;
}
</style>
