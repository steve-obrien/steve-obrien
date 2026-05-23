<script setup>
import { computed, onMounted, ref, useId, watch } from 'vue';

const listId = `el-combobox-${useId()}`;

defineOptions({
	__doc: {
		name: 'Combobox',
		tag: '<ElCombobox>',
		description: 'Select-like combobox with a styled input, floating list, keyboard navigation, and query events for async lookups.',
		slots: [
			{ name: 'item', payload: '{ item, index }', description: 'Replaces the rendering of each option.' },
		],
		events: [
			{ name: 'query', payload: '(query: string)', description: 'Fired as the user types. Use it to fetch or replace options.' },
			{ name: 'select', payload: '({ item, value, label })', description: 'Fired when an option is selected. item is the original option object.' },
		],
	},
});

const props = defineProps({
	modelValue: {
		type: [String, Number],
		default: '',
		_edit: { description: 'Committed selected value.' },
	},
	options: {
		type: Array,
		required: true,
		_edit: {
			component: 'ElListInput',
			description: 'Available options. May be replaced by async lookup results.',
		},
	},
	placeholder: {
		type: String,
		default: 'Search...',
		_edit: { description: 'Placeholder shown when the input is empty.' },
	},
	placement: {
		type: String,
		default: 'bottom',
		_edit: { options: ['bottom', 'top', 'right', 'left'], description: 'Preferred side before collision handling.' },
	},
	floatingMode: {
		type: String,
		default: 'viewport',
		_edit: { options: ['viewport', 'anchor'], description: 'viewport keeps the list inside the browser; anchor keeps it attached while scrolling.' },
	},
});
const emit = defineEmits(['update:modelValue', 'query', 'select']);

const root = ref(null);
const inputEl = ref(null);
const isMounted = ref(false);

const normalised = (option) => (typeof option === 'string' ? { value: option, label: option } : option);
const optionList = computed(() => props.options.map(normalised));

function displayForValue(value) {
	const selected = optionList.value.find((option) => String(option.value ?? option.label) === String(value));
	return selected ? (selected.label ?? selected.value ?? '') : (value ?? '');
}

function syncInputFromModel() {
	if (inputEl.value) inputEl.value.value = displayForValue(props.modelValue);
}

onMounted(async () => {
	isMounted.value = true;
	await import('../headless/combobox.js');
	syncInputFromModel();
	root.value?.addEventListener('el:change', (event) => emit('update:modelValue', event.detail.value));
	root.value?.addEventListener('el:select', (event) => {
		const index = Number(event.detail.option?.dataset.index);
		emit('select', {
			item: Number.isFinite(index) ? optionList.value[index] : null,
			value: event.detail.value,
			label: event.detail.label,
			option: event.detail.option,
		});
	});
	root.value?.addEventListener('el:query', (event) => {
		emit('query', event.detail.query);
	});
});

watch([() => props.modelValue, optionList], syncInputFromModel);
</script>

<template>
	<element-combobox
		ref="root"
		:data-menu-id="listId"
		:value="modelValue ?? null"
		:placement="placement"
		:floating-mode="floatingMode"
		class="relative block"
	>
		<input
			ref="inputEl"
			slot="input"
			type="text"
			:placeholder="placeholder"
			class="h-10 w-full rounded-full border border-border bg-background px-4 pr-10 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring/60"
		/>
		<button
			slot="toggle"
			type="button"
			class="absolute right-1 top-1 inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
			aria-label="Show options"
		>
			<svg viewBox="0 0 20 20" class="size-4" fill="none">
				<path d="M6 8l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		</button>
		<Teleport to="body" :disabled="!isMounted">
			<ul
				:id="listId"
				class="z-50 max-h-[min(15rem,var(--el-floating-available-height))] overflow-auto rounded-2xl border border-border bg-popover p-1 text-popover-foreground shadow-2xl shadow-black/10 ring-1 ring-border/60"
			>
				<li
					v-for="(option, index) in optionList"
					:key="option.value ?? index"
					:data-value="option.value"
					:data-label="option.label"
					:data-index="index"
					class="cursor-pointer rounded-xl px-3 py-2 text-sm transition data-[active]:bg-accent aria-selected:bg-accent"
				>
					<slot name="item" :item="option" :index="index">{{ option.label }}</slot>
				</li>
			</ul>
		</Teleport>
	</element-combobox>
</template>
