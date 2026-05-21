<script setup>
import { ref } from 'vue';
defineProps({
	lang: { type: String, default: 'vue' },
	code: { type: String, required: true },
});

const copied = ref(false);
function copy(text) {
	if (typeof navigator === 'undefined' || !navigator.clipboard) return;
	navigator.clipboard.writeText(text);
	copied.value = true;
	setTimeout(() => { copied.value = false; }, 1500);
}
</script>

<template>
	<div class="group relative overflow-hidden rounded-2xl border border-skin-border bg-[#0b1020]">
		<div class="flex items-center justify-between border-b border-white/5 px-4 py-2 text-xs text-white/60">
			<span class="font-mono uppercase tracking-wider">{{ lang }}</span>
			<button
				type="button"
				class="rounded-md px-2 py-1 font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
				@click="copy(code)"
			>{{ copied ? 'Copied' : 'Copy' }}</button>
		</div>
		<pre class="overflow-auto p-4 text-[12.5px] leading-relaxed text-white/90"><code>{{ code }}</code></pre>
	</div>
</template>
