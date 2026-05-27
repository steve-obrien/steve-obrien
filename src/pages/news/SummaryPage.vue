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
</script>

<template>
	<SteveLayout bg-class="news-summary-bg">
		<article v-if="feed && item" class="news-summary" :style="pageStyle">
			<RouterLink class="news-summary-back" :to="`/news/${feed.date}`">
				<span aria-hidden="true"><-</span>
				<span>{{ formatter.format(new Date(feed.generatedAt)) }} feed</span>
			</RouterLink>

			<header class="news-summary-hero">
				<div class="news-summary-copy">
					<div class="news-summary-meta">
						<span>{{ item.category }}</span>
						<span aria-hidden="true">/</span>
						<time :datetime="item.publishedAt">{{ formatter.format(new Date(item.publishedAt)) }}</time>
					</div>
					<h1>{{ item.title }}</h1>
					<p>{{ item.summary.deck }}</p>
				</div>

				<div class="news-summary-image-wrap">
					<img :src="item.image" :alt="item.imageAlt" />
				</div>
			</header>

			<div class="news-summary-body">
				<section class="news-summary-prose">
					<p v-for="paragraph in item.summary.paragraphs" :key="paragraph">
						{{ paragraph }}
					</p>
				</section>

				<aside class="news-summary-sidebar">
					<div class="news-summary-panel">
						<h2>Signals</h2>
						<ul>
							<li v-for="takeaway in item.summary.takeaways" :key="takeaway">
								{{ takeaway }}
							</li>
						</ul>
					</div>

					<a class="news-summary-source" :href="item.sourceUrl" target="_blank" rel="noreferrer">
						<span>Original source</span>
						<strong>{{ item.sourceName }}</strong>
					</a>
				</aside>
			</div>

			<nav class="news-summary-nav" aria-label="News summary navigation">
				<RouterLink
					v-if="itemNav.previous"
					class="news-summary-nav-link"
					:to="getNewsItemPath(feed, itemNav.previous)"
				>
					<span aria-hidden="true"><-</span>
					<span>{{ itemNav.previous.category }}</span>
				</RouterLink>
				<span v-else class="news-summary-nav-link news-summary-nav-disabled">
					<span aria-hidden="true"><-</span>
					<span>Previous summary</span>
				</span>

				<div class="news-summary-day-links">
					<RouterLink v-if="adjacent.previous" :to="`/news/${adjacent.previous.date}`">Older day</RouterLink>
					<RouterLink v-if="adjacent.next" :to="`/news/${adjacent.next.date}`">Newer day</RouterLink>
				</div>

				<RouterLink
					v-if="itemNav.next"
					class="news-summary-nav-link"
					:to="getNewsItemPath(feed, itemNav.next)"
				>
					<span>{{ itemNav.next.category }}</span>
					<span aria-hidden="true">-></span>
				</RouterLink>
				<span v-else class="news-summary-nav-link news-summary-nav-disabled">
					<span>Next summary</span>
					<span aria-hidden="true">-></span>
				</span>
			</nav>
		</article>

		<section v-else class="news-summary-missing">
			<p>That generated summary is not in this feed.</p>
			<RouterLink to="/news">Back to latest news</RouterLink>
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

.news-summary {
	display: grid;
	gap: 1.4rem;
	margin-top: -2.5rem;
}

.news-summary-back,
.news-summary-nav-link,
.news-summary-day-links a,
.news-summary-source {
	color: rgba(255, 255, 255, 0.76);
	text-decoration: none;
}

.news-summary-back {
	display: inline-flex;
	width: fit-content;
	align-items: center;
	gap: 0.55rem;
	border: 1px solid rgba(255, 255, 255, 0.14);
	border-radius: 999px;
	background: rgba(255, 255, 255, 0.055);
	font-size: 0.78rem;
	font-weight: 800;
	letter-spacing: 0.08em;
	padding: 0.8rem 1rem;
	text-transform: uppercase;
}

.news-summary-hero {
	display: grid;
	overflow: hidden;
	border: 1px solid rgba(255, 255, 255, 0.14);
	border-radius: 1.5rem;
	background:
		linear-gradient(180deg, rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0)),
		var(--summary-gradient);
	box-shadow: 0 1.5rem 4.5rem rgba(0, 0, 0, 0.34);
}

.news-summary-copy {
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
	gap: 1rem;
	min-height: 27rem;
	padding: clamp(1.25rem, 4vw, 2rem);
}

.news-summary-meta {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 0.55rem;
	color: color-mix(in srgb, var(--summary-accent) 70%, white 30%);
	font-size: 0.78rem;
	font-weight: 800;
	letter-spacing: 0.1em;
	line-height: 1.3;
	text-transform: uppercase;
}

