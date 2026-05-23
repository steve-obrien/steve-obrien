<script setup>
import { ref } from 'vue';
import { ElButton, ElToastStack } from '@elements/vue';

let id = 0;
const toasts = ref([]);

function showAssignee() {
	id += 1;
	toasts.value = [
		...toasts.value,
		{
			id: `person-${id}`,
			tone: 'success',
			title: 'Assigned to Maya',
			description: 'Senior product designer',
			avatar: `https://i.pravatar.cc/96?img=${(id % 12) + 1}`,
			duration: 0,
		},
	];
}

function dismiss(toastId) {
	toasts.value = toasts.value.filter((toast) => toast.id !== toastId);
}
</script>

<template>
	<div class="flex flex-wrap gap-2">
		<ElButton variant="secondary" @click="showAssignee">Show rich toast</ElButton>
		<ElToastStack :toasts="toasts" position="bottom-left" @dismiss="dismiss">
			<template #default="{ toast, dismiss: dismissToast }">
				<div class="flex items-center gap-3">
					<img :src="toast.avatar" alt="" class="size-10 rounded-full object-cover ring-1 ring-border" />
					<div class="min-w-0 flex-1">
						<p class="text-sm font-semibold text-foreground">{{ toast.title }}</p>
						<p class="mt-0.5 text-sm text-secondary">{{ toast.description }}</p>
					</div>
					<button
						type="button"
						class="rounded-full bg-secondary-skin px-3 py-1 text-xs font-medium text-foreground hover:bg-accent-skin"
						@click="dismissToast(toast.id)"
					>
						Done
					</button>
				</div>
			</template>
		</ElToastStack>
	</div>
</template>
