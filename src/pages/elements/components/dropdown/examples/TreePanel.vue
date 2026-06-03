<script setup>
import { computed, ref } from 'vue';
import { ElDropdown, ElTreeView } from '@elements/vue';

const folderIcon = 'M4 6h6l2 2h8v10H4V6Z';
const screenIcon = 'M5 5h14v10H5V5Zm4 14h6M10 15l-.5 4M14 15l.5 4';
const settingsIcon = 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-5v3M12 18v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1';
const fileIcon = 'M6 4h8l4 4v12H6V4Zm8 0v5h5';

const dropdown = ref(null);
const selected = ref('workspace-design-system');
const sections = ref([
	{
		id: 'workspace',
		label: 'Workspace',
		icon: folderIcon,
		open: true,
		children: [
			{ id: 'workspace-overview', label: 'Overview', icon: screenIcon },
			{ id: 'workspace-design-system', label: 'Design system', icon: settingsIcon },
			{ id: 'workspace-release-notes', label: 'Release notes', icon: fileIcon, children: [
				{ id: 'workspace-release-notes-1.0.0', label: '1.0.0', icon: fileIcon },
				{ id: 'workspace-release-notes-1.0.1', label: '1.0.1', icon: fileIcon },
				{ id: 'workspace-release-notes-1.0.2', label: '1.0.2', icon: fileIcon, children: [
					{ id: 'workspace-release-notes-1.0.2-1.0.0', label: '1.0.0', icon: fileIcon },
					{ id: 'workspace-release-notes-1.0.2-1.0.1', label: '1.0.1 best practices', icon: fileIcon, children: [
						{ id: 'workspace-release-notes-1.0.2-1.0.1-1.0.0', label: '1.0.0 The complete guide to Using AI', icon: fileIcon },
					] },
				] },
			] },
		],
	},
	{
		id: 'product',
		label: 'Product',
		icon: folderIcon,
		open: true,
		children: [
			{ id: 'product-roadmap', label: 'Roadmap', icon: fileIcon },
			{ id: 'product-feedback', label: 'Feedback', icon: screenIcon },
		],
	},
	{
		id: 'operations',
		label: 'Operations',
		icon: folderIcon,
		children: [
			{ id: 'operations-hiring', label: 'Hiring', icon: fileIcon },
			{ id: 'operations-finance', label: 'Finance', icon: fileIcon },
		],
	},
]);

function findSection(nodes, value) {
	for (const node of nodes) {
		if (node.id === value) return node;
		const match = node.children ? findSection(node.children, value) : null;
		if (match) return match;
	}
	return null;
}

const selectedSection = computed(() => findSection(sections.value, selected.value));

function chooseSection({ value }) {
	selected.value = value;
	dropdown.value?.close();
}
</script>

<template>
	<div class="flex flex-col items-center gap-3">
		<ElDropdown
			ref="dropdown"
			label="Move to"
			width="w-80"
			panel-type="tree"
			lock-scroll
		>
			<template #trigger>
				<span class="flex min-w-0 items-center gap-2">
					<svg viewBox="0 0 24 24" class="size-4 shrink-0" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round">
						<path :d="folderIcon" />
					</svg>
					<span class="max-w-40 truncate">{{ selectedSection?.label }}</span>
				</span>
			</template>

			<template #panel>
				<div class="w-full p-1">
					<div class="px-2 pb-2 pt-1">
						<p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Move to</p>
					</div>
					<ElTreeView
						v-model="selected"
						:items="sections"
						:draggable="false"
						:chrome="false"
						density="comfortable"
						variant="finder"
						label="Project sections"
						@select="chooseSection"
					/>
				</div>
			</template>
		</ElDropdown>
		<p class="text-xs text-muted-foreground">
			Destination: <code class="text-foreground">{{ selectedSection?.label }}</code>
		</p>
	</div>
</template>
