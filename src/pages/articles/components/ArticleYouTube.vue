<script setup>
import { computed } from 'vue';

const props = defineProps({
	id: {
		type: String,
		required: true,
	},
	title: {
		type: String,
		default: 'Embedded YouTube video',
	},
});

const src = computed(() => `https://www.youtube-nocookie.com/embed/${props.id}`);
</script>

<template>
	<figure class="article-youtube">
		<div class="article-youtube__frame">
			<iframe
				:src="src"
				:title="title"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
				allowfullscreen
				loading="lazy"
				referrerpolicy="strict-origin-when-cross-origin"
			/>
		</div>
		<figcaption>{{ title }}</figcaption>
	</figure>
</template>

<style scoped>
.article-youtube {
	margin: 0;
}

.article-youtube__frame {
	aspect-ratio: 16 / 9;
	background: var(--secondary);
	border: 1px solid var(--border);
	border-radius: 0.5rem;
	overflow: hidden;
}

.article-youtube iframe {
	border: 0;
	display: block;
	height: 100%;
	width: 100%;
}

.article-youtube figcaption {
	color: var(--muted-foreground);
	font-size: 0.875rem;
	line-height: 1.6;
	margin-top: 0.75rem;
}
</style>
