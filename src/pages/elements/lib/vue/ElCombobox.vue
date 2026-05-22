<script setup>
import { computed, onMounted, ref, useId, watch } from 'vue';

const listId = `el-combobox-${useId()}`;

defineOptions({
	__doc: {
		name: 'Combobox',
		tag: '<ElCombobox>',
		description: 'Select-like combobox with a styled input, floating list, keyboard navigation, optional creation, and query events for async lookups.',
		slots: [
			{ name: 'item', payload: '{ item, index }', description: 'Replaces the rendering of each option.' },
		],
		events: [
			{ name: 'query', payload: '(query: string)', description: 'Fired as the user types. Use it to fetch or replace options.' },
			{ name: 'create', payload: '(value: string)', description: 'Fired when creatable is true and a missing value is committed.' },
		],
	},
});

const props = defineProps({
	modelValue: {
		type: String,
		default: '',
		_edit: { description: 'Committed selected value.' },
	},
	options: {
		type: Array,
		required: true,
		_edit: {
			editor: 'ElListInput',
			description: 'Available options. May be replaced by async lookup results.',
		},
	},
	placeholder: {
		type: String,
		default: 'Search...',
		_edit: { description: 'Placeholder shown when the input is empty.' },
	},
	creatable: {
		type: Boolean,
		default: false,
		_edit: { description: 'Allow committing a value that is not in the list.' },
	},
	placement: {
		type: String,
		default: 'bottom',
		_edit: { options: ['bottom', 'top', 'right', 'left'], description: 'Preferred side before collision handling.' },
	},
});
const emit = defineEmits(['update:modelValue', 'query', 'create']);

const root = ref(null);
const inputEl = ref(null);
const isMounted = ref(false);
const query = ref('');

const normalised = (option) => (typeof option === 'string' ? { value: option, label: option } : option);
const optionList = computed(() => props.options.map(normalised));
const visibleItems = computed(() => {
	const q = query.value.trim().toLowerCase();
	const items = [...optionList.value];
	const exact = items.some((item) => String(item.value ?? item.label).toLowerCase() === q || String(item.label ?? item.value).toLowerCase() === q);
	if (props.creatable && q && !exact) {
		items.push({ value: query.value.trim(), label: `Add "${query.value.trim()}"`, create: true });
	}
	return items;
});

function syncInputFromModel() {
	if (inputEl.value) inputEl.value.value = props.modelValue ?? '';
}

onMounted(async () => {
	isMounted.value = true;
	await import('../headless/combobox.js');
	syncInputFromModel();
	root.value?.addEventListener('el:change', (event) => emit('update:modelValue', event.detail.value));
	root.value?.addEventListener('el:query', (event) => {
		query.value = event.detail.query;
		emit('query', event.detail.query);
	});
	root.value?.addEventListener('el:create', (event) => emit('create', event.detail.value));
});

watch(() => props.modelValue, syncInputFromModel);
</script>

<template>
	<element-combobox
		ref="root"
		:data-menu-id="listId"
		:value="modelValue || null"
		:placement="placement"
		:creatable="creatable ? '' : null"
		class="relative inline-block w-64"
	>
		<input
			ref="inputEl"
			slot="input"
			type="text"
			:placeholder="placeholder"
			class="h-10 w-full rounded-full border border-skin-border bg-skin-background px-4 pr-10 text-sm text-skin-primary outline-none transition focus:ring-2 focus:ring-skin-primary/60"
		/>
		<button
			slot="toggle"
			type="button"
			class="absolute right-1 top-1 inline-flex size-8 items-center justify-center rounded-full text-skin-muted transition hover:bg-skin-surface hover:text-skin-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-skin-primary/60"
			aria-label="Show options"
		>
			<svg viewBox="0 0 20 20" class="size-4" fill="none">
				<path d="M6 8l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		</button>
		<Teleport to="body" :disabled="!isMounted">
			<ul
				:id="listId"
				class="z-50 max-h-[min(15rem,var(--el-floating-available-height))] overflow-auto rounded-2xl border border-skin-border bg-skin-background p-1 shadow-2xl shadow-black/10 ring-1 ring-black/[0.04]"
			>
				<li
					v-for="(option, index) in visibleItems"
					:key="`${option.create ? 'create' : 'option'}-${option.value}`"
					:data-value="option.value"
					:data-label="option.label"
					:data-create="option.create ? '' : null"
					class="cursor-pointer rounded-xl px-3 py-2 text-sm text-skin-primary transition data-[active]:bg-skin-surface aria-selected:bg-skin-surface"
				>
					<slot name="item" :item="option" :index="index">{{ option.label }}</slot>
				</li>
			</ul>
		</Teleport>
	</element-combobox>
</template>
