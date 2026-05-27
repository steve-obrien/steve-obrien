<script setup>
import { ref } from 'vue';
import { ElButton, ElCard, ElEmailInput, ElForm, ElNativeSelect, ElTextInput, ElToggle } from '../../../lib/vue';

const user = ref({
	name: '',
	email: '',
	role: 'viewer',
	team: 'product',
	sendInvite: true,
});

const roles = [
	{ label: 'Owner', value: 'owner' },
	{ label: 'Administrator', value: 'admin' },
	{ label: 'Viewer', value: 'viewer' },
];

const teams = [
	{ label: 'Product', value: 'product' },
	{ label: 'Design', value: 'design' },
	{ label: 'Engineering', value: 'engineering' },
	{ label: 'Operations', value: 'operations' },
];
</script>

<template>
	<ElCard padding="lg" class="w-full max-w-2xl">
		<div class="border-b border-border pb-6">
			<p class="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Users</p>
			<h3 class="mt-2 text-2xl font-semibold tracking-tight">Add a new user</h3>
			<p class="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
				A team admin form for creating a user, assigning access, and choosing whether to send the invite immediately.
			</p>
		</div>

		<ElForm v-model="user" name="newUser" class="mt-6 grid gap-5">
			<div class="grid gap-5 md:grid-cols-2">
				<ElTextInput name="name" label="Full name" placeholder="Alex Morgan" required autocomplete="name" />
				<ElEmailInput name="email" label="Email" placeholder="alex@example.com" required autocomplete="email" />
			</div>

			<div class="grid gap-5 md:grid-cols-2">
				<ElNativeSelect
					name="role"
					label="Role"
					description="Controls what this user can view and change."
					:options="roles"
				/>
				<ElNativeSelect
					name="team"
					label="Team"
					description="Used for default dashboards and notifications."
					:options="teams"
				/>
			</div>

			<div class="flex items-center justify-between gap-4 rounded-2xl border border-border bg-secondary/50 p-4">
				<div>
					<p class="text-sm font-medium">Send invitation email</p>
					<p class="mt-1 text-sm text-muted-foreground">Email the user a secure setup link after creation.</p>
				</div>
				<ElToggle name="sendInvite" label="Send invitation email" chrome="none" />
			</div>

			<div class="flex flex-wrap justify-end gap-2 border-t border-border pt-6">
				<ElButton variant="secondary" type="button">Save draft</ElButton>
				<ElButton type="submit">Create user</ElButton>
			</div>
		</ElForm>
	</ElCard>
</template>
