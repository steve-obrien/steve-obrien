<script setup>
import { ref } from 'vue';
import { ElButton, ElDialogStack, useDialogs } from '@elements/vue';
import InviteDialogForm from './InviteDialogForm.vue';

const {
	dialogStack,
	confirmDialog,
	dialogForm,
	resolveDialog,
	dismissDialog,
} = useDialogs();
const lastResult = ref('No dialog result yet.');
const schemaFormFields = [
	{
		component: 'ElTextInput',
		props: {
			name: 'name',
			label: 'Name',
			required: true,
			placeholder: 'Maya Patel',
		},
	},
	{
		component: 'ElEmailInput',
		props: {
			name: 'email',
			label: 'Email',
			required: true,
			placeholder: 'maya@example.com',
		},
	},
];

async function confirmArchive() {
	const confirmed = await confirmDialog({
		title: 'Archive project?',
		description: 'The project will move out of the active workspace.',
		message: 'You can restore archived projects from workspace settings.',
		confirmText: 'Archive',
		tone: 'danger',
	});
	lastResult.value = confirmed ? 'Archive confirmed.' : 'Archive cancelled.';
}

async function openInviteForm() {
	const result = await dialogForm(InviteDialogForm, {
		defaultEmail: 'maya@example.com',
	}, {
		title: 'Invite teammate',
		description: 'Resolve the dialog with data from a custom form component.',
	});
	lastResult.value = result?.email ? `Invite queued for ${result.email}.` : 'Invite cancelled.';
}

async function openSchemaForm() {
	const result = await dialogForm(schemaFormFields, {
		initialValues: {
			name: 'Maya Patel',
			email: 'maya@example.com',
		},
		title: 'Schema-defined invite',
		description: 'The dialog renders an ElForm from a programmatic children schema.',
		confirmText: 'Create invite',
	});
	lastResult.value = result?.email
		? `Schema form resolved for ${result.name} (${result.email}).`
		: 'Schema form cancelled.';
}
</script>

<template>
	<div class="flex flex-col items-center gap-4">
		<div class="flex flex-wrap items-center justify-center gap-2">
			<ElButton variant="danger" @click="confirmArchive">Confirm action</ElButton>
			<ElButton variant="secondary" @click="openInviteForm">Open form</ElButton>
			<ElButton variant="secondary" @click="openSchemaForm">Open schema form</ElButton>
		</div>
		<p class="text-sm text-muted-foreground">{{ lastResult }}</p>
	</div>

	<ElDialogStack
		:dialogs="dialogStack"
		@resolve="resolveDialog($event.id, $event.value)"
		@dismiss="dismissDialog($event.id, $event.value)"
	/>
</template>
