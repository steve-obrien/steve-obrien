<script setup>
import { onMounted, ref, watch } from 'vue';
import { highlight } from './shiki.js';

// The code half of an <Example> / <Playground>. Shows a toolbar with a copy
// button + show/hide toggle, and renders the source with Shiki highlighting
// when the CDN load succeeded (falls back to a plain <pre> otherwise).
const props = defineProps({
	source: { type: String, default: '' },
	lang: { type: String, default: 'vue' },
	filename: { type: String, default: '' },
	defaultOpen: { type: Boolean, default: true },
});

const showCode = ref(props.defaultOpen);
const copied = ref(false);
const highlighted = ref(null);

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
</script>

<template>
	<div>
		<div class="flex items-center justify-between border-t border-skin-border bg-skin-surface/40 px-3 py-1.5 text-xs">
			<button
				type="button"
				class="inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-medium text-skin-secondary hover:bg-skin-background hover:text-skin-primary"
				@click="showCode = !showCode"
			>
				<svg viewBox="0 0 16 16" class="size-3.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
					<path d="M5 4L1 8l4 4M11 4l4 4-4 4" />
				</svg>
				{{ showCode ? 'Hide code' : 'Show code' }}
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

		<div v-if="showCode" class="el-code border-t border-skin-border">
			<div v-if="highlighted" class="el-shiki" v-html="highlighted"></div>
			<pre v-else class="overflow-auto bg-[#0b1020] p-4 text-[12.5px] leading-relaxed text-white/90"><code>{{ source }}</code></pre>
		</div>
	</div>
</template>
