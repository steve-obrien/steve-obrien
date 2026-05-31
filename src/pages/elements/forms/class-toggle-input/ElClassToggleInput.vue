<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import ElField from '../field/ElField.vue';
import { fieldProps } from '../field/fieldProps.js';
import { useField } from '../field/useField.js';

defineOptions({
	__doc: {
		name: 'Class toggle input',
		tag: '<ElClassToggleInput>',
		description: 'A class-name autocomplete that keeps every class as a checkbox so utilities can be toggled without being forgotten.',
		icon: 'M4 7h4l2 2 4-5 2 2-6 7-4-4H4V7Zm0 10h4l2 2 4-5 2 2-6 7-4-4H4v-2Z',
		events: [
			{ name: 'update:modelValue', payload: 'string', description: 'Emitted with the enabled class string.' },
			{ name: 'update:inactiveValues', payload: 'string[]', description: 'Emitted with known classes that are currently toggled off.' },
			{ name: 'query', payload: 'string', description: 'Fired as the user types.' },
			{ name: 'toggle', payload: '({ value, enabled, classes, inactiveValues })', description: 'Fired when a class checkbox is toggled.' },
			{ name: 'add', payload: '({ value, classes, inactiveValues })', description: 'Fired when a typed or suggested class is added.' },
		],
	},
});

const props = defineProps({
	...fieldProps,
	modelValue: {
		type: String,
		default: '',
		_edit: { group: 'Control props', description: 'Enabled class names as a space-separated string.' },
	},
	inactiveValues: {
		type: Array,
		default: () => [],
		_edit: { component: 'ElJsonInput', group: 'Control props', description: 'Known class names that are shown but toggled off.' },
	},
	options: {
		type: Array,
		default: () => [],
		_edit: {
			component: 'ElJsonListInput',
			group: 'Control props',
			description: 'Autocomplete options. Strings are treated as both label and value.',
			props: {
				compact: true,
				addLabel: '+ Add class',
				schema: [
					{ key: 'label', label: 'Label', placeholder: 'Class label', default: (index) => `Class ${index + 1}` },
					{ key: 'value', label: 'Value', placeholder: 'text-sm', default: (index) => `class-${index + 1}` },
					{ key: 'description', label: 'Description', placeholder: 'Optional helper text' },
				],
			},
		},
	},
	placeholder: {
		type: String,
		default: 'Add class',
		_edit: { group: 'Control props', description: 'Placeholder for the class entry field.' },
	},
	allowCustom: {
		type: [Boolean, String],
		default: true,
		_edit: { group: 'Control props', description: 'Allow typed classes that are not present in options.' },
	},
	filterOptions: {
		type: [Boolean, String],
		default: true,
		_edit: { group: 'Control props', description: 'Filter options locally. Turn off when options are already filtered.' },
	},
	maxOptions: {
		type: Number,
		default: 8,
		_edit: { group: 'Control props', description: 'Maximum matching suggestions to show.' },
	},
	emptyText: {
		type: String,
		default: 'No matching classes',
		_edit: { group: 'Control props', description: 'Text shown when no option matches.' },
	},
});

const emit = defineEmits(['update:modelValue', 'update:inactiveValues', 'query', 'add', 'toggle', 'change', 'focus', 'blur']);

const inputEl = ref(null);
const query = ref('');
const isOpen = ref(false);
const activeIndex = ref(0);
const knownValues = ref([]);
const field = useField(props, emit, { idPrefix: 'el-class-toggle-input' });

