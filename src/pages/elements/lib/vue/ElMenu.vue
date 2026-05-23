<script setup>
import { onMounted, ref } from 'vue';

defineOptions({
	__doc: {
		name: 'Menu',
		tag: '<ElMenu>',
		description: 'A roving-focus action menu for command lists, settings menus, and static menu panels.',
		slots: [{ name: 'item', payload: '{ item, index }', description: 'Custom menu item markup.' }],
		events: [
			{ name: 'select', payload: '({ value, item })', description: 'Fired when an item is selected.' },
			{ name: 'change', payload: '({ value, checked, item })', description: 'Fired when a checkbox or radio item changes.' },
		],
	},
});

const props = defineProps({
	items: {
		type: Array,
		required: true,
		_edit: { component: 'ElJsonListInput', description: 'Menu rows. Use separator: true for dividers.' },
	},
	orientation: {
		type: String,
		default: 'vertical',
		_edit: { options: ['vertical', 'horizontal'], description: 'Arrow key direction.' },
	},
});
const emit = defineEmits(['select', 'change']);
const root = ref(null);

onMounted(async () => {
	await import('../headless/menu.js');
	root.value?.addEventListener('el:select', (event) => emit('select', {
		value: event.detail.value,
		item: props.items.find((item) => valueOf(item) === event.detail.value) || null,
	}));
	root.value?.addEventListener('el:change', (event) => emit('change', {
		value: event.detail.value,
		checked: event.detail.checked,
		item: props.items.find((item) => valueOf(item) === event.detail.value) || null,
	}));
});

const labelOf = (item) => (item && typeof item === 'object' ? (item.label ?? item.value) : item);
const valueOf = (item) => String(item && typeof item === 'object' ? (item.value ?? item.label) : item);
const roleOf = (item) => {
	if (item?.type === 'checkbox') return 'menuitemcheckbox';
	if (item?.type === 'radio') return 'menuitemradio';
	return 'menuitem';
};
</script>

<template>
	<element-menu
		ref="root"
		:orientation="orientation"
		class="block rounded-2xl border border-border bg-background p-1 shadow-sm"
	>
		<template v-for="(item, index) in items" :key="valueOf(item) || index">
			<hr v-if="item && item.separator" class="my-1 border-t border-border" />
			<button
				v-else
				:role="roleOf(item)"
				:data-value="valueOf(item)"
				:aria-checked="item?.checked == null ? null : String(item.checked)"
				:aria-disabled="item?.disabled ? 'true' : null"
				:disabled="item?.disabled || null"
				class="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm text-foreground outline-none transition hover:bg-secondary focus:bg-secondary aria-disabled:cursor-not-allowed aria-disabled:opacity-50 data-[tone=danger]:text-destructive"
				:data-tone="item?.tone || null"
			>
				<span class="min-w-0">
					<slot name="item" :item="item" :index="index">{{ labelOf(item) }}</slot>
				</span>
				<span v-if="item?.type === 'checkbox' || item?.type === 'radio'" aria-hidden="true" class="text-xs text-muted-foreground">✓</span>
			</button>
		</template>
	</element-menu>
</template>