.news-summary h1 {
	margin: 0;
	color: white;
	font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
	font-size: clamp(2.8rem, 8vw, 6.7rem);
	font-weight: 400;
	letter-spacing: 0;
	line-height: 0.94;
}

.news-summary-copy p {
	margin: 0;
	max-width: 42rem;
	color: rgba(255, 255, 255, 0.76);
	font-size: 1.08rem;
	line-height: 1.75;
}

.news-summary-image-wrap {
	position: relative;
	min-height: 20rem;
	overflow: hidden;
}

.news-summary-image-wrap::after {
	position: absolute;
	inset: 0;
	background: linear-gradient(180deg, transparent 45%, rgba(0, 0, 0, 0.42));
	content: "";
}

.news-summary-image-wrap img {
	display: block;
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.news-summary-body {
	display: grid;
	gap: 1.2rem;
	align-items: start;
}

.news-summary-prose {
	display: grid;
	gap: 1.2rem;
	color: rgba(255, 255, 255, 0.78);
	font-size: clamp(1.05rem, 1.6vw, 1.2rem);
	line-height: 1.85;
}

.news-summary-prose p {
	margin: 0;
}

.news-summary-sidebar {
	display: grid;
	gap: 1rem;
}

.news-summary-panel,
.news-summary-source {
	border: 1px solid rgba(255, 255, 255, 0.14);
	border-radius: 1rem;
	background: rgba(255, 255, 255, 0.055);
}

.news-summary-panel {
	padding: 1.2rem;
}

.news-summary-panel h2 {
	margin: 0 0 1rem;
	color: color-mix(in srgb, var(--summary-accent) 68%, white 32%);
	font-size: 0.78rem;
	font-weight: 800;
	letter-spacing: 0.1em;
	text-transform: uppercase;
}

.news-summary-panel ul {
	display: grid;
	gap: 0.85rem;
	margin: 0;
	padding-left: 1.05rem;
	color: rgba(255, 255, 255, 0.76);
	line-height: 1.55;
}

.news-summary-source {
	display: grid;
	gap: 0.3rem;
	padding: 1.2rem;
}

.news-summary-source span {
	color: rgba(255, 255, 255, 0.58);
	font-size: 0.78rem;
	font-weight: 800;
	letter-spacing: 0.1em;
	text-transform: uppercase;
}

.news-summary-source strong {
	color: white;
	font-size: 1.1rem;
	font-weight: 700;
}

.news-summary-nav {
	display: grid;
	grid-template-columns: 1fr;
	gap: 0.75rem;
	align-items: center;
	padding-top: 1rem;
}

.news-summary-nav-link,
.news-summary-day-links a {
	display: inline-flex;
	min-height: 2.7rem;
	align-items: center;
	justify-content: center;
	gap: 0.55rem;
	border: 1px solid rgba(255, 255, 255, 0.14);
	border-radius: 999px;
	background: rgba(255, 255, 255, 0.055);
	font-size: 0.78rem;
	font-weight: 800;
	letter-spacing: 0.08em;
	padding: 0.85rem 1rem;
	text-transform: uppercase;
}

.news-summary-nav-link:hover,
.news-summary-day-links a:hover,
.news-summary-back:hover,
.news-summary-source:hover {
	border-color: rgba(255, 255, 255, 0.34);
	background: rgba(255, 255, 255, 0.095);
	color: white;
}

.news-summary-nav-disabled {
	opacity: 0.42;
}

.news-summary-day-links {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	gap: 0.75rem;
}

.news-summary-missing {
	display: grid;
	gap: 1rem;
	margin-top: -2.5rem;
	color: white;
}

.news-summary-missing a {
	color: white;
}

@media (min-width: 900px) {
	.news-summary {
		gap: 1.8rem;
	}

	.news-summary-hero {
		grid-template-columns: minmax(0, 1fr) minmax(22rem, 0.72fr);
	}

	.news-summary-image-wrap {
		min-height: 36rem;
		border-left: 1px solid rgba(255, 255, 255, 0.12);
	}

	.news-summary-body {
		grid-template-columns: minmax(0, 1fr) minmax(18rem, 0.34fr);
		gap: 1.8rem;
	}

	.news-summary-nav {
		grid-template-columns: 1fr auto 1fr;
	}
}

@media (max-width: 640px) {
	.news-summary {
		margin-top: -3.5rem;
	}

	.news-summary-hero {
		border-radius: 1.1rem;
	}

	.news-summary-copy {
		min-height: auto;
	}

	.news-summary h1 {
		font-size: 2.75rem;
		line-height: 1;
	}
}
</style>