const enabledClasses = computed(() => splitClassNames(field.value.value));
const inactiveClasses = computed(() => uniqueValues(props.inactiveValues));
const normalizedOptions = computed(() => props.options.map(normalizeOption).filter(Boolean));
const enabledSet = computed(() => new Set(enabledClasses.value.map(classKey)));
const inactiveSet = computed(() => new Set(inactiveClasses.value.map(classKey)));
const knownItems = computed(() => {
	const optionMap = new Map(normalizedOptions.value.map((option) => [classKey(option.value), option]));
	return uniqueValues([
		...knownValues.value,
		...enabledClasses.value,
		...inactiveClasses.value,
	]).map((value) => {
		const option = optionMap.get(classKey(value));
		return {
			value,
			label: option?.label ?? value,
			description: option?.description || '',
			enabled: enabledSet.value.has(classKey(value)),
		};
	});
});
const trimmedQuery = computed(() => query.value.trim());
const canCreateQuery = computed(() => {
	if (!booleanProp(props.allowCustom, true) || !trimmedQuery.value) return false;
	return !knownItems.value.some((item) => classKey(item.value) === classKey(trimmedQuery.value));
});
const matchingOptions = computed(() => {
	const needle = trimmedQuery.value.toLowerCase();
	return normalizedOptions.value
		.filter((option) => !knownItems.value.some((item) => classKey(item.value) === classKey(option.value)))
		.filter((option) => {
			if (!needle || !booleanProp(props.filterOptions, true)) return true;
			return searchableText(option).includes(needle);
		})
		.slice(0, Math.max(1, props.maxOptions));
});
const menuItems = computed(() => {
	const items = matchingOptions.value.map((option) => ({ ...option, custom: false }));
	if (canCreateQuery.value) items.push({ value: trimmedQuery.value, label: trimmedQuery.value, description: 'Add custom class', custom: true });
	return items;
});
const showMenu = computed(() => isOpen.value && !field.disabled.value && !field.readOnly.value && (menuItems.value.length || trimmedQuery.value));
const hasEmptyState = computed(() => showMenu.value && !menuItems.value.length);
const inputAttrs = computed(() => {
	const { value, placeholder, ...attrs } = field.inputAttrs.value;
	return attrs;
});

watch([enabledClasses, inactiveClasses], ([enabled, inactive]) => {
	rememberValues([...enabled, ...inactive]);
}, { immediate: true });

watch(query, (value) => {
	emit('query', value);
	activeIndex.value = 0;
	if (value) isOpen.value = true;
});

watch(menuItems, () => {
	if (activeIndex.value >= menuItems.value.length) {
		activeIndex.value = Math.max(0, menuItems.value.length - 1);
	}
});

function normalizeOption(option) {
	if (option == null) return null;
	if (typeof option === 'string' || typeof option === 'number') {
		return { value: String(option), label: String(option) };
	}
	const value = option.value ?? option.label;
	if (value == null || value === '') return null;
	return {
		...option,
		value: String(value),
		label: option.label ?? String(value),
	};
}

function splitClassNames(value) {
	return uniqueValues(String(value || '').split(/\s+/).map((item) => item.trim()).filter(Boolean));
}

function joinClassNames(values) {
	return uniqueValues(values).join(' ');
}

function classKey(value) {
	return String(value || '').toLowerCase();
}

function uniqueValues(values) {
	const seen = new Set();
	const out = [];
	for (const value of values || []) {
		const className = String(value || '').trim();
		if (!className || seen.has(classKey(className))) continue;
		seen.add(classKey(className));
		out.push(className);
	}
	return out;
}

function searchableText(option) {
	return [option.label, option.value, option.description, option.group].filter(Boolean).join(' ').toLowerCase();
}

function rememberValues(values) {
	const next = uniqueValues([...knownValues.value, ...values]);
	if (next.length !== knownValues.value.length) knownValues.value = next;
}

function addClass(value) {
	const className = String(value || '').trim();
	if (!className || field.disabled.value || field.readOnly.value) return;
	if (!booleanProp(props.allowCustom, true) && !normalizedOptions.value.some((option) => classKey(option.value) === classKey(className))) return;
	rememberValues([className]);
	const nextEnabled = uniqueValues([...enabledClasses.value, className]);
	const nextInactive = inactiveClasses.value.filter((item) => classKey(item) !== classKey(className));
	commitClasses(nextEnabled, nextInactive);
	emit('add', { value: className, classes: joinClassNames(nextEnabled), inactiveValues: nextInactive });
	resetQuery();
	nextTick(() => inputEl.value?.focus());
}

