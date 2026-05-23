<script setup>
import { reactive } from 'vue';
import { ElDrawer } from '@elements/vue';

// The playground state is just a reactive props object. The <Playground>
// wrapper introspects this via defineExpose to drive its inspector form, but
// nothing here is playground-specific — copy this file and you have a
// drop-in drawer with its props stored in one place.
const data = reactive({
	side: 'right',
	title: 'Drawer',
	width: 'var(--container-sm)',
	static: false,
	modelValue: false,
});

defineExpose({ data });
</script>

<template>
	<ElDrawer
		v-bind="data"
		@update:modelValue="data.modelValue = $event"
	>
		<template #trigger>
			<button
				slot="trigger"
				type="button"
				class="inline-flex h-10 items-center rounded-full bg-primary-skin px-4 text-sm font-medium text-primary hover:opacity-90"
			>Open drawer</button>
		</template>
		<nav class="space-y-1 p-4">
			<a class="block rounded-md px-3 py-2 hover:bg-secondary-skin" href="#">Home</a>
			<a class="block rounded-md px-3 py-2 hover:bg-secondary-skin" href="#">Inbox</a>
			<a class="block rounded-md px-3 py-2 hover:bg-secondary-skin" href="#">Settings</a>
		</nav>
	</ElDrawer>
</template>
