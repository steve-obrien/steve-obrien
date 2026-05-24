<script setup>
import { sideNavLinks } from './sideNavLinks';
import { RouterLink, useRoute } from 'vue-router';

const route = useRoute();

const iconPaths = {
	'AI builders': 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Zm6 9 .9 2.6 2.6.9-2.6.9L18 20l-.9-2.6-2.6-.9 2.6-.9L18 12Z',
	Theming: 'M12 3v18M5 8h14M7 16h10',
	Studio: 'M4 5h16v14H4V5Zm4 4h8M8 13h5',
	Playground: 'M8 4l8 8-8 8',
	Button: 'M7 8h10a4 4 0 0 1 0 8H7a4 4 0 0 1 0-8Z',
	Menu: 'M5 7h14M5 12h14M5 17h14',
	Listbox: 'M8 6h11M8 12h11M8 18h11M4 6h.01M4 12h.01M4 18h.01',
	Dropdown: 'M7 10l5 5 5-5',
	Dialog: 'M5 6h14v12H5V6Zm4 4h6',
	Drawer: 'M4 5h16v14H4V5Zm0 0h6v14',
	Tabs: 'M4 7h7v4H4V7Zm9 0h7v4h-7V7ZM4 11h16v8H4v-8Z',
	Toggle: 'M8 9h8a3 3 0 0 1 0 6H8a3 3 0 0 1 0-6Zm0 0a3 3 0 0 0 0 6',
	Tooltip: 'M5 5h14v9H9l-4 4V5Z',
	Accordion: 'M7 8h10M7 16h10M9 6l-2 2 2 2M15 14l2 2-2 2',
	Combobox: 'M5 7h14M7 12h8M7 17h5',
	Autocomplete: 'M5 11h10M5 16h7M16 16l3 3M14 14a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
	Popover: 'M6 7h12v8H9l-3 3V7Z',
	Toast: 'M5 7h14v10H5V7Zm3 3h8M8 14h5',
	Card: 'M5 6h14v12H5V6Zm0 4h14',
	Dashboard: 'M4 5h7v7H4V5Zm9 0h7v5h-7V5ZM4 14h7v5H4v-5Zm9-2h7v7h-7v-7Z',
	Chat: 'M5 6h14v9H9l-4 4V6Z',
	Mail: 'M4 6h16v12H4V6Zm0 0 8 7 8-7',
	Forms: 'M7 4h10l3 3v13H7V4Zm10 0v4h4M10 12h7M10 16h5',
	Login: 'M10 17l5-5-5-5M15 12H3M14 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5',
	Checkbox: 'M5 12l4 4L19 6',
	'Radio group': 'M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
	'Text input': 'M5 7h14M12 7v10M8 17h8',
	'Password input': 'M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6v-9Z',
	Textarea: 'M5 5h14v14H5V5Zm3 4h8M8 13h8M8 17h5',
	'Number input': 'M8 7h8M8 17h8M10 5l-2 14M16 5l-2 14',
	'Select input': 'M6 8h12M8 13h8M9 17l3 3 3-3',
	'Native select': 'M6 8h12M8 13h8M9 17l3 3 3-3',
	'Boolean input': 'M8 9h8a3 3 0 0 1 0 6H8a3 3 0 0 1 0-6Z',
	'Color input': 'M12 21a7 7 0 0 1-7-7c0-5 7-11 7-11s7 6 7 11a7 7 0 0 1-7 7Z',
	'JSON list input': 'M8 6h11M8 12h11M8 18h11M4 6h.01M4 12h.01M4 18h.01M8 3H6a2 2 0 0 0-2 2',
	'Code input': 'M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14',
	'JSON input': 'M8 7H6a2 2 0 0 0-2 2v1a2 2 0 0 1-2 2 2 2 0 0 1 2 2v1a2 2 0 0 0 2 2h2M16 7h2a2 2 0 0 1 2 2v1a2 2 0 0 0 2 2 2 2 0 0 0-2 2v1a2 2 0 0 1-2 2h-2',
	Overview: 'M5 5h14v14H5V5Zm4 4h6M9 13h6',
};

function iconPath(label) {
	return iconPaths[label] || 'M5 12h14';
}
</script>

<template>
	<aside>
		<div v-for="(group, gi) in sideNavLinks" :key="group.label" :class="gi > 0 && 'mt-5'">
			<p class="px-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{{ group.label }}</p>
			<nav class="mt-2 space-y-0.5">
				<RouterLink
				v-for="c in group.items"
				:key="c.to"
				:to="c.to"
				class="flex items-center justify-between rounded-lg px-3 py-1.5 text-sm font-medium transition"
				:class="route.path === c.to
					? 'bg-secondary text-secondary-foreground'
					: 'text-muted-foreground hover:bg-secondary hover:text-foreground'">
					<span class="flex min-w-0 items-center gap-2">
						<svg class="size-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
							<path :d="iconPath(c.label)" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
						<span class="truncate">{{ c.label }}</span>
					</span>
					<span v-if="c.tag" class="rounded-full bg-success/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-success dark:text-success">{{ c.tag }}</span>
				</RouterLink>
			</nav>
		</div>
		<div class="mt-8 rounded-2xl border border-border bg-gradient-to-br from-secondary to-transparent p-4">
			<p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pro</p>
			<p class="mt-1 text-sm font-medium text-foreground">Get every blueprint, template &amp; pre-built app.</p>
			<RouterLink to="/elements/pricing" class="mt-3 inline-flex items-center gap-1 text-sm font-medium text-foreground hover:underline">
				View pricing →
			</RouterLink>
		</div>
	</aside>
</template>
