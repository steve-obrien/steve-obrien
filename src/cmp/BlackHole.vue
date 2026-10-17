<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';

const canvas = ref(null);

let animationFrame;
let motionQuery;
let resizeObserver;
let particles = [];
let startedAt = 0;
let lastFrame = 0;

const PARTICLE_COUNT = 2200;
const INNER = 1.55;
const OUTER = 4.4;

const pointer = {
	currentX: 0,
	currentY: 0,
	targetX: 0,
	targetY: 0,
};

/**
 * Maps a normalised disk temperature to an RGB triple. Inner orbits burn
 * white-gold, outer orbits cool to amber and deep red.
 *
 * @param {number} t Temperature from 0 (hottest, inner) to 1 (coolest, outer).
 * @returns {number[]} RGB channels.
 */
function diskColour(t) {
	const stops = [
		[0, [255, 248, 230]],
		[0.18, [255, 214, 140]],
		[0.45, [255, 150, 60]],
		[0.75, [214, 72, 40]],
		[1, [120, 30, 50]],
	];

	for (let i = 1; i < stops.length; i++) {
		if (t <= stops[i][0]) {
			const [t0, c0] = stops[i - 1];
			const [t1, c1] = stops[i];
			const k = (t - t0) / (t1 - t0);
			return c0.map((channel, index) => Math.round(channel + (c1[index] - channel) * k));
		}
	}

	return stops.at(-1)[1];
}

/**
 * Seeds accretion disk particles, weighted towards the inner disk.
 *
 * @returns {void}
 */
function seedParticles() {
	particles = Array.from({ length: PARTICLE_COUNT }, () => {
		const t = Math.random() ** 1.6;
		const radius = INNER + t * (OUTER - INNER);
		const [r, g, b] = diskColour(t);

		return {
			radius,
			angle: Math.random() * Math.PI * 2,
			// Keplerian falloff: inner material orbits much faster.
			speed: 0.00055 * radius ** -1.5 * (0.85 + Math.random() * 0.3),
			size: 0.4 + Math.random() * 1.1,
			alpha: 0.35 + Math.random() * 0.65,
			wobble: (Math.random() - 0.5) * 0.06,
			t,
			rgb: `${r},${g},${b}`,
		};
	});
}

/**
 * Computes the black hole's position and scale for the current canvas size.
 *
 * @param {number} width Canvas CSS width.
 * @param {number} height Canvas CSS height.
 * @returns {{ x: number, y: number, horizon: number }} Layout values.
 */
function layout(width, height) {
	if (width < 768) {
		return { x: width * 0.8, y: height * 0.06, horizon: Math.min(width, height) * 0.085 };
	}

	return { x: width * 0.74, y: height * 0.46, horizon: Math.min(width * 0.6, height) * 0.13 };
}

/**
 * Draws one particle as a short glowing streak along its orbit.
 *
 * @param {CanvasRenderingContext2D} context Canvas context.
 * @param {number} x Screen x position.
 * @param {number} y Screen y position.
 * @param {number} size Particle radius.
 * @param {string} rgb Particle colour.
 * @param {number} alpha Opacity.
 * @returns {void}
 */
function dot(context, x, y, size, rgb, alpha) {
	context.fillStyle = `rgba(${rgb},${Math.min(1, alpha)})`;
	context.beginPath();
	context.arc(x, y, size, 0, Math.PI * 2);
	context.fill();
}

/**
 * Fills a radial colour gradient for the given annulus, used for both the
 * flat disk and its lensed image.
 *
 * @param {CanvasRenderingContext2D} context Canvas context.
 * @param {number} inner Inner radius.
 * @param {number} outer Outer radius.
 * @param {number} intensity Overall opacity multiplier.
 * @returns {CanvasGradient} Disk gradient.
 */
function diskGradient(context, inner, outer, intensity) {
	const gradient = context.createRadialGradient(0, 0, inner, 0, 0, outer);
	gradient.addColorStop(0, 'rgba(255,248,230,0)');
	gradient.addColorStop(0.04, `rgba(255,240,205,${0.85 * intensity})`);
	gradient.addColorStop(0.2, `rgba(255,190,110,${0.5 * intensity})`);
	gradient.addColorStop(0.5, `rgba(230,100,50,${0.22 * intensity})`);
	gradient.addColorStop(1, 'rgba(120,30,50,0)');
	return gradient;
}

