<script setup>
import { ref } from 'vue';
import { ElMenu } from '@elements/vue';

const selected = ref('none');
const items = ref([
	{ label: 'Sync status', value: 'sync', slot: 'sync' },
	{ label: 'Live mode', value: 'live', slot: 'live', badge: 'Live' },
	{ separator: true },
	{ label: 'Notifications', value: 'notifications', type: 'checkbox', checked: true, slot: 'switch' },
	{ label: 'Compact sidebar', value: 'compact-sidebar', type: 'checkbox', checked: false, slot: 'switch' },
	{ separator: true },
	{ label: 'Delete workspace', value: 'delete', tone: 'danger', slot: 'danger' },
]);

function onSelect(event) {
	selected.value = event.value;
}

function onChange(event) {
	const item = items.value.find((candidate) => candidate.value === event.value);
	if (item) item.checked = event.checked;
}
</script>

<template>
	<div class="w-full max-w-sm space-y-3">
		<ElMenu :items="items" @select="onSelect" @change="onChange">
			<template #sync="{ label }">
				<span class="flex min-w-0 items-center gap-3">
					<span class="grid size-8 place-items-center rounded-lg bg-success/15 text-success">
						<svg viewBox="0 0 24 24" class="size-4" fill="none" aria-hidden="true">
							<path d="M6.5 8.5A6 6 0 0 1 17 7l1 .95M17.5 15.5A6 6 0 0 1 7 17l-1-.95M18 4.5V8h-3.5M6 19.5V16h3.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					</span>
					<span class="min-w-0">
						<span class="block truncate font-medium">{{ label }}</span>
						<span class="block truncate text-xs text-muted-foreground">Updated just now</span>
					</span>
				</span>
				<span class="text-xs text-success">Ready</span>
			</template>

			<template #live="{ label, item }">
				<span class="min-w-0">
					<span class="block truncate font-medium">{{ label }}</span>
					<span class="block truncate text-xs text-muted-foreground">Broadcast changes to viewers</span>
				</span>
				<span class="rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-medium text-success">{{ item.badge }}</span>
			</template>

			<template #switch="{ label, checked }">
				<span class="min-w-0 truncate">{{ label }}</span>
				<span
					class="relative inline-flex h-5 w-9 shrink-0 rounded-full transition"
					:class="checked ? 'bg-primary' : 'bg-input'"
					aria-hidden="true"
				>
					<span
						class="absolute left-0.5 top-0.5 size-4 rounded-full bg-card shadow-sm transition"
						:class="checked ? 'translate-x-4' : 'translate-x-0'"
					></span>
				</span>
			</template>

			<template #danger="{ label }">
				<span class="min-w-0 truncate">{{ label }}</span>
				<span class="text-xs text-destructive/70">Del</span>
			</template>
		</ElMenu>

		<p class="text-xs text-muted-foreground">Selected: <code class="text-foreground">{{ selected }}</code></p>
	</div>
</template>
