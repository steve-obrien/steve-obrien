<script setup>
import { ref } from 'vue';
import { ElButton, ElDrawer } from '@elements/vue';

const open = ref(false);
</script>

<template>
	<ElButton variant="secondary" @click="open = true">Open bottom drawer</ElButton>
	<ElDrawer
		v-model="open"
		side="bottom"
		title="Quick actions"
		width="100%"
	>
		<div class="grid gap-3 p-4 sm:grid-cols-3">
			<ElButton variant="secondary" class="justify-center">Duplicate</ElButton>
			<ElButton variant="secondary" class="justify-center">Share</ElButton>
			<ElButton class="justify-center" data-close>Done</ElButton>
		</div>
	</ElDrawer>
</template>
