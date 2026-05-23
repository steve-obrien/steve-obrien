<script setup>
import { reactive } from 'vue';
import { ElDialog, ElButton } from '@elements/vue';

const data = reactive({
	modelValue: false,
	static: false,
	title: 'Dialog title',
	description: 'Supporting text shown under the heading.',
});

defineExpose({ data });
</script>

<template>
	<ElDialog
		v-bind="data"
		@update:modelValue="data.modelValue = $event"
	>
		<template #trigger>
			<ElButton variant="primary">Open dialog</ElButton>
		</template>
		<p class="text-sm text-secondary">Dialog body content.</p>
		<template #footer>
			<ElButton variant="secondary" data-close>Cancel</ElButton>
			<ElButton data-close>Confirm</ElButton>
		</template>
	</ElDialog>
</template>
