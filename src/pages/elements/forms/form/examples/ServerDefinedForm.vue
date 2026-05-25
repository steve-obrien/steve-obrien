<script setup>
import { ref } from 'vue';
import { ElForm } from '../../../lib/vue';

const user = ref({
	id: 'usr_1024',
	name: 'Ada Lovelace',
	email: 'ada@example.com',
});

const children = [
	{
		component: 'ElTextInput',
		props: {
			name: 'id',
			label: 'User ID',
			readOnly: true,
		},
	},
	{
		component: 'ElTextInput',
		props: {
			name: 'name',
			label: 'Name',
			required: true,
		},
	},
	{
		component: 'ElEmailInput',
		props: {
			name: 'email',
			label: 'Email',
			required: true,
		},
	},
];
</script>

<template>
	<div class="w-full max-w-md">
		<ElForm v-model="user" :children="children" class="space-y-4" />
		<pre class="mt-4 overflow-auto rounded-lg border border-border bg-secondary/30 p-3 text-xs text-muted-foreground">{{ user }}</pre>
	</div>
</template>
