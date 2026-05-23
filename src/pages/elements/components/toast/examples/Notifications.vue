<script setup>
import { ref } from 'vue';
import { ElButton, ElToastStack } from '@elements/vue';

let id = 0;
const toasts = ref([]);

const copy = {
	default: {
		title: 'Draft updated',
		description: 'Your latest changes are ready to review.',
	},
	success: {
		title: 'Successfully saved',
		description: 'Your changes have been stored.',
	},
	danger: {
		title: 'Could not publish',
		description: 'Check the required fields and try again.',
	},
	warning: {
		title: 'Sync paused',
		description: 'Reconnect your account before new changes can sync.',
	},
};

function pushToast(tone = 'default') {
	id += 1;
	toasts.value = [
		...toasts.value,
		{
			id: `toast-${id}`,
			title: copy[tone].title,
			description: copy[tone].description,
			tone,
			duration: tone === 'warning' ? 0 : tone === 'danger' ? 5200 : 3600,
		},
	];
}

function dismiss(toastId) {
	toasts.value = toasts.value.filter((toast) => toast.id !== toastId);
}
</script>

<template>
	<div class="flex flex-wrap gap-2">
		<ElButton variant="secondary" @click="pushToast('default')">Normal</ElButton>
		<ElButton variant="secondary" @click="pushToast('success')">Success</ElButton>
		<ElButton variant="danger" @click="pushToast('danger')">Danger</ElButton>
		<ElButton variant="secondary" @click="pushToast('warning')">Needs dismiss</ElButton>
		<ElToastStack :toasts="toasts" @dismiss="dismiss" />
	</div>
</template>
