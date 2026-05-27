<script setup>
import { ref } from 'vue';
import { ElContextMenu } from '@elements/vue';

const selected = ref('none');
const items = [
	{ label: 'Open', value: 'open' },
	{ label: 'Rename', value: 'rename' },
	{ label: 'Duplicate', value: 'duplicate' },
	{
		label: 'Move to',
		value: 'move',
		children: [
			{ label: 'Inbox', value: 'move-inbox' },
			{ label: 'Archive', value: 'move-archive' },
			{ label: 'Projects', value: 'move-projects' },
		],
	},
	{
		label: 'Share',
		value: 'share',
		children: [
			{ label: 'Email', value: 'share-email' },
			{ label: 'SMS', value: 'share-sms' },
			{ label: 'Instagram', value: 'share-instagram' },
		],
	},
	{ separator: true },
	{ label: 'Delete', value: 'delete', tone: 'danger' },
];
</script>

<template>
	<div class="w-full max-w-lg space-y-3">
		<ElContextMenu :items="items" @select="selected = $event.value">
			<div class="overflow-hidden rounded-2xl border border-border bg-background text-sm shadow-sm">
				<div class="grid grid-cols-[1fr_auto] gap-4 border-b border-border bg-card/70 px-4 py-3 backdrop-blur">
					<div>
						<p class="font-medium text-foreground">Quarterly plan</p>
						<p class="mt-1 text-xs text-muted-foreground">Right click this row to open nested actions.</p>
					</div>
					<span class="self-start rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium text-success">Live</span>
				</div>
				<div class="grid gap-2 p-4 text-muted-foreground sm:grid-cols-3">
					<div>
						<p class="text-xs uppercase tracking-[0.14em]">Owner</p>
						<p class="mt-1 text-foreground">Maya Patel</p>
					</div>
					<div>
						<p class="text-xs uppercase tracking-[0.14em]">Status</p>
						<p class="mt-1 text-foreground">In review</p>
					</div>
					<div>
						<p class="text-xs uppercase tracking-[0.14em]">Updated</p>
						<p class="mt-1 text-foreground">Today</p>
					</div>
				</div>
			</div>
		</ElContextMenu>

		<p class="text-xs text-muted-foreground">Selected: <code class="text-foreground">{{ selected }}</code></p>
	</div>
</template>
