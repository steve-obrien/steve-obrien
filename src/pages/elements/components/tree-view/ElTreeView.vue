<script setup>
import { computed, nextTick, ref, useId, watch } from 'vue';
import {
	flattenTreeItems,
	isSameOrDescendantPath,
	moveTreeItem,
	seedTreeOpenValues,
	treeItemCanAcceptChildren,
	treeItemChildren,
	treeItemHasChildren,
} from './treeUtils.js';

defineOptions({
	__doc: {
		name: 'Tree view',
		tag: '<ElTreeView>',
		description: 'A keyboard navigable hierarchical tree with selection, custom item rendering, lazy loading, and drag/drop reordering.',
		icon: 'M6 5h5v5H6V5Zm7 2h5M8.5 10v3M6 13h5v5H6v-5Zm7 2h5M8.5 18v1M6 21h5',
		slots: [
			{ name: 'item', payload: '{ item, node, depth, open, selected, loading }', description: 'Custom content inside the default tree row.' },
			{ name: 'row', payload: '{ item, node, depth, open, selected, loading, toggle, select }', description: 'Replace the full tree row while keeping tree structure, focus, and drag/drop wrapper.' },
			{ name: 'item.slot', payload: '{ item, node, depth, open, selected, loading }', description: 'Set item.slot to a named slot for special node rendering.' },
		],
		events: [
			{ name: 'update:modelValue', payload: '(value)', description: 'Emitted when the selected node changes.' },
			{ name: 'select', payload: '({ item, value, node })', description: 'Fired when a tree item is selected.' },
			{ name: 'action', payload: '({ action, item, value, node })', description: 'Fired when a right-side item action is clicked.' },
			{ name: 'toggle', payload: '({ item, value, open })', description: 'Fired when a branch is opened or closed.' },
			{ name: 'load-children', payload: '({ item, value })', description: 'Fired when a lazy node is opened and needs children.' },
			{ name: 'reorder', payload: '({ items, item, target, position })', description: 'Fired after drag/drop with a reordered items array.' },
			{ name: 'update:items', payload: '(items)', description: 'Emitted with the reordered tree so callers can sync v-model:items.' },
		],
		keyboard: [
			{ keys: '↑ / ↓', action: 'Move focus through visible items.' },
			{ keys: '→', action: 'Open a closed branch, otherwise move to the first child.' },
			{ keys: '←', action: 'Close an open branch, otherwise move to the parent.' },
			{ keys: 'Enter / Space', action: 'Select the focused item.' },
			{ keys: 'Home / End', action: 'Move to the first or last visible item.' },
			{ keys: 'Alt + ↑ / ↓', action: 'Move the focused item before or after a sibling when draggable is enabled.' },
		],
	},
});

const props = defineProps({
	modelValue: {
		type: [String, Number],
		default: '',
		_edit: { description: 'Selected node value. Update it programmatically to highlight a node from another part of the UI.' },
	},
	items: {
		type: Array,
		required: true,
		_edit: {
			component: 'ElJsonListInput',
			description: 'Nested tree items. Use children for branches, lazy for async loading, and acceptsChildren: false to lock drops into a node.',
			props: {
				compact: true,
				addLabel: '+ Add node',
				schema: [
					{ key: 'id', label: 'ID', placeholder: 'node-id', default: (index) => `node-${index + 1}` },
					{ key: 'label', label: 'Label', placeholder: 'Layer name', default: (index) => `Node ${index + 1}` },
					{ key: 'icon', label: 'Icon path', placeholder: 'SVG path data' },
					{ key: 'rightIcon', label: 'Right icon', placeholder: 'SVG path data' },
					{ key: 'open', label: 'Open', type: 'boolean', default: false },
					{ key: 'lazy', label: 'Lazy', type: 'boolean', default: false },
					{ key: 'acceptsChildren', label: 'Accept drops', type: 'boolean', default: true },
				],
			},
		},
	},
	openValues: {
		type: Array,
		default: () => [],
		_edit: { component: 'ElJsonInput', description: 'Controlled open branch values. When empty, item.open seeds the initial state.' },
	},
	draggable: {
		type: Boolean,
		default: true,
		_edit: { description: 'Allow nodes to be reordered by drag and drop.' },
	},
	scrollIntoView: {
		type: Boolean,
		default: true,
		_edit: { description: 'Scroll the selected node into view when modelValue changes programmatically.' },
	},
	density: {
		type: String,
		default: 'compact',
		_edit: { options: ['compact', 'comfortable'], description: 'Vertical spacing for tree rows.' },
	},
	toggleTransition: {
		type: Boolean,
		default: true,
		_edit: { description: 'Animate rows in and out when branches open and close.' },
	},
	variant: {
		type: String,
		default: 'default',
		_edit: { options: ['default', 'finder'], description: 'Visual treatment for the tree surface.' },
	},
	label: {
		type: String,
		default: 'Tree view',
		_edit: { description: 'Accessible name for the tree.' },
	},
});

