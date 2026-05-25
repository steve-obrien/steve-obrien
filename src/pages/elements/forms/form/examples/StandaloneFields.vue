<script setup>
import { ref } from 'vue';
import { ElCheckbox, ElNativeSelect, ElNumberInput, ElTextInput } from '../../../lib/vue';

const label = ref('Inbox');
const tone = ref('success');
const limit = ref(10);
const pinned = ref(true);

const toneOptions = [
	{ label: 'Default', value: 'default' },
	{ label: 'Success', value: 'success' },
	{ label: 'Danger', value: 'danger' },
];
</script>

<template>
	<div class="w-full max-w-md space-y-4">
		<ElTextInput v-model="label" label="Label" />
		<ElNativeSelect v-model="tone" label="Tone" :options="toneOptions" />
		<ElNumberInput v-model="limit" label="Result limit" :min="1" :max="50" />
		<ElCheckbox v-model="pinned" label="Pinned" description="This checkbox is not inside ElForm." />

		<pre class="overflow-auto rounded-lg border border-border bg-secondary/30 p-3 text-xs text-muted-foreground">{{ { label, tone, limit, pinned } }}</pre>
	</div>
</template>
