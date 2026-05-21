<script setup>
import { ref } from 'vue';
import { ElDialog, ElButton, ElTextInput } from '@elements/vue';

const outer = ref(false);
const confirm = ref(false);
const projectName = ref('');
</script>

<template>
	<ElButton variant="danger" @click="outer = true">Delete project…</ElButton>

	<ElDialog
		v-model="outer"
		title="Delete project?"
		description="This action cannot be undone."
	>
		<p class="text-sm text-skin-secondary">All issues, comments, and uploads will be removed.</p>
		<template #footer>
			<ElButton variant="secondary" @click="outer = false">Cancel</ElButton>
			<ElButton variant="danger" @click="confirm = true">Continue</ElButton>
		</template>

		<ElDialog
			v-model="confirm"
			title="Final confirmation"
			description="Type the project name to confirm deletion."
		>
			<ElTextInput v-model="projectName" label="Project name" placeholder="my-project" />
			<template #footer>
				<ElButton variant="secondary" @click="confirm = false">Back</ElButton>
				<ElButton
					variant="danger"
					:disabled="projectName !== 'my-project'"
					@click="confirm = false; outer = false; projectName = ''"
				>
					Delete forever
				</ElButton>
			</template>
		</ElDialog>
	</ElDialog>
</template>
