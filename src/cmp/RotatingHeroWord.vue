<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps({
	words: {
		type: Array,
		required: true,
	},
});

const displayedWord = ref('');

let motionQuery;
let timeout;
let wordIndex = 0;

function schedule(callback, delay) {
	clearTimeout(timeout);
	timeout = window.setTimeout(callback, delay);
}

function typeWord() {
	const word = props.words[wordIndex] ? `${props.words[wordIndex]}.` : '';

	if (displayedWord.value.length < word.length) {
		displayedWord.value = word.slice(0, displayedWord.value.length + 1);
		schedule(typeWord, 90);
		return;
	}

	schedule(deleteWord, 2400);
}

function deleteWord() {
	if (displayedWord.value.length) {
		displayedWord.value = displayedWord.value.slice(0, -1);
		schedule(deleteWord, 55);
		return;
	}

	wordIndex = (wordIndex + 1) % props.words.length;
	schedule(typeWord, 320);
}

function restart() {
	clearTimeout(timeout);
	wordIndex = 0;
	displayedWord.value = props.words[0] ? `${props.words[0]}.` : '';

	if (!motionQuery?.matches && props.words.length > 1) {
		schedule(deleteWord, 2400);
	}
}

onMounted(() => {
	motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
	motionQuery.addEventListener('change', restart);
	restart();
});

watch(() => props.words, restart, { deep: true });

onBeforeUnmount(() => {
	clearTimeout(timeout);
	motionQuery?.removeEventListener('change', restart);
});
</script>

<template>
	<span>
		{{ displayedWord }}<span class="rotating-word-cursor" aria-hidden="true"></span>
	</span>
</template>

<style scoped>
.rotating-word-cursor {
	display: inline-block;
	width: 0.045em;
	height: 0.78em;
	margin-left: 0.06em;
	border-radius: 999px;
	background: color-mix(in oklch, var(--foreground) 42%, #6577ff);
	vertical-align: -0.06em;
	animation: cursor-blink 900ms steps(1, end) infinite;
}

@keyframes cursor-blink {
	50% {
		opacity: 0;
	}
}

@media (prefers-reduced-motion: reduce) {
	.rotating-word-cursor {
		animation: none;
	}
}
</style>
