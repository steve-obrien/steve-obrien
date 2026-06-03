<script setup>
import { ref } from 'vue';
import { ElButton, ElForm, forms } from '../../../lib/vue';

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
			validators: [
				{
					name: 'pattern',
					props: { pattern: '^usr_[0-9]+$' },
					message: 'Use an ID like usr_1024.',
				},
			],
		},
	},
	{
		component: 'ElTextInput',
		props: {
			name: 'name',
			label: 'Name',
			required: true,
			validators: [
				{
					name: 'minLength',
					props: { min: 2 },
				},
			],
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

const result = ref('');

async function validate() {
	const valid = await forms.serverUser?.validate();
	result.value = valid ? 'Server-defined form is valid.' : 'Server-defined form has errors.';
}
</script>

<template>
	<div class="w-full max-w-md">
		<ElForm name="serverUser" v-model="user" :children="children" class="space-y-4">
			<div class="border-t border-border pt-4">
				<ElButton type="button" @click="validate">Validate generated fields</ElButton>
			</div>
		</ElForm>
		<p v-if="result" class="mt-4 text-sm text-muted-foreground">{{ result }}</p>
		<pre class="mt-4 overflow-auto rounded-lg border border-border bg-secondary/30 p-3 text-xs text-muted-foreground">{{ user }}</pre>
	</div>
</template>