/**
 * Draws one half of the flattened accretion disk as a smooth gradient band.
 *
 * @param {CanvasRenderingContext2D} context Canvas context.
 * @param {number} inner Inner radius.
 * @param {number} outer Outer radius.
 * @param {number} squash Vertical flattening from viewing inclination.
 * @param {'back'|'front'} half Which half of the disk to draw.
 * @param {number} intensity Overall opacity multiplier.
 * @returns {void}
 */
function band(context, inner, outer, squash, half, intensity) {
	context.save();
	context.beginPath();
	context.rect(-outer, half === 'back' ? -outer : 0, outer * 2, outer);
	context.clip();
	context.scale(1, squash);
	context.fillStyle = diskGradient(context, inner, outer, intensity);
	context.beginPath();
	context.arc(0, 0, outer, 0, Math.PI * 2);
	context.arc(0, 0, inner, 0, Math.PI * 2, true);
	context.fill();
	context.restore();
}

/**
 * Draws the gravitationally lensed image of the far disk, which appears as a
 * bright arch bent over the top of the shadow and a thin ring beneath it.
 *
 * @param {CanvasRenderingContext2D} context Canvas context.
 * @param {number} horizon Event horizon radius.
 * @param {number} breathing Subtle pulse multiplier.
 * @returns {void}
 */
function lensArc(context, horizon, breathing) {
	const inner = horizon * 1.06;
	const outer = horizon * 2.1 * breathing;

	context.save();
	context.beginPath();
	context.rect(-outer, -outer, outer * 2, outer + horizon * 0.15);
	context.clip();
	context.fillStyle = diskGradient(context, inner, outer, 0.8);
	context.beginPath();
	context.arc(0, 0, outer, 0, Math.PI * 2);
	context.arc(0, 0, inner, 0, Math.PI * 2, true);
	context.fill();
	context.restore();

	context.save();
	context.beginPath();
	context.rect(-outer, 0, outer * 2, outer);
	context.clip();
	context.fillStyle = diskGradient(context, inner, horizon * 1.35, 0.45);
	context.beginPath();
	context.arc(0, 0, horizon * 1.35, 0, Math.PI * 2);
	context.arc(0, 0, inner, 0, Math.PI * 2, true);
	context.fill();
	context.restore();
}

/**
 * Renders the black hole: back disk, lensed arcs, shadow, photon ring and
 * front disk, in that order so the shadow occludes only what lies behind it.
 *
 * @param {number} now Animation timestamp.
 * @returns {void}
 */
