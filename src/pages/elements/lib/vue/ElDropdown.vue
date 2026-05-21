<script setup>
import { onMounted, onBeforeUnmount, ref, useId } from 'vue';

// useId() is stable across SSR and unique per component instance — replaces
// the previous module-counter approach which reset on every setup and gave
// every dropdown the same id when multiple instances rendered on a page.
const menuId = `el-dropdown-${useId()}`;

const props = defineProps({
	items: {
		type: Array,
		required: true,
		_edit: {
			component: 'ElListInput',
			description: 'Menu items shown when the dropdown opens.',
		},
	},
	label: {
		type: String,
		default: 'Options',
		_edit: { description: 'Trigger button label (overridden by the #trigger slot if used).' },
	},
	align: {
		type: String,
		default: 'left',
		_edit: {
			type: 'select',
			options: ['left', 'right'],
			description: 'Where the menu opens relative to the trigger.',
		},
	},
	width: {
		type: String,
		default: 'min-w-[12rem]',
		_edit: { description: 'Tailwind width utility for the menu (e.g. min-w-[16rem]).' },
	},
});
const emit = defineEmits(['select']);

const root = ref(null);
const triggerEl = ref(null);
const isMounted = ref(false);
const menuStyle = ref({ position: 'fixed', top: 0, left: 0, zIndex: 50, visibility: 'hidden' });

function updatePosition() {
	if (!triggerEl.value || typeof window === 'undefined') return;
	const r = triggerEl.value.getBoundingClientRect();
	menuStyle.value = {
		position: 'fixed',
		top: `${r.bottom + 4}px`,
		left: props.align === 'right' ? 'auto' : `${r.left}px`,
		right: props.align === 'right' ? `${window.innerWidth - r.right}px` : 'auto',
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
	await import('../headless/dropdown.js');
	root.value?.addEventListener('el:select', (e) => emit('select', e.detail.value));
	root.value?.addEventListener('el:open', () => {
		updatePosition();
		attachReflow();
	});
	root.value?.addEventListener('el:close', () => {
		detachReflow();
	});
});

onBeforeUnmount(detachReflow);

const labelOf = (item) => (item && typeof item === 'object' ? (item.label ?? item.value) : item);
const valueOf = (item) => (item && typeof item === 'object' ? (item.value ?? item.label) : item);
</script>

<template>
	<element-dropdown ref="root" :data-menu-id="menuId" class="relative inline-block">
		<button
			ref="triggerEl"
			slot="trigger"
			type="button"
			class="inline-flex h-10 items-center gap-2 rounded-full bg-skin-surface px-4 text-sm font-medium text-skin-primary ring-1 ring-skin-border transition hover:bg-skin-border/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-skin-primary/60"
		>
			<slot name="trigger">{{ label }}</slot>
			<svg viewBox="0 0 20 20" class="size-4 opacity-70" fill="none">
				<path d="M6 8l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		</button>
		<Teleport to="body" :disabled="!isMounted">
			<div
				:id="menuId"
				:style="menuStyle"
				class="rounded-2xl border border-skin-border bg-skin-background p-1 shadow-2xl shadow-black/10 ring-1 ring-black/[0.04] dark:shadow-black/40"
				:class="width"
			>
				<template v-for="(item, i) in items" :key="valueOf(item) ?? i">
					<hr v-if="item && item.separator" class="my-1 border-t border-skin-border" />
					<button
						v-else
						role="menuitem"
						:data-value="valueOf(item)"
						class="block w-full rounded-xl px-3 py-2 text-left text-sm text-skin-primary outline-none transition hover:bg-skin-surface focus:bg-skin-surface"
					>
						<slot name="item" :item="item" :index="i">{{ labelOf(item) }}</slot>
					</button>
				</template>
			</div>
		</Teleport>
	</element-dropdown>
</template>
