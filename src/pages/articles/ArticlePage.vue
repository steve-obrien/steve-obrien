<script setup>
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import MarkdownArticle from './MarkdownArticle.vue';
import { getArticle } from './articles';

const props = defineProps({
	slug: {
		type: String,
		default: '',
	},
});

const route = useRoute();
const article = computed(() => getArticle(props.slug || route.params.slug));

const formatter = new Intl.DateTimeFormat('en-GB', {
	day: 'numeric',
	month: 'long',
	year: 'numeric',
});

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
				<RouterLink to="/articles" class="text-sm text-muted-foreground hover:text-foreground">
					Articles
				</RouterLink>
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
