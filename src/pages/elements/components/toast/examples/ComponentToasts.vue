<script setup>
import { ref } from 'vue';
import { ElButton, ElToastStack, useToasts } from '@elements/vue';
import AvatarToast from './toasts/AvatarToast.vue';
import SoftwareUpdateToast from './toasts/SoftwareUpdateToast.vue';

const { toasts, show, dismiss } = useToasts();
const lastAction = ref('none');

function showAvatarToast() {
	show(AvatarToast, {
		avatar: 'https://i.pravatar.cc/96?img=5',
		name: 'Maya Patel',
		role: 'Senior product designer',
	}, {
		tone: 'success',
		duration: 0,
	});
}

function showUpdateToast() {
	show(SoftwareUpdateToast, {
		version: 'Elements 2.4',
		size: '48 MB',
	}, {
		duration: 3000,
	});
}

function onAction(event) {
	lastAction.value = [event.action, event.value || event.person || event.version].filter(Boolean).join(': ');
	if (event.action !== 'dismiss') dismiss(event.id);
}
</script>

<template>
	<div class="grid gap-3">
		<div class="flex flex-wrap gap-2">
			<ElButton variant="secondary" @click="showAvatarToast">Avatar toast</ElButton>
			<ElButton variant="secondary" @click="showUpdateToast">Software update</ElButton>
		</div>
		<p class="text-xs text-skin-muted">Action: <code class="text-skin-primary">{{ lastAction }}</code></p>
		<ElToastStack
			:toasts="toasts"
			position="bottom-right"
			@dismiss="dismiss"
			@action="onAction"
		/>
	</div>
</template>
