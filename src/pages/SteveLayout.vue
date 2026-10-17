<script setup>
import SocialLinks from '../cmp/SocialLinks.vue';
import { defineAsyncComponent, onBeforeUnmount, onMounted } from 'vue';
import { useTheme } from '../composable/useTheme';
import Navbar from '../cmp/Navbar.vue';
const SpaceBackdrop = defineAsyncComponent(loadSpaceBackdrop);
const MatrixBackdrop = defineAsyncComponent(loadMatrixBackdrop);

const { initTheme, siteMode, ready } = useTheme();

/** @returns {Promise<object>} Loads the star renderer only when Space mode is active. */
function loadSpaceBackdrop() {
	return import('../cmp/SpaceBackdrop.vue');
}

/** @returns {Promise<object>} Loads binary rain only while AI Overlord mode is active. */
function loadMatrixBackdrop() {
	return import('../cmp/MatrixBackdrop.vue');
}

/**
 * Moves the liquid-glass highlight towards the pointer on whichever glass
 * surface it is over, so the sheen behaves like light on a real lens.
 *
 * @param {PointerEvent} event Pointer movement.
 * @returns {void}
 */
function trackGlassLight(event) {
	if (siteMode.value !== 'space') return;
	const glass = event.target instanceof Element ? event.target.closest('.liquid-glass') : null;
	if (!glass) return;
	const bounds = glass.getBoundingClientRect();
	glass.style.setProperty('--glass-x', `${event.clientX - bounds.left}px`);
	glass.style.setProperty('--glass-y', `${event.clientY - bounds.top}px`);
}

/** @returns {void} Initializes appearance and the shared glass pointer effect. */
function mountLayout() {
	initTheme();
	window.addEventListener('pointermove', trackGlassLight, { passive: true });
}

/** @returns {void} Releases the shared pointer effect when this page leaves. */
function unmountLayout() {
	window.removeEventListener('pointermove', trackGlassLight);
}

onMounted(mountLayout);
onBeforeUnmount(unmountLayout);

defineProps({
	bgClass: {
		type: String,
		default: 'bg-background',
	},
});

</script>

<template>
	<div class="site-shell relative isolate min-h-screen text-foreground transition-colors duration-200" :class="bgClass">
		<SpaceBackdrop v-if="ready && siteMode === 'space'" />
		<MatrixBackdrop v-if="ready && siteMode === 'ai-overlord'" />
		<Navbar></Navbar>
		<main class="mx-auto w-full max-w-6xl px-6 pt-4 pb-20">
			<slot />
		</main>
		<footer class="mx-auto w-full max-w-6xl border-t border-border px-6 py-10">
			<div class="flex flex-wrap items-center justify-between gap-5">
				<p class="text-sm text-muted-foreground">
					&copy; {{ new Date().getFullYear() }} Steve O’Brien · Building useful intelligence from Bristol.
				</p>
				<SocialLinks />
			</div>
		</footer>
	</div>
</template>
