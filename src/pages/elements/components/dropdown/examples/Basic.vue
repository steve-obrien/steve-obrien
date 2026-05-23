<script setup>
import { ref } from 'vue';
import { ElDropdown } from '@elements/vue';

const items = [
	{ label: 'View profile', value: 'profile' },
	{ label: 'Billing & plans', value: 'billing' },
	{ label: 'Team settings', value: 'team' },
	{ label: 'Sign out', value: 'signout' },
];
const selected = ref('');
</script>

<template>
	<div class="flex flex-col items-center gap-3">
		<ElDropdown :items="items" label="Account ▾" @select="(v) => selected = v" />
		<p class="text-xs text-muted">
			Selected: <code class="text-foreground">{{ selected || '—' }}</code>
		</p>
	</div>
</template>
