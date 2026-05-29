<script setup>
import { ref } from 'vue';
import { ElTreeView } from '../../../lib/vue';

const frameIcon = 'M4 5h16v14H4V5Zm4 0v14M4 9h16';
const groupIcon = 'M4 6h6l2 2h8v10H4V6Z';
const rectIcon = 'M5 6h14v12H5V6Z';
const textIcon = 'M5 7h14M12 7v10M8 17h8';
const lockIcon = 'M8 11V8a4 4 0 0 1 8 0v3M7 11h10v8H7v-8Z';
const eyeIcon = 'M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z';
const eyeOffIcon = 'M3 3l18 18M10.6 10.6A2 2 0 0 0 13.4 13.4M9.9 5.2A9.8 9.8 0 0 1 12 5c6 0 10 7 10 7a16.2 16.2 0 0 1-3.1 3.9M6.5 6.5C3.8 8.2 2 12 2 12s4 7 10 7c1.4 0 2.7-.4 3.8-1';

const selected = ref('hero-title');
const tree = ref([
	{
		id: 'page',
		label: 'Landing page',
		icon: frameIcon,
		open: true,
		children: [
			{
				id: 'hero',
				label: 'Hero',
				icon: groupIcon,
				open: true,
				children: [
					{
						id: 'hero-title',
						label: 'Headline',
						icon: textIcon,
						visible: true,
						actions: [{ value: 'visibility', label: 'Toggle visibility', icon: eyeIcon }],
					},
					{ id: 'hero-card', label: 'Feature card', icon: rectIcon },
				],
			},
			{
				id: 'locked-nav',
				label: 'Locked nav',
				icon: groupIcon,
				actions: [{ value: 'locked', label: 'Locked subtree', icon: lockIcon, disabled: true }],
				acceptsChildren: false,
				children: [
					{ id: 'logo', label: 'Logo', icon: rectIcon },
				],
			},
		],
	},
]);

function selectFromStage(id) {
	selected.value = id;
}

function updateNode(nodes, id, callback) {
	for (const node of nodes) {
		if (node.id === id) {
			callback(node);
			return true;
		}
		if (Array.isArray(node.children) && updateNode(node.children, id, callback)) return true;
	}
	return false;
}

function onAction({ action, item }) {
	if (action.value !== 'visibility') return;
	updateNode(tree.value, item.id, (node) => {
		node.visible = !node.visible;
		node.actions = [{ value: 'visibility', label: 'Toggle visibility', icon: node.visible ? eyeIcon : eyeOffIcon }];
	});
}
</script>

<template>
	<div class="grid w-full gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
		<ElTreeView
			v-model="selected"
			v-model:items="tree"
			@reorder="tree = $event.items"
			@action="onAction"
		>
			<template #item="{ item }">
				<span class="flex min-w-0 items-center gap-2">
					<span class="truncate">{{ item.label }}</span>
					<span v-if="item.acceptsChildren === false" class="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground group-aria-selected:bg-primary-foreground/15 group-aria-selected:text-primary-foreground/80">
						locked
					</span>
				</span>
			</template>
		</ElTreeView>

		<div class="rounded-2xl border border-border bg-secondary/40 p-4">
			<div class="mb-3 flex items-center justify-between">
				<p class="text-sm font-medium text-foreground">Stage</p>
				<p class="text-xs text-muted-foreground">Selected: <code>{{ selected }}</code></p>
			</div>
			<div class="space-y-3 rounded-xl border border-border bg-background p-4">
				<div class="w-full rounded-xl border border-border p-4 text-left transition hover:border-ring" :class="selected === 'hero' && 'ring-2 ring-ring/40'" @click="selectFromStage('hero')">
					<p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Hero group</p>
					<button type="button" class="mt-3 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground" :class="selected === 'hero-title' && 'ring-2 ring-ring/50'" @click.stop="selectFromStage('hero-title')">Headline layer</button>
				</div>
				<button type="button" class="rounded-xl border border-border bg-card p-4 text-sm transition hover:border-ring" :class="selected === 'hero-card' && 'ring-2 ring-ring/40'" @click="selectFromStage('hero-card')">
					Feature card layer
				</button>
			</div>
		</div>
	</div>
</template>
