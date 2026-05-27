<script setup>
import { ref } from 'vue';
import { ElTreeView } from '../../../lib/vue';

const folderIcon = 'M4 6h6l2 2h8v10H4V6Z';
const fileIcon = 'M6 4h8l4 4v12H6V4Zm8 0v5h5';
const selected = ref('workspace');
const items = ref([
	{
		id: 'workspace',
		label: 'Workspace',
		icon: folderIcon,
		open: true,
		children: [
			{ id: 'remote-pages', label: 'Remote pages', icon: folderIcon, lazy: true },
			{ id: 'remote-components', label: 'Remote components', icon: folderIcon, lazy: true },
		],
	},
]);

function updateNode(nodes, id, patch) {
	for (const node of nodes) {
		if (node.id === id) {
			Object.assign(node, patch);
			return true;
		}
		if (Array.isArray(node.children) && updateNode(node.children, id, patch)) return true;
	}
	return false;
}

function loadChildren({ value }) {
	updateNode(items.value, value, { loading: true });
	setTimeout(() => {
		updateNode(items.value, value, {
			loading: false,
			lazy: false,
			children: [
				{ id: `${value}-overview`, label: 'Overview.vue', icon: fileIcon },
				{ id: `${value}-settings`, label: 'Settings.vue', icon: fileIcon },
				{ id: `${value}-history`, label: 'History.vue', icon: fileIcon },
			],
		});
	}, 900);
}
</script>

<template>
	<div class="w-full max-w-md">
		<ElTreeView
			v-model="selected"
			v-model:items="items"
			@load-children="loadChildren"
		/>
		<p class="mt-3 text-xs text-muted-foreground">Open a remote folder to simulate a server lookup.</p>
	</div>
</template>
