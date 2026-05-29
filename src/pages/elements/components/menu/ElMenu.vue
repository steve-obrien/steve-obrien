<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { positionPopoverPanel } from '../../lib/headless/popover-panel.js';
import { provideMenuContext, useParentMenuContext } from './menuContext.js';

defineOptions({
	__doc: {
		name: 'Menu',
		tag: '<ElMenu>',
		description: 'A roving-focus action menu for command lists, settings menus, and static menu panels.',
		slots: [
			{ name: '(default)', description: 'Custom <MenuItem> rows when you want markup-driven menus instead of the items prop.' },
			{ name: 'item', payload: '{ item, index, value, label, checked, open, hasChildren }', description: 'Custom label/body content inside the default menu row.' },
			{ name: 'item-row', payload: '{ item, index, value, label, checked, open, hasChildren }', description: 'Replace the full inner row markup while ElMenu keeps the interactive wrapper.' },
			{ name: 'item.slot', payload: '{ item, index, value, label, checked, open, hasChildren }', description: 'Set item.slot to a named slot for per-item row markup.' },
		],
		events: [
			{ name: 'select', payload: '({ value, item })', description: 'Fired when an item is selected.' },
			{ name: 'change', payload: '({ value, checked, item })', description: 'Fired when a checkbox or radio item changes.' },
		],
	},
});

const props = defineProps({
	items: {
		type: Array,
		default: null,
		_edit: { component: 'ElJsonListInput', description: 'Menu rows. Use separator: true for dividers.', props: { compact: true } },
	},
	orientation: {
		type: String,
		default: 'vertical',
		_edit: { options: ['vertical', 'horizontal'], description: 'Arrow key direction.' },
	},
	surface: {
		type: Boolean,
		default: true,
		_edit: { description: 'Render menu as a bordered surface. Disable when embedding inside a popover or dropdown.' },
	},
});
const emit = defineEmits(['select', 'change']);
const root = ref(null);
const openPath = ref('');
const submenuPanel = ref(null);
const submenuTrigger = ref(null);
const parentMenu = useParentMenuContext();
const hasItemPropRows = computed(() => Array.isArray(props.items) && props.items.length > 0);
let parentPopover = null;
let parentPopoverToggleOff = null;
let closeTimer = null;
const submenuCloseDelay = 650;

provideMenuContext({
	select(event) {
		emit('select', event);
		parentMenu?.select?.(event);
	},
	change(event) {
		emit('change', event);
		parentMenu?.change?.(event);
	},
});

onMounted(async () => {
	await import('../../lib/headless/menu.js');
	root.value?.addEventListener('el:select', (event) => emitSelect({
		value: event.detail.value,
		item: itemForValue(event.detail.value),
	}));
	root.value?.addEventListener('el:change', (event) => emitChange({
		value: event.detail.value,
		checked: event.detail.checked,
		item: itemForValue(event.detail.value),
	}));
	root.value?.addEventListener('el:submenu', (event) => {
		if (!hasItemPropRows.value) return;
		openSubmenu(event.detail.value, event.detail.item, true);
	});
	parentPopover = root.value?.closest?.('[popover]');
	if (parentPopover) {
		parentPopoverToggleOff = (event) => {
			if (event.newState === 'closed') closeActiveSubmenu(false);
		};
		parentPopover.addEventListener('toggle', parentPopoverToggleOff);
	}
});

const labelOf = (item) => (item && typeof item === 'object' ? (item.label ?? item.value) : item);
const valueOf = (item) => String(item && typeof item === 'object' ? (item.value ?? item.label) : item);
const hasChildren = (item) => Array.isArray(item?.children) && item.children.length > 0;
const itemTag = (item) => item?.as || (item?.href ? 'a' : 'button');
const slotNameOf = (item) => item?.slot || 'item-row';
const slotProps = (item, index) => {
	const value = valueOf(item);
	return {
		item,
		index,
		value,
		label: labelOf(item),
		checked: Boolean(item?.checked),
		open: openPath.value === value,
		hasChildren: hasChildren(item),
	};
};
const roleOf = (item) => {
	if (hasChildren(item)) return 'menuitem';
	if (item?.type === 'checkbox') return 'menuitemcheckbox';
	if (item?.type === 'radio') return 'menuitemradio';
	return 'menuitem';
};

function itemForValue(value) {
	return props.items?.find?.((item) => valueOf(item) === value) || null;
}

function emitSelect(event) {
	emit('select', event);
	parentMenu?.select?.(event);
}

function emitChange(event) {
	emit('change', event);
	parentMenu?.change?.(event);
}

function activeChildItems() {
	return props.items?.find?.((item) => valueOf(item) === openPath.value)?.children || [];
}

function submenuOptions() {
	return {
		placement: 'right',
		align: 'start',
		offset: 4,
		padding: 8,
		mode: 'viewport',
		flip: true,
	};
}

function placeSubmenu() {
	if (!submenuPanel.value || !submenuTrigger.value) return;
	positionPopoverPanel(submenuPanel.value, submenuTrigger.value, submenuOptions());
}

function openSubmenu(value, trigger = null, focusFirst = false) {
	cancelSubmenuClose();
	openPath.value = value;
	if (trigger) submenuTrigger.value = trigger;
	nextTick(() => {
		if (!submenuTrigger.value) {
			submenuTrigger.value = root.value?.querySelector(`[data-value="${CSS.escape(value)}"]`);
		}
		placeSubmenu();
		if (focusFirst) submenuPanel.value?.querySelector('[role="menuitem"]')?.focus();
	});
}

