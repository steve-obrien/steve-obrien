import { markRaw } from 'vue';
import { getComponentRecords } from '../componentManager.js';
import { getComponentProps, getStudioMeta, inspectComponentRecord } from '../componentInspector.js';

const GROUP_ORDER = ['Elements', 'Forms', 'Visual', 'HTML', 'Content'];

const SAMPLE_PROPS = {
	ElAccordion: {
		items: [
			{ title: 'Section A', content: 'Content for the first section.' },
			{ title: 'Section B', content: 'Content for the second section.' },
		],
	},
	ElAutocomplete: {
		placeholder: 'Search...',
		options: [
			{ label: 'Apple', value: 'apple' },
			{ label: 'Banana', value: 'banana' },
			{ label: 'Cherry', value: 'cherry' },
		],
	},
	ElBooleanInput: {
		label: 'Enabled',
		modelValue: true,
	},
	ElCalendar: {
		label: 'Date',
		description: 'Pick a date.',
		modelValue: '2026-06-18',
		initialMonth: 6,
		initialYear: 2026,
	},
	ElCard: {
		class: 'w-full max-w-sm',
	},
	ElCheckbox: {
		modelValue: true,
		label: 'Product updates',
	},
	ElCodeInput: {
		label: 'Code',
		lang: 'json',
		modelValue: '{\n\t"name": "Elements"\n}',
		rows: 8,
	},
	ElColorInput: {
		label: 'Accent',
		modelValue: '#0ea5e9',
	},
	ElCombobox: {
		placeholder: 'Search...',
		options: [
			{ label: 'Apple', value: 'apple' },
			{ label: 'Banana', value: 'banana' },
			{ label: 'Cherry', value: 'cherry' },
		],
	},
	ElCommandPalette: {
		commands: [
			{ label: 'Open dashboard', value: 'dashboard' },
			{ label: 'Create project', value: 'project' },
			{ label: 'Invite teammate', value: 'invite' },
		],
		placeholder: 'Search commands...',
	},
	ElDropdown: {
		items: [
			{ label: 'First option', value: 'a' },
			{ label: 'Second option', value: 'b' },
			{ label: 'Third option', value: 'c' },
		],
		label: 'Choose...',
		align: 'left',
	},
	ElJsonInput: {
		label: 'JSON',
		description: 'Valid JSON emits parsed data.',
		modelValue: { name: 'Elements', editable: true },
		rows: 8,
	},
	ElJsonListInput: {
		label: 'Items',
		addLabel: '+ Add item',
		modelValue: [
			{ label: 'Item 1', value: 'one' },
			{ label: 'Item 2', value: 'two' },
		],
		schema: [
			{ key: 'label', label: 'Label', placeholder: 'Item label', default: (index) => `Item ${index + 1}` },
			{ key: 'value', label: 'Value', placeholder: 'item-value', default: (index) => `item-${index + 1}` },
		],
	},
	ElListbox: {
		modelValue: 'medium',
		options: [
			{ label: 'Small', value: 'small' },
			{ label: 'Medium', value: 'medium' },
			{ label: 'Large', value: 'large' },
		],
	},
	ElMenu: {
		items: [
			{ label: 'Rename', value: 'rename' },
			{ label: 'Duplicate', value: 'duplicate' },
			{ label: 'Delete', value: 'delete', tone: 'danger' },
		],
	},
	ElNativeSelect: {
		label: 'Workspace',
		options: [
			{ label: 'Design system', value: 'design' },
			{ label: 'Marketing site', value: 'marketing' },
		],
		modelValue: 'design',
	},
	ElNumberInput: {
		label: 'Quantity',
		modelValue: 0,
	},
	ElPasswordInput: {
		label: 'Password',
		description: 'Use a strong password.',
		modelValue: 'correct-horse',
	},
	ElRadioGroup: {
		label: 'Plan',
		modelValue: 'team',
		options: [
			{ label: 'Solo', value: 'solo' },
			{ label: 'Team', value: 'team' },
		],
	},
	ElSelectInput: {
		label: 'Pick one',
		options: ['One', 'Two', 'Three'],
		modelValue: 'One',
	},
	ElTabs: {
		tabs: [
			{ key: 'overview', label: 'Overview' },
			{ key: 'settings', label: 'Settings' },
		],
		modelValue: 'overview',
	},
	ElTextInput: {
		label: 'Label',
		placeholder: 'Type here...',
	},
	ElTextareaInput: {
		label: 'Label',
		placeholder: 'Tell us more...',
		rows: 3,
	},
	ElToastStack: {
		toasts: [
			{ id: 'saved', title: 'Successfully saved', description: 'Your changes have been stored.', tone: 'success', duration: 0 },
		],
	},
	ElTooltip: {
		text: 'Tooltip text',
	},
	ElToggle: {
		modelValue: true,
		label: 'Notifications',
	},
};

