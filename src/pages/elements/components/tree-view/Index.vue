<script setup>
import ElementsLayout from '../../_layout/ElementsLayout.vue';
import DocPage from '../../_layout/DocPage.vue';
import DocSection from '../../_layout/DocSection.vue';
import CodeBlock from '../../_layout/CodeBlock.vue';
import Example from '../../_layout/docs/Example.vue';
import Playground from '../../_layout/docs/Playground.vue';
import ComponentProps from '../../_layout/docs/ComponentProps.vue';
import ComponentEvents from '../../_layout/docs/ComponentEvents.vue';
import ComponentKeyboard from '../../_layout/docs/ComponentKeyboard.vue';
import { ElTreeView } from '../../lib/vue';
import Layers from './examples/Layers.vue';
import LayersSrc from './examples/Layers.vue?raw';
import FileBrowser from './examples/FileBrowser.vue';
import FileBrowserSrc from './examples/FileBrowser.vue?raw';
import FinderMenu from './examples/FinderMenu.vue';
import FinderMenuSrc from './examples/FinderMenu.vue?raw';
import AsyncLoading from './examples/AsyncLoading.vue';
import AsyncLoadingSrc from './examples/AsyncLoading.vue?raw';

const folderIcon = 'M4 6h6l2 2h8v10H4V6Z';
const fileIcon = 'M6 4h8l4 4v12H6V4Zm8 0v5h5';
const initialItems = [
	{
		id: 'frame',
		label: 'Frame',
		icon: folderIcon,
		open: true,
		children: [
			{ id: 'header', label: 'Header', icon: folderIcon, children: [{ id: 'logo', label: 'Logo', icon: fileIcon }] },
			{ id: 'content', label: 'Content', icon: fileIcon },
		],
	},
	{ id: 'footer', label: 'Footer', icon: fileIcon },
];

const storeCode = `import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { flattenTreeItems, indexTreeItems, moveTreeItem } from '@elements/vue';

export const useLayersStore = defineStore('layers', () => {
\tconst items = ref([]);
\tconst openValues = ref(new Set());
\tconst selectedId = ref('');

\tconst visibleRows = computed(() => flattenTreeItems(items.value, openValues.value));
\tconst byId = computed(() => indexTreeItems(items.value));

\tfunction moveLayer(sourceId, targetId, position) {
\t\tconst moved = moveTreeItem(items.value, sourceId, targetId, position);
\t\tif (moved) items.value = moved.items;
\t}

\treturn { items, openValues, selectedId, visibleRows, byId, moveLayer };
});`;

const utilityRows = [
	{ name: 'treeItemValue(item)', description: 'Returns the stable address for an item. Prefer id in production; value and label are supported for simple demos.' },
	{ name: 'treeItemLabel(item)', description: 'Returns the display label from label, name, or the item value.' },
	{ name: 'treeItemChildren(item)', description: 'Safely returns children as an array so callers do not need null checks.' },
	{ name: 'visitTreeItems(items, callback)', description: 'Walks every nested item. Useful for migrations, permissions, collecting ids, or seeding state.' },
	{ name: 'seedTreeOpenValues(items, controlled, previous)', description: 'Creates the open branch set from controlled openValues, item.open flags, and previous local state.' },
	{ name: 'treeItemHasChildren(item)', description: 'Returns true for items with children or lazy nodes that can load children later.' },
	{ name: 'treeItemCanAcceptChildren(item)', description: 'Honours acceptsChildren and decides whether the middle drop zone is allowed.' },
	{ name: 'flattenTreeItems(items, openValues)', description: 'Converts a nested tree into visible rows with depth, parent, path, open, loading, and expandable metadata.' },
	{ name: 'indexTreeItems(items)', description: 'Builds a Map keyed by item id/value for fast lookup of item, parent, and path.' },
	{ name: 'cloneTreeItems(items)', description: 'Clones nested tree arrays before a move so the source data is not mutated.' },
	{ name: 'moveTreeItem(items, source, target, position)', description: 'Returns a new nested tree after moving one item before, inside, or after another item.' },
	{ name: 'isSameOrDescendantPath(path, possibleParentPath)', description: 'Prevents invalid drops, such as moving a parent into one of its own descendants.' },
];

const databaseCode = `// Database rows are usually already normalized.
// The tree can be derived at the edge of your app, while the database/store
// remains the source of truth.
const rows = [
\t{ id: 'root', parent_id: null, label: 'Project' },
\t{ id: 'hero', parent_id: 'root', label: 'Hero section' },
\t{ id: 'cta', parent_id: 'hero', label: 'CTA button' },
];

function rowsToTree(rows) {
\tconst byId = new Map(rows.map((row) => [row.id, { ...row, children: [] }]));
\tconst roots = [];

\tfor (const item of byId.values()) {
\t\tif (item.parent_id && byId.has(item.parent_id)) {
\t\t\tbyId.get(item.parent_id).children.push(item);
\t\t} else {
\t\t\troots.push(item);
\t\t}
\t}

\treturn roots;
}

function applyDropToRows(rows, { item, target, position }) {
\tconst next = rows.map((row) => ({ ...row }));
\tconst moved = next.find((row) => row.id === item.id);
\tconst targetRow = next.find((row) => row.id === target.id);
\tif (!moved || !targetRow) return rows;

\t// A real app would also update sort_order for siblings.
\tmoved.parent_id = position === 'inside' ? targetRow.id : targetRow.parent_id;
\treturn next;
}`;
</script>

