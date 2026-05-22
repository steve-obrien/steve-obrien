<script setup>
import { ElCombobox } from '@elements/vue';
import { ref } from 'vue';
const value = ref('');
const options = [
	{ value: '1', label: 'Apple' },
	{ value: '2', label: 'Banana' },
	{ value: '3', label: 'Cherry' },
];
</script>

<template>
	<div class="flex w-full max-w-sm flex-col gap-2">
		<ElCombobox v-model="value" :options="options" placeholder="Pick a fruit" class="w-full" />
		<p class="text-xs text-skin-muted">Selected value: <code class="text-skin-primary">{{ value || '—' }}</code></p>
	</div>
</template>