function draw(now = 0) {
	const element = canvas.value;
	if (!element) return;

	const context = element.getContext('2d');
	const width = element.clientWidth;
	const height = element.clientHeight;
	const scale = Math.min(window.devicePixelRatio || 1, 2);

	if (element.width !== Math.round(width * scale) || element.height !== Math.round(height * scale)) {
		element.width = Math.round(width * scale);
		element.height = Math.round(height * scale);
	}

	const moving = !motionQuery?.matches;
	const delta = moving ? Math.min(now - (lastFrame || now), 50) : 0;
	lastFrame = now;

	if (moving) {
		pointer.currentX += (pointer.targetX - pointer.currentX) * 0.03;
		pointer.currentY += (pointer.targetY - pointer.currentY) * 0.03;
	}

	const { x: cx, y: cy, horizon } = layout(width, height);
	const squash = 0.16 + pointer.currentY * 0.08;
	const tilt = -0.18 + pointer.currentX * 0.1;
	const breathing = moving ? 1 + Math.sin((now - startedAt) * 0.0008) * 0.04 : 1;

	context.setTransform(scale, 0, 0, scale, 0, 0);
	context.clearRect(0, 0, width, height);

	// Ambient glow spilling out from the disk.
	const halo = context.createRadialGradient(cx, cy, horizon * 0.8, cx, cy, horizon * 6);
	halo.addColorStop(0, 'rgba(255,170,90,0.20)');
	halo.addColorStop(0.35, 'rgba(200,80,90,0.07)');
	halo.addColorStop(1, 'rgba(0,0,0,0)');
	context.fillStyle = halo;
	context.fillRect(0, 0, width, height);

	context.save();
	context.translate(cx, cy);
	context.rotate(tilt);
	context.globalCompositeOperation = 'lighter';

	// Smooth luminous body of the far disk, then its lensed image over the top.
	band(context, horizon * INNER * 0.95, horizon * OUTER, squash, 'back', 0.55);
	lensArc(context, horizon, breathing);

	const front = [];

	for (const particle of particles) {
		particle.angle += particle.speed * delta;

		const cos = Math.cos(particle.angle);
		const sin = Math.sin(particle.angle);
		const r = particle.radius * horizon;
		// Doppler beaming: material moving towards the viewer appears brighter.
		const beaming = 1 + 0.75 * cos;
		const alpha = particle.alpha * beaming * 0.55;
		const px = r * cos;
		const py = r * (sin + particle.wobble) * squash;

		if (sin > 0) {
			front.push([px, py, particle, alpha]);
			continue;
		}

		dot(context, px, py, particle.size, particle.rgb, alpha * 0.8);

		// Primary lensed image: far side of the disk bent up over the top.
		const lensRadius = horizon * (1.12 + (particle.radius - INNER) * 0.32);
		const lx = lensRadius * cos;
		const ly = lensRadius * sin * (0.92 + squash * 0.4) * breathing;
		dot(context, lx, ly, particle.size * 0.8, particle.rgb, alpha * 0.6);

		// Fainter secondary image wrapping under the bottom.
		const innerRadius = horizon * (1.05 + (particle.radius - INNER) * 0.05);
		dot(context, innerRadius * cos, -innerRadius * sin * 0.9, particle.size * 0.5, particle.rgb, alpha * 0.22);
	}

	// Event horizon shadow.
	context.globalCompositeOperation = 'source-over';
	const shadow = context.createRadialGradient(0, 0, horizon * 0.6, 0, 0, horizon * 1.08);
	shadow.addColorStop(0, 'rgba(0,0,0,1)');
	shadow.addColorStop(0.85, 'rgba(0,0,0,1)');
	shadow.addColorStop(1, 'rgba(0,0,0,0)');
	context.fillStyle = shadow;
	context.beginPath();
	context.arc(0, 0, horizon * 1.08, 0, Math.PI * 2);
	context.fill();

	// Photon ring.
	context.globalCompositeOperation = 'lighter';
	const ring = context.createRadialGradient(0, 0, horizon * 0.98, 0, 0, horizon * 1.16);
	ring.addColorStop(0, 'rgba(255,240,210,0)');
	ring.addColorStop(0.35, `rgba(255,225,170,${0.55 * breathing})`);
	ring.addColorStop(1, 'rgba(255,140,60,0)');
	context.fillStyle = ring;
	context.beginPath();
	context.arc(0, 0, horizon * 1.16, 0, Math.PI * 2);
	context.fill();

	band(context, horizon * INNER * 0.95, horizon * OUTER, squash, 'front', 0.75);

	for (const [px, py, particle, alpha] of front) {
		dot(context, px, py, particle.size, particle.rgb, alpha);
	}

	context.restore();

	if (moving) animationFrame = requestAnimationFrame(draw);
}

/**
 * Tracks the pointer so the disk tilts subtly towards it.
 *
 * @param {PointerEvent} event Pointer movement.
 * @returns {void}
 */
function updatePointer(event) {
	if (motionQuery?.matches) return;
	pointer.targetX = Math.max(-0.5, Math.min(0.5, event.clientX / window.innerWidth - 0.5));
	pointer.targetY = Math.max(-0.5, Math.min(0.5, event.clientY / window.innerHeight - 0.5));
}

/**
 * Returns the disk to its resting tilt when the pointer leaves the page.
 *
 * @returns {void}
 */
function resetPointer() {
	pointer.targetX = 0;
	pointer.targetY = 0;
}

/**
 * Restarts the render loop, e.g. after a resize or motion preference change.
 *
 * @returns {void}
 */
function restart() {
	cancelAnimationFrame(animationFrame);
	startedAt = performance.now();
	lastFrame = 0;
	draw(startedAt);
}

onMounted(() => {
	seedParticles();
	motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
	motionQuery.addEventListener('change', restart);
	window.addEventListener('pointermove', updatePointer, { passive: true });
	document.documentElement.addEventListener('pointerleave', resetPointer);

	resizeObserver = new ResizeObserver(restart);
	resizeObserver.observe(canvas.value);

	restart();
});

onBeforeUnmount(() => {
	cancelAnimationFrame(animationFrame);
	motionQuery?.removeEventListener('change', restart);
	window.removeEventListener('pointermove', updatePointer);
	document.documentElement.removeEventListener('pointerleave', resetPointer);
	resizeObserver?.disconnect();
});
</script>

<template>
	<canvas ref="canvas" class="pointer-events-none absolute top-0 left-1/2 h-full w-screen -translate-x-1/2 max-md:opacity-70" aria-hidden="true"></canvas>
</template>