const emit = defineEmits(['update:modelValue', 'update:items', 'update:openValues', 'select', 'action', 'toggle', 'load-children', 'reorder']);
const activeValue = ref(props.modelValue);
const openSet = ref(new Set(seedTreeOpenValues(props.items, props.openValues)));
const dropTarget = ref(null);
const draggedValue = ref(null);
const liveMessage = ref('');
const treeId = `el-tree-${useId()}`;
const rowRefs = new Map();

const treeItems = computed(() => props.items || []);
const visibleNodes = computed(() => flattenTreeItems(treeItems.value, openSet.value));
const selectedValue = computed(() => props.modelValue);

// Local open state lets the tree work without a store, while update:openValues
// still gives larger apps a clean controlled-state path.
watch(() => props.items, (items) => {
	openSet.value = new Set(seedTreeOpenValues(items, props.openValues, openSet.value));
	if (!activeValue.value && visibleNodes.value[0]) activeValue.value = visibleNodes.value[0].value;
}, { deep: true });

watch(() => props.openValues, (values) => {
	if (values?.length) openSet.value = new Set(values.map(String));
}, { deep: true });

watch(() => props.modelValue, (value) => {
	if (value === activeValue.value) return;
	activeValue.value = value;
	if (props.scrollIntoView) nextTick(() => scrollToNode(value));
});

function isLoading(item) {
	return Boolean(item?.loading);
}

function iconPath(item) {
	return item?.icon || defaultIconFor(item);
}

function defaultIconFor(item) {
	if (treeItemHasChildren(item)) return 'M4 6h6l2 2h8v10H4V6Z';
	return 'M6 4h8l4 4v12H6V4Zm8 0v5h5';
}

function slotNameOf(item) {
	return item?.slot || 'item';
}

function rowActions(item) {
	const actions = Array.isArray(item?.actions) ? item.actions : [];
	if (item?.rightIcon) {
		return [
			...actions,
			{ value: item.rightIconAction || 'right-icon', label: item.rightIconLabel || 'Item action', icon: item.rightIcon },
		];
	}
	return actions;
}

function setRowRef(value, element) {
	if (element) rowRefs.set(String(value), element);
	else rowRefs.delete(String(value));
}

/**
 * Focus a tree row by value.
 *
 * Useful when another surface, such as a design stage, wants to move keyboard
 * focus to the matching layer.
 *
 * @param {string|number} value
 * @param {boolean} shouldScroll
 */
function focusNode(value, shouldScroll = false) {
	if (value == null) return;
	activeValue.value = value;
	nextTick(() => {
		const row = rowRefs.get(String(value));
		row?.focus();
		if (shouldScroll) row?.scrollIntoView({ block: 'nearest' });
	});
}

/**
 * Scroll a tree row into view by value without changing selection.
 *
 * @param {string|number} value
 */
function scrollToNode(value) {
	nextTick(() => rowRefs.get(String(value))?.scrollIntoView({ block: 'nearest' }));
}

function selectNode(node) {
	if (node.item?.disabled) return;
	activeValue.value = node.value;
	emit('update:modelValue', node.value);
	emit('select', { item: node.item, value: node.value, node });
}

