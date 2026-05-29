<script setup>
import { computed, ref } from 'vue';
import { ElButton, ElForm, ElTextInput, forms } from '../../../lib/vue';

const account = ref({
	username: 'steve',
	displayName: 'Steve OBrien',
});

const lastAction = ref('Click "Add username error" to add a runtime error to the field.');
const runtimeErrors = computed(() => forms.accountErrors?.errors || {});

function formApi() {
	return forms.accountErrors;
}

function addUsernameError() {
	formApi().setFieldState('username', {
		invalid: true,
		errors: {
			unique: 'That username is already taken.',
		},
	});
	lastAction.value = 'form.setFieldState("username", { errors: { unique: "That username is already taken." } })';
}

function addDisplayNameError() {
	formApi().getField('displayName').setState({
		invalid: true,
		errors: [
			{ name: 'format', message: 'Use a space between first and last name.' },
		],
	});
	lastAction.value = 'form.getField("displayName").setState({ errors: [{ name: "format", message: "Use a space between first and last name." }] })';
}

function clearErrors() {
	formApi().setFieldState('username', { invalid: false, errors: [] });
	formApi().setFieldState('displayName', { invalid: false, errors: [] });
	lastAction.value = 'form.setFieldState(name, { invalid: false, errors: [] })';
}
</script>

<template>
	<div class="w-full max-w-md">
		<ElForm name="accountErrors" v-model="account" class="space-y-4">
			<ElTextInput name="username" label="Username" />
			<ElTextInput name="displayName" label="Display name" />

			<div class="flex flex-wrap gap-2">
				<ElButton type="button" variant="secondary" @click="addUsernameError">Add username error</ElButton>
				<ElButton type="button" variant="secondary" @click="addDisplayNameError">Add name error</ElButton>
				<ElButton type="button" @click="clearErrors">Clear errors</ElButton>
			</div>
		</ElForm>

		<pre class="mt-4 overflow-auto rounded-lg border border-border bg-secondary/30 p-3 text-xs text-muted-foreground">{{ lastAction }}</pre>
		<pre class="mt-3 overflow-auto rounded-lg border border-border bg-secondary/30 p-3 text-xs text-muted-foreground">{{ runtimeErrors }}</pre>
	</div>
</template>
