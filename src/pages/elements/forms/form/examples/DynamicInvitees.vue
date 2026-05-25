<script setup>
import { ref } from 'vue';
import { ElButton, ElForm, forms } from '../../../lib/vue';

const invitation = ref({
	workspace: 'Elements Studio',
	role: 'viewer',
	message: 'You are invited to collaborate on the next release.',
	invitees: [],
});
const submitResult = ref(null);
const children = ref([
	{
		component: 'ElTextInput',
		props: {
			name: 'workspace',
			label: 'Workspace',
			required: true,
		},
	},
	{
		component: 'ElNativeSelect',
		props: {
			name: 'role',
			label: 'Invitee role',
			description: 'Every invitee added below will receive this access level.',
			required: true,
			options: [
				{ label: 'Owner', value: 'owner' },
				{ label: 'Admin', value: 'admin' },
				{ label: 'Viewer', value: 'viewer' },
			],
		},
	},
	{
		component: 'ElTextareaInput',
		props: {
			name: 'message',
			label: 'Invitation message',
			description: 'Top-level message stored beside the nested invitees array.',
			rows: 3,
		},
	},
]);

function inviteeFields(index) {
	return [
		{
			component: 'p',
			props: { class: 'text-xs font-semibold uppercase tracking-wider text-muted-foreground' },
			children: [{ text: `Invitee ${index + 1}` }],
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
}

function addInvitee() {
	const index = invitation.value.invitees.length;
	forms.invites?.setFieldValue(`invitees.${index}`, { name: '', email: '' });
	forms.invites?.addSubform(`invitees.${index}`, inviteeFields(index), {
		id: `invitee-${index}`,
	});
}

async function validateInvitees() {
	const valid = await forms.invites?.validate();
	submitResult.value = {
		status: valid ? 'valid' : 'invalid',
		role: invitation.value.role,
		invitees: invitation.value.invitees.length,
	};
}

function onSubmit({ values }) {
	submitResult.value = {
		status: 'submitted',
		role: values.role,
		invitees: values.invitees.length,
	};
}

function onInvalid({ values, state }) {
	submitResult.value = {
		status: 'invalid',
		role: values.role,
		errorCount: state.errorCount,
	};
}
</script>

<template>
	<div class="w-full max-w-md">
		<ElForm
			name="invites"
			v-model="invitation"
			v-model:children="children"
			class="space-y-4"
			@submit="onSubmit"
			@invalid="onInvalid"
		>
			<div class="flex flex-wrap gap-2 border-t border-border pt-4">
				<ElButton type="button" variant="secondary" @click="addInvitee">Add invitee</ElButton>
				<ElButton type="submit">Send invitations</ElButton>
				<ElButton type="button" variant="secondary" @click="validateInvitees">Validate only</ElButton>
			</div>
		</ElForm>

		<pre class="mt-4 overflow-auto rounded-lg border border-border bg-secondary/30 p-3 text-xs text-muted-foreground">{{ invitation }}</pre>
		<pre class="mt-3 overflow-auto rounded-lg border border-border bg-secondary/30 p-3 text-xs text-muted-foreground">{{ submitResult }}</pre>
		<pre class="mt-3 max-h-40 overflow-auto rounded-lg border border-border bg-secondary/30 p-3 text-xs text-muted-foreground">{{ children }}</pre>
	</div>
</template>