<template>
	<ElementsLayout>
		<DocPage
			name="Tree view"
			tagline="Keyboard navigable trees for layers panels, file browsers, document outlines, and async server-backed hierarchies."
			tag="<ElTreeView>"
		>
			<DocSection eyebrow="Playground" title="Try every prop live">
				<Playground
					:inspect="ElTreeView"
					:initial="{ modelValue: 'content', items: initialItems }"
					title="Tree view playground"
					description="Edit the data, select nodes, expand branches, and reorder items with drag and drop."
				/>
			</DocSection>

			<DocSection eyebrow="Demo" title="Figma-style layers">
				<Example
					:source="LayersSrc"
					filename="Layers.vue"
					description="Use v-model to programmatically highlight a layer from the stage, custom slots for metadata, and drag/drop to reorder the tree."
				>
					<Layers />
				</Example>
			</DocSection>

			<DocSection eyebrow="Demo" title="File browser">
				<Example
					:source="FileBrowserSrc"
					filename="FileBrowser.vue"
					description="A file tree can use folder/file icons and comfortable row density while keeping the same keyboard navigation."
				>
					<FileBrowser />
				</Example>
			</DocSection>

			<DocSection eyebrow="Demo" title="Finder-style sidebar">
				<Example
					:source="FinderMenuSrc"
					filename="FinderMenu.vue"
					description="Use the finder variant with toggleTransition for a softer sidebar tree that feels closer to an Apple Finder menu."
				>
					<FinderMenu />
				</Example>
			</DocSection>

			<DocSection eyebrow="Demo" title="Async loading">
				<Example
					:source="AsyncLoadingSrc"
					filename="AsyncLoading.vue"
					description="Lazy nodes emit load-children on expand. Show loading on the node, then replace its children from the server response."
				>
					<AsyncLoading />
				</Example>
			</DocSection>

			<DocSection eyebrow="Architecture" title="Working with stores">
				<div class="space-y-4 text-sm leading-7 text-muted-foreground">
					<p>
						ElTreeView emits intent: selection, toggles, actions, lazy-load requests, and reorder results. For small local trees, use
						<code class="text-foreground">v-model:items</code>. For a larger editor, keep the real source of truth in Pinia and decide in the store whether a drop is allowed, persisted, or transformed.
					</p>
					<p>
						The generic tree helpers are exported separately so a store can flatten visible rows, build an id index, and move nested items without mounting the component. A normalized store can still use the same event shape, then implement its own move operation against
						<code class="text-foreground">byId</code> and child id arrays.
					</p>
				</div>
				<CodeBlock class="mt-5" :code="storeCode" lang="js" />
			</DocSection>

			<DocSection eyebrow="Utilities" title="Tree helpers">
				<div class="space-y-4 text-sm leading-7 text-muted-foreground">
					<p>
						The tree utilities are plain functions exported from <code class="text-foreground">@elements/vue</code>. They are deliberately separate from the component so a Pinia store, editor engine, or server sync layer can use the same rules without mounting a TreeView.
					</p>
					<p>
						Use these helpers when your source data is a nested array. If your app keeps a normalized store, use the same event shape from TreeView and apply the change inside the store instead.
					</p>
				</div>

				<div class="mt-5 overflow-hidden rounded-2xl border border-border bg-background text-sm">
					<div class="hidden grid-cols-[minmax(13rem,0.9fr)_1.5fr] gap-4 border-b border-border bg-secondary/60 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid">
						<span>Function</span>
						<span>Use</span>
					</div>
					<div
						v-for="utility in utilityRows"
						:key="utility.name"
						class="grid gap-2 border-b border-border px-4 py-3 last:border-b-0 md:grid-cols-[minmax(13rem,0.9fr)_1.5fr] md:gap-4"
					>
						<code class="text-foreground">{{ utility.name }}</code>
						<p class="leading-6 text-muted-foreground">{{ utility.description }}</p>
					</div>
				</div>
			</DocSection>

			<DocSection eyebrow="Data" title="Database-backed trees">
				<div class="space-y-4 text-sm leading-7 text-muted-foreground">
					<p>
						Database trees are usually normalized already: each row has an id, a parent id, and often a sort order. Keep that shape in your database and store. Derive the nested items only where the TreeView needs to render.
					</p>
					<p>
						When a drop happens, treat the TreeView event as an instruction. Update the moved row's parent id and sibling order in your store or API, then let the derived tree refresh. That keeps the visual component from owning persistence rules.
					</p>
				</div>
				<CodeBlock class="mt-5" :code="databaseCode" lang="js" />
			</DocSection>

			<DocSection title="Reference">
				<ComponentProps :component="ElTreeView" />
				<ComponentEvents :component="ElTreeView" />
				<ComponentKeyboard :component="ElTreeView" />
			</DocSection>
		</DocPage>
	</ElementsLayout>
</template>
