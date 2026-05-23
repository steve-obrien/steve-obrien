<script setup>
import { ref } from 'vue';
import { ElButton, ElCommandPalette } from '@elements/vue';

const open = ref(false);
const selected = ref('none');
const commands = [
	{ value: 'new-project', label: 'New project', description: 'Create a blank project.' },
	{ value: 'invite-team', label: 'Invite team', description: 'Send invitations to collaborators.' },
	{ value: 'open-billing', label: 'Open billing', description: 'Manage plan and invoices.' },
	{ value: 'toggle-theme', label: 'Toggle theme', description: 'Switch between light and dark.' },
];

function onSelect(event) {
	selected.value = event.value;
}
</script>

<template>
	<div class="grid gap-3">
		<div class="flex flex-wrap items-center gap-2">
			<ElButton variant="secondary" @click="open = true">Open command palette (Cmd+K)</ElButton>
			<p class="text-xs text-muted">Selected: <code class="text-foreground">{{ selected }}</code></p>
		</div>
		<ElCommandPalette v-model="open" :commands="commands" @select="onSelect" />
	</div>
</template>
