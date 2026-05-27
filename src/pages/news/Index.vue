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
</script>

<template>
	<SteveLayout bg-class="news-page-bg" data-theme="dark">
		<section class="news-feed">
			<header class="news-feed-header">
				<div class="news-feed-kicker">
					<span>Daily feed</span>
					<span aria-hidden="true">/</span>
					<time :datetime="feed.generatedAt">{{ generatedLabel }}</time>
				</div>
				<div class="news-feed-heading">
					<h1>AI, brain science, and agentic engineering worth tracking.</h1>
					<p>{{ feed.description }}</p>
				</div>
			</header>

			<nav class="news-day-nav" aria-label="Daily news feed navigation">
				<RouterLink
					v-if="adjacent.previous"
					class="news-day-link"
					:to="`/news/${adjacent.previous.date}`"
				>
					<span aria-hidden="true"><-</span>
					<span>{{ formatter.format(new Date(adjacent.previous.generatedAt)) }}</span>
				</RouterLink>
				<span v-else class="news-day-link news-day-link-disabled">
					<span aria-hidden="true"><-</span>
					<span>Older feed</span>
				</span>

				<RouterLink class="news-day-current" :to="`/news/${feed.date}`">
					{{ generatedLabel }}
				</RouterLink>

				<RouterLink
					v-if="adjacent.next"
					class="news-day-link"
					:to="`/news/${adjacent.next.date}`"
				>
					<span>{{ formatter.format(new Date(adjacent.next.generatedAt)) }}</span>
					<span aria-hidden="true">-></span>
				</RouterLink>
				<span v-else class="news-day-link news-day-link-disabled">
					<span>Newer feed</span>
					<span aria-hidden="true">-></span>
				</span>
			</nav>

			<div class="news-feed-grid">
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

.news-feed {
	position: relative;
	display: grid;
	gap: 2rem;
	margin-top: -2.5rem;
	padding-bottom: 2rem;
}

.news-feed-header {
	display: grid;
	gap: 1.25rem;
	padding-bottom: 0.75rem;
}

.news-feed-kicker {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 0.6rem;
	color: rgba(255, 255, 255, 0.58);
	font-size: 0.76rem;
	font-weight: 800;
	letter-spacing: 0.16em;
	line-height: 1.4;
	text-transform: uppercase;
}

.news-feed-heading {
	display: grid;
	gap: 1rem;
	max-width: 54rem;
}

.news-feed-heading h1 {
	margin: 0;
	color: white;
	font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
	font-size: clamp(3.2rem, 8vw, 7rem);
	font-weight: 400;
	letter-spacing: 0;
	line-height: 0.95;
}

.news-feed-heading p {
	margin: 0;
	max-width: 42rem;
	color: rgba(255, 255, 255, 0.66);
	font-size: 1.1rem;
	line-height: 1.8;
}

.news-feed-grid {
	display: grid;
	gap: 1.25rem;
}

.news-day-nav {
	display: grid;
	grid-template-columns: 1fr auto 1fr;
	gap: 0.75rem;
	align-items: center;
}

.news-day-link,
.news-day-current {
	display: inline-flex;
	min-height: 2.7rem;
	align-items: center;
	justify-content: center;
	gap: 0.55rem;
	border: 1px solid rgba(255, 255, 255, 0.14);
	border-radius: 999px;
	background: rgba(255, 255, 255, 0.055);
	color: rgba(255, 255, 255, 0.76);
	font-size: 0.78rem;
	font-weight: 800;
	letter-spacing: 0.08em;
	line-height: 1.2;
	padding: 0.85rem 1rem;
	text-decoration: none;
	text-transform: uppercase;
	transition:
		background 180ms ease,
		border-color 180ms ease,
		color 180ms ease;
}

.news-day-link:hover,
.news-day-current:hover {
	border-color: rgba(255, 255, 255, 0.34);
	background: rgba(255, 255, 255, 0.095);
	color: white;
}

.news-day-current {
	min-width: 11rem;
	color: white;
}

.news-day-link-disabled {
	opacity: 0.42;
}

.news-day-link-disabled:hover {
	border-color: rgba(255, 255, 255, 0.14);
	background: rgba(255, 255, 255, 0.055);
	color: rgba(255, 255, 255, 0.76);
}

@media (min-width: 900px) {
	.news-feed {
		gap: 2.5rem;
	}

	.news-feed-header {
		grid-template-columns: minmax(9rem, 0.28fr) minmax(0, 1fr);
		align-items: end;
	}

	.news-feed-kicker {
		align-self: start;
		padding-top: 0.75rem;
	}

	.news-feed-grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1.5rem;
	}
}

@media (min-width: 1160px) {
	.news-feed-grid {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}
}

@media (max-width: 640px) {
	.news-feed {
		margin-top: -3.5rem;
		gap: 1.5rem;
	}

	.news-feed-heading h1 {
		font-size: 3rem;
		line-height: 1;
	}

	.news-feed-heading p {
		font-size: 1rem;
		line-height: 1.68;
	}

	.news-day-nav {
		grid-template-columns: 1fr;
	}

	.news-day-current {
		order: -1;
	}
}
</style>
