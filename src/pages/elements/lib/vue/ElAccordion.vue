<script setup>
import { onMounted } from 'vue';

defineProps({
	items: {
		type: Array,
		required: true, // [{ title, content }]
		_edit: { description: 'Each entry renders one collapsible section.' },
	},
	multiple: {
		type: Boolean,
		default: false,
		_edit: { description: 'Allow multiple accordion tabs to be open at once.' },
	},
});

onMounted(async () => { await import('../headless/accordion.js'); });
</script>

<template>
	<element-accordion :multiple="multiple || null" class="block divide-y divide-border rounded-2xl border border-border bg-background">
		<element-accordion-item v-for="(item, i) in items" :key="i" class="block">
			<button
				slot="header"
				class="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-foreground outline-none transition hover:bg-secondary focus-visible:bg-secondary"
			>
				<span>{{ item.title }}</span>
				<svg viewBox="0 0 20 20" class="size-4 transition aria-expanded-rotate" fill="none">
					<path d="M6 8l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
			</button>
			<div slot="content" class="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{{ item.content }}</div>
		</element-accordion-item>
	</element-accordion>
</template>

<style>
element-accordion-item[open] [slot="header"] svg { transform: rotate(180deg); }
</style>
