<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { isSiteMode, siteModes, useTheme } from '../composable/useTheme.js';

const { siteMode, mode, setSiteMode, setMode } = useTheme();
const route = useRoute();
const router = useRouter();
const panel = ref(null);
const currentLabel = computed(getCurrentLabel);

/** @returns {string} The human-readable name of the selected website mode. */
function getCurrentLabel() {
	for (const option of siteModes) if (option.value === siteMode.value) return option.label;
	return 'Professional';
}

/** @returns {void} Closes the selector and returns keyboard focus to its trigger. */
function closePanel() {
	if (!panel.value) return;
	panel.value.open = false;
	panel.value.querySelector('summary')?.focus();
}

/** @param {PointerEvent} event Pointer interaction. @returns {void} Dismisses an outside click. */
function dismissOutside(event) {
	if (panel.value?.open && !panel.value.contains(event.target)) panel.value.open = false;
}

/** @param {KeyboardEvent} event Keyboard interaction. @returns {void} Handles Escape dismissal. */
function handleKey(event) {
	if (event.key === 'Escape') closePanel();
}

/**
 * Chooses a mode and updates an explicit share-link override when present.
 * @param {string} value Supported site mode.
 * @returns {void}
 */
function chooseMode(value) {
	setSiteMode(value);
	if (route.query.mode !== undefined) router.replace({ query: { ...route.query, mode: value }, hash: route.hash });
	closePanel();
}

/** @returns {unknown} The current route's optional mode override. */
function getRouteMode() {
	return route.query.mode;
}

/** @param {unknown} value Route query value. @returns {void} Applies valid navigation overrides. */
function applyRouteMode(value) {
	if (isSiteMode(value)) setSiteMode(value);
}

/** @returns {void} Installs the outside-pointer listener for this mounted selector. */
function mountSelector() {
	document.addEventListener('pointerdown', dismissOutside);
	applyRouteMode(route.query.mode);
}

/** @returns {void} Removes the selector's document listener. */
function unmountSelector() {
	document.removeEventListener('pointerdown', dismissOutside);
}

watch(getRouteMode, applyRouteMode);
onMounted(mountSelector);
onBeforeUnmount(unmountSelector);
</script>

<template>
	<details ref="panel" class="site-mode-selector relative shrink-0" @keydown="handleKey">
		<summary class="flex cursor-pointer list-none items-center gap-2 rounded-full border border-border px-3 py-2 text-xs font-medium text-foreground transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring [&::-webkit-details-marker]:hidden" aria-label="Choose website mode">
			<svg aria-hidden="true" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
				<circle cx="12" cy="12" r="8" /><path d="M12 4a8 8 0 0 0 0 16Z" fill="currentColor" stroke="none" />
			</svg>
			<span class="hidden sm:inline">{{ currentLabel }}</span>
			<span class="sm:hidden">Mode</span>
			<span aria-hidden="true">⌄</span>
		</summary>
		<div class="skin-popover absolute top-full right-0 z-50 mt-3 w-72 max-w-[calc(100vw-2rem)] rounded-2xl p-3">
			<p class="px-2 pt-1 pb-3 text-xs font-semibold tracking-wide text-muted-fg">Website mode</p>
			<div class="grid gap-1" role="group" aria-label="Website mode">
				<button v-for="option in siteModes" :key="option.value" type="button" :aria-label="option.label" :aria-pressed="siteMode === option.value" class="flex w-full cursor-pointer items-center gap-3 rounded-xl border p-3 text-left transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-ring" :class="siteMode === option.value ? 'border-ring bg-secondary' : 'border-transparent'" @click="chooseMode(option.value)">
					<span class="size-8 shrink-0 rounded-lg border border-border" :style="{ background: option.swatch }" aria-hidden="true"></span>
					<span><span class="block text-sm font-semibold text-canvas-fg">{{ option.label }}</span><span class="mt-0.5 block text-xs leading-5 text-muted-fg">{{ option.description }}</span></span>
				</button>
			</div>
			<label v-if="siteMode === 'professional'" class="mt-3 grid gap-2 border-t border-border px-2 pt-3 pb-1 text-xs font-medium text-muted-fg">
				Professional colour scheme
				<select :value="mode" class="skin-control w-full rounded-lg px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-ring" @change="setMode($event.target.value)">
					<option value="light">Light</option>
					<option value="dark">Dark</option>
					<option value="system">System</option>
				</select>
			</label>
		</div>
	</details>
</template>
