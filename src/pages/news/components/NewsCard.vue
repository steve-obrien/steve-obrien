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
		class="news-card relative isolate min-h-[31rem] overflow-hidden rounded-3xl border border-white/15 text-white shadow-[0_1.25rem_3.5rem_rgba(0,0,0,0.32)] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_1.75rem_4.5rem_rgba(0,0,0,0.4)] max-sm:min-h-0 max-sm:rounded-[1.1rem]"
		:class="{ 'news-card-featured min-h-[35rem] md:col-span-2': featured }"
		:style="cardStyle"
	>
		<RouterLink
			class="news-card-link grid min-h-[inherit] text-inherit no-underline"
			:to="to"
			:aria-label="`Read generated summary for ${item.title}`"
		>
			<div class="news-card-image-wrap relative aspect-[16/10] overflow-hidden border-b border-white/10">
				<img
					class="block size-full scale-[1.01] object-cover transition-transform duration-300"
					:src="item.image"
					:alt="item.imageAlt"
					loading="lazy"
				/>
			</div>

			<div class="news-card-body flex min-h-[17rem] flex-col gap-4 p-[1.35rem] max-sm:min-h-0 max-sm:p-[1.1rem]">
				<div class="flex items-center gap-2 text-xs font-bold uppercase leading-tight tracking-[0.08em] text-white/70">
					<span class="news-card-category">{{ item.category }}</span>
					<span aria-hidden="true">/</span>
					<time :datetime="item.publishedAt">{{ publishedLabel }}</time>
				</div>

				<h2 class="news-card-title m-0 font-serif text-[clamp(1.8rem,3vw,2.65rem)] font-normal leading-[1.02] tracking-normal text-white max-sm:text-[1.7rem]">
					{{ item.title }}
				</h2>
				<p class="m-0 max-w-xl text-base leading-7 text-white/75 max-sm:text-[0.95rem] max-sm:leading-relaxed">
					{{ item.description }}
				</p>

				<div class="mt-auto flex items-center gap-2 text-xs font-bold uppercase leading-tight tracking-[0.08em] text-white/80">
					<span>Read summary</span>
					<span class="news-card-source-mark inline-flex size-6 items-center justify-center rounded-full text-xs text-white transition-[background,transform] duration-200" aria-hidden="true">-></span>
				</div>
			</div>
		</RouterLink>
	</article>
</template>

<style scoped>
.news-card {
	background:
		linear-gradient(180deg, rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0)),
		var(--news-card-gradient);
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
	border-color: color-mix(in srgb, var(--news-card-accent) 44%, white 10%);
}

.news-card-image-wrap::after {
	position: absolute;
	inset: 0;
	background:
		linear-gradient(180deg, transparent 50%, rgba(0, 0, 0, 0.46) 100%),
		radial-gradient(circle at 50% 16%, transparent 0%, rgba(0, 0, 0, 0.18) 68%);
	content: "";
}

.news-card:hover img {
	transform: scale(1.05);
}

.news-card-category {
	color: color-mix(in srgb, var(--news-card-accent) 72%, white 28%);
}

.news-card-source-mark {
	border: 1px solid color-mix(in srgb, var(--news-card-accent) 56%, white 12%);
}

.news-card:hover .news-card-source-mark {
	background: color-mix(in srgb, var(--news-card-accent) 28%, transparent);
	transform: translateX(0.18rem);
}

.news-card-featured .news-card-body {
	min-height: 18rem;
	padding: 1.55rem;
}

.news-card-featured .news-card-title {
	font-size: clamp(2.2rem, 5vw, 4.15rem);
}

@media (min-width: 900px) {
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
</style>
