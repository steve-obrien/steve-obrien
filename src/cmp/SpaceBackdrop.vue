<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';

const canvas = ref(null);

let animationFrame;
let motionQuery;
let resizeObserver;
let stars = [];
let comets = [];
let nextCometAt = 0;
let width = 0;
let height = 0;

/**
 * Star layers, from distant to near. Nearer layers are larger, brighter and
 * drift further with scroll to give a gentle parallax depth.
 */
const layers = [
	{ density: 0.00028, size: [0.3, 0.8], alpha: [0.25, 0.55], parallax: 0.02 },
	{ density: 0.00012, size: [0.6, 1.2], alpha: [0.4, 0.8], parallax: 0.06 },
	{ density: 0.00003, size: [1, 1.8], alpha: [0.6, 1], parallax: 0.12 },
];

/** Warm, white and cool star tints, roughly following stellar classes. */
const tints = ['255,255,255', '255,255,255', '200,215,255', '170,190,255', '255,226,190', '255,200,170'];

/**
 * Returns a random number between two bounds.
 *
 * @param {number} min Lower bound.
 * @param {number} max Upper bound.
 * @returns {number} Random value in range.
 */
function random(min, max) {
	return min + Math.random() * (max - min);
}

/**
 * Seeds the star layers for the current viewport size.
 *
 * @returns {void}
 */
function seedStars() {
	stars = [];
	const area = width * height;

	for (const layer of layers) {
		const count = Math.round(area * layer.density);
		for (let i = 0; i < count; i++) {
			stars.push({
				x: Math.random() * width,
				y: Math.random() * height,
				size: random(...layer.size),
				alpha: random(...layer.alpha),
				parallax: layer.parallax,
				tint: tints[Math.floor(Math.random() * tints.length)],
				twinkleSpeed: random(0.0005, 0.0025),
				twinkleDepth: Math.random() < 0.3 ? random(0.3, 0.7) : random(0, 0.15),
				phase: Math.random() * Math.PI * 2,
			});
		}
	}
}

/**
 * Launches a shooting star from a random point near the top of the viewport.
 *
 * @param {number} now Current animation timestamp.
 * @returns {void}
 */
function launchComet(now) {
	const angle = random(Math.PI * 0.12, Math.PI * 0.28);
	const speed = random(0.6, 1.1);
	comets.push({
		x: random(width * 0.1, width * 0.9),
		y: random(-20, height * 0.35),
		vx: Math.cos(angle) * speed * (Math.random() < 0.5 ? -1 : 1),
		vy: Math.sin(angle) * speed,
		born: now,
		life: random(900, 1500),
		length: random(80, 180),
	});
}

/**
 * Resizes the canvas backing store to match its CSS size and pixel ratio.
 *
 * @returns {void}
 */
function resize() {
	const element = canvas.value;
	if (!element) return;
	cancelAnimationFrame(animationFrame);

	const scale = Math.min(window.devicePixelRatio || 1, 2);
	width = element.clientWidth;
	height = element.clientHeight;
	element.width = Math.round(width * scale);
	element.height = Math.round(height * scale);
	element.getContext('2d').setTransform(scale, 0, 0, scale, 0, 0);
	seedStars();
	draw(performance.now());
}

/**
 * Renders a single frame of stars and shooting stars.
 *
 * @param {number} now Animation timestamp.
 * @returns {void}
 */