const SAMPLE_CHILDREN = {
	ElButton: [{ id: null, text: 'Button' }],
	ElCard: [
		{
			id: null,
			component: 'h3',
			props: { class: 'text-lg font-semibold tracking-tight' },
			children: [{ id: null, text: 'Card title' }],
		},
		{
			id: null,
			component: 'p',
			props: { class: 'mt-2 text-sm leading-6 text-muted-foreground' },
			children: [{ id: null, text: 'Drop content into this visual surface.' }],
		},
	],
	ElDialog: [{ id: null, text: 'Dialog content.' }],
	ElDrawer: [{ id: null, text: 'Drawer content.' }],
	ElPopover: [{ id: null, text: 'Popover content.' }],
	ElTooltip: [{ id: null, text: 'Hover me' }],
};

function buildComponentEntry(record) {
	const { exportName, component, section } = record;
	const meta = record.studio || getStudioMeta(component);
	const label = meta.label || record.label || labelFromExport(exportName);
	const accepts = meta.accepts || inferAccepts(exportName, component);
	const defaults = {
		props: {
			...inferDefaultProps(exportName, component, label),
			...(meta.defaults?.props || {}),
		},
	};
	const children = meta.defaults?.children || SAMPLE_CHILDREN[exportName];
	if (children) defaults.children = children;
	if (meta.defaults?.text) defaults.text = meta.defaults.text;

	return {
		id: meta.id || idFromExport(exportName),
		label,
		group: meta.group || groupFromSection(section),
		component: markRaw(component),
		icon: meta.icon || record.icon || label.charAt(0),
		accepts,
		defaults,
		hints: meta.hints || {},
	};
}

function inferDefaultProps(exportName, component, label) {
	const props = {};
	for (const [key, def] of Object.entries(getComponentProps(component))) {
		if (key === 'class' || key === 'modelModifiers') continue;
		const value = propDefaultValue(def);
		if (value !== undefined) props[key] = value;
	}

	const componentProps = getComponentProps(component);
	if ('label' in componentProps && props.label == null) props.label = label;
	if ('placeholder' in componentProps && props.placeholder == null) props.placeholder = 'Type here...';
	if ('description' in componentProps && props.description == null) props.description = '';
	if ('modelValue' in componentProps && props.modelValue == null) {
		props.modelValue = emptyValueForProp(componentProps.modelValue);
	}
	if ('options' in componentProps && !props.options) props.options = defaultOptions();
	if ('items' in componentProps && !props.items) props.items = defaultItems(exportName);
	if ('commands' in componentProps && !props.commands) props.commands = defaultCommands();
	if ('tabs' in componentProps && !props.tabs) props.tabs = defaultTabs();
	if ('toasts' in componentProps && !props.toasts) props.toasts = defaultToasts();

	return {
		...props,
		...(SAMPLE_PROPS[exportName] || {}),
	};
}

function propDefaultValue(def) {
	if (!def || typeof def !== 'object' || !('default' in def)) return undefined;
	if (typeof def.default === 'function' && def.type !== Function) {
		try {
			return def.default();
		} catch {
			return undefined;
		}
	}
	return def.default;
}

function emptyValueForProp(def) {
	const type = Array.isArray(def?.type) ? def.type : [def?.type];
	if (type.includes(Boolean)) return false;
	if (type.includes(Number)) return 0;
	if (type.includes(Array)) return [];
	if (type.includes(Object)) return {};
	return '';
}

function defaultOptions() {
	return [
		{ label: 'Small', value: 'small' },
		{ label: 'Medium', value: 'medium' },
		{ label: 'Large', value: 'large' },
	];
}

function defaultItems(exportName) {
	if (exportName === 'ElAccordion') {
		return [
			{ title: 'Section A', content: 'Content for the first section.' },
			{ title: 'Section B', content: 'Content for the second section.' },
		];
	}
	return [
		{ label: 'First option', value: 'a' },
		{ label: 'Second option', value: 'b' },
		{ label: 'Third option', value: 'c' },
	];
}

function defaultCommands() {
	return [
		{ label: 'Open dashboard', value: 'dashboard' },
		{ label: 'Create project', value: 'project' },
		{ label: 'Invite teammate', value: 'invite' },
	];
}

