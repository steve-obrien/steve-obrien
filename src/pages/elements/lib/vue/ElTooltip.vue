<script setup>
import { onMounted, ref } from 'vue';

defineProps({
	text: {
		type: String,
		required: true,
		_edit: { description: 'Tooltip body. Keep it short — one line works best.' },
	},
	placement: {
		type: String,
		default: 'top',
		_edit: {
			type: 'select',
			options: ['top', 'bottom', 'left', 'right'],
			description: 'Position of the bubble relative to the trigger.',
		},
	},
	delay: {
		type: Number,
		default: 120,
		_edit: { description: 'Open delay in milliseconds — stops flicker when sweeping the cursor across.' },
	},
});

const root = ref(null);
onMounted(async () => { await import('../headless/tooltip.js'); });
</script>

<template>
	<element-tooltip ref="root" :text="text" :placement="placement" :delay="delay" class="el-tooltip relative inline-flex">
		<slot />
	</element-tooltip>
</template>

<style>
[data-el-tooltip] {
	position: absolute;
	z-index: 50;
	padding: 0.375rem 0.625rem;
	border-radius: 0.5rem;
	font-size: 0.75rem;
	line-height: 1rem;
	font-weight: 500;
	background: rgb(var(--primary));
	color: rgb(var(--inverse));
	box-shadow: 0 8px 24px -8px rgba(0,0,0,0.25);
	white-space: nowrap;
	pointer-events: none;
	opacity: 1;
}
[data-el-tooltip][data-placement="top"] { bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%); }
[data-el-tooltip][data-placement="bottom"] { top: calc(100% + 6px); left: 50%; transform: translateX(-50%); }
[data-el-tooltip][data-placement="left"] { right: calc(100% + 6px); top: 50%; transform: translateY(-50%); }
[data-el-tooltip][data-placement="right"] { left: calc(100% + 6px); top: 50%; transform: translateY(-50%); }
</style>
