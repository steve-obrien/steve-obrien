<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { highlight } from './shiki.js';

// The code half of an <Example> / <Playground>. Shows a toolbar with a copy
// button + show/hide toggle, and renders the source with Shiki highlighting
// when the CDN load succeeded (falls back to a plain <pre> otherwise).
const props = defineProps({
	source: { type: String, default: '' },
	lang: { type: String, default: 'vue' },
	filename: { type: String, default: '' },
	defaultOpen: { type: Boolean, default: true },
	previewLines: { type: Number, default: 0 },
});

const showCode = ref(props.defaultOpen || props.previewLines > 0);
const expanded = ref(props.defaultOpen);
const copied = ref(false);
const highlighted = ref(null);
const isPreview = computed(() => props.previewLines > 0);
const isClipped = computed(() => showCode.value && isPreview.value && !expanded.value);
const toggleLabel = computed(() => {
	if (isPreview.value) return expanded.value ? 'Collapse code' : 'Expand code';
	return showCode.value ? 'Hide code' : 'Show code';
});
const codeStyle = computed(() => {
	if (!isPreview.value) return {};
	if (expanded.value) return { maxHeight: '70vh' };
	return { maxHeight: `${Math.round((props.previewLines * 20.625) + 32)}px` };
});

async function refreshHighlight() {
	highlighted.value = await highlight(props.source, props.lang);
}
onMounted(refreshHighlight);
watch(() => [props.source, props.lang], refreshHighlight);

function copy() {
	if (typeof navigator === 'undefined' || !navigator.clipboard) return;
	navigator.clipboard.writeText(props.source);
	copied.value = true;
	setTimeout(() => { copied.value = false; }, 1500);
}

function toggleCode() {
	if (isPreview.value) {
		showCode.value = true;
		expanded.value = !expanded.value;
		return;
	}
	showCode.value = !showCode.value;
}

function expandPreview() {
	if (isClipped.value) expanded.value = true;
}
</script>

<template>
	<div>
		<div class="flex items-center justify-between border-t border-skin-border bg-skin-surface/40 px-3 py-1.5 text-xs">
			<button
				type="button"
				class="inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-medium text-skin-secondary hover:bg-skin-background hover:text-skin-primary"
				@click="toggleCode"
			>
				<svg viewBox="0 0 16 16" class="size-3.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
					<path d="M5 4L1 8l4 4M11 4l4 4-4 4" />
				</svg>
				{{ toggleLabel }}
			</button>
			<div class="flex items-center gap-2">
				<span v-if="filename" class="font-mono text-[11px] text-skin-muted">{{ filename }}</span>
				<span class="font-mono text-[11px] uppercase tracking-wider text-skin-muted">{{ lang }}</span>
				<button
					type="button"
					class="rounded-md px-2 py-1 font-medium text-skin-secondary hover:bg-skin-background hover:text-skin-primary"
					@click="copy"
				>{{ copied ? 'Copied' : 'Copy' }}</button>
			</div>
		</div>

		<div
			v-if="showCode"
			class="el-code relative border-t border-skin-border transition-[max-height] duration-300 ease-out"
			:class="isClipped ? 'cursor-pointer overflow-hidden' : 'overflow-auto'"
			:style="codeStyle"
			@click="expandPreview"
		>
			<div v-if="highlighted" class="el-shiki" v-html="highlighted"></div>
			<pre v-else class="overflow-auto bg-[#0b1020] p-4 text-[12.5px] leading-relaxed text-white/90"><code>{{ source }}</code></pre>
			<div
				v-if="isClipped"
				class="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-b from-transparent via-skin-background/80 to-skin-background"
			></div>
		</div>
	</div>
</template>
