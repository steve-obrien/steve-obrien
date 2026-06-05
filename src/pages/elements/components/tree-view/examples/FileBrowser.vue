<script setup>
import { computed, ref } from 'vue';
import { ElContextMenu, ElTreeView } from '../../../lib/vue';

const folderIcon = 'M4 6h6l2 2h8v10H4V6Z';
const vueIcon = 'M4 5h16l-8 14L4 5Z';
const jsIcon = 'M6 4h12v16H6V4Zm4 11c0 1.5 1 2 2 2s2-.5 2-2V9';
const cssIcon = 'M6 4h12l-1 14-5 2-5-2L6 4Zm3 4h6M9 12h6';
const textIcon = 'M6 4h8l4 4v12H6V4Zm8 0v5h5M9 13h6M9 16h4';

const selected = ref('src-pages-elements');
const contextMenu = ref(null);
const context = ref({ kind: 'empty', item: null, value: null, node: null });
const lastAction = ref('none');
const newFolderCount = ref(1);
const newFileCount = ref(1);
const files = ref([
	{
		id: 'src',
		label: 'src',
		type: 'folder',
		icon: folderIcon,
		open: true,
		children: [
			{
				id: 'src-pages',
				label: 'pages',
				type: 'folder',
				icon: folderIcon,
				open: true,
				children: [
					{ id: 'src-pages-elements', label: 'ElementsLayout.vue', type: 'file', icon: vueIcon },
					{ id: 'src-pages-routes', label: 'routes.js', type: 'file', icon: jsIcon },
				],
			},
			{ id: 'src-style', label: 'style.css', type: 'file', icon: cssIcon },
		],
	},
	{
		id: 'public',
		label: 'public',
		type: 'folder',
		icon: folderIcon,
		children: [
			{ id: 'public-llms', label: 'llms.txt', type: 'file', icon: textIcon },
		],
	},
]);

const contextItems = computed(() => {
	if (context.value.kind === 'empty') {
		return [
			{ label: 'New folder', value: 'new-folder' },
			{ label: 'New file', value: 'new-file' },
			{ separator: true },
			{ label: 'Paste', value: 'paste', disabled: true },
		];
	}

	if (context.value.item?.type === 'folder') {
		return [
			{ label: 'Open', value: 'open' },
			{ label: 'New folder', value: 'new-folder' },
			{ label: 'New file', value: 'new-file' },
			{ separator: true },
			{ label: 'Rename', value: 'rename' },
			{ label: 'Delete', value: 'delete', tone: 'danger' },
		];
	}

	return [
		{ label: 'Open', value: 'open' },
		{ label: 'Open with', value: 'open-with', children: [
			{ label: 'Code editor', value: 'open-code' },
			{ label: 'Preview', value: 'open-preview' },
		] },
		{ separator: true },
		{ label: 'Rename', value: 'rename' },
		{ label: 'Duplicate', value: 'duplicate' },
		{ label: 'Delete', value: 'delete', tone: 'danger' },
	];
});

function openContextMenu(payload) {
	context.value = payload;
	if (payload.kind === 'item') selected.value = payload.value;
	contextMenu.value?.open(payload.event);
}

function onMenuSelect({ value }) {
	lastAction.value = `${value} on ${contextLabel()}`;
	if (value === 'new-folder') addItemToContext({
		id: `folder-${newFolderCount.value}`,
		label: `New folder ${newFolderCount.value++}`,
		type: 'folder',
		icon: folderIcon,
		children: [],
	});
	if (value === 'new-file') addItemToContext({
		id: `file-${newFileCount.value}`,
		label: `new-file-${newFileCount.value++}.txt`,
		type: 'file',
		icon: textIcon,
	});
}

function contextLabel() {
	return context.value.item?.label || 'project root';
}

function addItemToContext(item) {
	if (context.value.kind === 'empty') {
		files.value = [...files.value, item];
		selected.value = item.id;
		return;
	}

	const target = findItem(files.value, context.value.value);
	if (!target || target.type !== 'folder') return;
	target.open = true;
	target.children = [...(target.children || []), item];
	selected.value = item.id;
}

function findItem(items, value) {
	for (const item of items) {
		if (String(item.id) === String(value)) return item;
		const match = findItem(item.children || [], value);
		if (match) return match;
	}
	return null;
}
</script>

<template>
	<div class="w-full max-w-md">
		<ElContextMenu
			ref="contextMenu"
			:items="contextItems"
			:open-on-context-menu="false"
			@select="onMenuSelect"
		>
			<ElTreeView
				v-model="selected"
				v-model:items="files"
				class="min-h-72"
				density="comfortable"
				@context-menu="openContextMenu"
			/>
		</ElContextMenu>
		<p class="mt-3 text-xs text-muted-foreground">Selected path: <code class="text-foreground">{{ selected }}</code></p>
		<p class="mt-1 text-xs text-muted-foreground">Last context action: <code class="text-foreground">{{ lastAction }}</code></p>
	</div>
</template>
