<script setup>
import { ref } from 'vue';
import { ElButton, ElEmailInput, ElForm, ElTextInput, forms } from '../../../lib/vue';

const event = ref({
	title: 'Design review',
	invitees: [
		{ name: 'Sam', email: 'sam@example.com' },
	],
});

async function validateInvitee() {
	await forms.event.getSubform('invitees.0').validate();
}

function updateInvitee() {
	forms.event.setFieldValue('invitees.0.email', 'not-an-email');
}
</script>

<template>
	<div class="w-full max-w-md">
		<ElForm name="event" v-model="event" class="space-y-4">
			<ElTextInput name="title" label="Event title" />

			<ElForm name="invitees.0" class="space-y-3 rounded-xl border border-border bg-secondary/25 p-4">
				<p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">First invitee</p>
				<ElTextInput name="name" label="Name" />
				<ElEmailInput name="email" label="Email" />
			</ElForm>

			<div class="flex flex-wrap gap-2">
				<ElButton type="button" variant="secondary" @click="updateInvitee">Set nested value</ElButton>
				<ElButton type="button" @click="validateInvitee">Validate subform</ElButton>
			</div>
		</ElForm>

		<pre class="mt-4 overflow-auto rounded-lg border border-border bg-secondary/30 p-3 text-xs text-muted-foreground">{{ event }}</pre>
	</div>
</template>
