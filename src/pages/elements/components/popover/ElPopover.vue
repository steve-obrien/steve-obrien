<script>
export const popoverProps = {
	position: {
		type: String,
		default: 'bottom-start',
		_edit: {
			component: 'ElPositionInput',
			props: {
				label: 'Position',
			},
			description: 'Preferred side and alignment around the trigger.',
		},
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
	flip: {
		type: Boolean,
		default: true,
		_edit: { description: 'Allow the popover to flip to the opposite side when it would collide with the viewport.' },
	},
	lockScroll: {
		type: Boolean,
		default: false,
		_edit: { description: 'Lock browser scrolling while the popover is open.' },
	},
	trigger: {
		type: String,
		default: 'click',
		_edit: { options: ['click', 'hover'], description: 'How the trigger opens the popover.' },
	},
	hoverCloseDelay: {
		type: Number,
		default: 140,
		_edit: { description: 'Delay in milliseconds before a hover-triggered popover closes after pointer or focus leaves.' },
	},
	arrow: {
		type: Boolean,
		default: true,
		_edit: { description: 'Show a small arrow pointing back to the trigger.' },
	},
	width: {
		type: String,
		default: 'min-w-[14rem] max-w-[20rem]',
		_edit: { description: 'Tailwind width utility(ies) for the panel.' },
	},
	padding: {
		type: String,
		default: 'p-4',
		_edit: { description: 'Tailwind padding utility for the panel.' },
	},
	label: {
		type: String,
		default: 'More',
		_edit: { description: 'Trigger button label (use the #trigger slot for richer content).' },
	},
	triggerId: {
		type: String,
		default: '',
		_edit: { description: 'ID of an external trigger button. When set, ElPopover will not render its own trigger.' },
	},
};
</script>

<script setup>
import { computed, onMounted, ref, useSlots } from 'vue';

defineOptions({
	__doc: {
		name: 'Popover',
		tag: '<ElPopover>',
		description: 'A floating panel anchored to a trigger. Built on the HTML Popover API so it sits in the top layer — no parent overflow, transform, or z-index can clip it.',
		slots: [
			{ name: 'trigger', description: 'Replaces the trigger button. Omit when using triggerId.' },
			{ name: '(default)', payload: '{ open, close, toggle }', description: 'Popover body. Receives helpers so content can close itself without storing a component ref.' },
		],
		keyboard: [
			{ keys: 'Click trigger', action: 'Toggles the popover.' },
			{ keys: 'Focus trigger', action: 'Opens the popover when trigger is hover.' },
			{ keys: 'Click outside', action: 'Light-dismiss via the native popover API.' },
			{ keys: 'Esc', action: 'Closes the popover.' },
		],
	},
});

const props = defineProps(popoverProps);
const emit = defineEmits(['open', 'close']);

const root = ref(null);
const slots = useSlots();
const hasTriggerSlot = computed(() => !!slots.trigger);
const positionMap = {
	'start-bottom': { placement: 'left', align: 'end' },
	start: { placement: 'left', align: 'center' },
	'start-top': { placement: 'left', align: 'start' },
	'top-start': { placement: 'top', align: 'start' },
	top: { placement: 'top', align: 'center' },
	'top-end': { placement: 'top', align: 'end' },
	'end-top': { placement: 'right', align: 'start' },
	end: { placement: 'right', align: 'center' },
	'end-bottom': { placement: 'right', align: 'end' },
	'bottom-end': { placement: 'bottom', align: 'end' },
	bottom: { placement: 'bottom', align: 'center' },
	'bottom-start': { placement: 'bottom', align: 'start' },
};

const resolvedPosition = computed(() => {
	return positionMap[props.position] || positionMap['bottom-start'];
});

function open() {
	if (root.value) root.value.open = true;
}

function close() {
	if (root.value) root.value.open = false;
}

function toggle() {
	root.value?.toggle?.();
}

defineExpose({
	open,
	close,
	toggle,
});

onMounted(async () => {
	await import('../../lib/headless/popover.js');
	root.value?.addEventListener('el:open', () => emit('open'));
	root.value?.addEventListener('el:close', () => emit('close'));
});
</script>

<template>
	<element-popover
		ref="root"
		:align="resolvedPosition.align"
		:offset="offset"
		:placement="resolvedPosition.placement"
		:collision-padding="collisionPadding"
		:floating-mode="floatingMode"
		:flip="flip ? null : 'false'"
		:lock-scroll="lockScroll ? '' : null"
		:trigger="trigger"
		:hover-close-delay="hoverCloseDelay"
		:data-trigger-id="triggerId || null"
		class="relative inline-block"
	>
		<span v-if="!triggerId && hasTriggerSlot" slot="trigger" data-trigger class="inline-block align-baseline">
			<slot name="trigger" />
		</span>
		<button
			v-else-if="!triggerId"
			slot="trigger"
			type="button"
			class="inline-flex h-10 items-center gap-2 rounded-full bg-secondary px-4 text-sm font-medium text-foreground ring-1 ring-border transition hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
		>
			{{ label }}
		</button>
		<div
			slot="panel"
			class="el-popover-panel el-floating-transition outline-none rounded-2xl"
			:class="width"
		>
			<div
				class="el-popover-card relative rounded-2xl border border-border bg-popover text-left text-sm text-popover-foreground shadow-2xl shadow-black/10 ring-1 ring-border/60 dark:shadow-black/40"
				:class="padding"
			>
				<svg v-if="arrow" class="el-popover-arrow" aria-hidden="true" viewBox="0 0 16 8">
					<path class="el-popover-arrow-fill" d="M1 8L8 1L15 8Z" />
					<path class="el-popover-arrow-stroke" d="M1 8L8 1L15 8" />
				</svg>
				<div class="el-popover-content relative z-10 text-left">
					<slot :open="open" :close="close" :toggle="toggle" />
				</div>
			</div>
		</div>
	</element-popover>
</template>

<style>
.el-popover-arrow {
	position: absolute;
	z-index: 0;
	display: block;
	width: 16px;
	height: 8px;
	overflow: visible;
	fill: var(--popover);
	stroke: var(--border);
	stroke-width: 1;
	stroke-linejoin: round;
	pointer-events: none;
}

.el-popover-arrow-fill {
	fill: var(--popover);
	stroke: none;
}

.el-popover-arrow-stroke {
	fill: none;
	stroke: var(--border);
	stroke-width: 1;
	stroke-linecap: round;
	stroke-linejoin: round;
}

.el-floating-transition[data-side="top"] .el-popover-arrow,
.el-popover-transition[data-side="top"] .el-popover-arrow {
	bottom: -7px;
	left: var(--el-popover-arrow-x);
	transform: translateX(-50%) rotate(180deg);
}

.el-floating-transition[data-side="bottom"] .el-popover-arrow,
.el-popover-transition[data-side="bottom"] .el-popover-arrow {
	top: -7px;
	left: var(--el-popover-arrow-x);
	transform: translateX(-50%);
}

.el-floating-transition[data-side="left"] .el-popover-arrow,
.el-popover-transition[data-side="left"] .el-popover-arrow {
	right: -12px;
	top: var(--el-popover-arrow-y);
	transform: translateY(-50%) rotate(90deg);
}

.el-floating-transition[data-side="right"] .el-popover-arrow,
.el-popover-transition[data-side="right"] .el-popover-arrow {
	left: -12px;
	top: var(--el-popover-arrow-y);
	transform: translateY(-50%) rotate(-90deg);
}
</style>
