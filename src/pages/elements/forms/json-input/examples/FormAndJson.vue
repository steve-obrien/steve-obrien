<script setup>
import { computed, ref } from 'vue';
import { ElCheckbox, ElJsonInput, ElNativeSelect, ElTextInput } from '../../../lib/vue';

const config = ref({
	name: 'Elements CRM',
	visibility: 'team',
	enableAi: true,
});

const jsonValue = computed({
	get: () => config.value,
	set: (value) => {
		if (value && typeof value === 'object' && !Array.isArray(value)) config.value = value;
	},
});
</script>

<template>
	<div class="grid w-full max-w-4xl gap-5 lg:grid-cols-2">
		<div class="space-y-4 rounded-2xl border border-border bg-card p-5 text-card-foreground">
			<h3 class="text-lg font-semibold tracking-tight">Form controls</h3>
			<ElTextInput
				v-model="config.name"
				label="Workspace name"
			/>
			<ElNativeSelect
				v-model="config.visibility"
				label="Visibility"
				:options="[
					{ label: 'Private', value: 'private' },
					{ label: 'Team', value: 'team' },
					{ label: 'Public', value: 'public' },
				]"
			/>
			<ElCheckbox
				v-model="config.enableAi"
				label="Enable AI features"
				description="Expose AI-specific examples and generated UI helpers."
			/>
		</div>

		<ElJsonInput
			v-model="jsonValue"
			label="Raw JSON"
			description="Edit the same data directly. Valid JSON updates the form."
			:rows="13"
		/>
	</div>
</template>
