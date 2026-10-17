<template>
	<div class="overlord-core pointer-events-none absolute top-1/2 right-0 w-[65%] -translate-y-1/2 opacity-25 sm:opacity-40" aria-hidden="true">
		<svg viewBox="0 0 600 600" fill="none" class="w-full overflow-visible" stroke="currentColor">
			<g class="core-orbit" stroke-width="0.7" opacity="0.45">
				<circle cx="300" cy="300" r="245" stroke-dasharray="2 12" />
				<rect x="115" y="115" width="370" height="370" transform="rotate(45 300 300)" />
				<path d="M300 10V590M10 300H590M95 95L505 505M95 505L505 95" />
			</g>
			<g stroke-width="1.5">
				<path d="M90 300Q300 90 510 300Q300 510 90 300Z" />
				<circle cx="300" cy="300" r="100" />
				<circle cx="300" cy="300" r="76" stroke-dasharray="3 9" />
				<circle cx="300" cy="300" r="36" class="core-pupil" />
				<circle cx="300" cy="300" r="9" fill="currentColor" />
			</g>
		</svg>
	</div>
</template>

<style scoped>
.overlord-core {
	color: var(--primary);
	mask-image: linear-gradient(to right, transparent, #000 40%);
}
.core-orbit {
	transform-origin: 300px 300px;
	animation: core-rotate 120s linear infinite;
}
.core-pupil {
	filter: drop-shadow(0 0 12px currentColor);
}
@keyframes core-rotate {
	to { transform: rotate(360deg); }
}
@media (prefers-reduced-motion: reduce) {
	.core-orbit { animation: none; }
}
</style>
