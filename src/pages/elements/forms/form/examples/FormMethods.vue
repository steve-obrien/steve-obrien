<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { ElButton, ElForm, forms } from '../../../lib/vue';

const project = ref({
	title: 'Launch checklist',
	status: 'draft',
	reviewer: {
		name: 'Mina Patel',
		email: 'mina@example.com',
	},
});
const lastAction = ref('Open the browser console and try window.elementsForm.get("reviewer.email").');
const methodForm = ref(null);

const children = [
	{
		component: 'ElTextInput',
		props: {
			name: 'title',
			label: 'Title',
			required: true,
		},
	},
	{
		component: 'ElNativeSelect',
		props: {
			name: 'status',
			label: 'Status',
			options: [
				{ label: 'Draft', value: 'draft' },
				{ label: 'Ready', value: 'ready' },
				{ label: 'Archived', value: 'archived' },
			],
		},
	},
	{
		component: 'ElForm',
		props: {
			name: 'reviewer',
			class: 'space-y-3 rounded-xl border border-border bg-secondary/25 p-4',
		},
		children: [
			{
				component: 'p',
				props: { class: 'text-xs font-semibold uppercase tracking-wider text-muted-foreground' },
				children: [{ text: 'Reviewer' }],
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
		],
	},
];

function formApi() {
	return methodForm.value || forms.methodControl;
}

function setReady() {
	formApi().get('status').setValue('ready');
	lastAction.value = 'form.get("status").setValue("ready")';
}

function changeReviewer() {
	formApi().get('reviewer.email').setValue('alex@example.com');
	lastAction.value = 'form.get("reviewer.email").setValue("alex@example.com")';
}

function inspectReviewer() {
	const reviewer = formApi().get('reviewer');
	lastAction.value = `form.isForm(form.get("reviewer")) === ${formApi().isForm(reviewer)}`;
}

async function validateForm() {
	const valid = await formApi().validate();
	lastAction.value = `await form.validate() -> ${valid}`;
}

onMounted(async () => {
	await nextTick();
	globalThis.elementsForm = formApi();
	window.elementsForm = formApi();
	window.top.elementsForm = formApi();
});

onBeforeUnmount(() => {
	if (window.elementsForm === formApi()) delete window.elementsForm;
	if (window.top.elementsForm === formApi()) delete window.top.elementsForm;
	if (globalThis.elementsForm === formApi()) delete globalThis.elementsForm;
});
</script>

<template>
	<div class="w-full max-w-md">
		<ElForm
			ref="methodForm"
			name="methodControl"
			v-model="project"
			:children="children"
			class="space-y-4"
		>
			<div class="flex flex-wrap gap-2 border-t border-border pt-4">
				<ElButton type="button" variant="secondary" @click="setReady">Set ready</ElButton>
				<ElButton type="button" variant="secondary" @click="changeReviewer">Change reviewer</ElButton>
				<ElButton type="button" variant="secondary" @click="inspectReviewer">Inspect reviewer</ElButton>
				<ElButton type="button" @click="validateForm">Validate</ElButton>
			</div>
		</ElForm>

		<pre class="mt-4 overflow-auto rounded-lg border border-border bg-secondary/30 p-3 text-xs text-muted-foreground">{{ lastAction }}</pre>
		<pre class="mt-3 overflow-auto rounded-lg border border-border bg-secondary/30 p-3 text-xs text-muted-foreground">{{ project }}</pre>
	</div>
</template>
