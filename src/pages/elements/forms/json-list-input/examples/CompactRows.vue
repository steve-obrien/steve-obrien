<script setup>
import { ref } from 'vue';
import { ElJsonListInput } from '../../../lib/vue';

const people = ref([
	{
		value: 'person-1',
		label: 'Maya Patel',
		role: 'Product lead',
		avatar: 'https://i.pravatar.cc/96?img=47',
		meta: { team: 'Design systems', timezone: 'GMT' },
	},
	{
		value: 'person-2',
		label: 'Noah Hughes',
		role: 'Frontend engineer',
		avatar: 'https://i.pravatar.cc/96?img=12',
		meta: { team: 'Studio', timezone: 'CET' },
	},
]);

const schema = [
	{ key: 'value', label: 'Value', placeholder: 'person-id', default: (index) => `person-${index + 1}` },
	{ key: 'label', label: 'Name', placeholder: 'Person name', default: (index) => `Person ${index + 1}` },
	{ key: 'role', label: 'Role', placeholder: 'Role or title' },
	{ key: 'avatar', label: 'Avatar URL', type: 'url', placeholder: 'https://...' },
	{ key: 'meta', label: 'Meta', type: 'json', default: () => ({ team: '', timezone: '' }) },
];
</script>

<template>
	<div class="w-full max-w-md rounded-2xl border border-border bg-card p-4 text-card-foreground">
		<ElJsonListInput
			v-model="people"
			label="People"
			description="Compact mode is intended for inspectors and narrow panels."
			add-label="+ Add person"
			:schema="schema"
			compact
		/>
	</div>
</template>
