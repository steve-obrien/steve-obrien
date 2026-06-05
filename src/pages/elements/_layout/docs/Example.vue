<script setup>
import { computed, useSlots } from 'vue';
import CodePanel from './CodePanel.vue';
import MobilePreview from './MobilePreview.vue';

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
const props = defineProps({
	source: { type: String, default: '' },
	lang: { type: String, default: 'vue' },
	title: { type: String, default: '' },
	description: { type: String, default: '' },
	filename: { type: String, default: '' },
	defaultOpen: { type: Boolean, default: false },
	codeFirst: { type: Boolean, default: false },
	previewLines: { type: Number, default: 5 },
	propertiesTitle: { type: String, default: 'Properties' },
	presentation: {
		type: String,
		default: 'default',
		validator: (value) => ['default', 'mobile'].includes(value),
	},
	deviceTitle: { type: String, default: '' },
	device: { type: String, default: 'Elements Phone' },
});

const slots = useSlots();
const hasProperties = computed(() => Boolean(slots.properties));
const isMobilePresentation = computed(() => props.presentation === 'mobile');
const previewClasses = computed(() => {
	if (isMobilePresentation.value) {
		return hasProperties.value
			? 'flex min-h-[200px] items-center justify-center overflow-hidden bg-secondary/30 p-4 sm:p-8'
			: 'flex min-h-[200px] items-center justify-center overflow-hidden bg-secondary/30 p-4 sm:p-8';
	}
	return 'flex min-h-[200px] items-center justify-center overflow-auto p-10';
});
</script>

<template>
	<figure class="my-6 min-w-0 overflow-hidden rounded-2xl border border-border bg-background">
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

		<div
			:class="hasProperties
				? 'grid min-h-[200px] grid-cols-1 items-stretch bg-background md:grid-cols-[minmax(0,1fr)_18rem]'
				: 'block'"
		>
			<div :class="previewClasses">
				<MobilePreview
					v-if="isMobilePresentation"
					:title="deviceTitle || title"
					:device="device"
				>
					<slot />
				</MobilePreview>
				<slot v-else />
			</div>

			<aside
				v-if="hasProperties"
				class="min-h-0 border-t border-border bg-card text-card-foreground md:border-l md:border-t-0"
			>
				<div class="sticky top-0 z-10 border-b border-border bg-card px-4 py-3">
					<p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{{ props.propertiesTitle }}</p>
				</div>
				<div class="max-h-72 space-y-4 overflow-y-auto p-4 md:max-h-[32rem]">
					<slot name="properties" />
				</div>
			</aside>
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