function closeSubmenu(value, focusBack = true) {
	cancelSubmenuClose();
	if (openPath.value === value) openPath.value = '';
	if (focusBack) root.value?.querySelector(`[data-value="${CSS.escape(value)}"]`)?.focus();
}

function closeActiveSubmenu(focusBack = true) {
	if (!openPath.value) return;
	closeSubmenu(openPath.value, focusBack);
}

function cancelSubmenuClose() {
	if (!closeTimer) return;
	clearTimeout(closeTimer);
	closeTimer = null;
}

function scheduleCloseSubmenu(value, focusBack = false) {
	cancelSubmenuClose();
	closeTimer = setTimeout(() => closeSubmenu(value, focusBack), submenuCloseDelay);
}

function isSubmenuSafeTarget(target) {
	if (!(target instanceof Element)) return false;
	return Boolean(target.closest('[data-el-menu-submenu-panel]'));
}

function maybeCloseSubmenu(event, value) {
	if (submenuPanel.value?.contains(event.relatedTarget) || isSubmenuSafeTarget(event.relatedTarget)) return;
	scheduleCloseSubmenu(value, false);
}

function maybeCloseSubmenuPanel(event) {
	if (!openPath.value) return;
	if (submenuTrigger.value?.contains(event.relatedTarget) || isSubmenuSafeTarget(event.relatedTarget)) return;
	scheduleCloseSubmenu(openPath.value, false);
}

function onItemKeydown(event, item) {
	if (!hasChildren(item)) return;
	const value = valueOf(item);
	if (event.key === 'ArrowRight' || event.key === 'Enter' || event.key === ' ') {
		event.preventDefault();
		openSubmenu(value, event.currentTarget, true);
	}
}

function onSubmenuKeydown(event, item) {
	if (event.key !== 'ArrowLeft' && event.key !== 'Escape') return;
	event.preventDefault();
	closeSubmenu(valueOf(item));
}

function onSelect(event) {
	openPath.value = '';
}

function onChange() {
	// Nested ElMenu instances propagate change through menuContext.
}

function setSubmenuPanel(element) {
	submenuPanel.value = element;
	if (!element) return;
	nextTick(placeSubmenu);
}

function focusableAttrs(item) {
	const tag = itemTag(item);
	return {
		type: tag === 'button' ? 'button' : null,
		href: tag === 'a' && !item?.disabled ? item?.href : null,
		tabindex: tag === 'a' && item?.disabled ? -1 : null,
	};
}

onBeforeUnmount(() => {
	cancelSubmenuClose();
	parentPopover?.removeEventListener('toggle', parentPopoverToggleOff);
	closeActiveSubmenu(false);
});
</script>

<template>
	<element-menu
		ref="root"
		:orientation="orientation"
		class="block w-full"
		:class="surface ? 'el-glass-surface rounded-2xl p-1 shadow-sm' : ''"
	>
		<slot v-if="!hasItemPropRows" />
		<template v-for="(item, index) in items" v-else :key="valueOf(item) || index">
			<hr v-if="item && item.separator" class="my-1 border-t border-border" />
			<div
				v-else
				class="relative"
				@mouseenter="hasChildren(item) && openSubmenu(valueOf(item), $event.currentTarget.querySelector('[role=menuitem]'))"
				@mouseleave="hasChildren(item) && maybeCloseSubmenu($event, valueOf(item))"
			>
				<component
					:is="itemTag(item)"
					v-bind="focusableAttrs(item)"
					:role="roleOf(item)"
					:data-value="valueOf(item)"
					:aria-haspopup="hasChildren(item) ? 'menu' : null"
					:aria-expanded="hasChildren(item) ? String(openPath === valueOf(item)) : null"
					:aria-checked="item?.checked == null ? null : String(item.checked)"
					:aria-disabled="item?.disabled ? 'true' : null"
					:disabled="item?.disabled || null"
					class="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm text-foreground outline-none transition hover:bg-secondary focus:bg-secondary aria-disabled:cursor-not-allowed aria-disabled:opacity-50 data-[tone=danger]:text-destructive"
					:data-tone="item?.tone || null"
					@keydown="onItemKeydown($event, item)"
				>
					<slot :name="slotNameOf(item)" v-bind="slotProps(item, index)">
						<span class="min-w-0">
							<slot name="item" v-bind="slotProps(item, index)">{{ labelOf(item) }}</slot>
						</span>
						<span v-if="hasChildren(item)" aria-hidden="true" class="text-xs text-muted-foreground">›</span>
						<span
							v-else-if="item?.type === 'checkbox' || item?.type === 'radio'"
							aria-hidden="true"
							class="text-xs text-muted-foreground transition"
							:class="item?.checked ? 'opacity-100' : 'opacity-0'"
						>✓</span>
					</slot>
				</component>
			</div>
		</template>
	</element-menu>

	<Teleport to="body">
		<div
			v-if="openPath"
			:ref="setSubmenuPanel"
			data-el-menu-submenu-panel
			class="el-popover-panel el-glass-surface fixed z-50 min-w-40 rounded-2xl p-1 outline-none"
			@keydown="onSubmenuKeydown($event, { value: openPath })"
			@mouseenter="cancelSubmenuClose"
			@mouseleave="maybeCloseSubmenuPanel"
		>
			<ElMenu :items="activeChildItems()" :surface="false" @select="onSelect" @change="onChange">
				<template v-for="(_, slotName) in $slots" #[slotName]="childSlotProps">
					<slot :name="slotName" v-bind="childSlotProps" />
				</template>
			</ElMenu>
		</div>
	</Teleport>
</template>