function onActionClick(action, node) {
	emit('action', {
		action,
		item: node.item,
		value: node.value,
		node,
	});
}

function toggleNode(node, forceOpen = null) {
	if (!node.expandable || node.item?.disabled) return;
	const key = String(node.value);
	const nextOpen = forceOpen ?? !openSet.value.has(key);
	const next = new Set(openSet.value);
	if (nextOpen) next.add(key);
	else next.delete(key);
	openSet.value = next;
	emit('update:openValues', [...next]);
	emit('toggle', { item: node.item, value: node.value, open: nextOpen });
	if (nextOpen && node.item?.lazy && !treeItemChildren(node.item).length) {
		emit('load-children', { item: node.item, value: node.value });
	}
}

function onRowKeydown(event, node) {
	const index = visibleNodes.value.findIndex((visible) => String(visible.value) === String(node.value));
	if (event.altKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
		reorderByKeyboard(event, node, event.key === 'ArrowUp' ? -1 : 1);
	} else if (event.key === 'ArrowDown') {
		event.preventDefault();
		focusNode(visibleNodes.value[Math.min(index + 1, visibleNodes.value.length - 1)]?.value, true);
	} else if (event.key === 'ArrowUp') {
		event.preventDefault();
		focusNode(visibleNodes.value[Math.max(index - 1, 0)]?.value, true);
	} else if (event.key === 'ArrowRight') {
		event.preventDefault();
		if (node.expandable && !node.open) toggleNode(node, true);
		else if (node.expandable) focusNode(visibleNodes.value[index + 1]?.value, true);
	} else if (event.key === 'ArrowLeft') {
		event.preventDefault();
		if (node.expandable && node.open) toggleNode(node, false);
		else if (node.parent) focusNode(node.parent.value, true);
	} else if (event.key === 'Home') {
		event.preventDefault();
		focusNode(visibleNodes.value[0]?.value, true);
	} else if (event.key === 'End') {
		event.preventDefault();
		focusNode(visibleNodes.value.at(-1)?.value, true);
	} else if (event.key === 'Enter' || event.key === ' ') {
		event.preventDefault();
		selectNode(node);
	}
}

function reorderByKeyboard(event, node, direction) {
	if (!dragAllowed(node)) return;
	const index = visibleNodes.value.findIndex((visible) => String(visible.value) === String(node.value));
	const target = visibleNodes.value[index + direction];
	if (!target) return;
	const position = direction < 0 ? 'before' : 'after';
	if (!canDrop(String(node.value), target, position)) return;
	event.preventDefault();
	const result = moveTreeItem(treeItems.value, node.value, target.value, position);
	if (!result) return;
	emit('update:items', result.items);
	emit('reorder', {
		items: result.items,
		item: result.item,
		target: target.item,
		position,
	});
	liveMessage.value = `Moved ${node.label} ${direction < 0 ? 'up' : 'down'}.`;
	nextTick(() => focusNode(node.value, true));
}

function dragAllowed(node) {
	return props.draggable && node.item?.draggable !== false && !node.item?.disabled;
}

function onDragStart(event, node) {
	if (!dragAllowed(node)) {
		event.preventDefault();
		return;
	}
	event.dataTransfer.effectAllowed = 'move';
	event.dataTransfer.setData('text/plain', String(node.value));
	draggedValue.value = String(node.value);
	dropTarget.value = null;
}

function onDragOver(event, node) {
	const sourceValue = draggedValue.value || event.dataTransfer?.getData('text/plain');
	if (!sourceValue || String(sourceValue) === String(node.value)) return;
	// The row is split into three drop zones: top = before, middle = child,
	// bottom = after. Locked/non-container nodes collapse this to before/after.
	const position = dropPositionFromEvent(event, node);
	if (!canDrop(sourceValue, node, position)) return;
	event.preventDefault();
	event.dataTransfer.dropEffect = 'move';
	dropTarget.value = { value: node.value, position };
}

