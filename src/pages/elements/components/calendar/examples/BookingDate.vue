<script setup>
import { ref } from 'vue';
import { ElCalendar } from '../../../lib/vue';

const date = ref('2026-06-18');
</script>

<template>
	<div class="w-full max-w-sm">
		<ElCalendar
			v-model="date"
			label="Booking date"
			description="Use the month and year controls to move through the calendar."
			min="2026-01-01"
			max="2026-12-31"
		/>
		<p class="mt-3 text-xs text-muted-foreground">
			Selected date: <code class="text-foreground">{{ date }}</code>
		</p>
	</div>
</template>
