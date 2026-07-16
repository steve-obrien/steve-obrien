<script setup>
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import MarkdownArticle from './MarkdownArticle.vue';
import { getArticle, getChildArticles } from './articles';

const props = defineProps({
	slug: {
		type: String,
		default: '',
	},
});

const route = useRoute();
const article = computed(() => getArticle(props.slug || route.params.slug));

/** Resolve the overview article for a nested series page. */
const parentArticle = computed(() => {
	if (!article.value?.parent) return null;
	return getArticle(article.value.parent);
});

/** Return ordered pages in the current nested article series. */
const siblingArticles = computed(() => {
	if (!article.value?.parent) return [];
	return getChildArticles(article.value.parent);
});

/** Locate the current page within its ordered series. */
const siblingIndex = computed(() => siblingArticles.value.findIndex(
	(candidate) => candidate.slug === article.value?.slug,
));

/** Return the preceding page when the reader can move backwards. */
const previousArticle = computed(() => {
	if (siblingIndex.value <= 0) return null;
	return siblingArticles.value[siblingIndex.value - 1];
});

/** Return the following page when the reader can continue the series. */
const nextArticle = computed(() => {
	if (siblingIndex.value < 0) return null;
	return siblingArticles.value[siblingIndex.value + 1] || null;
});

const formatter = new Intl.DateTimeFormat('en-GB', {
	day: 'numeric',
	month: 'long',
	year: 'numeric',
});

/** Format the current article's publication date for display. */
const publishedDate = computed(() => {
	if (!article.value?.date) return '';
	const [year, month, day] = article.value.date.split('-').map(Number);
	return formatter.format(new Date(year, month - 1, day));
});
</script>

<template>
	<SteveLayout bg-class="bg-background">
		<article v-if="article" class="mx-auto w-full max-w-6xl">
			<header class="article-header mx-auto max-w-[45rem] space-y-6 pb-12">
				<nav class="flex flex-wrap items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
					<RouterLink to="/articles" class="hover:text-foreground">Articles</RouterLink>
					<template v-if="parentArticle">
						<span aria-hidden="true">/</span>
						<RouterLink :to="`/articles/${parentArticle.slug}`" class="hover:text-foreground">
							{{ parentArticle.title }}
						</RouterLink>
					</template>
				</nav>
				<div class="space-y-5">
					<div class="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
						<time v-if="publishedDate" :datetime="article.date">{{ publishedDate }}</time>
						<span v-if="publishedDate && article.readingTime">/</span>
						<span v-if="article.readingTime">{{ article.readingTime }}</span>
					</div>
					<h1 class="font-serif text-5xl font-normal leading-[1.02] tracking-normal text-foreground sm:text-7xl">
						{{ article.title }}
					</h1>
					<p class="text-xl leading-9 text-muted-foreground">
						{{ article.description }}
					</p>
				</div>
			</header>

			<img
				v-if="article.imageUrl"
				:src="article.imageUrl"
				:alt="article.title"
				class="mx-auto mb-12 aspect-[16/9] w-full max-w-5xl rounded-lg border border-border bg-muted object-cover"
				decoding="async"
			>

			<MarkdownArticle :content="article.body" />

			<nav
				v-if="parentArticle"
				class="mx-auto mt-16 grid max-w-[45rem] gap-4 border-t border-border pt-8 sm:grid-cols-2"
				aria-label="Article series navigation"
			>
				<RouterLink
					v-if="previousArticle"
					:to="`/articles/${previousArticle.slug}`"
					class="rounded-lg border border-border p-4 hover:bg-secondary"
				>
					<span class="block text-xs uppercase tracking-[0.14em] text-muted-foreground">Previous</span>
					<span class="mt-2 block text-base text-foreground">{{ previousArticle.title }}</span>
				</RouterLink>
				<div v-else />
				<RouterLink
					v-if="nextArticle"
					:to="`/articles/${nextArticle.slug}`"
					class="rounded-lg border border-border p-4 text-left hover:bg-secondary sm:text-right"
				>
					<span class="block text-xs uppercase tracking-[0.14em] text-muted-foreground">Next</span>
					<span class="mt-2 block text-base text-foreground">{{ nextArticle.title }}</span>
				</RouterLink>
			</nav>
		</article>

		<section v-else class="mx-auto max-w-2xl space-y-4">
			<p class="text-sm text-muted-foreground">Article not found</p>
			<h1 class="font-serif text-5xl font-normal tracking-normal">This article is not available.</h1>
			<RouterLink to="/articles" class="text-sm underline underline-offset-4">
				Return to articles
			</RouterLink>
		</section>
	</SteveLayout>
</template>