function onDragLeave(event, node) {
	if (!event.currentTarget.contains(event.relatedTarget) && String(dropTarget.value?.value) === String(node.value)) {
		dropTarget.value = null;
	}
}

function onDrop(event, node) {
	const sourceValue = draggedValue.value || event.dataTransfer?.getData('text/plain');
	const target = dropTarget.value;
	dropTarget.value = null;
	draggedValue.value = null;
	if (!sourceValue || !target || String(target.value) !== String(node.value)) return;
	event.preventDefault();
	if (!canDrop(sourceValue, node, target.position)) return;
	const result = moveTreeItem(treeItems.value, sourceValue, node.value, target.position);
	if (!result) return;
	if (target.position === 'inside') toggleNode(node, true);
	emit('update:items', result.items);
	emit('reorder', {
		items: result.items,
		item: result.item,
		target: node.item,
		position: target.position,
	});
}

function dropPositionFromEvent(event, node) {
	if (treeItemCanAcceptChildren(node.item)) {
		const rect = event.currentTarget.getBoundingClientRect();
		const y = event.clientY - rect.top;
		if (y < rect.height * 0.25) return 'before';
		if (y > rect.height * 0.75) return 'after';
		return 'inside';
	}
	const rect = event.currentTarget.getBoundingClientRect();
	return event.clientY - rect.top < rect.height / 2 ? 'before' : 'after';
}

function canDrop(sourceValue, targetNode, position) {
	if (position === 'inside' && !treeItemCanAcceptChildren(targetNode.item)) return false;
	const source = visibleNodes.value.find((node) => String(node.value) === String(sourceValue));
	if (!source) return false;
	return !isSameOrDescendantPath(targetNode.path, source.path);
}

function dropClass(node, position) {
	if (String(dropTarget.value?.value) !== String(node.value)) return '';
	if (dropTarget.value.position !== position) return '';
	return position === 'inside'
		? 'bg-accent ring-1 ring-ring/40'
		: 'after:opacity-100';
}

defineExpose({
	focusNode,
	scrollToNode,
});
</script>

