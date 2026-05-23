<script setup>
import { ref } from 'vue';
import { ElRadioGroup } from '@elements/vue';

const plan = ref('team');
const options = [
	{ value: 'solo', label: 'Solo' },
	{ value: 'team', label: 'Team' },
	{ value: 'enterprise', label: 'Enterprise' },
];
</script>

<template>
	<div class="grid w-full max-w-md gap-3">
		<ElRadioGroup v-model="plan" :options="options" label="Plan" />
		<p class="text-xs text-skin-muted">Selected value: <code class="text-skin-primary">{{ plan }}</code></p>
	</div>
</template>
