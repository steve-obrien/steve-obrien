<script setup>
import { onMounted, ref, watch } from 'vue';

const props = defineProps({
	modelValue: {
		type: Boolean,
		default: false,
		_edit: { description: 'Whether the dialog is open.' },
	},
	title: {
		type: String,
		default: '',
		_edit: { description: 'Heading rendered inside the dialog card.' },
	},
	description: {
		type: String,
		default: '',
		_edit: { description: 'Supporting copy under the heading.' },
	},
});
const emit = defineEmits(['update:modelValue', 'close']);

const root = ref(null);

onMounted(async () => {
	await import('../headless/dialog.js');
	root.value?.addEventListener('el:open', () => emit('update:modelValue', true));
	root.value?.addEventListener('el:close', () => {
		emit('update:modelValue', false);
		emit('close');
	});
	if (props.modelValue) root.value.open = true;
});

watch(() => props.modelValue, (v) => {
	if (root.value) root.value.open = v;
});
</script>

<template>
	<!--
		<element-dialog> owns the native <dialog> internally (shadow DOM). We
		just hand it a trigger slot and the dialog body — no <dialog> tag in
		Vue templates.
	-->
	<element-dialog ref="root">
		<slot name="trigger" />
		<div class="rounded-2xl border border-skin-border bg-skin-background p-6 shadow-2xl shadow-black/30 ring-1 ring-black/[0.04] outline-none w-[min(92vw,28rem)]">
			<div v-if="title || description" class="space-y-2">
				<h2 v-if="title" class="text-lg font-semibold tracking-tight text-skin-primary">{{ title }}</h2>
				<p v-if="description" class="text-sm text-skin-secondary">{{ description }}</p>
			</div>
			<div :class="(title || description) && 'mt-4'">
				<slot />
			</div>
			<div class="mt-6 flex items-center justify-end gap-2">
				<slot name="footer">
					<button
						data-close
						type="button"
						class="inline-flex h-9 items-center rounded-full bg-skin-primary px-4 text-sm font-medium text-skin-inverse hover:opacity-90"
					>Close</button>
				</slot>
			</div>
		</div>
	</element-dialog>
</template>
