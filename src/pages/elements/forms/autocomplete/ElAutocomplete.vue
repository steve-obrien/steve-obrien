<script setup>
import { computed, onMounted, ref, useId, watch } from 'vue';
import ElFieldLoadingSpinner from '../_shared/ElFieldLoadingSpinner.vue';
import ElField from '../field/ElField.vue';
import { fieldProps } from '../field/fieldProps.js';
import { useField } from '../field/useField.js';

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
	...fieldProps,
	modelValue: {
		type: String,
		default: '',
		_edit: { group: 'Control props', description: 'Current text value.' },
	},
	options: {
		type: Array,
		default: () => [],
		_edit: {
			component: 'ElJsonListInput',
			description: 'Suggestions. May be replaced by async lookup results.',
			props: {
				compact: true,
				addLabel: '+ Add suggestion',
				schema: [
					{ key: 'label', label: 'Label', placeholder: 'Suggestion label', default: (index) => `Suggestion ${index + 1}` },
					{ key: 'value', label: 'Value', placeholder: 'suggestion-value', default: (index) => `suggestion-${index + 1}` },
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
		_edit: { group: 'Control props', options: ['viewport', 'anchor'], description: 'viewport keeps suggestions inside the browser; anchor keeps them attached while scrolling.' },
	},
	loading: {
		type: [Boolean, String],
		default: false,
		_edit: { group: 'Control props', description: 'Show an inline spinner while async suggestions are being fetched.' },
	},
});
const emit = defineEmits(['update:modelValue', 'query', 'select', 'commit', 'focus', 'blur']);

const root = ref(null);
const inputEl = ref(null);
const isMounted = ref(false);
const currentText = ref('');
const field = useField(props, emit, { idPrefix: 'el-autocomplete' });
const isLoading = computed(() => booleanProp(props.loading, false));

const normalised = (option) => (typeof option === 'string' ? { value: option, label: option } : option);
const items = computed(() => props.options.map(normalised));

function syncInputFromModel() {
	currentText.value = field.value.value ?? '';
	if (inputEl.value) inputEl.value.value = field.value.value ?? '';
}

onMounted(async () => {
	isMounted.value = true;
	await import('../../lib/headless/autocomplete.js');
	syncInputFromModel();
	root.value?.addEventListener('el:input', (event) => {
		currentText.value = event.detail.value;
		field.onInput(event.detail.value);
	});
	root.value?.addEventListener('el:query', (event) => emit('query', event.detail.query));
	root.value?.addEventListener('el:select', (event) => {
		const index = Number(event.detail.option?.dataset.index);
		const item = Number.isFinite(index) ? items.value[index] : null;
		const text = event.detail.label ?? event.detail.value ?? '';
		field.onInput(text);
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

watch(field.value, syncInputFromModel);

function booleanProp(value, defaultValue = false) {
	if (value === undefined || value === null) return defaultValue;
	if (value === '' || value === true) return true;
	if (value === false) return false;
	return !['false', '0', 'no', 'off'].includes(String(value).toLowerCase());
}
</script>

<template>
	<ElField v-bind="field.fieldAttrs.value" :chrome="chrome">
		<element-autocomplete
			ref="root"
			:data-menu-id="listId"
			:value="field.value.value ?? null"
			:placement="placement"
			:floating-mode="floatingMode"
			class="relative block"
		>
			<input
				v-bind="field.inputAttrs.value"
				ref="inputEl"
				slot="input"
				type="text"
				class="el-input rounded-full px-4 focus:ring-ring/60"
				:class="isLoading ? 'pr-10' : ''"
				@focus="field.onFocus"
				@blur="field.onBlur"
			/>
			<ElFieldLoadingSpinner
				v-if="isLoading"
				class="absolute right-1 top-1"
			/>
			<Teleport to="body" :disabled="!isMounted">
				<ul
					:id="listId"
					class="el-glass-surface z-50 max-h-[min(15rem,var(--el-floating-available-height))] overflow-auto rounded-2xl p-1"
				>
					<li
						v-for="(option, index) in items"
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
		</element-autocomplete>
	</ElField>
</template>
