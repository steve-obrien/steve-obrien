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
onMounted(async () => { await import('../../lib/headless/tooltip.js'); });
</script>

<template>
	<element-tooltip ref="root" :text="text" :placement="placement" :delay="delay">
		<slot />
	</element-tooltip>
</template>
