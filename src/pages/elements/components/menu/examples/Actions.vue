<script setup>
import { ref } from 'vue';
import { ElMenu } from '@elements/vue';

const selected = ref('none');
const items = [
	{ value: 'rename', label: 'Rename' },
	{ value: 'duplicate', label: 'Duplicate' },
	{ separator: true },
	{ value: 'notifications', label: 'Notifications', type: 'checkbox', checked: true },
	{ value: 'archive', label: 'Archive' },
	{ value: 'delete', label: 'Delete', tone: 'danger' },
];
</script>

<template>
	<div class="grid w-full max-w-sm gap-3">
		<ElMenu :items="items" @select="selected = $event.value" />
		<p class="text-xs text-skin-muted">Selected: <code class="text-skin-primary">{{ selected }}</code></p>
	</div>
</template>
