<script setup>
import { ref } from 'vue';
import { ElListbox } from '@elements/vue';

const value = ref('team');
const options = [
	{ value: 'solo', label: 'Solo', description: 'For small personal projects.' },
	{ value: 'team', label: 'Team', description: 'Shared workspace and billing.' },
	{ value: 'enterprise', label: 'Enterprise', description: 'SSO, audit logs, and support.' },
];
</script>

<template>
	<div class="grid w-full max-w-md gap-3">
		<ElListbox v-model="value" :options="options">
			<template #option="{ option }">
				<span class="block font-medium">{{ option.label }}</span>
				<span class="block text-xs opacity-75">{{ option.description }}</span>
			</template>
		</ElListbox>
		<p class="text-xs text-muted-foreground">Selected value: <code class="text-foreground">{{ value }}</code></p>
	</div>
</template>
