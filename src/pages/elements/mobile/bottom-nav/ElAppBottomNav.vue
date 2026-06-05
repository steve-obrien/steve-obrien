<script setup>
import { computed } from 'vue';

defineOptions({
	__doc: {
		name: 'App bottom nav',
		tag: '<ElAppBottomNav>',
		description: 'A thumb-friendly bottom navigation bar for primary app destinations.',
		events: [
			{ name: 'update:modelValue', payload: 'string', description: 'Fired when a tab is selected.' },
			{ name: 'change', payload: 'object', description: 'Fired with the selected tab item.' },
		],
		playground: {
			mobileSlot: 'bottom',
			initial: {
				modelValue: 'home',
				items: [
					{ value: 'home', label: 'Home' },
					{ value: 'inbox', label: 'Inbox', badge: '3' },
					{ value: 'settings', label: 'Settings' },
				],
			},
		},
	},
});

const props = defineProps({
	modelValue: {
		type: String,
		default: '',
		_edit: { description: 'Currently selected navigation item value.' },
	},
	items: {
		type: Array,
		default: () => [],
		_edit: {
			component: 'ElJsonListInput',
			description: 'Navigation items: { value, label, icon, badge }.',
		},
	},
});
const emit = defineEmits(['update:modelValue', 'change']);

const activeValue = computed(() => props.modelValue || props.items[0]?.value || '');

function selectItem(item) {
	emit('update:modelValue', item.value);
	emit('change', item);
}
</script>

<template>
	<nav class="border-t border-border bg-card/95 px-2 py-2 backdrop-blur-xl" aria-label="Primary">
		<div class="grid auto-cols-fr grid-flow-col gap-1">
			<button
				v-for="item in items"
				:key="item.value"
				type="button"
				class="relative flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-2 text-xs font-medium text-muted-foreground transition active:scale-95"
				:class="item.value === activeValue && 'bg-secondary text-foreground'"
				:aria-current="item.value === activeValue ? 'page' : undefined"
				@click="selectItem(item)"
			>
				<span v-if="item.icon" class="grid size-5 place-items-center" v-html="item.icon"></span>
				<span class="max-w-full truncate">{{ item.label }}</span>
				<span
					v-if="item.badge"
					class="absolute right-4 top-2 min-w-4 rounded-full bg-primary px-1 text-[10px] leading-4 text-primary-foreground"
				>{{ item.badge }}</span>
			</button>
		</div>
	</nav>
</template>
