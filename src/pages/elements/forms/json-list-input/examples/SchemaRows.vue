<script setup>
import { ref } from 'vue';
import { ElJsonListInput } from '../../../lib/vue';

const rows = ref([
	{ id: 'toast-1', title: 'Saved', tone: 'success', duration: 3200 },
	{ id: 'toast-2', title: 'Could not publish', tone: 'danger', duration: 0 },
]);

const schema = {
	type: 'array',
	label: 'Toast rows',
	items: {
		type: 'ElForm',
		properties: {
			id: {
				type: 'string',
				label: 'ID',
				placeholder: 'toast-id',
			},
			title: {
				type: 'string',
				label: 'Title',
				placeholder: 'Successfully saved',
			},
			tone: {
				type: 'string',
				component: 'ElSelectInput',
				label: 'Tone',
				options: [
					'default',
					'success',
					'danger',
					'warning',
				],
			},
			duration: {
				type: 'number',
				label: 'Duration',
				default: 3600,
			},
		},
	},
};
</script>

<template>
	<div class="grid w-full max-w-4xl gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
		<ElJsonListInput
			v-model="rows"
			label="Toast rows"
			description="Use the field editor for day-to-day edits, or switch to JSON for bulk changes."
			add-label="+ Add toast"
			:schema="schema"
		/>
		<pre class="max-h-96 overflow-auto rounded-xl border border-border bg-secondary/50 p-3 text-xs text-muted-foreground">{{ rows }}</pre>
	</div>
</template>
