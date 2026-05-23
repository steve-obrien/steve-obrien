<script setup>
import { reactive } from 'vue';
import { ElButton, ElToastStack } from '@elements/vue';

let id = 0;
const data = reactive({
	duration: 3600,
	autoDismiss: false,
	toasts: [],
});

function pushToast() {
	id += 1;
	data.toasts = [
		...data.toasts,
		{
			id: `toast-${id}`,
			title: 'Preview toast',
			description: 'Edit this row in the inspector.',
			tone: id % 2 === 0 ? 'success' : 'default',
			duration: data.autoDismiss ? data.duration : 0,
		},
	];
}

function dismiss(toastId) {
	data.toasts = data.toasts.filter((toast) => toast.id !== toastId);
}

defineExpose({ data });
</script>

<template>
	<div class="grid gap-3">
		<ElButton variant="secondary" @click="pushToast">Add preview toast</ElButton>
		<ElToastStack v-bind="data" @dismiss="dismiss" />
	</div>
</template>
