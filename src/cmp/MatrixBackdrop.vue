<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';

const paused = ref(false);
const hidden = ref(false);
const reducedMotion = ref(false);
const streams = ref(Array.from({ length: 44 }, createStream));
const DIGIT_UPDATE_MS = 80;
let motionQuery;
let digitTimer;

/**
 * Creates a stable binary trail and staggered motion without hydration randomness.
 * @param {undefined} unused Array.from placeholder.
 * @param {number} index Column index.
 * @returns {{ id: number, digits: string, style: object }} Decorative stream content and CSS variables.
 */
function createStream(unused, index) {
	let seed = (index + 1) * 7919;
	const digits = [];
	for (let row = 0; row < 22 + (index % 13); row++) {
		seed = (seed * 16807) % 2147483647;
		digits.push(seed % 2 ? '1' : '0');
	}
	return {
		id: index,
		digits: digits.join('\n'),
		style: {
			left: `${(index + 0.5) * 100 / 44}%`,
			'--fall-duration': `${18 + (index * 7 % 19)}s`,
			'--fall-delay': `${-(index * 13 % 37)}s`,
			'--trail-opacity': 0.25 + (index % 4) * 0.1,
			'--resting-y': `${(index * 17 % 100) - 35}vh`,
		},
	};
}

/** @returns {void} Toggles decorative motion without affecting the page content. */
function togglePause() {
	paused.value = !paused.value;
	syncDigitAnimation();
}

/** @returns {void} Suspends background animation while the browser tab is hidden. */
function syncVisibility() {
	hidden.value = document.hidden;
	syncDigitAnimation();
}

/** @returns {void} Reflects the OS motion preference in the optional pause control. */
function syncMotionPreference() {
	reducedMotion.value = motionQuery.matches;
	syncDigitAnimation();
}

/** @returns {'0' | '1'} A fresh binary glyph without changing the trail's brightness. */
function randomDigit() {
	return Math.random() < 0.5 ? '0' : '1';
}

/** @returns {void} Scrambles each trail in place while CSS continues its falling motion. */
function refreshDigits() {
	for (const stream of streams.value) {
		stream.digits = stream.digits.replace(/[01]/g, randomDigit);
	}
}

/** @returns {void} Runs one shared timer only while decorative motion is allowed. */
function syncDigitAnimation() {
	window.clearInterval(digitTimer);
	digitTimer = undefined;
	if (!paused.value && !hidden.value && !reducedMotion.value) {
		digitTimer = window.setInterval(refreshDigits, DIGIT_UPDATE_MS);
	}
}

/** @returns {void} Installs visibility and motion observers for this mounted backdrop. */
function mountBackdrop() {
	motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
	motionQuery.addEventListener('change', syncMotionPreference);
	document.addEventListener('visibilitychange', syncVisibility);
	syncMotionPreference();
	syncVisibility();
}

/** @returns {void} Releases all observers when leaving AI Overlord mode or the page. */
function unmountBackdrop() {
	window.clearInterval(digitTimer);
	motionQuery?.removeEventListener('change', syncMotionPreference);
	document.removeEventListener('visibilitychange', syncVisibility);
}

onMounted(mountBackdrop);
onBeforeUnmount(unmountBackdrop);
</script>

<template>
	<div class="matrix-backdrop pointer-events-none fixed inset-0 -z-10 overflow-hidden" :data-paused="paused || hidden" aria-hidden="true">
		<div class="matrix-rain absolute inset-0">
			<span v-for="stream in streams" :key="stream.id" class="matrix-stream absolute top-0 block whitespace-pre font-mono text-sm leading-6" :style="stream.style">{{ stream.digits }}</span>
		</div>
	</div>
	<button v-if="!reducedMotion" type="button" :aria-pressed="paused" class="matrix-motion-control fixed right-3 bottom-3 z-20 rounded-full border border-border bg-background/95 px-3 py-2 font-mono text-xs text-muted-foreground shadow-sm transition hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring" @click="togglePause">{{ paused ? 'Resume matrix' : 'Pause matrix' }}</button>
</template>

<style scoped>
.matrix-backdrop {
	background: var(--background);
}

/* Keep the trails strongest at the edges, away from the main reading column. */
.matrix-rain {
	mask-image: linear-gradient(to right, #000, rgb(0 0 0 / 22%) 32%, rgb(0 0 0 / 22%) 68%, #000);
}

.matrix-stream {
	color: transparent;
	background: linear-gradient(to bottom, transparent, #26774c 30%, #62db98 82%, #dcffe9);
	background-clip: text;
	opacity: var(--trail-opacity);
	animation: matrix-fall var(--fall-duration) var(--fall-delay) linear infinite;
}

.matrix-backdrop[data-paused="true"] .matrix-stream {
	animation-play-state: paused;
}

@keyframes matrix-fall {
	from { transform: translate3d(0, -100%, 0); }
	to { transform: translate3d(0, 100vh, 0); }
}

@media (max-width: 639px) {
	.matrix-stream:nth-child(even) { display: none; }
	.matrix-rain { opacity: 0.65; }
}

@media (prefers-reduced-motion: reduce) {
	.matrix-stream {
		animation: none;
		transform: translate3d(0, var(--resting-y), 0);
	}
}

@media print {
	.matrix-backdrop, .matrix-motion-control { display: none; }
}
</style>
