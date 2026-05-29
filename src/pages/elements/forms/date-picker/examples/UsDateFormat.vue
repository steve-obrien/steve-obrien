<script setup>
import { ref } from 'vue';
import { ElDatePicker } from '../../../lib/vue';

const date = ref('2026-11-24');
</script>

<template>
	<div class="max-w-sm space-y-4">
		<ElDatePicker
			v-model="date"
			name="delivery_date"
			label="Delivery date"
			description="This example parses and displays typed dates as mm/dd/yyyy."
			date-format="mm/dd/yyyy"
			:calendar-props="{ locale: 'en-US', weekStartsOn: 0 }"
		/>

		<p class="rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-muted-foreground">
			Stored value:
			<code class="font-mono text-foreground">{{ date || 'empty' }}</code>
		</p>
	</div>
</template>
