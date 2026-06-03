<script setup>
import { computed, nextTick, ref } from 'vue';
import ElFieldLoadingSpinner from '../_shared/ElFieldLoadingSpinner.vue';
import { booleanProp, normalizeOption, optionKey, searchableText, splitTokens as splitOptionTokens } from '../_shared/options.js';
import { useOptionMenu } from '../_shared/useOptionMenu.js';
import ElField from '../field/ElField.vue';
import { fieldProps } from '../field/fieldProps.js';
import { useField } from '../field/useField.js';

defineOptions({
	__doc: {
		name: 'Tag combobox',
		tag: '<ElTagCombobox>',
		description: 'A tokenizing multi-select combobox for class lists, recipients, labels, and other values that need autocomplete plus optional custom entries.',
		icon: 'M7 5h5l5 5-7 7-5-5 7-7Zm1.5 4.5h.01M15 15h4M17 13v4',
		slots: [
			{ name: 'item', payload: '{ item, index, active, custom }', description: 'Replaces each suggestion row.' },
			{ name: 'tag', payload: '{ item, value, label, remove }', description: 'Replaces each selected token.' },
		],
		events: [
			{ name: 'query', payload: 'string', description: 'Fired as the user types.' },
			{ name: 'add', payload: '({ item, value, label, custom })', description: 'Fired when a tag is added.' },
			{ name: 'remove', payload: '({ item, value, label })', description: 'Fired when a tag is removed.' },
			{ name: 'select', payload: '({ item, value, label, custom })', description: 'Fired when a suggestion or custom value is committed.' },
			{ name: 'change', payload: 'Array', description: 'Fired after the selected values array changes.' },
		],
	},
});

const props = defineProps({
	...fieldProps,
	modelValue: {
		type: Array,
		default: () => [],
		_edit: {
			component: 'ElJsonInput',
			description: 'Selected tag values.',
		},
	},
	options: {
		type: Array,
		default: () => [],
		_edit: {
			component: 'ElJsonListInput',
			description: 'Autocomplete options. Strings are treated as both label and value.',
			props: {
				compact: true,
				addLabel: '+ Add option',
				schema: [
					{ key: 'label', label: 'Label', placeholder: 'Option label', default: (index) => `Option ${index + 1}` },
					{ key: 'value', label: 'Value', placeholder: 'option-value', default: (index) => `option-${index + 1}` },
					{ key: 'description', label: 'Description', placeholder: 'Optional helper text' },
					{ key: 'group', label: 'Group', placeholder: 'Optional group' },
				],
			},
		},
	},
	placeholder: {
		type: String,
		default: 'Add tags...',
		_edit: { group: 'Control props', description: 'Placeholder shown when no query is active.' },
	},
	allowCustom: {
		type: [Boolean, String],
		default: false,
		_edit: { group: 'Control props', description: 'Allow values that do not exist in options.' },
	},
	filterOptions: {
		type: [Boolean, String],
		default: true,
		_edit: { group: 'Control props', description: 'Filter options locally. Turn off when options are already server-filtered.' },
	},
	loading: {
		type: [Boolean, String],
		default: false,
		_edit: { group: 'Control props', description: 'Show an inline loading spinner while async options are being fetched.' },
	},
	emptyText: {
		type: String,
		default: 'No matches',
		_edit: { group: 'Control props', description: 'Message shown when no option matches and custom values are not available.' },
	},
	maxOptions: {
		type: Number,
		default: 8,
		_edit: { group: 'Control props', description: 'Maximum matching suggestions to show.' },
	},
	tokenSeparators: {
		type: Array,
		default: () => [' ', ','],
		_edit: { component: 'ElJsonInput', group: 'Control props', description: 'Characters that split pasted text into tags.' },
	},
	clearable: {
		type: [Boolean, String],
		default: false,
		_edit: { group: 'Control props', description: 'Show a clear-all button when tags are selected.' },
	},
});

const emit = defineEmits(['update:modelValue', 'query', 'add', 'remove', 'select', 'change', 'focus', 'blur']);

const inputEl = ref(null);
const query = ref('');
const field = useField(props, emit, { idPrefix: 'el-tag-combobox' });

