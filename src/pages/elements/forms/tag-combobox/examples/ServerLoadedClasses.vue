<script setup>
import { ref } from 'vue';
import { ElTagCombobox } from '@elements/vue';
import { searchTailwindClasses } from '../../_shared/serverLookup.js';

const classes = ref(['flex']);
const loading = ref(false);
const options = ref([]);
let requestId = 0;

async function searchClasses(query) {
	const currentRequest = ++requestId;
	if (!query.trim()) {
		options.value = [];
		loading.value = false;
		return;
	}

	loading.value = true;
	const results = await searchTailwindClasses(query);
	if (currentRequest !== requestId) return;
	options.value = results;
	loading.value = false;
}
</script>

<template>
	<div class="grid w-full gap-3">
		<ElTagCombobox
			v-model="classes"
			:options="options"
			:loading="loading"
			:filter-options="false"
			:allow-custom="true"
			label="Server-loaded classes"
			description="The component emits @query. The parent fetches options and passes the server result back in."
			placeholder="Type a class prefix"
			@query="searchClasses"
		/>
		<p class="rounded-2xl border border-border bg-secondary/40 p-3 font-mono text-xs text-muted-foreground">
			{{ classes.join(' ') }}
		</p>
	</div>
</template>
