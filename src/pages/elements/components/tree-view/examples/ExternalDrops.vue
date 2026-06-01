<script setup>
import { ref } from 'vue';
import { ElTreeView } from '../../../lib/vue';

const paletteDropType = 'application/x-elements-tree-palette';
const folderIcon = 'M4 6h6l2 2h8v10H4V6Z';
const rectIcon = 'M5 6h14v12H5V6Z';
const textIcon = 'M5 7h14M12 7v10M8 17h8';
const buttonIcon = 'M8 8h8a4 4 0 0 1 0 8H8a4 4 0 0 1 0-8Z';

let nextId = 1;
const selected = ref('hero');
const openValues = ref(['page', 'hero']);
const snippets = [
	{ id: 'section', label: 'Section', icon: folderIcon, acceptsChildren: true },
	{ id: 'headline', label: 'Headline', icon: textIcon, acceptsChildren: false },
	{ id: 'button', label: 'Button', icon: buttonIcon, acceptsChildren: false },
];
const tree = ref([
	{
		id: 'page',
		label: 'Landing page',
		icon: folderIcon,
		acceptsChildren: true,
		children: [
			{
				id: 'hero',
				label: 'Hero section',
				icon: folderIcon,
				acceptsChildren: true,
				children: [
					{ id: 'hero-title', label: 'Headline', icon: textIcon, acceptsChildren: false },
					{ id: 'hero-card', label: 'Feature card', icon: rectIcon, acceptsChildren: false },
				],
			},
		],
	},
]);

function onPaletteDragStart(snippet, event) {
	event.dataTransfer.effectAllowed = 'copy';
	event.dataTransfer.setData(paletteDropType, snippet.id);
	event.dataTransfer.setData('text/plain', snippet.label);
}

function canDropPalette({ item, position }) {
	if (position === 'inside') return item.acceptsChildren !== false;
	return item.id !== 'page';
}

function onExternalDrop(drop) {
	const snippet = snippets.find((item) => item.id === drop.getData(paletteDropType));
	if (!snippet) return;
	const node = {
		id: `${snippet.id}-${nextId}`,
		label: snippet.label,
		icon: snippet.icon,
		acceptsChildren: snippet.acceptsChildren,
		children: snippet.acceptsChildren ? [] : undefined,
	};
	nextId += 1;
	const next = insertTreeItem(tree.value, drop.value, drop.position, node);
	if (!next) return;
	tree.value = next;
	selected.value = node.id;
	if (drop.position === 'inside') {
		openValues.value = [...new Set([...openValues.value, String(drop.value)])];
	}
}

function insertTreeItem(items, targetValue, position, item) {
	const next = cloneItems(items);
	return insertInto(next, targetValue, position, item) ? next : null;
}

function insertInto(items, targetValue, position, item) {
	for (let index = 0; index < items.length; index += 1) {
		if (String(items[index].id) === String(targetValue)) {
			if (position === 'inside') {
				if (!Array.isArray(items[index].children)) items[index].children = [];
				items[index].children.push(item);
			} else {
				items.splice(position === 'before' ? index : index + 1, 0, item);
			}
			return true;
		}
		if (Array.isArray(items[index].children) && insertInto(items[index].children, targetValue, position, item)) return true;
	}
	return false;
}

function cloneItems(items) {
	return items.map((item) => ({
		...item,
		children: Array.isArray(item.children) ? cloneItems(item.children) : item.children,
	}));
}
</script>

<template>
	<div class="grid w-full gap-4 lg:grid-cols-[14rem_minmax(0,1fr)]">
		<div class="rounded-xl border border-border bg-secondary/40 p-3">
			<p class="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Palette</p>
			<div class="grid gap-2">
				<button
					v-for="snippet in snippets"
					:key="snippet.id"
					type="button"
					draggable="true"
					class="flex h-9 items-center gap-2 rounded-lg border border-border bg-background px-3 text-left text-sm text-foreground transition hover:border-ring hover:bg-card"
					@dragstart="onPaletteDragStart(snippet, $event)"
				>
					<svg class="size-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true">
						<path :d="snippet.icon" />
					</svg>
					<span>{{ snippet.label }}</span>
				</button>
			</div>
		</div>

		<ElTreeView
			v-model="selected"
			v-model:items="tree"
			v-model:open-values="openValues"
			:external-drop-types="[paletteDropType]"
			:can-drop-external="canDropPalette"
			label="External drop layers"
			@external-drop="onExternalDrop"
		/>
	</div>
</template>
