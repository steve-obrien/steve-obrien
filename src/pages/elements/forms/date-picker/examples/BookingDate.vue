<script setup>
import { ref } from 'vue';
import { ElDatePicker } from '../../../lib/vue';

const date = ref('2026-06-18');
</script>

<template>
	<div class="max-w-sm space-y-4">
		<ElDatePicker
			v-model="date"
			name="booking_date"
			label="Booking date"
			description="Type a date or choose one from the calendar."
			date-format="dd/mm/yyyy"
			:calendar-props="{ min: '2026-01-01', max: '2026-12-31' }"
		/>

		<p class="rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-muted-foreground">
			Stored value:
			<code class="font-mono text-foreground">{{ date || 'empty' }}</code>
		</p>
	</div>
</template>
