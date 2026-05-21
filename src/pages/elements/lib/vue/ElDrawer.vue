<script setup>
import { computed, onMounted, ref, watch } from 'vue';

defineOptions({
	__doc: {
		name: 'Drawer',
		tag: '<ElDrawer>',
		description: 'A slide-out panel for navigation menus, filters, or any secondary surface — slides from the left or right with backdrop dismiss, scroll lock, and focus trap built in.',
		slots: [
			{ name: 'trigger', description: 'Element that opens the drawer when clicked (omit when controlling open state yourself).' },
			{ name: '(default)', description: 'Panel body.' },
			{ name: 'header', description: 'Replace the default header row (title + close button).' },
			{ name: 'footer', description: 'Optional footer below the scrollable body.' },
		],
		keyboard: [
			{ keys: 'Esc', action: 'Closes the drawer.' },
			{ keys: 'Tab / Shift+Tab', action: 'Focus stays within the panel while open.' },
			{ keys: 'Click backdrop', action: 'Dismisses the drawer. Add `static` on the host to disable.' },
		],
	},
});



const props = defineProps({
	modelValue: {
		type: Boolean,
		default: false,
		_edit: { description: 'Whether the drawer is open.' },
	},
	side: {
		type: String,
		default: 'right',
		_edit: { options: ['left', 'right'], description: 'Edge the panel slides in from.' },
	},
	title: {
		type: String,
		default: '',
		_edit: { description: 'Optional heading at the top of the panel.' },
	},
	width: {
		type: String,
		default: 'var(--container-sm)',
		_edit: {
			editor: 'ElCombobox',
			// Tailwind v4 max-w-* resolves to var(--container-*). Store the variable so
			// theme overrides apply; combobox hints show the matching utility name.
			options: [
				{ value: 'var(--container-3xs)', label: 'var(--container-3xs) · max-w-3xs' },
				{ value: 'var(--container-2xs)', label: 'var(--container-2xs) · max-w-2xs' },
				{ value: 'var(--container-xs)', label: 'var(--container-xs) · max-w-xs' },
				{ value: 'var(--container-sm)', label: 'var(--container-sm) · max-w-sm' },
				{ value: 'var(--container-md)', label: 'var(--container-md) · max-w-md' },
				{ value: 'var(--container-lg)', label: 'var(--container-lg) · max-w-lg' },
				{ value: 'var(--container-xl)', label: 'var(--container-xl) · max-w-xl' },
				{ value: 'var(--container-2xl)', label: 'var(--container-2xl) · max-w-2xl' },
				{ value: 'var(--container-3xl)', label: 'var(--container-3xl) · max-w-3xl' },
				{ value: 'var(--container-4xl)', label: 'var(--container-4xl) · max-w-4xl' },
				{ value: 'var(--container-5xl)', label: 'var(--container-5xl) · max-w-5xl' },
				{ value: 'var(--container-6xl)', label: 'var(--container-6xl) · max-w-6xl' },
				{ value: 'var(--container-7xl)', label: 'var(--container-7xl) · max-w-7xl' },
			],
			placeholder: 'var(--container-sm)',
			description: 'Panel width as a CSS length — pick a Tailwind container variable or type your own (e.g. 50rem).',
		},
	},
	static: {
		type: Boolean,
		default: false,
		_edit: { description: 'Disable backdrop-click dismiss. Esc and data-close still work.' },
	},
});
const emit = defineEmits(['update:modelValue', 'open', 'close']);

const root = ref(null);

const hostStyle = computed(() => ({
	'--el-drawer-width': props.width,
}));

function setOpen(v) {
	if (root.value) root.value.open = v;
}

onMounted(async () => {
	await import('../headless/drawer.js');
	root.value?.addEventListener('el:open', () => {
		emit('update:modelValue', true);
		emit('open');
	});
	root.value?.addEventListener('el:close', () => {
		emit('update:modelValue', false);
		emit('close');
	});
	if (props.modelValue) setOpen(true);
});

watch(() => props.modelValue, setOpen);

defineExpose({
	open: () => setOpen(true),
	close: () => setOpen(false),
	toggle: () => { if (root.value) root.value.toggle(); },
	get element() { return root.value; },
});
</script>

<template>
	<element-drawer ref="root" :side="side" :static="static || null" :style="hostStyle">
		<span slot="trigger" class="contents">
			<slot name="trigger" />
		</span>
		<div
			class="flex h-full flex-col bg-zinc-50/95 ring-1 ring-zinc-900/5 backdrop-blur-sm dark:bg-zinc-900/95 dark:ring-white/10"
		>
			<header v-if="title || $slots.header" class="flex shrink-0 items-center justify-between gap-3 border-b border-skin-border px-4 py-4">
				<slot name="header">
					<h2 v-if="title" class="text-base font-semibold tracking-tight text-skin-primary">{{ title }}</h2>
				</slot>
				<button
					data-close
					type="button"
					class="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-skin-secondary ring-1 ring-skin-border transition hover:bg-skin-surface hover:text-skin-primary"
					aria-label="Close"
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5" aria-hidden="true">
						<path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
					</svg>
				</button>
			</header>
			<div class="min-h-0 flex-1 overflow-y-auto">
				<slot />
			</div>
			<footer v-if="$slots.footer" class="shrink-0 border-t border-skin-border p-4">
				<slot name="footer" />
			</footer>
		</div>
	</element-drawer>
</template>
