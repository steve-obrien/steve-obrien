<script setup>
import { computed, ref } from 'vue';
import {
	ElAppBottomNav,
	ElAppListItem,
	ElAppShell,
	ElAppTopBar,
	ElActionSheet,
	ElTextInput,
	ElToggle,
} from '@elements/vue';

const activeTab = ref('home');
const query = ref('');
const notifications = ref(true);
const sheetOpen = ref(false);

const icons = {
	home: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-8.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
	inbox: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 6h16v12H4V6Zm0 8h5l1.5 2h3L15 14h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
	settings: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" stroke-width="1.8"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a7.4 7.4 0 0 0-1.7-1L14.5 3h-4l-.3 3.1a7.4 7.4 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.4-1a7.4 7.4 0 0 0 1.7 1l.3 3.1h4l.3-3.1a7.4 7.4 0 0 0 1.7-1l2.4 1 2-3.4-2-1.5c.1-.3.1-.7.1-1Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
};

const navItems = [
	{ value: 'home', label: 'Home', icon: icons.home },
	{ value: 'inbox', label: 'Inbox', icon: icons.inbox, badge: '3' },
	{ value: 'settings', label: 'Settings', icon: icons.settings },
];

const tasks = [
	{ label: 'Sync Capacitor status bar', description: 'Match the native chrome to the Elements theme.', meta: 'Now' },
	{ label: 'Review keyboard-aware form', description: 'Keep submit actions visible above the mobile keyboard.', meta: 'Today' },
	{ label: 'Ship mobile app shell', description: 'Use safe areas, bottom nav, and one scroll container.', meta: 'Fri' },
	{ label: 'Add native share action', description: 'Pair a row action with the Capacitor Share plugin.', meta: 'Fri' },
	{ label: 'Tune haptics', description: 'Use light impact feedback for destructive and confirm actions.', meta: 'Next' },
	{ label: 'Capture camera flow', description: 'Sketch the image picker and preview confirmation screen.', meta: 'Next' },
];

const filteredTasks = computed(() => {
	if (!query.value) return tasks;
	return tasks.filter((task) => task.label.toLowerCase().includes(query.value.toLowerCase()));
});

const actions = [
	{ label: 'Share project', description: 'Open the native share sheet', value: 'share' },
	{ label: 'Duplicate screen', value: 'duplicate' },
	{ label: 'Delete draft', value: 'delete', variant: 'danger' },
];
</script>

<template>
	<ElAppShell>
		<template #top>
			<ElAppTopBar title="Elements" subtitle="Mobile workspace">
				<template #trailing>
					<button
						type="button"
						class="grid size-10 place-items-center rounded-full bg-secondary text-foreground active:scale-95"
						aria-label="More actions"
						@click="sheetOpen = true"
					>
						<svg class="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
							<path d="M4 10a2 2 0 1 1 4 0 2 2 0 0 1-4 0Zm6 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0Zm6 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0Z" />
						</svg>
					</button>
				</template>
			</ElAppTopBar>
		</template>

		<section class="space-y-4 p-4">
			<div class="rounded-[1.75rem] bg-primary p-5 text-primary-foreground shadow-xl shadow-black/10">
				<p class="text-xs font-medium uppercase tracking-[0.16em] opacity-80">Today</p>
				<h2 class="mt-2 text-2xl font-semibold tracking-tight">Build mobile primitives.</h2>
				<p class="mt-2 text-sm leading-6 opacity-85">A web UI system, tuned for Capacitor screens and native app rhythms.</p>
			</div>

			<div class="mobile-task-search">
				<ElTextInput
					v-model="query"
					type="search"
					placeholder="Search mobile tasks"
				/>
			</div>

			<div class="overflow-hidden rounded-[1.5rem] border border-border bg-background">
				<ElAppListItem
					v-for="task in filteredTasks"
					:key="task.label"
					:label="task.label"
					:description="task.description"
					:meta="task.meta"
					chevron
				>
					<template #icon>
						<svg class="size-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
							<path d="m5 10 3 3 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					</template>
				</ElAppListItem>
			</div>

			<div class="overflow-hidden rounded-[1.5rem] border border-border bg-background">
				<ElAppListItem label="Push notifications" description="Demo row using an existing Elements toggle.">
					<template #trailing>
						<ElToggle v-model="notifications" aria-label="Push notifications" />
					</template>
				</ElAppListItem>
				<ElAppListItem label="Native share" description="Pair this row with Capacitor Share." chevron />
			</div>
		</section>

		<template #bottom>
			<ElAppBottomNav v-model="activeTab" :items="navItems" />
		</template>

		<ElActionSheet
			v-model="sheetOpen"
			title="Project actions"
			description="Use for app commands that should stay near the thumb."
			:actions="actions"
		/>
	</ElAppShell>
</template>

<style scoped>
.mobile-task-search :deep(.el-input) {
	height: 3rem;
	border-radius: 1rem;
	background: color-mix(in oklch, var(--secondary) 80%, transparent);
	font-size: 1rem;
}
</style>
