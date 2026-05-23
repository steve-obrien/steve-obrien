<script setup>
import CodePanel from './docs/CodePanel.vue';

defineProps({
	lang: { type: String, default: 'vue' },
	code: { type: String, required: true },
	filename: { type: String, default: '' },
	defaultOpen: { type: Boolean, default: true },
	previewLines: { type: Number, default: 0 },
});
</script>

<template>
	<div class="overflow-hidden rounded-2xl border border-border bg-background">
		<CodePanel
			:source="code"
			:lang="lang"
			:filename="filename"
			:default-open="defaultOpen"
			:preview-lines="previewLines"
			:border-top="false"
		/>
	</div>
</template>
