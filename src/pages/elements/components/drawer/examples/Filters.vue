<script setup>
import { ref } from 'vue';
import { ElDrawer, ElButton } from '@elements/vue';

const open = ref(false);
</script>

<template>
	<ElButton variant="secondary" @click="open = true">Open filters</ElButton>
	<ElDrawer v-model="open" side="left" title="Filters" width="var(--container-xs)">
		<div class="space-y-4 p-4 text-sm text-secondary">
			<p>Sort by date, status, or assignee.</p>
			<ElButton variant="secondary" data-close class="w-full">Apply</ElButton>
		</div>
	</ElDrawer>
</template>
