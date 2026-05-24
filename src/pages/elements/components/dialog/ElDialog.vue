<script setup>
import { onMounted, ref, watch } from 'vue';

defineOptions({
	__doc: {
		name: 'Dialog',
		tag: '<ElDialog>',
		description: 'A modal built on the native HTML <dialog> element — top-layer rendering, native stacking, scroll lock, and backdrop styling without z-index hacks.',
		slots: [
			{ name: 'trigger', description: 'Optional. Element that opens the dialog when clicked — omit when using v-model, a template ref, or commandfor on an external button.' },
			{ name: '(default)', description: 'Dialog body — rendered inside the card below the title and description.' },
			{ name: 'footer', description: 'Action buttons. Add `data-close` on a control to dismiss the dialog.' },
		],
		events: [
			{ name: 'update:modelValue', payload: '(open: boolean)', description: 'Emitted when the dialog opens or closes.' },
			{ name: 'close', description: 'Emitted when the dialog is dismissed.' },
		],
		keyboard: [
			{ keys: 'Esc', action: 'Closes the topmost open dialog unless `static` is set.' },
			{ keys: 'Tab / Shift+Tab', action: 'Focus stays within the dialog while open (native top-layer).' },
			{ keys: 'Click backdrop', action: 'Dismisses the dialog unless `static` is set.' },
		],
	},
});

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
	static: {
		type: Boolean,
		default: false,
		_edit: { description: 'Modal cannot be dismissed by backdrop click or Esc — use footer actions with data-close or v-model.' },
	},
});
const emit = defineEmits(['update:modelValue', 'close']);

const root = ref(null);

function setOpen(v) {
	if (!root.value) return;
	if (v) root.value.open();
	else root.value.close();
}

onMounted(async () => {
	await import('../../lib/headless/dialog.js');
	root.value?.addEventListener('el:open', () => emit('update:modelValue', true));
	root.value?.addEventListener('el:close', () => {
		emit('update:modelValue', false);
		emit('close');
	});
	if (props.modelValue) setOpen(true);
});

watch(() => props.modelValue, setOpen);

defineExpose({
	open: () => setOpen(true),
	close: () => setOpen(false),
	toggle: () => root.value?.toggle(),
	get element() { return root.value; },
});
</script>

<template>
	<!--
		<element-dialog> owns the native <dialog> internally (shadow DOM). We
		just hand it a trigger slot and the dialog body — no <dialog> tag in
		Vue templates.
	-->
	<element-dialog ref="root" :static="static || null">
		<!-- Vue does not forward slot= onto component roots; anchor trigger for element-dialog -->
		<span slot="trigger" class="contents">
			<slot name="trigger" />
		</span>
		<div class="rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-2xl shadow-black/30 ring-1 ring-border/60 outline-none w-[min(92vw,28rem)]">
			<div v-if="title || description" class="space-y-2">
				<h2 v-if="title" class="text-lg font-semibold tracking-tight">{{ title }}</h2>
				<p v-if="description" class="text-sm text-muted-foreground">{{ description }}</p>
			</div>
			<div :class="(title || description) && 'mt-4'">
				<slot />
			</div>
			<div class="mt-6 flex items-center justify-end gap-2">
				<slot name="footer">
					<button
						data-close
						type="button"
						class="inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
					>Close</button>
				</slot>
			</div>
		</div>
	</element-dialog>
</template>
