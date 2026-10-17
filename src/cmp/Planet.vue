<script setup>
import { computed } from 'vue';

/**
 * A CSS-rendered planet with terminator shading, optional atmospheric bands,
 * a tilted ring system and an orbiting moon.
 */
const props = defineProps({
	/** Base surface colour (any CSS colour). */
	color: {
		type: String,
		default: 'oklch(0.62 0.14 250)',
	},
	/** Highlight colour for the lit limb. */
	glow: {
		type: String,
		default: 'oklch(0.85 0.1 220)',
	},
	/** Draw horizontal cloud bands, gas-giant style. */
	banded: {
		type: Boolean,
		default: false,
	},
	/** Draw a tilted ring system. */
	rings: {
		type: Boolean,
		default: false,
	},
	/** Show a small moon on an elliptical orbit. */
	moon: {
		type: Boolean,
		default: false,
	},
	/** Seconds for one full moon orbit. */
	orbit: {
		type: Number,
		default: 14,
	},
});

const style = computed(() => ({
	'--planet-color': props.color,
	'--planet-glow': props.glow,
	'--planet-orbit': `${props.orbit}s`,
}));
</script>

<template>
	<div class="planet relative aspect-square" :style="style" aria-hidden="true">
		<div v-if="rings" class="planet-rings planet-rings-back"></div>
		<div class="planet-body absolute inset-0 overflow-hidden rounded-full">
			<div v-if="banded" class="planet-bands absolute inset-0"></div>
			<div class="planet-shade absolute inset-0 rounded-full"></div>
		</div>
		<div v-if="rings" class="planet-rings planet-rings-front"></div>
		<div v-if="moon" class="planet-moon-track absolute inset-[-35%]">
			<span class="planet-moon"></span>
		</div>
	</div>
</template>

<style scoped>
.planet-body {
	background: radial-gradient(circle at 32% 30%, var(--planet-glow), var(--planet-color) 45%, color-mix(in oklch, var(--planet-color) 30%, black) 100%);
	box-shadow:
		0 0 60px -10px color-mix(in oklch, var(--planet-glow) 55%, transparent),
		inset -12px -10px 30px rgb(0 0 0 / 45%);
}

.planet-bands {
	background: repeating-linear-gradient(
		172deg,
		transparent 0 7%,
		color-mix(in oklch, var(--planet-glow) 22%, transparent) 7% 10%,
		transparent 10% 15%,
		rgb(0 0 0 / 14%) 15% 19%
	);
	animation: planet-spin 60s linear infinite;
	background-size: 200% 100%;
}

.planet-shade {
	background: radial-gradient(circle at 70% 72%, rgb(0 0 0 / 70%), transparent 62%);
}

.planet-rings {
	position: absolute;
	inset: 34% -42%;
	border-radius: 50%;
	transform: rotate(-16deg);
	border: 0.35rem solid color-mix(in oklch, var(--planet-glow) 55%, transparent);
	box-shadow:
		0 0 0 0.3rem color-mix(in oklch, var(--planet-color) 30%, transparent),
		0 0 0 0.7rem color-mix(in oklch, var(--planet-glow) 12%, transparent);
}

/* The front half of the ring overlaps the body; the back half sits behind it. */
.planet-rings-back {
	clip-path: inset(0 0 50% 0);
}

.planet-rings-front {
	clip-path: inset(50% 0 0 0);
}

.planet-moon-track {
	animation: planet-orbit var(--planet-orbit) linear infinite;
	transform: rotate(-20deg) scaleY(0.35);
	border-radius: 50%;
}

.planet-moon {
	position: absolute;
	top: 50%;
	left: -3%;
	width: 9%;
	aspect-ratio: 1;
	border-radius: 50%;
	background: radial-gradient(circle at 35% 35%, #f4f1ea, #8a8580 70%);
	box-shadow: 0 0 12px rgb(255 255 255 / 35%);
	/* Counter the track's rotation and squash so the moon stays round. */
	animation: planet-moon-upright var(--planet-orbit) linear infinite;
	transform: scaleY(2.857);
}

@keyframes planet-moon-upright {
	from {
		transform: rotate(0deg) scaleY(2.857);
	}
	to {
		transform: rotate(-360deg) scaleY(2.857);
	}
}

@keyframes planet-orbit {
	from {
		transform: rotate(-20deg) scaleY(0.35) rotate(0deg);
	}
	to {
		transform: rotate(-20deg) scaleY(0.35) rotate(360deg);
	}
}

@keyframes planet-spin {
	to {
		background-position: -200% 0;
	}
}

@media (prefers-reduced-motion: reduce) {
	.planet-bands,
	.planet-moon-track,
	.planet-moon {
		animation: none;
	}
}
</style>
