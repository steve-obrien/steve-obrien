<script setup>
import { ref } from 'vue';
import { ElField } from '@elements/vue';

const email = ref('');
</script>

<template>
	<div class="w-full max-w-sm">
		<ElField
			label="Email address"
			description="Used for account notifications and sign-in recovery."
			html-for="field-email"
			required
		>
			<input
				id="field-email"
				v-model="email"
				type="email"
				placeholder="steve@example.com"
				class="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
			/>
		</ElField>
		<p class="mt-3 text-xs text-muted-foreground">Value: <code class="text-foreground">{{ email || 'empty' }}</code></p>
	</div>
</template>