function defaultTabs() {
	return [
		{ key: 'overview', label: 'Overview' },
		{ key: 'settings', label: 'Settings' },
	];
}

function defaultToasts() {
	return [
		{ id: 'saved', title: 'Successfully saved', description: 'Your changes have been stored.', tone: 'success', duration: 0 },
	];
}

function inferAccepts(exportName, component) {
	if (SAMPLE_CHILDREN[exportName]) return 'children';
	const slots = component.__doc?.slots || [];
	return slots.some((slot) => slot.name === '(default)' || slot.name === 'default') ? 'children' : 'none';
}

function groupFromSection(section) {
	return {
		components: 'Elements',
		forms: 'Forms',
		visual: 'Visual',
	}[section] || 'Elements';
}

function idFromExport(name) {
	return name
		.replace(/^El/, 'el')
		.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
		.toLowerCase();
}

function labelFromExport(name) {
	return name
		.replace(/^El/, '')
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
		.replace(/^./, (c) => c.toUpperCase());
}

function sortEntries(a, b) {
	const groupDelta = GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group);
	if (groupDelta) return groupDelta;
	return a.label.localeCompare(b.label);
}

// ---------------- HTML primitives ------------------------------------------
const htmlEntries = [
	{
		id: 'html-div',
		label: 'Container',
		group: 'HTML',
		component: 'div',
		icon: '▢',
		accepts: 'children',
		defaults: {
			props: { class: 'flex flex-col gap-3 rounded-2xl border border-border bg-background p-6' },
		},
	},
	{
		id: 'html-row',
		label: 'Row',
		group: 'HTML',
		component: 'div',
		icon: '⇆',
		accepts: 'children',
		defaults: { props: { class: 'flex items-center gap-3' } },
	},
	{
		id: 'html-heading',
		label: 'Heading',
		group: 'HTML',
		component: 'h3',
		icon: 'H',
		accepts: 'children',
		defaults: {
			props: { class: 'text-2xl font-bold tracking-tight text-foreground' },
			children: [{ id: null, text: 'Heading' }],
		},
	},
	{
		id: 'html-paragraph',
		label: 'Paragraph',
		group: 'HTML',
		component: 'p',
		icon: '¶',
		accepts: 'children',
		defaults: {
			props: { class: 'text-sm leading-relaxed text-muted-foreground' },
			children: [{ id: null, text: 'Body copy lives here.' }],
		},
	},
	{
		id: 'html-span',
		label: 'Span',
		group: 'HTML',
		component: 'span',
		icon: '⎯',
		accepts: 'children',
		defaults: {
			props: {},
			children: [{ id: null, text: 'inline' }],
		},
	},
	{
		id: 'html-badge',
		label: 'Badge',
		group: 'HTML',
		component: 'span',
		icon: '▣',
		accepts: 'children',
		defaults: {
			props: { class: 'inline-flex rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground' },
			children: [{ id: null, text: 'New' }],
		},
	},
	{
		id: 'html-img',
		label: 'Image',
		group: 'HTML',
		component: 'img',
		icon: '◧',
		accepts: 'none',
		defaults: { props: { src: 'https://placehold.co/240x160', alt: '', class: 'rounded-xl' } },
	},
	{
		id: 'html-text',
		label: 'Text',
		group: 'Content',
		component: null,
		icon: 'T',
		accepts: 'none',
		defaults: { text: 'Edit me' },
	},
];

const discoveredEntries = getComponentRecords()
	.map(inspectComponentRecord)
	.filter((record) => !record.studioHidden)
	.map(buildComponentEntry)
	.sort(sortEntries);
const entries = [...discoveredEntries, ...htmlEntries];

export const componentRegistry = entries;
export const groupedRegistry = entries.reduce((acc, entry) => {
	(acc[entry.group] ||= []).push(entry);
	return acc;
}, {});

export function lookupEntry(component) {
	if (component == null) return entries.find((e) => e.id === 'html-text');
	return entries.find((e) => e.component === component);
}

export function lookupById(typeId) {
	return entries.find((e) => e.id === typeId);
}

// Text nodes are pure-content leaves: `{ id, text: 'Hello' }` (no `component`).
export function isTextNode(node) {
	return !!(node && node.component == null && node.text != null);
}

export function canHaveChildren(node) {
	if (!node) return false;
	if (isTextNode(node)) return false;
	const entry = lookupEntry(node.component);
	if (entry) return entry.accepts !== 'none';
	if (typeof node.component === 'string') {
		return !['area','base','br','col','embed','hr','img','input','link','meta','source','track','wbr'].includes(node.component);
	}
	return false;
}
