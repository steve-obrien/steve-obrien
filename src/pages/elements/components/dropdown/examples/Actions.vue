<script setup>
import { ref } from 'vue';
import { ElDropdown } from '@elements/vue';

const icons = {
	edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />',
	duplicate: '<rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />',
	share: '<circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />',
	archive: '<polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" /><line x1="10" y1="12" x2="14" y2="12" />',
	trash: '<polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />',
};
const actions = [
	{ label: 'Edit', value: 'edit', icon: 'edit' },
	{ label: 'Duplicate', value: 'duplicate', icon: 'duplicate' },
	{ label: 'Share', value: 'share', icon: 'share' },
	{ label: 'Archive', value: 'archive', icon: 'archive' },
	{ separator: true },
	{ label: 'Delete', value: 'delete', icon: 'trash', tone: 'danger' },
];
const lastAction = ref('');
</script>

<template>
	<div class="flex flex-col items-center gap-3">
		<ElDropdown
			:items="actions"
			label="Actions"
			align="right"
			width="min-w-[14rem]"
			@select="(v) => lastAction = v"
		>
			<template #item="{ item }">
				<span class="flex items-center gap-2.5" :class="item.tone === 'danger' && 'text-red-500'">
					<svg
						viewBox="0 0 24 24"
						class="size-4 opacity-80"
						fill="none"
						stroke="currentColor"
						stroke-width="1.6"
						stroke-linecap="round"
						stroke-linejoin="round"
						v-html="icons[item.icon]"
					/>
					<span>{{ item.label }}</span>
				</span>
			</template>
		</ElDropdown>
		<p v-if="lastAction" class="text-xs text-skin-muted">
			Last action: <code class="text-skin-primary">{{ lastAction }}</code>
		</p>
	</div>
</template>
