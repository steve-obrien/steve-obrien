<script setup>
import { ref } from 'vue';
import { ElButton, ElEmailInput, ElForm, ElTextInput, ElUrlInput, forms } from '../../../lib/vue';

const profile = ref({
	name: 'Grace Hopper',
	email: 'grace@example.com',
	website: 'https://example.com',
});

async function validateProfile() {
	await forms.profile.validate();
}

function setExternalValues() {
	forms.profile.setFieldValue('name', 'Katherine Johnson');
	forms.profile.setFieldValue('email', 'katherine@example.com');
	forms.profile.setFieldValue('website', 'not a url');
}
</script>

<template>
	<div class="w-full max-w-md">
		<ElForm name="profile" v-model="profile" class="space-y-4">
			<ElTextInput name="name" label="Name" />
			<ElEmailInput name="email" label="Email" />
			<ElUrlInput name="website" label="Website" :validate-on-blur="false" />

			<div class="flex flex-wrap gap-2">
				<ElButton type="button" variant="secondary" @click="setExternalValues">Set externally</ElButton>
				<ElButton type="button" @click="validateProfile">Validate</ElButton>
			</div>
		</ElForm>

		<pre class="mt-4 overflow-auto rounded-lg border border-border bg-secondary/30 p-3 text-xs text-muted-foreground">{{ profile }}</pre>
	</div>
</template>
