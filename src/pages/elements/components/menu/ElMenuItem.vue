<script setup>
import { computed, nextTick, onBeforeUnmount, ref, useSlots } from 'vue';
import ElMenu from './ElMenu.vue';
import { positionSubmenuPanel } from './menuPlacement.js';

defineOptions({
	name: 'ElMenuItem',
	__doc: {
		name: 'Menu item',
		tag: '<MenuItem>',
		description: 'Markup-driven menu row for ElMenu, including optional submenu content through the submenu slot.',
		slots: [
			{ name: '(default)', description: 'Custom row markup.' },
			{ name: 'submenu', description: 'Nested <MenuItem> rows shown as a submenu.' },
		],
	},
});

const props = defineProps({
	value: {
		type: [String, Number],
		required: true,
	},
	as: {
		type: String,
		default: 'button',
	},
	href: {
		type: String,
		default: null,
	},
	type: {
		type: String,
		default: 'item',
		validator: (value) => ['item', 'checkbox', 'radio'].includes(value),
	},
	checked: {
		type: Boolean,
		default: null,
	},
	disabled: {
		type: Boolean,
		default: false,
	},
	tone: {
		type: String,
		default: null,
	},
});

const slots = useSlots();
const open = ref(false);
const trigger = ref(null);
const submenuPanel = ref(null);
const hasSubmenu = computed(() => Boolean(slots.submenu));
let closeTimer = null;
const submenuCloseDelay = 650;

const tag = computed(() => props.href ? 'a' : props.as);
const role = computed(() => {
	if (hasSubmenu.value) return 'menuitem';
	if (props.type === 'checkbox') return 'menuitemcheckbox';
	if (props.type === 'radio') return 'menuitemradio';
	return 'menuitem';
});

const focusableAttrs = computed(() => ({
	type: tag.value === 'button' ? 'button' : null,
	href: tag.value === 'a' && !props.disabled ? props.href : null,
	tabindex: tag.value === 'a' && props.disabled ? -1 : null,
}));

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
	if (!submenuPanel.value || !trigger.value) return;
	positionSubmenuPanel(submenuPanel.value, trigger.value, submenuOptions());
}

function openSubmenu(focusFirst = false) {
	if (!hasSubmenu.value || props.disabled) return;
	cancelSubmenuClose();
	open.value = true;
	nextTick(() => {
		placeSubmenu();
		if (focusFirst) submenuPanel.value?.querySelector('[role="menuitem"]')?.focus();
	});
}

function closeSubmenu(focusBack = false) {
	cancelSubmenuClose();
	open.value = false;
	if (focusBack) trigger.value?.focus();
}

function cancelSubmenuClose() {
	if (!closeTimer) return;
	clearTimeout(closeTimer);
	closeTimer = null;
}

function scheduleCloseSubmenu(focusBack = false) {
	cancelSubmenuClose();
	closeTimer = setTimeout(() => closeSubmenu(focusBack), submenuCloseDelay);
}

function isSubmenuSafeTarget(target) {
	if (!(target instanceof Element)) return false;
	return Boolean(target.closest('[data-el-menu-submenu-panel]'));
}

function maybeCloseSubmenu(event) {
	if (submenuPanel.value?.contains(event.relatedTarget) || isSubmenuSafeTarget(event.relatedTarget)) return;
	scheduleCloseSubmenu(false);
}

function maybeCloseSubmenuPanel(event) {
	if (trigger.value?.contains(event.relatedTarget) || isSubmenuSafeTarget(event.relatedTarget)) return;
	scheduleCloseSubmenu(false);
}

function setSubmenuPanel(element) {
	submenuPanel.value = element;
	if (!element) return;
	nextTick(placeSubmenu);
}

function onKeydown(event) {
	if (!hasSubmenu.value) return;
	if (event.key === 'ArrowRight' || event.key === 'Enter' || event.key === ' ') {
		event.preventDefault();
		event.stopPropagation();
		openSubmenu(true);
	}
}

function onClick() {
	openSubmenu(true);
}

function onSubmenuKeydown(event) {
	if (event.key !== 'ArrowLeft' && event.key !== 'Escape') return;
	event.preventDefault();
	closeSubmenu(true);
}

function onNestedSelect() {
	closeSubmenu(false);
}

onBeforeUnmount(() => {
	cancelSubmenuClose();
	closeSubmenu(false);
});
</script>

<template>
	<div
		class="relative"
		@mouseenter="openSubmenu(false)"
		@mouseleave="maybeCloseSubmenu"
	>
		<component
			:is="tag"
			ref="trigger"
			v-bind="focusableAttrs"
			:role="role"
			:data-value="String(value)"
			:data-custom-submenu="hasSubmenu ? 'true' : null"
			:aria-haspopup="hasSubmenu ? 'menu' : null"
			:aria-expanded="hasSubmenu ? String(open) : null"
			:aria-checked="checked == null ? null : String(checked)"
			:aria-disabled="disabled ? 'true' : null"
			:disabled="disabled || null"
			class="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm text-foreground outline-none transition hover:bg-secondary focus:bg-secondary aria-disabled:cursor-not-allowed aria-disabled:opacity-50 data-[tone=danger]:text-destructive"
			:data-tone="tone"
			@click="onClick"
			@keydown="onKeydown"
		>
			<slot />
			<span v-if="hasSubmenu" aria-hidden="true" class="text-xs text-muted-foreground">›</span>
		</component>
	</div>

	<div
		v-if="open"
		:ref="setSubmenuPanel"
		data-el-menu-submenu-panel
		class="el-popover-panel el-glass-surface absolute z-50 min-w-48 rounded-2xl p-1 outline-none"
		@keydown="onSubmenuKeydown"
		@mouseenter="cancelSubmenuClose"
		@mouseleave="maybeCloseSubmenuPanel"
	>
		<ElMenu :surface="false" @select="onNestedSelect" @change="onNestedSelect">
			<slot name="submenu" />
		</ElMenu>
	</div>
</template>
