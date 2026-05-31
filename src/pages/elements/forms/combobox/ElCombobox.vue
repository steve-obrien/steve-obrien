<script setup>
import { computed, onMounted, ref, useId, watch } from 'vue';
import ElFieldLoadingSpinner from '../_shared/ElFieldLoadingSpinner.vue';
import ElField from '../field/ElField.vue';
import { fieldProps } from '../field/fieldProps.js';
import { useField } from '../field/useField.js';

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
	...fieldProps,
	modelValue: {
		type: [String, Number],
		default: '',
		_edit: { group: 'Control props', description: 'Committed selected value.' },
	},
	options: {
		type: Array,
		required: true,
		_edit: {
			component: 'ElJsonListInput',
			description: 'Available options. May be replaced by async lookup results.',
			props: {
				compact: true,
				addLabel: '+ Add option',
				schema: [
					{ key: 'label', label: 'Label', placeholder: 'Option label', default: (index) => `Option ${index + 1}` },
					{ key: 'value', label: 'Value', placeholder: 'option-value', default: (index) => `option-${index + 1}` },
				],
			},
		},
	},
	placeholder: {
		type: String,
		default: 'Search...',
		_edit: { group: 'Control props', description: 'Placeholder shown when the input is empty.' },
	},
	placement: {
		type: String,
		default: 'bottom',
		_edit: { group: 'Control props', options: ['bottom', 'top', 'right', 'left'], description: 'Preferred side before collision handling.' },
	},
	floatingMode: {
		type: String,
		default: 'viewport',
		_edit: { group: 'Control props', options: ['viewport', 'anchor'], description: 'viewport keeps the list inside the browser; anchor keeps it attached while scrolling.' },
	},
	clearable: {
		type: [Boolean, String],
		default: true,
		_edit: { group: 'Control props', description: 'Show a clear button when an option has been selected.' },
	},
	loading: {
		type: [Boolean, String],
		default: false,
		_edit: { group: 'Control props', description: 'Show an inline spinner while async options are being fetched.' },
	},
});
const emit = defineEmits(['update:modelValue', 'query', 'select', 'focus', 'blur']);

const root = ref(null);
const inputEl = ref(null);
const isMounted = ref(false);
const field = useField(props, emit, { idPrefix: 'el-combobox' });
const isClearable = computed(() => booleanProp(props.clearable, true));
const isLoading = computed(() => booleanProp(props.loading, false));
const hasSelection = computed(() => field.value.value !== null && field.value.value !== undefined && field.value.value !== '');
const inputAttrs = computed(() => {
	const { value: _value, ...attrs } = field.inputAttrs.value;
	return attrs;
});
const inputPaddingClass = computed(() => {
	if (isClearable.value && hasSelection.value && isLoading.value) return 'pr-28';
	if (isClearable.value && hasSelection.value) return 'pr-20';
	if (isLoading.value) return 'pr-20';
	return 'pr-10';
});
const loadingPositionClass = computed(() => (isClearable.value && hasSelection.value ? 'right-[4.25rem]' : 'right-9'));

const normalised = (option) => (typeof option === 'string' ? { value: option, label: option } : option);
const optionList = computed(() => props.options.map(normalised));

function displayForValue(value) {
	const selected = optionList.value.find((option) => String(option.value ?? option.label) === String(value));
	return selected ? (selected.label ?? selected.value ?? '') : (value ?? '');
}

function syncInputFromModel() {
	if (root.value && root.value.value !== String(field.value.value ?? '')) {
		root.value.value = field.value.value ?? '';
	}
	if (inputEl.value) inputEl.value.value = displayForValue(field.value.value);
}

function syncInputAfterOptionsChange() {
	if (!hasSelection.value || field.focused.value) return;
	syncInputFromModel();
}

onMounted(async () => {
	isMounted.value = true;
	await import('../../lib/headless/combobox.js');
	syncInputFromModel();
	root.value?.addEventListener('el:change', (event) => field.onInput(event.detail.value));
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

watch(field.value, syncInputFromModel);
watch(optionList, syncInputAfterOptionsChange);

function clearSelection() {
	field.setValue('');
	if (root.value) root.value.value = '';
	if (inputEl.value) inputEl.value.value = '';
	root.value?.removeAttribute('open');
	emit('select', { item: null, value: '', label: '', option: null });
}

function booleanProp(value, defaultValue = false) {
	if (value === undefined || value === null) return defaultValue;
	if (value === '' || value === true) return true;
	if (value === false) return false;
	return !['false', '0', 'no', 'off'].includes(String(value).toLowerCase());
}
</script>

<template>
	<ElField v-bind="field.fieldAttrs.value" :chrome="chrome">
		<element-combobox
			ref="root"
			:data-menu-id="listId"
			:placement="placement"
			:floating-mode="floatingMode"
			class="relative block"
		>
			<input
				v-bind="inputAttrs"
				ref="inputEl"
				slot="input"
				type="text"
				class="el-input rounded-full px-4 focus:ring-ring/60"
				:class="inputPaddingClass"
				@focus="field.onFocus"
				@blur="field.onBlur"
			/>
			<ElFieldLoadingSpinner
				v-if="isLoading"
				class="absolute top-1"
				:class="loadingPositionClass"
			/>
			<button
				v-if="isClearable && hasSelection"
				type="button"
				class="absolute right-9 top-1 inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
				aria-label="Clear selection"
				@click.stop="clearSelection"
				@mousedown.prevent
			>
				<svg viewBox="0 0 20 20" class="size-4" fill="none">
					<circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.5" />
					<path d="M7.5 7.5l5 5M12.5 7.5l-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
				</svg>
			</button>
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
					class="el-glass-surface z-50 max-h-[min(15rem,var(--el-floating-available-height))] overflow-auto rounded-2xl p-1"
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
	</ElField>
</template>
