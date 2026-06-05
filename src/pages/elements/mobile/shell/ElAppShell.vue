<script setup>
defineOptions({
	__doc: {
		name: 'App shell',
		tag: '<ElAppShell>',
		description: 'A web app surface with safe-area padding, scrollable content, and fixed app chrome slots for mobile or desktop app layouts.',
		slots: [
			{ name: 'top', description: 'Top navigation, status, or toolbar content.' },
			{ name: '(default)', description: 'Scrollable app content.' },
			{ name: 'bottom', description: 'Bottom navigation, tab bar, or persistent controls.' },
			{ name: 'overlay', description: 'Absolute overlay layer for drawers, action sheets, and app-level panels.' },
		],
		playground: {
			mobileSlot: 'shell',
		},
	},
});

defineProps({
	variant: {
		type: String,
		default: 'app',
		_edit: {
			options: ['app', 'card'],
			description: 'Use app for full-screen app views and card for inset surfaces.',
		},
	},
});
</script>

<template>
	<div
		data-el-app-shell
		class="relative isolate flex h-full min-h-0 w-full flex-col overflow-hidden overscroll-none bg-background text-foreground"
		:class="variant === 'card' && 'rounded-[2rem] border border-border shadow-xl shadow-black/10'"
		style="--el-mobile-safe-top: env(safe-area-inset-top, 0px); --el-mobile-safe-bottom: env(safe-area-inset-bottom, 0px);"
	>
		<div v-if="$slots.top" class="shrink-0 pt-[var(--el-mobile-safe-top)]">
			<slot name="top" />
		</div>
		<main data-el-app-shell-main class="min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-smooth [-webkit-overflow-scrolling:touch]">
			<slot />
		</main>
		<div v-if="$slots.bottom" class="shrink-0 pb-[var(--el-mobile-safe-bottom)]">
			<slot name="bottom" />
		</div>
		<div v-if="$slots.overlay" data-el-app-shell-overlay class="pointer-events-none absolute inset-0 z-20">
			<slot name="overlay" />
		</div>
	</div>
</template>
