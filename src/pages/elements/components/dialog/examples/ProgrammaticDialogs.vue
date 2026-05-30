<script setup>
import { defineComponent, h, ref } from 'vue';
import { ElButton, ElDialogStack, ElForm, useDialogs } from '@elements/vue';
import InviteDialogForm from './InviteDialogForm.vue';

const { dialogs, confirmDialog, form, resolve, dismiss } = useDialogs();
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

const RuntimeInviteForm = defineComponent({
	name: 'RuntimeInviteForm',
	props: {
		initialValues: {
			type: Object,
			default: () => ({}),
		},
		children: {
			type: Array,
			default: () => [],
		},
	},
	emits: ['resolve', 'dismiss'],
	setup(props, { emit }) {
		const values = ref({ ...props.initialValues });
		const formMessage = ref('');
		return () => h(ElForm, {
			modelValue: values.value,
			'onUpdate:modelValue': (nextValues) => {
				values.value = nextValues;
			},
			children: props.children,
			class: 'space-y-4',
			onChange: () => {
				formMessage.value = '';
			},
			onInvalid: () => {
				formMessage.value = 'Complete the required fields before continuing.';
			},
			onSubmit: ({ values: submittedValues }) => {
				emit('resolve', submittedValues);
			},
		}, () => [
			formMessage.value
				? h('p', { class: 'text-xs text-destructive' }, formMessage.value)
				: null,
			h('div', { class: 'flex items-center justify-end gap-2' }, [
				h(ElButton, {
					type: 'button',
					variant: 'secondary',
					onClick: () => emit('dismiss'),
				}, () => 'Cancel'),
				h(ElButton, { type: 'submit' }, () => 'Create invite'),
			]),
		]);
	},
});

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
	const result = await form(InviteDialogForm, {
		defaultEmail: 'maya@example.com',
	}, {
		title: 'Invite teammate',
		description: 'Resolve the dialog with data from a custom form component.',
	});
	lastResult.value = result?.email ? `Invite queued for ${result.email}.` : 'Invite cancelled.';
}

async function openSchemaForm() {
	const result = await form(RuntimeInviteForm, {
		initialValues: {
			name: 'Maya Patel',
			email: 'maya@example.com',
		},
		children: schemaFormFields,
	}, {
		title: 'Schema-defined invite',
		description: 'The dialog and form component are both defined from script.',
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
		:dialogs="dialogs"
		@resolve="resolve($event.id, $event.value)"
		@dismiss="dismiss($event.id, $event.value)"
	/>
</template>