function toggleClass(value, enabled) {
	const className = String(value || '').trim();
	if (!className || field.disabled.value || field.readOnly.value) return;
	rememberValues([className]);
	const nextEnabled = enabled
		? uniqueValues([...enabledClasses.value, className])
		: enabledClasses.value.filter((item) => classKey(item) !== classKey(className));
	const nextInactive = enabled
		? inactiveClasses.value.filter((item) => classKey(item) !== classKey(className))
		: uniqueValues([...inactiveClasses.value, className]);
	commitClasses(nextEnabled, nextInactive);
	emit('toggle', {
		value: className,
		enabled,
		classes: joinClassNames(nextEnabled),
		inactiveValues: nextInactive,
	});
}

function commitClasses(nextEnabled, nextInactive) {
	const nextClassString = joinClassNames(nextEnabled);
	field.setValue(nextClassString);
	emit('update:inactiveValues', nextInactive);
	emit('change', { classes: nextClassString, inactiveValues: nextInactive });
}

function resetQuery() {
	query.value = '';
	isOpen.value = false;
	activeIndex.value = 0;
}

function onFocus(event) {
	field.onFocus(event);
	isOpen.value = true;
}

function onBlur(event) {
	window.setTimeout(() => {
		isOpen.value = false;
	}, 120);
	field.onBlur(event);
}

function onKeydown(event) {
	if (event.key === 'ArrowDown') {
		event.preventDefault();
		isOpen.value = true;
		activeIndex.value = wrapIndex(activeIndex.value + 1);
		return;
	}
	if (event.key === 'ArrowUp') {
		event.preventDefault();
		isOpen.value = true;
		activeIndex.value = wrapIndex(activeIndex.value - 1);
		return;
	}
	if (event.key === 'Enter') {
		event.preventDefault();
		const item = menuItems.value[activeIndex.value];
		if (item) addClass(item.value);
		else addClass(trimmedQuery.value);
		return;
	}
	if (event.key === 'Escape') {
		event.preventDefault();
		isOpen.value = false;
	}
}

function onPaste(event) {
	const values = splitClassNames(event.clipboardData?.getData('text') || '');
	if (values.length <= 1) return;
	event.preventDefault();
	for (const value of values) addClass(value);
}

function wrapIndex(index) {
	if (!menuItems.value.length) return 0;
	return (index + menuItems.value.length) % menuItems.value.length;
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
		<div class="relative">
			<input
				v-bind="inputAttrs"
				ref="inputEl"
				v-model="query"
				type="text"
				role="combobox"
				:aria-expanded="showMenu"
				:aria-controls="`${field.id.value}-listbox`"
				:placeholder="placeholder"
				class="el-input h-9 rounded-md font-mono text-sm"
				@focus="onFocus"
				@blur="onBlur"
				@keydown="onKeydown"
				@paste="onPaste"
			/>

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
					v-for="(item, index) in menuItems"
					:key="`${item.custom ? 'custom' : 'option'}-${classKey(item.value)}`"
					role="option"
					:aria-selected="activeIndex === index"
					class="cursor-pointer rounded-xl px-3 py-2 text-sm transition"
					:class="activeIndex === index ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/70'"
					@mouseenter="activeIndex = index"
					@mousedown.prevent
					@click="addClass(item.value)"
				>
					<span class="block truncate font-mono">{{ item.custom ? `Add ${item.label}` : item.label }}</span>
					<span v-if="item.description" class="block truncate text-xs text-muted-foreground">{{ item.description }}</span>
				</li>
			</ul>

			<div v-if="knownItems.length" class="mt-2 flex flex-wrap gap-x-4 gap-y-2">
				<label
					v-for="item in knownItems"
					:key="classKey(item.value)"
					class="inline-flex min-w-0 items-center gap-1.5 font-mono text-sm text-foreground"
					:class="item.enabled ? '' : 'opacity-50'"
				>
					<input
						type="checkbox"
						class="size-4 rounded border-input text-primary focus:ring-ring/60"
						:checked="item.enabled"
						:disabled="field.disabled.value || field.readOnly.value"
						@change="toggleClass(item.value, $event.target.checked)"
					>
					<span class="truncate">{{ item.label }}</span>
				</label>
			</div>
		</div>
	</ElField>
</template>
