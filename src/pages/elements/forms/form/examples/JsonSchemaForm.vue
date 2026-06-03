<script setup>
import { ref } from 'vue';
import { ElButton, ElForm, forms, jsonSchemaToChildren } from '../../../lib/vue';

const profile = ref({
	name: 'Ada Lovelace',
	email: 'ada@example.com',
	role: 'admin',
	active: true,
	bio: 'Computing notes, analytical engines, and careful correspondence.',
	team: {
		name: 'Research',
		size: 6,
	},
	links: [
		{ label: 'Website', url: 'https://example.com' },
	],
});

const profileSchema = {
	$schema: 'https://json-schema.org/draft/2020-12/schema',
	type: 'object',
	required: ['name', 'email', 'role', 'team'],
	properties: {
		name: {
			type: 'string',
			title: 'Full name',
			minLength: 2,
			examples: ['Grace Hopper'],
		},
		email: {
			type: 'string',
			format: 'email',
			title: 'Email address',
		},
		role: {
			type: 'string',
			title: 'Role',
			enum: ['viewer', 'editor', 'admin'],
			'x-el': {
				description: 'Enum values render as a native select.',
				props: {
					options: [
						{ label: 'Viewer', value: 'viewer' },
						{ label: 'Editor', value: 'editor' },
						{ label: 'Admin', value: 'admin' },
					],
				},
			},
		},
		active: {
			type: 'boolean',
			title: 'Active account',
			default: true,
			'x-el': {
				component: 'ElToggle',
				description: 'Rendered as a switch through the JSON Schema vendor extension.',
			},
		},
		bio: {
			type: 'string',
			title: 'Bio',
			maxLength: 240,
			'x-el': {
				component: 'ElTextareaInput',
				props: {
					rows: 4,
					placeholder: 'Short public note',
				},
			},
		},
		team: {
			type: 'object',
			required: ['name', 'size'],
			properties: {
				name: {
					type: 'string',
					title: 'Team name',
				},
				size: {
					type: 'integer',
					title: 'Team size',
					minimum: 1,
					maximum: 30,
				},
			},
		},
		links: {
			type: 'array',
			title: 'Links',
			items: {
				type: 'object',
				properties: {
					label: {
						type: 'string',
						title: 'Label',
					},
					url: {
						type: 'string',
						format: 'uri',
						title: 'URL',
					},
				},
			},
			'x-el': {
				props: {
					addLabel: '+ Add link',
				},
			},
		},
	},
};

const adapterOptions = {
	fields: {
		team: {
			class: 'space-y-3 rounded-xl border border-border bg-secondary/25 p-4',
		},
		'team.size': {
			description: 'Integer constraints become number input props and validators.',
		},
	},
};
const formChildren = jsonSchemaToChildren(profileSchema, adapterOptions);

const result = ref(null);

async function validate() {
	const valid = await forms.jsonProfile?.validate();
	result.value = valid ? 'JSON Schema form is valid.' : 'JSON Schema form has errors.';
}
</script>

<template>
	<div class="w-full max-w-xl">
		<ElForm
			name="jsonProfile"
			v-model="profile"
			:children="formChildren"
			class="space-y-4"
		>
			<div class="border-t border-border pt-4">
				<ElButton type="button" @click="validate">Validate JSON Schema form</ElButton>
			</div>
		</ElForm>

		<p v-if="result" class="mt-4 text-sm text-muted-foreground">{{ result }}</p>
		<pre class="mt-4 overflow-auto rounded-lg border border-border bg-secondary/30 p-3 text-xs text-muted-foreground">{{ profile }}</pre>
	</div>
</template>
