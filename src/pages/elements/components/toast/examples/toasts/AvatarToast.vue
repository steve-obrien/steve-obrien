<script setup>
import { ElButton } from '@elements/vue';

const props = defineProps({
	avatar: {
		type: String,
		required: true,
	},
	name: {
		type: String,
		required: true,
	},
	role: {
		type: String,
		default: '',
	},
});
const emit = defineEmits(['action', 'dismiss']);
</script>

<template>
	<div class="flex items-center gap-3">
		<img
			:src="avatar"
			:alt="`${name} avatar`"
			class="size-10 rounded-full object-cover ring-1 ring-skin-border"
		/>
		<div class="min-w-0 flex-1">
			<p class="truncate text-sm font-semibold text-skin-primary">{{ name }}</p>
			<p v-if="role" class="mt-0.5 truncate text-sm text-skin-secondary">{{ role }}</p>
		</div>
		<ElButton
			size="sm"
			variant="secondary"
			@click="emit('action', { action: 'view-profile', person: props.name })"
		>View</ElButton>
		<button
			type="button"
			aria-label="Dismiss notification"
			class="-mr-1 rounded-full px-2 text-lg leading-none text-skin-muted transition hover:bg-skin-surface hover:text-skin-primary"
			@click="emit('dismiss')"
		>×</button>
	</div>
</template>
