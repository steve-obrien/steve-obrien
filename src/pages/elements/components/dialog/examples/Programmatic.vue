<script setup>
import { ref } from 'vue';
import { ElDialog, ElButton } from '@elements/vue';

const dialogRef = ref(null);
</script>

<template>
	<div class="flex flex-wrap items-center justify-center gap-2">
		<ElButton @click="dialogRef?.open()">Open</ElButton>
		<ElButton variant="secondary" @click="dialogRef?.close()">Close</ElButton>
		<ElButton variant="ghost" @click="dialogRef?.toggle()">Toggle</ElButton>
	</div>
	<ElDialog
		ref="dialogRef"
		title="Programmatic control"
		description="No trigger slot — open from script via the component ref."
	>
		<p class="text-sm text-secondary">
			Call <code class="text-foreground">open()</code>, <code class="text-foreground">close()</code>, or
			<code class="text-foreground">toggle()</code> on the ref, or bind <code class="text-foreground">v-model</code>.
		</p>
		<template #footer>
			<ElButton variant="secondary" data-close>Done</ElButton>
		</template>
	</ElDialog>
</template>
