<script setup>
import { computed } from 'vue';

defineOptions({
	__doc: {
		name: 'App list item',
		tag: '<ElAppListItem>',
		description: 'A touch-sized app row for settings, inboxes, menus, and navigation.',
		slots: [
			{ name: 'icon', description: 'Leading icon or avatar.' },
			{ name: 'trailing', description: 'Trailing value, switch, badge, or custom action.' },
		],
		playground: {
			mobileSlot: 'content',
			initial: {
				label: 'Sync Capacitor status bar',
				description: 'Match native chrome to the Elements theme.',
				meta: 'Now',
				chevron: true,
			},
		},
	},
});

const props = defineProps({
	as: {
		type: String,
		default: 'button',
		_edit: { description: 'Element or component used for the row.' },
	},
	label: {
		type: String,
		required: true,
		_edit: { description: 'Primary row label.' },
	},
	description: {
		type: String,
		default: '',
		_edit: { description: 'Optional secondary copy.' },
	},
	meta: {
		type: String,
		default: '',
		_edit: { description: 'Small trailing metadata shown beside the label.' },
	},
	chevron: {
		type: Boolean,
		default: false,
		_edit: { description: 'Show a trailing chevron when no trailing slot is provided.' },
	},
	selected: {
		type: Boolean,
		default: false,
		_edit: { description: 'Show the row as selected.' },
	},
	danger: {
		type: Boolean,
		default: false,
		_edit: { description: 'Style the row as a destructive action.' },
	},
});

const isButton = computed(() => props.as === 'button');
</script>

<template>
	<component
		:is="as"
		class="flex min-h-16 w-full items-center gap-3 border-b border-border bg-background px-4 py-3 text-left transition last:border-b-0 hover:bg-secondary/60 active:bg-secondary"
		:class="[selected && 'bg-secondary', danger && 'text-destructive']"
		:type="isButton ? 'button' : undefined"
	>
		<div v-if="$slots.icon" class="grid size-10 shrink-0 place-items-center rounded-2xl bg-secondary text-muted-foreground">
			<slot name="icon" />
		</div>
		<div class="min-w-0 flex-1">
			<div class="flex min-w-0 items-baseline gap-2">
				<p class="truncate text-sm font-medium" :class="danger ? 'text-destructive' : 'text-foreground'">{{ label }}</p>
				<p v-if="meta" class="shrink-0 text-xs text-muted-foreground">{{ meta }}</p>
			</div>
			<p v-if="description" class="mt-0.5 line-clamp-2 text-xs leading-5 text-muted-foreground">{{ description }}</p>
		</div>
		<div v-if="$slots.trailing" class="flex shrink-0 items-center text-muted-foreground">
			<slot name="trailing" />
		</div>
		<svg v-else-if="chevron" class="size-4 shrink-0 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
			<path d="M7.3 4.3a1 1 0 0 1 1.4 0l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 1 1-1.4-1.4L11.58 10 7.3 5.7a1 1 0 0 1 0-1.4Z" />
		</svg>
	</component>
</template>
