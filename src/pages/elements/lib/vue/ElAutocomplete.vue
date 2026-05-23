<script setup>
import { computed, onMounted, ref, useId, watch } from 'vue';

const listId = `el-autocomplete-${useId()}`;

defineOptions({
	__doc: {
		name: 'Autocomplete',
		tag: '<ElAutocomplete>',
		description: 'Free-text autocomplete with optional suggestions, floating positioning, keyboard navigation, and query events for async lookups.',
		slots: [
			{ name: 'item', payload: '{ item, index }', description: 'Replaces the rendering of each suggestion.' },
		],
		events: [
			{ name: 'query', payload: '(query: string)', description: 'Fired as the user types. Use it to fetch or replace suggestions.' },
			{ name: 'select', payload: '({ item, value, label, text, query })', description: 'Fired when a suggestion is chosen. item is the original option object.' },
			{ name: 'commit', payload: '({ value, label, custom })', description: 'Fired when the current text is committed with Enter.' },
		],
	},
});

const props = defineProps({
	modelValue: {
		type: String,
		default: '',
		_edit: { description: 'Current text value.' },
	},
	options: {
		type: Array,
		default: () => [],
		_edit: {
			component: 'ElListInput',
			description: 'Suggestions. May be replaced by async lookup results.',
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
		_edit: { options: ['viewport', 'anchor'], description: 'viewport keeps suggestions inside the browser; anchor keeps them attached while scrolling.' },
	},
});
const emit = defineEmits(['update:modelValue', 'query', 'select', 'commit']);

const root = ref(null);
const inputEl = ref(null);
const isMounted = ref(false);
const currentText = ref('');

const normalised = (option) => (typeof option === 'string' ? { value: option, label: option } : option);
const items = computed(() => props.options.map(normalised));

function syncInputFromModel() {
	currentText.value = props.modelValue ?? '';
	if (inputEl.value) inputEl.value.value = props.modelValue ?? '';
}

onMounted(async () => {
	isMounted.value = true;
	await import('../headless/autocomplete.js');
	syncInputFromModel();
	root.value?.addEventListener('el:input', (event) => {
		currentText.value = event.detail.value;
		emit('update:modelValue', event.detail.value);
	});
	root.value?.addEventListener('el:query', (event) => emit('query', event.detail.query));
	root.value?.addEventListener('el:select', (event) => {
		const index = Number(event.detail.option?.dataset.index);
		const item = Number.isFinite(index) ? items.value[index] : null;
		const text = event.detail.label ?? event.detail.value ?? '';
		emit('update:modelValue', text);
		emit('select', {
			item,
			value: event.detail.value,
			label: event.detail.label,
			text,
			query: currentText.value,
			option: event.detail.option,
		});
		currentText.value = text;
	});
	root.value?.addEventListener('el:change', (event) => emit('commit', event.detail));
});

watch(() => props.modelValue, syncInputFromModel);
</script>

<template>
	<element-autocomplete
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
			class="h-10 w-full rounded-full border border-skin-border bg-skin-background px-4 text-sm text-skin-primary outline-none transition focus:ring-2 focus:ring-skin-primary/60"
		/>
		<Teleport to="body" :disabled="!isMounted">
			<ul
				:id="listId"
				class="z-50 max-h-[min(15rem,var(--el-floating-available-height))] overflow-auto rounded-2xl border border-skin-border bg-skin-background p-1 shadow-2xl shadow-black/10 ring-1 ring-black/[0.04]"
			>
				<li
					v-for="(option, index) in items"
					:key="option.value ?? index"
					:data-value="option.value"
					:data-label="option.label"
					:data-index="index"
					class="cursor-pointer rounded-xl px-3 py-2 text-sm text-skin-primary transition data-[active]:bg-skin-surface aria-selected:bg-skin-surface"
				>
					<slot name="item" :item="option" :index="index">{{ option.label }}</slot>
				</li>
			</ul>
		</Teleport>
	</element-autocomplete>
</template>
