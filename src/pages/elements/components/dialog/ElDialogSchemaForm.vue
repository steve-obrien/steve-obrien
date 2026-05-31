<script setup>
import { ref, watch } from 'vue';
import ElButton from '../button/ElButton.vue';
import ElForm from '../../forms/form/ElForm.vue';

defineOptions({
	__doc: {
		name: 'Dialog schema form',
		tag: '<ElDialogSchemaForm>',
		description: 'Internal renderer used by dialogForm(schema) to resolve an ElForm children schema from a programmatic dialog.',
		events: [
			{ name: 'resolve', payload: 'Record<string, unknown>', description: 'Emitted with validated form values.' },
			{ name: 'dismiss', description: 'Emitted when the form is cancelled.' },
		],
	},
});

const props = defineProps({
	schema: {
		type: Array,
		default: () => [],
	},
	modelValue: {
		type: Object,
		default: () => ({}),
	},
	submitText: {
		type: String,
		default: 'Submit',
	},
	cancelText: {
		type: String,
		default: 'Cancel',
	},
	invalidMessage: {
		type: String,
		default: 'Complete the required fields before continuing.',
	},
});
const emit = defineEmits(['resolve', 'dismiss']);
const values = ref({ ...props.modelValue });
const formMessage = ref('');

watch(() => props.modelValue, (nextValues) => {
	values.value = { ...(nextValues || {}) };
}, { deep: true });

function submit({ values: submittedValues }) {
	emit('resolve', submittedValues);
}

function invalid() {
	formMessage.value = props.invalidMessage;
}
</script>

<template>
	<ElForm
		v-model="values"
		:children="schema"
		class="space-y-4"
		@change="formMessage = ''"
		@invalid="invalid"
		@submit="submit"
	>
		<p v-if="formMessage" class="text-xs text-destructive">{{ formMessage }}</p>
		<div class="flex items-center justify-end gap-2">
			<ElButton variant="secondary" type="button" @click="emit('dismiss')">{{ cancelText }}</ElButton>
			<ElButton type="submit">{{ submitText }}</ElButton>
		</div>
	</ElForm>
</template>
