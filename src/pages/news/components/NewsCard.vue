<script setup>
import { RouterLink } from 'vue-router';
import { computed } from 'vue';

const props = defineProps({
	item: {
		type: Object,
		required: true,
	},
	featured: {
		type: Boolean,
		default: false,
	},
	to: {
		type: String,
		required: true,
	},
});

const formatter = new Intl.DateTimeFormat('en-GB', {
	day: 'numeric',
	month: 'short',
	year: 'numeric',
});

const publishedLabel = computed(() => {
	const [year, month, day] = props.item.publishedAt.split('-').map(Number);
	return formatter.format(new Date(year, month - 1, day));
});

const cardStyle = computed(() => ({
	'--news-card-gradient': props.item.gradient,
	'--news-card-accent': props.item.accent,
}));
</script>

<template>
	<article
		class="news-card"
		:class="{ 'news-card-featured': featured }"
		:style="cardStyle"
	>
		<RouterLink
			class="news-card-link"
			:to="to"
			:aria-label="`Read generated summary for ${item.title}`"
		>
			<div class="news-card-image-wrap">
				<img
					class="news-card-image"
					:src="item.image"
					:alt="item.imageAlt"
					loading="lazy"
				/>
			</div>

			<div class="news-card-body">
				<div class="news-card-meta">
					<span class="news-card-category">{{ item.category }}</span>
					<span aria-hidden="true">/</span>
					<time :datetime="item.publishedAt">{{ publishedLabel }}</time>
				</div>

				<h2 class="news-card-title">{{ item.title }}</h2>
				<p class="news-card-description">{{ item.description }}</p>

				<div class="news-card-source">
					<span>Read summary</span>
					<span class="news-card-source-mark" aria-hidden="true">-></span>
				</div>
			</div>
		</RouterLink>
	</article>
</template>

<style scoped>
.news-card {
	position: relative;
	min-height: 31rem;
	overflow: hidden;
	border: 1px solid rgba(255, 255, 255, 0.14);
	border-radius: 1.5rem;
	background:
		linear-gradient(180deg, rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0)),
		var(--news-card-gradient);
	box-shadow: 0 1.25rem 3.5rem rgba(0, 0, 0, 0.32);
	color: white;
	isolation: isolate;
	transition:
		transform 220ms ease,
		border-color 220ms ease,
		box-shadow 220ms ease;
}

.news-card::before {
	position: absolute;
	inset: 0;
	z-index: -1;
	background:
		linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.18) 44%, rgba(0, 0, 0, 0.58) 100%),
		radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--news-card-accent) 18%, transparent), transparent 52%);
	content: "";
}

.news-card:hover {
	transform: translateY(-0.25rem);
	border-color: color-mix(in srgb, var(--news-card-accent) 44%, white 10%);
	box-shadow: 0 1.75rem 4.5rem rgba(0, 0, 0, 0.4);
}

.news-card-link {
	display: grid;
	min-height: inherit;
	color: inherit;
	text-decoration: none;
}

.news-card-image-wrap {
	position: relative;
	overflow: hidden;
	aspect-ratio: 16 / 10;
	border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.news-card-image-wrap::after {
	position: absolute;
	inset: 0;
	background:
		linear-gradient(180deg, transparent 50%, rgba(0, 0, 0, 0.46) 100%),
		radial-gradient(circle at 50% 16%, transparent 0%, rgba(0, 0, 0, 0.18) 68%);
	content: "";
}

.news-card-image {
	display: block;
	width: 100%;
	height: 100%;
	object-fit: cover;
	transform: scale(1.01);
	transition: transform 320ms ease;
}

.news-card:hover .news-card-image {
	transform: scale(1.05);
}

.news-card-body {
	display: flex;
	min-height: 17rem;
	flex-direction: column;
	gap: 1rem;
	padding: 1.35rem;
}

.news-card-meta,
.news-card-source {
	display: flex;
	align-items: center;
	gap: 0.55rem;
	color: rgba(255, 255, 255, 0.68);
	font-size: 0.72rem;
	font-weight: 700;
	letter-spacing: 0.08em;
	line-height: 1.2;
	text-transform: uppercase;
}

.news-card-category {
	color: color-mix(in srgb, var(--news-card-accent) 72%, white 28%);
}

.news-card-title {
	margin: 0;
	color: white;
	font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
	font-size: clamp(1.8rem, 3vw, 2.65rem);
	font-weight: 400;
	letter-spacing: 0;
	line-height: 1.02;
}

.news-card-description {
	margin: 0;
	max-width: 36rem;
	color: rgba(255, 255, 255, 0.76);
	font-size: 1rem;
	line-height: 1.7;
}

.news-card-source {
	margin-top: auto;
	color: rgba(255, 255, 255, 0.78);
}

.news-card-source-mark {
	display: inline-flex;
	height: 1.6rem;
	width: 1.6rem;
	align-items: center;
	justify-content: center;
	border: 1px solid color-mix(in srgb, var(--news-card-accent) 56%, white 12%);
	border-radius: 999px;
	color: white;
	font-size: 0.8rem;
	transition:
		background 220ms ease,
		transform 220ms ease;
}

.news-card:hover .news-card-source-mark {
	background: color-mix(in srgb, var(--news-card-accent) 28%, transparent);
	transform: translateX(0.18rem);
}

.news-card-featured {
	min-height: 35rem;
}

.news-card-featured .news-card-body {
	min-height: 18rem;
	padding: 1.55rem;
}

.news-card-featured .news-card-title {
	font-size: clamp(2.2rem, 5vw, 4.15rem);
}

@media (min-width: 900px) {
	.news-card-featured {
		grid-column: span 2;
	}

	.news-card-featured .news-card-link {
		grid-template-columns: minmax(0, 1.08fr) minmax(21rem, 0.92fr);
	}

	.news-card-featured .news-card-image-wrap {
		height: 100%;
		aspect-ratio: auto;
		border-right: 1px solid rgba(255, 255, 255, 0.12);
		border-bottom: 0;
	}

	.news-card-featured .news-card-body {
		min-height: 35rem;
		justify-content: flex-end;
	}
}

@media (max-width: 640px) {
	.news-card {
		min-height: auto;
		border-radius: 1.1rem;
	}

	.news-card-body {
		min-height: auto;
		padding: 1.1rem;
	}

	.news-card-title {
		font-size: 1.7rem;
	}

	.news-card-description {
		font-size: 0.95rem;
		line-height: 1.62;
	}
}
</style>
