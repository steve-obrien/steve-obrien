<script setup>
import { ref } from 'vue';
import { ElButton, ElCard, ElNativeSelect, ElPasswordInput, ElTextInput, ElToggle } from '../../../lib/vue';

const email = ref('steve@example.com');
const password = ref('password123');
const role = ref('admin');
const twoFactor = ref(true);
</script>

<template>
	<ElCard padding="lg" class="w-full max-w-2xl">
		<div class="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
			<div>
				<p class="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Account</p>
				<h3 class="mt-2 text-2xl font-semibold tracking-tight">Security settings</h3>
				<p class="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
					A complete form starter with text input, native select, password strength, breach warning, and a toggle.
				</p>
			</div>
			<span class="rounded-full bg-warning/15 px-2.5 py-1 text-xs font-medium text-warning">Review needed</span>
		</div>

		<div class="mt-6 grid gap-5">
			<ElTextInput
				v-model="email"
				label="Email address"
				description="Used for login, notifications, and account recovery."
				placeholder="you@example.com"
			/>

			<ElNativeSelect
				v-model="role"
				label="Access level"
				description="Native select is best when the browser picker is preferable on mobile."
				:options="[
					{ label: 'Owner', value: 'owner' },
					{ label: 'Administrator', value: 'admin' },
					{ label: 'Editor', value: 'editor' },
				]"
			/>

			<ElPasswordInput
				v-model="password"
				label="Password"
				description="Try changing this away from password123 to clear the breach warning."
				:compromised="password === 'password123'"
			/>

			<div class="flex items-center justify-between gap-4 rounded-2xl border border-border bg-secondary/60 p-4">
				<div>
					<p class="text-sm font-medium">Two-factor authentication</p>
					<p class="mt-1 text-sm text-muted-foreground">Require a verification code during login.</p>
				</div>
				<ElToggle v-model="twoFactor" label="Two-factor authentication" />
			</div>
		</div>

		<div class="mt-6 flex flex-wrap justify-end gap-2 border-t border-border pt-6">
			<ElButton variant="secondary">Cancel</ElButton>
			<ElButton>Save changes</ElButton>
		</div>
	</ElCard>
</template>
