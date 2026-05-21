<script setup>
import { onMounted, onBeforeUnmount, ref, useId } from 'vue';

// useId() gives a stable, per-instance id. The previous module-counter
// approach reset on every setup() call, so multiple comboboxes on a page
// all shared the same listId.
const listId = `el-combobox-${useId()}`;

const props = defineProps({
	modelValue: {
		type: String,
		default: '',
		_edit: { description: 'Currently selected value.' },
	},
	options: {
		type: Array,
		required: true,
		_edit: {
			component: 'ElListInput',
			description: 'Searchable options. The input filters this list live.',
		},
	},
	placeholder: {
		type: String,
		default: 'Search…',
		_edit: { description: 'Placeholder shown when the input is empty.' },
	},
});
const emit = defineEmits(['update:modelValue']);

const root = ref(null);
const inputEl = ref(null);
const isMounted = ref(false);
const listStyle = ref({ position: 'fixed', top: 0, left: 0, zIndex: 50, visibility: 'hidden' });

function updatePosition() {
	if (!inputEl.value || typeof window === 'undefined') return;
	const r = inputEl.value.getBoundingClientRect();
	listStyle.value = {
		position: 'fixed',
		top: `${r.bottom + 4}px`,
		left: `${r.left}px`,
		minWidth: `${r.width}px`,
		zIndex: 50,
	};
}

let scrollHandler = null;
let resizeHandler = null;
function attachReflow() {
	scrollHandler = () => updatePosition();
	resizeHandler = () => updatePosition();
	window.addEventListener('scroll', scrollHandler, { capture: true, passive: true });
	window.addEventListener('resize', resizeHandler);
}
function detachReflow() {
	if (scrollHandler) window.removeEventListener('scroll', scrollHandler, { capture: true });
	if (resizeHandler) window.removeEventListener('resize', resizeHandler);
	scrollHandler = resizeHandler = null;
}

onMounted(async () => {
	isMounted.value = true;
	await import('../headless/combobox.js');
	root.value?.addEventListener('el:change', (e) => emit('update:modelValue', e.detail.value));
	// The combobox opens on input focus + on filter — track both.
	inputEl.value?.addEventListener('focus', () => {
		updatePosition();
		attachReflow();
	});
	inputEl.value?.addEventListener('input', updatePosition);
	inputEl.value?.addEventListener('blur', () => {
		// Tear down on next tick so click-outside in headless still fires.
		setTimeout(detachReflow, 100);
	});
});

onBeforeUnmount(detachReflow);

const normalised = (opt) => (typeof opt === 'string' ? { value: opt, label: opt } : opt);
</script>

<template>
	<element-combobox ref="root" :data-menu-id="listId" :value="modelValue || null" class="relative inline-block w-64">
		<input
			ref="inputEl"
			slot="input"
			type="text"
			:placeholder="placeholder"
			class="h-10 w-full rounded-full border border-skin-border bg-skin-background px-4 text-sm text-skin-primary outline-none transition focus:ring-2 focus:ring-skin-primary/40"
		/>
		<Teleport to="body" :disabled="!isMounted">
			<ul
				:id="listId"
				:style="listStyle"
				class="max-h-60 overflow-auto rounded-2xl border border-skin-border bg-skin-background p-1 shadow-2xl shadow-black/10 ring-1 ring-black/[0.04]"
			>
				<li
					v-for="opt in options.map(normalised)"
					:key="opt.value"
					:data-value="opt.value"
					class="cursor-pointer rounded-xl px-3 py-2 text-sm text-skin-primary transition data-[active]:bg-skin-surface aria-selected:bg-skin-surface"
				>{{ opt.label }}</li>
			</ul>
		</Teleport>
	</element-combobox>
</template>
