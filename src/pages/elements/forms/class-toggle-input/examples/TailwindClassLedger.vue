<script setup>
import { ref } from 'vue';
import { ElClassToggleInput } from '@elements/vue';
import { tailwindClassIndex } from '../../_shared/serverLookup.js';

const classes = ref('flex md:h-full md:overflow-y-auto md:pr-2 md:py-10 min-w-0 text-2xl');
const inactiveClasses = ref(['bg-white', 'rounded-xl']);
</script>

<template>
	<div class="grid w-full max-w-2xl gap-3">
		<ElClassToggleInput
			v-model="classes"
			v-model:inactive-values="inactiveClasses"
			:options="tailwindClassIndex"
			label="Classes"
			description="Type a utility and press Enter. Checkboxes toggle classes in and out of the final class string."
			placeholder="Add new class"
		/>
		<div class="rounded-2xl border border-border bg-secondary/40 p-3 text-xs">
			<p class="text-muted-foreground">Enabled class string</p>
			<code class="mt-1 block break-all font-mono text-foreground">{{ classes || 'None' }}</code>
		</div>
	</div>
</template>
