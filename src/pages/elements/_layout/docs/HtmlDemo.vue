<script setup>
import { onMounted, ref, watch } from 'vue';
import { mountHtmlExample } from './runHtmlExample.js';

const props = defineProps({
	source: { type: String, required: true },
});

const root = ref(null);

async function mount() {
	if (!root.value) return;
	try {
		await mountHtmlExample(root.value, props.source);
	} catch (err) {
		console.error('[HtmlDemo]', err);
	}
}

onMounted(mount);
watch(() => props.source, mount);
</script>

<template>
	<div ref="root" class="html-demo flex flex-wrap items-center justify-center gap-3" />
</template>

<!--
This CSS hides any <script> elements rendered inside the .html-demo container. 
:deep(script) ensures that <script> tags in child components or rendered HTML examples are not displayed, 
preventing raw scripts from being shown in the demo UI.
-->
<style scoped>
.html-demo :deep(script) {
	display: none;
}
</style>