const selectedValues = computed(() => Array.isArray(field.value.value) ? field.value.value : []);
const normalizedOptions = computed(() => props.options.map((option) => normalizeOption(option)).filter(Boolean));
const selectedItems = computed(() => selectedValues.value.map((value) => optionForValue(value) || customOption(value)));
const selectedValueKeys = computed(() => new Set(selectedValues.value.map(optionKey)));
const isClearable = computed(() => booleanProp(props.clearable, false));
const isCustomAllowed = computed(() => booleanProp(props.allowCustom, false));
const isFilteringOptions = computed(() => booleanProp(props.filterOptions, true));
const isLoading = computed(() => booleanProp(props.loading, false));
const controlInputAttrs = computed(() => {
	const { value, placeholder, ...attrs } = field.inputAttrs.value;
	return attrs;
});
const trimmedQuery = computed(() => query.value.trim());
const exactQueryOption = computed(() => normalizedOptions.value.find((option) => optionKey(option.value) === optionKey(trimmedQuery.value)));
const canCreateQuery = computed(() => {
	if (!isCustomAllowed.value || !trimmedQuery.value) return false;
	if (selectedValueKeys.value.has(optionKey(trimmedQuery.value))) return false;
	return !exactQueryOption.value;
});
const matchingOptions = computed(() => {
	const needle = trimmedQuery.value.toLowerCase();
	return normalizedOptions.value
		.filter((option) => !option.disabled)
		.filter((option) => !selectedValueKeys.value.has(optionKey(option.value)))
		.filter((option) => {
			if (!needle || !isFilteringOptions.value) return true;
			return searchableText(option).includes(needle);
		})
		.slice(0, Math.max(1, props.maxOptions));
});
const menuItems = computed(() => {
	const items = matchingOptions.value.map((item) => ({ item, value: item.value, label: item.label, custom: false }));
	if (canCreateQuery.value) {
		items.push({
			item: customOption(trimmedQuery.value),
			value: trimmedQuery.value,
			label: trimmedQuery.value,
			custom: true,
		});
	}
	return items;
});
const optionMenu = useOptionMenu(menuItems, {
	query,
	emitQuery: (value) => emit('query', value),
});
const { activeIndex, isOpen } = optionMenu;
const hasEmptyState = computed(() => !isLoading.value && !menuItems.value.length && trimmedQuery.value && !isCustomAllowed.value);
const showMenu = computed(() => isOpen.value && (menuItems.value.length > 0 || hasEmptyState.value) && !field.disabled.value && !field.readOnly.value);
const hasTags = computed(() => selectedValues.value.length > 0);

function customOption(value) {
	return { value, label: String(value), custom: true };
}

function optionForValue(value) {
	return normalizedOptions.value.find((option) => optionKey(option.value) === optionKey(value));
}

function commitItem(entry) {
	if (!entry) return;
	commitValue(entry.value, entry.item, entry.custom);
}

function commitValue(value, item = null, custom = false) {
	if (field.disabled.value || field.readOnly.value) return;
	if (value == null || value === '') return;
	if (selectedValueKeys.value.has(optionKey(value))) {
		resetQuery();
		return;
	}
	if (!custom && !optionForValue(value) && !isCustomAllowed.value) return;

	const nextValue = [...selectedValues.value, value];
	field.setValue(nextValue);
	emit('add', { item, value, label: item?.label ?? String(value), custom });
	emit('select', { item, value, label: item?.label ?? String(value), custom });
	emit('change', nextValue);
	resetQuery();
	nextTick(() => inputEl.value?.focus());
}

function removeValue(value) {
	if (field.disabled.value || field.readOnly.value) return;
	const item = optionForValue(value) || customOption(value);
	const nextValue = selectedValues.value.filter((candidate) => optionKey(candidate) !== optionKey(value));
	field.setValue(nextValue);
	emit('remove', { item, value, label: item.label });
	emit('change', nextValue);
	nextTick(() => inputEl.value?.focus());
}

function clearAll() {
	if (field.disabled.value || field.readOnly.value) return;
	field.setValue([]);
	emit('change', []);
	nextTick(() => inputEl.value?.focus());
}

function resetQuery() {
	optionMenu.reset();
}

function onFocus(event) {
	field.onFocus(event);
	isOpen.value = true;
}

function onBlur(event) {
	optionMenu.closeSoon();
	field.onBlur(event);
}

function onKeydown(event) {
	if (event.key === 'ArrowDown') {
		event.preventDefault();
		optionMenu.move(1);
		return;
	}
	if (event.key === 'ArrowUp') {
		event.preventDefault();
		optionMenu.move(-1);
		return;
	}
	if (event.key === 'Enter') {
		event.preventDefault();
		if (menuItems.value[activeIndex.value]) commitItem(menuItems.value[activeIndex.value]);
		else if (isCustomAllowed.value) commitValue(trimmedQuery.value, customOption(trimmedQuery.value), true);
		return;
	}
	if (event.key === 'Escape') {
		event.preventDefault();
		isOpen.value = false;
		return;
	}
	if (event.key === 'Backspace' && !query.value && selectedValues.value.length) {
		removeValue(selectedValues.value[selectedValues.value.length - 1]);
	}
}

