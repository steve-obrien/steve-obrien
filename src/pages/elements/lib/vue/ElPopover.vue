<script setup>
import { onMounted, onBeforeUnmount, ref, useId } from 'vue';

const panelId = `el-popover-${useId()}`;

const props = defineProps({
	align: {
		type: String,
		default: 'left',
		_edit: { type: 'select', options: ['left', 'right', 'center'], description: 'Horizontal anchor relative to the trigger.' },
	},
	offset: {
		type: Number,
		default: 8,
		_edit: { description: 'Gap in pixels between the trigger and the popover.' },
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
const triggerEl = ref(null);
const panelStyle = ref({ position: 'fixed', top: 0, left: 0, margin: 0 });

function updatePosition() {
	if (!triggerEl.value || typeof window === 'undefined') return;
	const r = triggerEl.value.getBoundingClientRect();
	const top = `${r.bottom + props.offset}px`;
	let placement;
	if (props.align === 'right') {
		placement = { left: 'auto', right: `${window.innerWidth - r.right}px` };
	} else if (props.align === 'center') {
		placement = { left: `${r.left + r.width / 2}px`, transform: 'translateX(-50%)' };
	} else {
		placement = { left: `${r.left}px`, right: 'auto' };
	}
	panelStyle.value = { position: 'fixed', top, margin: 0, ...placement };
}

let scrollHandler = null;
let resizeHandler = null;
function attachReflow() {
	scrollHandler = () => updatePosition();
	resizeHandler = () => updatePosition();
	window.addEventListener('scroll', scrollHandler, { capture: true, passive: true });
	window.addEventListener('resize', resizeHandler);
}
function detachReflow() {
	if (scrollHandler) window.removeEventListener('scroll', scrollHandler, { capture: true });
	if (resizeHandler) window.removeEventListener('resize', resizeHandler);
	scrollHandler = resizeHandler = null;
}

onMounted(async () => {
	await import('../headless/popover.js');
	root.value?.addEventListener('el:open', () => {
		updatePosition();
		attachReflow();
		emit('open');
	});
	root.value?.addEventListener('el:close', () => {
		detachReflow();
		emit('close');
	});
});

onBeforeUnmount(detachReflow);
</script>

<template>
	<element-popover ref="root" class="relative inline-block">
		<button
			ref="triggerEl"
			slot="trigger"
			type="button"
			class="inline-flex h-10 items-center gap-2 rounded-full bg-skin-surface px-4 text-sm font-medium text-skin-primary ring-1 ring-skin-border transition hover:bg-skin-border/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-skin-primary/60"
		>
			<slot name="trigger">{{ label }}</slot>
		</button>
		<div
			:id="panelId"
			slot="panel"
			:style="panelStyle"
			class="el-popover-panel rounded-2xl border border-skin-border bg-skin-background p-4 text-sm text-skin-primary shadow-2xl shadow-black/10 ring-1 ring-black/[0.04] outline-none dark:shadow-black/40"
			:class="width"
		>
			<slot />
		</div>
	</element-popover>
</template>

<style>
/* Reset the user-agent popover defaults so our inline coords win. */
.el-popover-panel {
	margin: 0;
}
.el-popover-panel:not(:popover-open) {
	display: none;
}
</style>
