<script setup>
import { onMounted, ref, useId } from 'vue';

defineOptions({
	__doc: {
		name: 'Dropdown',
		tag: '<ElDropdown>',
		description: 'A menu that opens from a button — fully keyboard accessible, with focus return and outside-click handling.',
		slots: [
			{ name: 'trigger', description: 'Replaces the inner content of the trigger button.' },
			{ name: 'item', payload: '{ item, index }', description: 'Replaces the rendering of each menu item.' },
		],
		events: [
			{ name: 'select', payload: '(value: string)', description: 'Fired when a menu item is chosen.' },
		],
		keyboard: [
			{ keys: 'Enter / Space / ↓', action: 'Open menu (when trigger is focused).' },
			{ keys: '↑ / ↓', action: 'Move active item.' },
			{ keys: 'Home / End', action: 'Jump to first / last item.' },
			{ keys: 'Enter', action: 'Select active item.' },
			{ keys: 'Esc / Tab', action: 'Close menu and return focus.' },
		],
	},
});

const menuId = `el-dropdown-${useId()}`;

const props = defineProps({
	items: {
		type: Array,
		required: true,
		_edit: {
			component: 'ElListInput',
			description: 'Menu items shown when the dropdown opens.',
		},
	},
	label: {
		type: String,
		default: 'Options',
		_edit: { description: 'Trigger button label (overridden by the #trigger slot if used).' },
	},
	align: {
		type: String,
		default: 'left',
		_edit: {
			options: ['left', 'right'],
			description: 'Where the menu opens relative to the trigger.',
		},
	},
	placement: {
		type: String,
		default: 'bottom',
		_edit: {
			options: ['bottom', 'top', 'right', 'left'],
			description: 'Preferred side before collision handling.',
		},
	},
	collisionPadding: {
		type: Number,
		default: 8,
		_edit: { description: 'Viewport padding used when the menu flips or shifts.' },
	},
	floatingMode: {
		type: String,
		default: 'viewport',
		_edit: { options: ['viewport', 'anchor'], description: 'viewport keeps the menu inside the browser; anchor keeps it attached while scrolling.' },
	},
	width: {
		type: String,
		default: 'min-w-[12rem]',
		_edit: { description: 'Tailwind width utility for the menu (e.g. min-w-[16rem]).' },
	},
});
const emit = defineEmits(['select']);

const root = ref(null);
const isMounted = ref(false);

onMounted(async () => {
	isMounted.value = true;
	await import('../headless/dropdown.js');
	root.value?.addEventListener('el:select', (e) => emit('select', e.detail.value));
});

const labelOf = (item) => (item && typeof item === 'object' ? (item.label ?? item.value) : item);
const valueOf = (item) => (item && typeof item === 'object' ? (item.value ?? item.label) : item);
</script>

<template>
	<element-dropdown
		ref="root"
		:data-menu-id="menuId"
		:align="align"
		:offset="4"
		:placement="placement"
		:collision-padding="collisionPadding"
		:floating-mode="floatingMode"
		class="relative inline-block"
	>
		<button
			slot="trigger"
			type="button"
			class="inline-flex h-10 items-center gap-2 rounded-full bg-secondary px-4 text-sm font-medium text-foreground ring-1 ring-border transition hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
		>
			<slot name="trigger">{{ label }}</slot>
			<svg viewBox="0 0 20 20" class="size-4 opacity-70" fill="none">
				<path d="M6 8l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		</button>
		<Teleport to="body" :disabled="!isMounted">
			<div
				:id="menuId"
				class="el-dropdown-menu rounded-2xl border border-border bg-popover p-1 text-popover-foreground shadow-2xl shadow-black/10 ring-1 ring-border/60 dark:shadow-black/40"
				:class="width"
			>
				<template v-for="(item, i) in items" :key="valueOf(item) ?? i">
					<hr v-if="item && item.separator" class="my-1 border-t border-border" />
					<button
						v-else
						role="menuitem"
						:data-value="valueOf(item)"
						class="block w-full rounded-xl px-3 py-2 text-left text-sm outline-none transition hover:bg-accent focus:bg-accent"
					>
						<slot name="item" :item="item" :index="i">{{ labelOf(item) }}</slot>
					</button>
				</template>
			</div>
		</Teleport>
	</element-dropdown>
</template>
