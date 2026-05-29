<script setup>
import { ref } from 'vue';
import { ElTreeView } from '../../../lib/vue';

const folderIcon = 'M4 6h6l2 2h8v10H4V6Z';
const tagIcon = 'M4 5h7l9 9-6 6-9-9V5Zm4 4h.01';
const diskIcon = 'M5 5h14v14H5V5Zm3 10h8M8 8h8';

const selected = ref('downloads');
const places = ref([
	{
		id: 'favourites',
		label: 'Favourites',
		icon: folderIcon,
		open: true,
		children: [
			{ id: 'airdrop', label: 'AirDrop', icon: diskIcon },
			{ id: 'applications', label: 'Applications', icon: folderIcon },
			{ id: 'downloads', label: 'Downloads', icon: folderIcon },
		],
	},
	{
		id: 'tags',
		label: 'Tags',
		icon: tagIcon,
		open: true,
		children: [
			{ id: 'work', label: 'Work', icon: tagIcon },
			{ id: 'archive', label: 'Archive', icon: tagIcon },
		],
	},
]);
</script>

<template>
	<div class="w-full max-w-xs rounded-3xl border border-border bg-background p-3 shadow-xl shadow-black/5">
		<ElTreeView
			v-model="selected"
			:items="places"
			variant="finder"
			:draggable="false"
			toggle-transition
			class="border-0 bg-transparent shadow-none"
		>
			<template #item="{ item, depth }">
				<span
					class="truncate"
					:class="depth === 1 && 'text-[11px] font-semibold uppercase tracking-wide text-muted-foreground group-aria-selected:text-accent-foreground'"
				>{{ item.label }}</span>
			</template>
		</ElTreeView>
	</div>
</template>
