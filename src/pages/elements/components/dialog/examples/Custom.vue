<script setup>
import { ref } from 'vue';
import { ElDialog, ElButton } from '@elements/vue';

const open = ref(false);
</script>

<template>
	<ElButton variant="danger" @click="open = true">Delete project</ElButton>
	<ElDialog
		v-model="open"
		static
		title="Delete project?"
		description="This will permanently delete the project and all of its data."
	>
		<p class="text-sm text-muted-foreground">There is no undo. Type the project name to confirm.</p>
		<input
			class="mt-3 h-10 w-full rounded-full border border-border bg-background px-4 text-sm"
			placeholder="my-project"
		/>
		<template #footer>
			<ElButton variant="secondary" data-close @click="open = false">Cancel</ElButton>
			<ElButton variant="danger" data-close @click="open = false">Delete</ElButton>
		</template>
	</ElDialog>
</template>
