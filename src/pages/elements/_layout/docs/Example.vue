<script setup>
import CodePanel from './CodePanel.vue';

// Pair a live demo with its source code — guaranteed in sync because both come
// from the same SFC file:
//
//   import Demo from './examples/Basic.vue';
//   import Src  from './examples/Basic.vue?raw';
//
//   <Example :source="Src"><Demo /></Example>
//
// Editing the example file updates both panels at once. The user can copy a
// snippet that matches exactly what they see rendered.
defineProps({
	source: { type: String, default: '' },
	lang: { type: String, default: 'vue' },
	title: { type: String, default: '' },
	description: { type: String, default: '' },
	filename: { type: String, default: '' },
	defaultOpen: { type: Boolean, default: false },
	codeFirst: { type: Boolean, default: false },
	previewLines: { type: Number, default: 5 },
});
</script>

<template>
	<figure class="my-6 overflow-hidden rounded-2xl border border-border bg-background">
		<figcaption v-if="title || description" class="border-b border-border bg-secondary/40 px-5 py-3">
			<p v-if="title" class="text-sm font-semibold tracking-tight text-foreground">{{ title }}</p>
			<p v-if="description" class="mt-0.5 text-sm text-muted-foreground">{{ description }}</p>
		</figcaption>

		<CodePanel
			v-if="codeFirst"
			:source="source"
			:lang="lang"
			:filename="filename"
			:default-open="defaultOpen"
			:preview-lines="previewLines"
		/>

		<div class="flex min-h-[200px] items-center justify-center p-10">
			<slot />
		</div>

		<CodePanel
			v-if="!codeFirst"
			:source="source"
			:lang="lang"
			:filename="filename"
			:default-open="defaultOpen"
			:preview-lines="previewLines"
		/>
	</figure>
</template>
