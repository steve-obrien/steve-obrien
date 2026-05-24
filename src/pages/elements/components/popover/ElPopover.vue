<script setup>
import { onMounted, ref } from 'vue';

defineOptions({
	__doc: {
		name: 'Popover',
		tag: '<ElPopover>',
		description: 'A floating panel anchored to a trigger. Built on the HTML Popover API so it sits in the top layer — no parent overflow, transform, or z-index can clip it.',
		slots: [
			{ name: 'trigger', description: 'Replaces the inner content of the trigger button.' },
			{ name: '(default)', description: 'Popover body — text, controls, forms, anything.' },
		],
		keyboard: [
			{ keys: 'Click trigger', action: 'Toggles the popover.' },
			{ keys: 'Click outside', action: 'Light-dismiss via the native popover API.' },
			{ keys: 'Esc', action: 'Closes the popover.' },
		],
	},
});

const props = defineProps({
	align: {
		type: String,
		default: 'left',
		_edit: { options: ['left', 'right', 'center'], description: 'Horizontal anchor relative to the trigger.' },
	},
	placement: {
		type: String,
		default: 'bottom',
		_edit: { options: ['bottom', 'top', 'right', 'left'], description: 'Preferred side before collision handling.' },
	},
	offset: {
		type: Number,
		default: 8,
		_edit: { description: 'Gap in pixels between the trigger and the popover.' },
	},
	collisionPadding: {
		type: Number,
		default: 8,
		_edit: { description: 'Viewport padding used when the panel flips or shifts.' },
	},
	floatingMode: {
		type: String,
		default: 'viewport',
		_edit: { options: ['viewport', 'anchor'], description: 'viewport keeps the panel inside the browser; anchor keeps it attached while scrolling.' },
	},
	width: {
		type: String,
		default: 'min-w-[14rem] max-w-[20rem]',
		_edit: { description: 'Tailwind width utility(ies) for the panel.' },
	},
	label: {
		type: String,
		default: 'More',
		_edit: { description: 'Trigger button label (use the #trigger slot for richer content).' },
	},
});
const emit = defineEmits(['open', 'close']);

const root = ref(null);

onMounted(async () => {
	await import('../../lib/headless/popover.js');
	root.value?.addEventListener('el:open', () => emit('open'));
	root.value?.addEventListener('el:close', () => emit('close'));
});
</script>

<template>
	<element-popover
		ref="root"
		:align="align"
		:offset="offset"
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
		</button>
		<div
			slot="panel"
			class="el-popover-panel rounded-2xl border border-border bg-popover p-4 text-sm text-popover-foreground shadow-2xl shadow-black/10 ring-1 ring-border/60 outline-none dark:shadow-black/40"
			:class="width"
		>
			<slot />
		</div>
	</element-popover>
</template>
