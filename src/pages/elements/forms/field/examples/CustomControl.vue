<script setup>
import { ref } from 'vue';
import { ElButton, ElField } from '@elements/vue';

const cadence = ref('weekly');
const options = [
	{ label: 'Daily', value: 'daily' },
	{ label: 'Weekly', value: 'weekly' },
	{ label: 'Monthly', value: 'monthly' },
];
</script>

<template>
	<div class="w-full max-w-md">
		<ElField
			label="Digest cadence"
			description="ElField can wrap custom controls when you need field chrome without writing a new input component."
			required
		>
			<div class="flex flex-wrap gap-2">
				<ElButton
					v-for="option in options"
					:key="option.value"
					type="button"
					size="sm"
					:variant="cadence === option.value ? 'primary' : 'secondary'"
					:aria-pressed="cadence === option.value"
					@click="cadence = option.value"
				>
					{{ option.label }}
				</ElButton>
			</div>
		</ElField>
	</div>
</template>
