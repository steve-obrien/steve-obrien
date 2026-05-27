<script setup>
import { ref } from 'vue';
import { ElPopover, ElToggle } from '@elements/vue';

const notifications = ref(true);
const digest = ref(false);
const sound = ref(true);
</script>

<template>
	<div class="flex flex-col gap-4">
		<div>Data: {{ notifications }}, {{ digest }}, {{ sound }}</div>
		<ElPopover class="text-left" label="Notifications" position="bottom" width="min-w-[18rem]">
			<h3 class="text-sm font-semibold tracking-tight text-foreground">Notification preferences</h3>
			<div class="mt-3 space-y-3 flex flex-col gap-2">
				<ElToggle v-model="notifications" label="Push notifications" description="Alerts in the menu bar." />
				<ElToggle v-model="digest" label="Weekly digest" description="Sent Mondays at 8am local time." />
				<ElToggle v-model="sound" label="Play sound" />
			</div>
		</ElPopover>
	</div>
</template>