function onPaste(event) {
	const text = event.clipboardData?.getData('text') || '';
	const tokens = splitTokens(text);
	if (tokens.length <= 1) return;
	event.preventDefault();
	for (const token of tokens) {
		const option = optionForValue(token);
		if (option) commitValue(option.value, option, false);
		else if (isCustomAllowed.value) commitValue(token, customOption(token), true);
	}
}

function splitTokens(value) {
	return splitOptionTokens(value, props.tokenSeparators);
}
</script>

<template>
	<ElField v-bind="field.fieldAttrs.value" :chrome="chrome">
		<div class="relative">
			<div
				class="flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-2xl border border-input bg-background px-2 py-1.5 text-sm shadow-sm transition focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20 data-[invalid]:border-destructive"
				:data-invalid="field.invalid.value ? '' : undefined"
				@click="inputEl?.focus()"
			>
				<span
					v-for="entry in selectedItems"
					:key="optionKey(entry.value)"
					class="inline-flex max-w-full items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground ring-1 ring-border"
				>
					<slot name="tag" :item="entry" :value="entry.value" :label="entry.label" :remove="() => removeValue(entry.value)">
						<span class="truncate">{{ entry.label }}</span>
						<button
							type="button"
							class="-mr-1 inline-flex size-4 items-center justify-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
							:aria-label="`Remove ${entry.label}`"
							@click.stop="removeValue(entry.value)"
							@mousedown.prevent
						>
							<svg viewBox="0 0 16 16" class="size-3" fill="none" aria-hidden="true">
								<path d="M5 5l6 6M11 5l-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
							</svg>
						</button>
					</slot>
				</span>
					<input
						v-bind="controlInputAttrs"
					ref="inputEl"
					v-model="query"
					type="text"
					role="combobox"
					:aria-expanded="showMenu"
					:aria-controls="`${field.id.value}-listbox`"
					:placeholder="hasTags ? '' : placeholder"
					class="min-w-28 flex-1 bg-transparent px-1 py-1 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
					@focus="onFocus"
					@blur="onBlur"
					@keydown="onKeydown"
						@paste="onPaste"
					/>
					<ElFieldLoadingSpinner
						v-if="isLoading"
					/>
					<button
						v-if="isClearable && hasTags"
					type="button"
					class="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
					aria-label="Clear tags"
					@click.stop="clearAll"
					@mousedown.prevent
				>
					<svg viewBox="0 0 20 20" class="size-4" fill="none" aria-hidden="true">
						<path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
					</svg>
				</button>
			</div>

			<ul
				v-if="showMenu"
				:id="`${field.id.value}-listbox`"
				role="listbox"
					class="el-glass-surface absolute z-40 mt-2 max-h-72 w-full overflow-auto rounded-2xl p-1 shadow-xl"
				>
					<li v-if="hasEmptyState" class="rounded-xl px-3 py-2 text-sm text-muted-foreground">
						{{ emptyText }}
					</li>
				<li
					v-for="(entry, index) in menuItems"
					:key="`${entry.custom ? 'custom' : 'option'}-${optionKey(entry.value)}`"
					role="option"
					:aria-selected="activeIndex === index"
					class="cursor-pointer rounded-xl px-3 py-2 text-sm transition"
					:class="activeIndex === index ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/70'"
					@mouseenter="activeIndex = index"
					@mousedown.prevent
					@click="commitItem(entry)"
				>
					<slot name="item" :item="entry.item" :index="index" :active="activeIndex === index" :custom="entry.custom">
						<div class="flex min-w-0 items-center justify-between gap-3">
							<span class="min-w-0">
								<span class="block truncate font-medium">{{ entry.custom ? `Add "${entry.label}"` : entry.label }}</span>
								<span v-if="entry.item.description || entry.item.group" class="block truncate text-xs text-muted-foreground">
									{{ entry.item.description || entry.item.group }}
								</span>
							</span>
							<span v-if="entry.custom" class="shrink-0 rounded-full bg-background/70 px-2 py-0.5 text-[11px] text-muted-foreground ring-1 ring-border">custom</span>
						</div>
					</slot>
				</li>
			</ul>
		</div>
	</ElField>
</template>
