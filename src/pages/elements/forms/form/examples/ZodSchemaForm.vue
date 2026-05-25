<script setup>
import { ref } from 'vue';
import { ElButton, ElForm, forms } from '../../../lib/vue';

const account = ref({
	name: 'Ada Lovelace',
	email: 'ada@example.com',
	website: 'https://example.com',
	plan: 'team',
	seats: 5,
	newsletter: true,
});

const accountSchema = {
	type: 'object',
	shape: {
		name: {
			type: 'string',
			minLength: 2,
			description: 'Name',
			placeholder: 'Grace Hopper',
		},
		email: {
			type: 'string',
			format: 'email',
			description: 'Email address',
		},
		website: {
			type: 'string',
			format: 'url',
			optional: true,
			description: 'Website',
		},
		plan: {
			type: 'enum',
			values: ['starter', 'team', 'enterprise'],
			description: 'Plan',
		},
		seats: {
			type: 'number',
			min: 1,
			max: 50,
			description: 'Seats',
		},
		newsletter: {
			type: 'boolean',
			description: 'Receive product updates',
			optional: true,
		},
	},
};

const schemaOptions = {
	fields: {
		plan: {
			description: 'Enum values become a styled native select.',
			props: {
				options: [
					{ label: 'Starter', value: 'starter' },
					{ label: 'Team', value: 'team' },
					{ label: 'Enterprise', value: 'enterprise' },
				],
			},
		},
		seats: {
			description: 'Number constraints become input props and validators.',
			props: {
				step: 1,
			},
		},
		newsletter: {
			description: 'Boolean fields become checkboxes.',
		},
	},
};

const result = ref(null);

async function validate() {
	const valid = await forms.schemaAccount?.validate();
	result.value = valid ? 'Schema form is valid.' : 'Schema form has errors.';
}
</script>

<template>
	<div class="w-full max-w-md">
		<ElForm
			name="schemaAccount"
			v-model="account"
			:zod-schema="accountSchema"
			:schema-options="schemaOptions"
			class="space-y-4"
		>
			<div class="border-t border-border pt-4">
				<ElButton type="button" @click="validate">Validate schema form</ElButton>
			</div>
		</ElForm>

		<p v-if="result" class="mt-4 text-sm text-muted-foreground">{{ result }}</p>
		<pre class="mt-4 overflow-auto rounded-lg border border-border bg-secondary/30 p-3 text-xs text-muted-foreground">{{ account }}</pre>
	</div>
</template>
