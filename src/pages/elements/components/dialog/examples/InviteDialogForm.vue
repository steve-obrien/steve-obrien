<script setup>
import { ref } from 'vue';
import { ElButton, ElEmailInput, ElForm } from '@elements/vue';

const props = defineProps({
	defaultEmail: {
		type: String,
		default: '',
	},
});
const emit = defineEmits(['resolve', 'dismiss']);
const invite = ref({ email: props.defaultEmail });
const formMessage = ref('');

function submit({ values }) {
	emit('resolve', { email: values.email.trim() });
}

function invalid() {
	formMessage.value = 'Enter a valid email address before sending.';
}
</script>

<template>
	<ElForm
		v-model="invite"
		class="space-y-4"
		@change="formMessage = ''"
		@invalid="invalid"
		@submit="submit"
	>
		<ElEmailInput
			name="email"
			label="Email"
			placeholder="maya@example.com"
			required
		/>
		<p v-if="formMessage" class="text-xs text-destructive">{{ formMessage }}</p>
		<div class="flex items-center justify-end gap-2">
			<ElButton variant="secondary" type="button" @click="emit('dismiss')">Cancel</ElButton>
			<ElButton type="submit">Send invite</ElButton>
		</div>
	</ElForm>
</template>
