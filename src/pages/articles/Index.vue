<script setup>
import { RouterLink } from 'vue-router';
import { listedArticles } from './articles';

const formatter = new Intl.DateTimeFormat('en-GB', {
	day: 'numeric',
	month: 'long',
	year: 'numeric',
});

/**
 * Format an ISO calendar date without applying a timezone shift.
 *
 * @param {string} date - Date in YYYY-MM-DD form.
 * @returns {string} Human-readable British date label.
 */
function formatDate(date) {
	if (!date) return '';
	const [year, month, day] = date.split('-').map(Number);
	return formatter.format(new Date(year, month - 1, day));
}
</script>

<template>
	<SteveLayout bg-class="bg-background">
		<section class="mx-auto max-w-5xl space-y-14">
			<header class="max-w-3xl space-y-5">
				<p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Articles</p>
				<h1 class="font-serif text-5xl font-normal leading-[1.05] tracking-normal text-foreground sm:text-7xl">
					Writing on software, AI, and building useful systems.
				</h1>
				<p class="max-w-2xl text-lg leading-8 text-muted-foreground">
					Long-form notes and essays. Mostly practical, occasionally speculative, and designed to leave enough room for code and working demos.
				</p>
			</header>

			<div class="divide-y divide-border border-y border-border">
				<article
					v-for="article in listedArticles"
					:key="article.slug"
					class="grid gap-4 py-8 md:grid-cols-[10rem_1fr]"
				>
					<div class="text-sm leading-6 text-muted-foreground">
						<p>{{ formatDate(article.date) }}</p>
						<p v-if="article.readingTime">{{ article.readingTime }}</p>
					</div>
					<RouterLink :to="`/articles/${article.slug}`" class="group block space-y-3">
						<h2 class="font-serif text-3xl font-normal leading-tight tracking-normal text-foreground group-hover:underline group-hover:decoration-border group-hover:underline-offset-4">
							{{ article.title }}
						</h2>
						<p class="max-w-2xl text-base leading-7 text-muted-foreground">
							{{ article.description }}
						</p>
						<div v-if="article.tags.length" class="flex flex-wrap gap-2 pt-1">
							<span
								v-for="tag in article.tags"
								:key="tag"
								class="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
							>
								{{ tag }}
							</span>
						</div>
					</RouterLink>
				</article>
			</div>
		</section>
	</SteveLayout>
</template>
