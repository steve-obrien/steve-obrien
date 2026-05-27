<script setup>
import { ref } from 'vue';
import { ElToggleButton } from '@elements/vue';

const pinned = ref(false);
</script>

<template>
	<div class="space-y-3">
		<ElToggleButton
			v-model="pinned"
			label="Pinned state"
			pressed-label="Pinned"
			unpressed-label="Pin item"
			description="Use this for compact boolean actions that should read like buttons."
		/>
		<p class="text-xs text-muted-foreground">Pinned: <code class="text-foreground">{{ pinned }}</code></p>
	</div>
</template>
