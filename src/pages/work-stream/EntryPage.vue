<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { workEntries, formatWorkDate } from './entries.js';
import WorkDiagram from './WorkDiagram.vue';

const props = defineProps({ slug: { type: String, required: true } });

/**
 * Resolve the current route prop on initial render and subsequent navigation.
 * @returns {typeof workEntries[number] | undefined} Matching diary entry.
 */
function resolveEntry() {
	return workEntries.find((entry) => entry.slug === props.slug);
}
const entry = computed(resolveEntry);

/**
 * Estimate reading time from the complete note using 220 words per minute.
 * @returns {number} Reading minutes, rounded up with a minimum of one.
 */
function estimateReadingTime() {
	const diagram = entry.value?.diagram;
	const text = [
		...(entry.value?.paragraphs || []),
		diagram?.title, diagram?.intro, diagram?.result, diagram?.caption,
		...(diagram?.steps.flatMap(step => [step.label, step.title, step.detail]) || []),
	].filter(Boolean).join(' ');
	return Math.max(1, Math.ceil(text.split(/\s+/).length / 220));
}
const readingMinutes = computed(estimateReadingTime);
</script>

<template>
	<SteveLayout>
		<article v-if="entry" class="mx-auto max-w-3xl pb-12 pt-8 sm:pt-14">
			<RouterLink to="/work-stream" class="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">← Work stream</RouterLink>
			<header class="space-y-6 border-b border-border pb-8 pt-10">
				<p class="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">{{ entry.kind === 'weekly' ? 'Weekly review' : 'Daily note' }}<span v-if="entry.ongoing"> · In progress</span></p>
				<h1 class="font-serif text-4xl font-normal leading-[1.12] sm:text-6xl">{{ entry.title }}</h1>
				<p class="text-lg leading-8 text-muted-foreground">{{ entry.summary }}</p>
				<div class="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
					<span v-if="entry.period">{{ entry.period }}</span>
					<time v-else :datetime="entry.date">{{ formatWorkDate(entry.date) }}</time>
					<span>{{ readingMinutes }} min read</span>
					<span>Written by Steve’s AI</span>
				</div>
			</header>
			<div class="space-y-6 py-10 text-lg leading-9">
				<template v-for="(paragraph, index) in entry.paragraphs" :key="index">
					<p>{{ paragraph }}</p>
					<WorkDiagram v-if="index === 0 && entry.diagram" :diagram="entry.diagram" />
				</template>
			</div>
			<footer class="space-y-5 border-t border-border pt-7">
				<p class="text-sm text-muted-foreground">{{ entry.projects.join(' / ') }}</p>
				<RouterLink to="/work-stream" class="inline-block text-sm underline underline-offset-4">More from the work stream →</RouterLink>
			</footer>
		</article>
	</SteveLayout>
</template>