function draw(now = 0) {
	const element = canvas.value;
	if (!element) return;

	const context = element.getContext('2d');
	const moving = !motionQuery?.matches;
	const scroll = window.scrollY || 0;

	context.clearRect(0, 0, width, height);

	for (const star of stars) {
		const twinkle = moving ? 1 - star.twinkleDepth * (0.5 + 0.5 * Math.sin(now * star.twinkleSpeed + star.phase)) : 1;
		const y = ((star.y - scroll * star.parallax) % height + height) % height;

		context.fillStyle = `rgba(${star.tint},${star.alpha * twinkle})`;
		context.beginPath();
		context.arc(star.x, y, star.size, 0, Math.PI * 2);
		context.fill();

		if (star.size > 1.4) {
			const glow = context.createRadialGradient(star.x, y, 0, star.x, y, star.size * 5);
			glow.addColorStop(0, `rgba(${star.tint},${0.25 * twinkle})`);
			glow.addColorStop(1, 'rgba(0,0,0,0)');
			context.fillStyle = glow;
			context.beginPath();
			context.arc(star.x, y, star.size * 5, 0, Math.PI * 2);
			context.fill();
		}
	}

	if (moving) {
		if (now > nextCometAt) {
			if (nextCometAt) launchComet(now);
			nextCometAt = now + random(6000, 14000);
		}

		comets = comets.filter((comet) => now - comet.born < comet.life);
		for (const comet of comets) {
			const age = now - comet.born;
			const progress = age / comet.life;
			const fade = Math.sin(progress * Math.PI);
			const headX = comet.x + comet.vx * age;
			const headY = comet.y + comet.vy * age;
			const norm = Math.hypot(comet.vx, comet.vy);
			const tailX = headX - (comet.vx / norm) * comet.length;
			const tailY = headY - (comet.vy / norm) * comet.length;
			const trail = context.createLinearGradient(headX, headY, tailX, tailY);

			trail.addColorStop(0, `rgba(255,255,255,${0.9 * fade})`);
			trail.addColorStop(0.2, `rgba(180,200,255,${0.35 * fade})`);
			trail.addColorStop(1, 'rgba(120,140,255,0)');
			context.strokeStyle = trail;
			context.lineWidth = 1.4;
			context.lineCap = 'round';
			context.beginPath();
			context.moveTo(headX, headY);
			context.lineTo(tailX, tailY);
			context.stroke();
		}

		animationFrame = requestAnimationFrame(draw);
	}
}

/**
 * Restarts the render loop after motion preferences change.
 *
 * @returns {void}
 */
function restart() {
	cancelAnimationFrame(animationFrame);
	comets = [];
	draw(performance.now());
}

/**
 * Redraws once on scroll when motion is reduced so parallax still settles.
 *
 * @returns {void}
 */
function redrawStatic() {
	if (motionQuery?.matches) draw(performance.now());
}

/** @returns {void} Starts a single renderer and installs viewport and motion observers. */
function mountBackdrop() {
	motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
	motionQuery.addEventListener('change', restart);
	window.addEventListener('scroll', redrawStatic, { passive: true });

	resizeObserver = new ResizeObserver(resize);
	resizeObserver.observe(canvas.value);
	resize();
}

/** @returns {void} Stops rendering and releases this backdrop's observers. */
function unmountBackdrop() {
	cancelAnimationFrame(animationFrame);
	motionQuery?.removeEventListener('change', restart);
	window.removeEventListener('scroll', redrawStatic);
	resizeObserver?.disconnect();
}

onMounted(mountBackdrop);
onBeforeUnmount(unmountBackdrop);
</script>

<template>
	<div class="space-backdrop pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
		<div class="nebula nebula-violet"></div>
		<div class="nebula nebula-teal"></div>
		<div class="nebula nebula-ember"></div>
		<canvas ref="canvas" class="absolute inset-0 size-full"></canvas>
	</div>
</template>

<style scoped>
.space-backdrop {
	background:
		radial-gradient(ellipse at 50% -20%, oklch(0.22 0.06 275) 0%, transparent 60%),
		var(--background);
}

.nebula {
	position: absolute;
	border-radius: 999px;
	filter: blur(80px);
	opacity: 0.5;
	animation: nebula-drift 40s ease-in-out infinite alternate;
}

.nebula-violet {
	top: -10%;
	right: -10%;
	width: 55vw;
	height: 45vw;
	background: radial-gradient(circle, oklch(0.45 0.2 295 / 45%), transparent 70%);
}

.nebula-teal {
	bottom: 5%;
	left: -15%;
	width: 50vw;
	height: 40vw;
	background: radial-gradient(circle, oklch(0.5 0.12 200 / 30%), transparent 70%);
	animation-duration: 55s;
}

.nebula-ember {
	top: 45%;
	right: 10%;
	width: 30vw;
	height: 25vw;
	background: radial-gradient(circle, oklch(0.55 0.16 35 / 18%), transparent 70%);
	animation-duration: 70s;
}

@keyframes nebula-drift {
	to {
		transform: translate3d(-4vw, 3vw, 0) scale(1.1);
	}
}

@media (prefers-reduced-motion: reduce) {
	.nebula {
		animation: none;
	}
}
</style>
