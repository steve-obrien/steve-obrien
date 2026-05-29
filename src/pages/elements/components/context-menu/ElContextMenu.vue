<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, useId } from 'vue';
import { lockDocumentScroll, unlockDocumentScroll } from '../../lib/headless/popover-panel.js';
import ElMenu from '../menu/ElMenu.vue';

defineOptions({
	__doc: {
		name: 'Context menu',
		tag: '<ElContextMenu>',
		description: 'A right-click menu surface built on ElMenu, with popover top-layer placement and keyboard navigation.',
		slots: [
			{ name: '(default)', description: 'The area that opens the context menu on right click.' },
			{ name: 'item', payload: '{ item, index, value, label, checked, open, hasChildren }', description: 'Custom label/body content inside the default menu row.' },
			{ name: 'item-row', payload: '{ item, index, value, label, checked, open, hasChildren }', description: 'Replace the full inner row markup while ElMenu keeps the interactive wrapper.' },
		],
		events: [
			{ name: 'select', payload: '({ value, item })', description: 'Fired when a menu item is selected.' },
		],
	},
});

const props = defineProps({
	items: {
		type: Array,
		required: true,
		_edit: {
			component: 'ElJsonListInput',
			description: 'Context menu rows. Use children for nested menus.',
			props: { compact: true },
		},
	},
	width: {
		type: String,
		default: 'min-w-48',
		_edit: { description: 'Tailwind width utility for the menu panel.' },
	},
	lockScroll: {
		type: Boolean,
		default: true,
		_edit: { description: 'Lock browser scrolling while the context menu is open.' },
	},
});
const emit = defineEmits(['select']);

const panelId = `el-context-menu-${useId()}`;
const trigger = ref(null);
const panel = ref(null);
let scrollLocked = false;

function lockScroll() {
	if (!props.lockScroll || scrollLocked) return;
	lockDocumentScroll(panel.value);
	scrollLocked = true;
}

function unlockScroll() {
	if (!scrollLocked) return;
	unlockDocumentScroll(panel.value);
	scrollLocked = false;
}

function open(event) {
	event.preventDefault();
	if (!panel.value) return;
	panel.value.style.left = `${event.clientX}px`;
	panel.value.style.top = `${event.clientY}px`;
	if (!panel.value.matches?.(':popover-open')) {
		panel.value.showPopover?.();
	}
	lockScroll();
	nextTick(() => {
		panel.value?.querySelector('[role="menuitem"]')?.focus();
	});
}

function isOpen() {
	return panel.value?.matches?.(':popover-open');
}

function isInside(event) {
	const path = event.composedPath?.() || [];
	return path.includes(panel.value) || path.includes(trigger.value);
}

function onDocumentPointerDown(event) {
	if (!isOpen() || isInside(event)) return;
	close();
}

function onDocumentContextMenu(event) {
	if (!isOpen() || isInside(event)) return;
	close();
}

function onWindowBlur() {
	if (!isOpen()) return;
	close();
}

function close() {
	panel.value?.hidePopover?.();
	unlockScroll();
}

function onSelect(event) {
	emit('select', event);
	close();
}

function onKeydown(event) {
	if (event.key !== 'Escape') return;
	event.preventDefault();
	close();
}

onMounted(() => {
	panel.value?.addEventListener('keydown', onKeydown);
	document.addEventListener('pointerdown', onDocumentPointerDown, true);
	document.addEventListener('contextmenu', onDocumentContextMenu, true);
	window.addEventListener('blur', onWindowBlur);
});

onBeforeUnmount(() => {
	panel.value?.removeEventListener('keydown', onKeydown);
	document.removeEventListener('pointerdown', onDocumentPointerDown, true);
	document.removeEventListener('contextmenu', onDocumentContextMenu, true);
	window.removeEventListener('blur', onWindowBlur);
	unlockScroll();
});
</script>

<template>
	<div ref="trigger" class="contents" @contextmenu="open">
		<slot />
	</div>
	<Teleport to="body">
		<div
			:id="panelId"
			ref="panel"
			popover="manual"
			class="el-popover-panel el-glass-surface fixed rounded-2xl p-1 outline-none"
			:class="width"
		>
			<ElMenu :items="items" :surface="false" @select="onSelect">
				<template v-for="(_, slotName) in $slots" #[slotName]="slotProps">
					<slot :name="slotName" v-bind="slotProps" />
				</template>
			</ElMenu>
		</div>
	</Teleport>
</template>
