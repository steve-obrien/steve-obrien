<script setup>
import { ref } from 'vue';
import { ElDropdown, ElJsonListInput } from '../../../lib/vue';

const items = ref([
	{ label: 'Apple', value: 'apple' },
	{ label: 'Banana', value: 'banana' },
	{ label: 'Cherry', value: 'cherry' },
]);

const schema = {
	type: 'array',
	label: 'Dropdown items',
	items: {
		type: 'ElForm',
		properties: {
			label: {
				type: 'string',
				label: 'Label',
				placeholder: 'Item label',
			},
			value: {
				type: 'string',
				label: 'Value',
				placeholder: 'item-value',
			},
		},
	},
};
</script>

<template>
	<div class="grid w-full max-w-4xl gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
		<ElJsonListInput
			v-model="items"
			label="Dropdown items"
			description="A simple label/value list is just a schema with two fields."
			add-label="+ Add fruit"
			:schema="schema"
		/>
		<div>
			<p class="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Bound elsewhere</p>
			<ElDropdown :items="items" label="Pick a fruit" />
			<pre class="mt-3 overflow-auto rounded-xl border border-border bg-secondary/50 p-3 text-xs text-muted-foreground">{{ items }}</pre>
		</div>
	</div>
</template>
