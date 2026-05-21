<script setup>
import { computed, onMounted, ref } from 'vue';
import { useTheme } from '../composable/useTheme';

const { mode, cycleMode, initTheme } = useTheme();

const mounted = ref(false);
onMounted(() => {
	initTheme();
	mounted.value = true;
});

const ariaLabel = computed(() => {
	if (mode.value === 'light') return 'Theme: light — click for dark';
	if (mode.value === 'dark') return 'Theme: dark — click for system';
	return 'Theme: system — click for light';
});
</script>

<template>
	<button
		type="button"
		:aria-label="ariaLabel"
		:title="ariaLabel"
		class="grid size-9 place-items-center rounded-full text-skin-secondary transition hover:bg-skin-surface hover:text-skin-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skin-primary/40"
		@click="cycleMode"
	>
		<!-- Sun (light) -->
		<svg
			v-if="mounted && mode === 'light'"
			viewBox="0 0 24 24"
			class="size-5"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<circle cx="12" cy="12" r="4" />
			<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
		</svg>

		<!-- Moon (dark) -->
		<svg
			v-else-if="mounted && mode === 'dark'"
			viewBox="0 0 24 24"
			class="size-5"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
		</svg>

		<!-- Monitor (system) -->
		<svg
			v-else
			viewBox="0 0 24 24"
			class="size-5"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<rect x="3" y="4" width="18" height="12" rx="2" />
			<path d="M9 20h6M12 16v4" />
		</svg>
	</button>
</template>
