<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';

const canvas = ref(null);

let animationFrame;
let motionQuery;
let resizeObserver;
let themeObserver;
let startedAt = 0;

const pointer = {
	currentX: 0,
	currentY: 0,
	targetX: 0,
	targetY: 0,
};

const orbs = [
	{ x: 0.72, y: 0.43, radius: 0.34, driftX: 0.11, driftY: 0.07, pointer: 0.045, speed: 0.00022, pulseSpeed: 0.00035, phase: 0, tone: 'blue' },
	{ x: 0.32, y: 0.73, radius: 0.24, driftX: 0.13, driftY: 0.08, pointer: 0.065, speed: 0.00016, pulseSpeed: 0.00027, phase: 2.1, tone: 'violet' },
	{ x: 0.88, y: 0.7, radius: 0.18, driftX: 0.09, driftY: 0.1, pointer: 0.08, speed: 0.00027, pulseSpeed: 0.00042, phase: 4.2, tone: 'blue' },
];

const palettes = {
	light: {
		blue: ['rgba(255,255,255,0.76)', 'rgba(105,125,238,0.20)', 'rgba(91,139,230,0.10)'],
		violet: ['rgba(255,255,255,0.52)', 'rgba(146,118,238,0.14)', 'rgba(89,138,234,0.09)'],
	},
	dark: {
		blue: ['rgba(255,255,255,0.10)', 'rgba(105,125,255,0.25)', 'rgba(72,125,232,0.13)'],
		violet: ['rgba(255,255,255,0.07)', 'rgba(151,117,255,0.18)', 'rgba(82,125,245,0.11)'],
	},
};

function drawOrb(context, x, y, radius, colours, pulse) {
	const gradient = context.createRadialGradient(
		x - radius * 0.28,
		y - radius * 0.3,
		radius * 0.03,
		x,
		y,
		radius,
	);

	gradient.addColorStop(0, colours[0]);
	gradient.addColorStop(0.38, colours[1]);
	gradient.addColorStop(0.72, colours[2]);
	gradient.addColorStop(1, 'rgba(0,0,0,0)');

	context.save();
	context.globalAlpha = 0.82 + pulse * 0.18;
	context.fillStyle = gradient;
	context.beginPath();
	context.arc(x, y, radius, 0, Math.PI * 2);
	context.fill();
	context.restore();
}

function draw(timestamp = 0) {
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

	context.setTransform(scale, 0, 0, scale, 0, 0);
	context.clearRect(0, 0, width, height);

	const theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
	const elapsed = timestamp - startedAt;
	const size = Math.min(width, height);
	const moving = !motionQuery?.matches;

	if (moving) {
		pointer.currentX += (pointer.targetX - pointer.currentX) * 0.025;
		pointer.currentY += (pointer.targetY - pointer.currentY) * 0.025;
	}

	for (const orb of orbs) {
		const wave = moving ? elapsed * orb.speed + orb.phase : orb.phase;
		const pulseWave = moving ? (Math.sin(elapsed * orb.pulseSpeed + orb.phase) + 1) / 2 : 0;
		const pulse = pulseWave ** 8;
		const radius = size * orb.radius * (1 + pulse * 0.12);
		const desiredX = width * (orb.x + Math.sin(wave) * orb.driftX + pointer.currentX * orb.pointer);
		const desiredY = height * (orb.y + Math.cos(wave * 0.8) * orb.driftY + pointer.currentY * orb.pointer);
		const edge = radius * 0.92;
		const x = Math.max(edge, Math.min(width - edge, desiredX));
		const y = Math.max(edge, Math.min(height - edge, desiredY));

		drawOrb(context, x, y, radius, palettes[theme][orb.tone], pulse);
	}

	if (moving) animationFrame = requestAnimationFrame(draw);
}

function updatePointer(event) {
	const element = canvas.value;
	if (!element || motionQuery?.matches) return;

	const bounds = element.getBoundingClientRect();
	pointer.targetX = Math.max(-0.5, Math.min(0.5, (event.clientX - bounds.left) / bounds.width - 0.5));
	pointer.targetY = Math.max(-0.5, Math.min(0.5, (event.clientY - bounds.top) / bounds.height - 0.5));
}

function resetPointer() {
	pointer.targetX = 0;
	pointer.targetY = 0;
}

function restart() {
	cancelAnimationFrame(animationFrame);
	startedAt = performance.now();
	draw(startedAt);
}

onMounted(() => {
	motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
	motionQuery.addEventListener('change', restart);
	window.addEventListener('pointermove', updatePointer, { passive: true });
	document.documentElement.addEventListener('pointerleave', resetPointer);

	resizeObserver = new ResizeObserver(restart);
	resizeObserver.observe(canvas.value);

	themeObserver = new MutationObserver(restart);
	themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

	restart();
});

onBeforeUnmount(() => {
	cancelAnimationFrame(animationFrame);
	motionQuery?.removeEventListener('change', restart);
	window.removeEventListener('pointermove', updatePointer);
	document.documentElement.removeEventListener('pointerleave', resetPointer);
	resizeObserver?.disconnect();
	themeObserver?.disconnect();
});
</script>

<template>
	<canvas ref="canvas" class="pointer-events-none absolute top-0 left-1/2 h-full w-screen -translate-x-1/2" aria-hidden="true"></canvas>
</template>
