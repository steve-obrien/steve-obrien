<script setup>
import { ElButton, ElToastStack, useToasts } from '@elements/vue';

const { toasts, show, success, danger, dismiss } = useToasts();

function save() {
	success('Successfully saved', {
		description: 'Your changes have been stored.',
	});
}

function publishError() {
	danger('Could not publish', {
		description: 'Check the required fields and try again.',
		duration: 5200,
	});
}

function needsDismissal() {
	show({
		title: 'Sync paused',
		description: 'Reconnect your account before new changes can sync.',
		tone: 'warning',
		duration: 0,
	});
}
</script>

<template>
	<div class="flex flex-wrap gap-2">
		<ElButton variant="secondary" @click="save">Save</ElButton>
		<ElButton variant="danger" @click="publishError">Fail publish</ElButton>
		<ElButton variant="secondary" @click="needsDismissal">Needs dismiss</ElButton>
		<ElToastStack :toasts="toasts" position="bottom-right" @dismiss="dismiss" />
	</div>
</template>
