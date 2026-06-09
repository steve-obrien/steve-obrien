<script setup>
import { computed, onMounted } from 'vue';

const props = defineProps({
	to: {
		type: String,
		required: true,
	},
	label: {
		type: String,
		default: 'Continue',
	},
});

const destinationLabel = computed(() => {
	try {
		return new URL(props.to).hostname.replace(/^www\./, '');
	} catch {
		return props.to;
	}
});

onMounted(() => {
	window.location.replace(props.to);
});
</script>

<template>
	<SteveLayout>
		<section class="space-y-8">
			<p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Moved</p>
			<h1 class="text-4xl font-semibold tracking-tight sm:text-5xl">This project has moved.</h1>
			<p class="max-w-3xl text-lg leading-relaxed text-muted-foreground">
				The Elements framework now lives at {{ destinationLabel }}.
			</p>
			<a
				:href="to"
				class="inline-flex rounded-full border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
			>
				{{ label }}
			</a>
		</section>
	</SteveLayout>
</template>