<template>
	<div
		role="tree"
		:id="treeId"
		class="w-full rounded-2xl border border-border p-1 text-sm text-foreground shadow-sm"
		:class="variant === 'finder' ? 'bg-secondary/50 backdrop-blur' : 'bg-background'"
		:aria-label="label"
		:aria-describedby="draggable ? `${treeId}-instructions` : undefined"
	>
		<p v-if="draggable" :id="`${treeId}-instructions`" class="sr-only">Use Alt plus Up or Down arrow to reorder the focused tree item.</p>
		<p class="sr-only" aria-live="polite">{{ liveMessage }}</p>
		<TransitionGroup
			:name="toggleTransition ? 'el-tree-slide' : null"
			tag="div"
			class="contents"
		>
			<div
				v-for="node in visibleNodes"
				:key="node.value"
				:ref="(element) => setRowRef(node.value, element)"
				role="treeitem"
				:aria-level="node.depth"
				:aria-expanded="node.expandable ? String(node.open) : null"
				:aria-selected="String(String(selectedValue) === String(node.value))"
				:aria-disabled="node.item?.disabled ? 'true' : null"
				:tabindex="String(activeValue) === String(node.value) || (!activeValue && visibleNodes[0]?.value === node.value) ? 0 : -1"
				:aria-keyshortcuts="draggable ? 'Alt+ArrowUp Alt+ArrowDown' : null"
				:draggable="dragAllowed(node)"
				class="group relative flex min-w-0 cursor-pointer items-center rounded-xl outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50 aria-selected:bg-primary aria-selected:text-primary-foreground"
				:class="[
					density === 'comfortable' ? 'min-h-10' : 'min-h-8',
					variant === 'finder' ? 'hover:bg-background/80 aria-selected:bg-accent aria-selected:text-accent-foreground' : 'hover:bg-secondary',
					dropClass(node, 'inside'),
					dropTarget?.value === node.value && dropTarget.position === 'before' ? 'before:opacity-100' : '',
					dropTarget?.value === node.value && dropTarget.position === 'after' ? 'after:opacity-100' : '',
					'before:pointer-events-none before:absolute before:inset-x-2 before:top-0 before:h-0.5 before:rounded-full before:bg-ring before:opacity-0 after:pointer-events-none after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-ring after:opacity-0',
				]"
				:style="{ paddingLeft: `${(node.depth - 1) * 1.25}rem` }"
				@click="selectNode(node)"
				@keydown="onRowKeydown($event, node)"
				@dragstart="onDragStart($event, node)"
				@dragover="onDragOver($event, node)"
				@dragleave="onDragLeave($event, node)"
				@drop="onDrop($event, node)"
				@dragend="draggedValue = null; dropTarget = null"
				@focus="activeValue = node.value"
			>
				<slot
					name="row"
					:item="node.item"
					:node="node"
					:depth="node.depth"
					:open="node.open"
					:selected="String(selectedValue) === String(node.value)"
					:loading="node.loading"
					:toggle="() => toggleNode(node)"
					:select="() => selectNode(node)"
				>
					<button
						v-if="node.expandable"
						type="button"
						class="grid size-7 shrink-0 cursor-pointer place-items-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground group-aria-selected:text-primary-foreground/80"
						:tabindex="-1"
						:aria-label="node.open ? 'Collapse item' : 'Expand item'"
						@click.stop="toggleNode(node)"
					>
						<svg v-if="node.loading" viewBox="0 0 20 20" class="size-4 animate-spin" fill="none">
							<circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="2" opacity=".25" />
							<path d="M17 10a7 7 0 0 0-7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
						</svg>
						<svg v-else viewBox="0 0 20 20" class="size-4 transition" :class="node.open && 'rotate-90'" fill="none">
							<path d="M8 5l5 5-5 5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					</button>
					<span v-else class="size-7 shrink-0" aria-hidden="true"></span>
					<span class="grid size-6 shrink-0 place-items-center text-muted-foreground group-aria-selected:text-primary-foreground/80">
						<svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">
							<path :d="iconPath(node.item)" />
						</svg>
					</span>
					<span class="min-w-0 flex-1 truncate px-1 py-1.5">
						<slot :name="slotNameOf(node.item)" :item="node.item" :node="node" :depth="node.depth" :open="node.open" :selected="String(selectedValue) === String(node.value)" :loading="node.loading">
							{{ node.label }}
						</slot>
					</span>
					<span v-if="rowActions(node.item).length" class="mr-1 flex shrink-0 items-center gap-0.5 opacity-80 transition group-hover:opacity-100 group-focus-within:opacity-100">
						<button
							v-for="action in rowActions(node.item)"
							:key="action.value || action.label"
							type="button"
							class="grid size-6 cursor-pointer place-items-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 group-aria-selected:text-primary-foreground/80 group-aria-selected:hover:bg-primary-foreground/15"
							:aria-label="action.label || action.value || 'Tree item action'"
							:title="action.label || action.value || 'Tree item action'"
							:disabled="action.disabled || undefined"
							@click.stop="onActionClick(action, node)"
							@mousedown.stop
						>
							<svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
								<path :d="action.icon" />
							</svg>
						</button>
					</span>
				</slot>
			</div>
		</TransitionGroup>
	</div>
</template>

<style>
.el-tree-slide-enter-active,
.el-tree-slide-leave-active {
	overflow: hidden;
	min-height: 0 !important;
	transition:
		max-height 260ms cubic-bezier(0.32, 0.72, 0, 1),
		opacity 180ms ease,
		transform 260ms cubic-bezier(0.32, 0.72, 0, 1);
}

.el-tree-slide-move {
	transition: transform 260ms cubic-bezier(0.32, 0.72, 0, 1);
}

.el-tree-slide-enter-from,
.el-tree-slide-leave-to {
	max-height: 0;
	opacity: 0;
	transform: translateY(-0.35rem);
}

.el-tree-slide-enter-to,
.el-tree-slide-leave-from {
	max-height: 2.75rem;
	opacity: 1;
	transform: translateY(0);
}
</style>
