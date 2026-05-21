import { markRaw } from 'vue';
import {
	ElButton,
	ElDropdown,
	ElToggle,
	ElTooltip,
	ElAccordion,
	ElCombobox,
	ElPopover,
	ElListInput,
	ElTextInput,
	ElTextareaInput,
	ElNumberInput,
	ElSelectInput,
	ElBooleanInput,
	ElColorInput,
} from '../../lib/vue';

// Components the studio can drag onto the stage.
//
// Each entry pairs:
//  - the component reference (or HTML tag string)
//  - sensible defaults (props + text or children)
//  - `accepts`: whether this node can have children dropped into it
//  - `hints`: per-prop overrides (the component's own `_edit` hints take care
//    of most cases; use this to override per-studio).
const entries = [
	// ---------------- Elements ------------------------------------------------
	{
		id: 'el-button',
		label: 'Button',
		group: 'Elements',
		component: markRaw(ElButton),
		icon: '◉',
		accepts: 'children',
		defaults: {
			props: { variant: 'primary', size: 'md' },
			children: [{ id: null, text: 'Button' }],
		},
	},
	{
		id: 'el-dropdown',
		label: 'Dropdown',
		group: 'Elements',
		component: markRaw(ElDropdown),
		icon: '▾',
		accepts: 'none',
		defaults: {
			props: {
				items: [
					{ label: 'First option', value: 'a' },
					{ label: 'Second option', value: 'b' },
					{ label: 'Third option', value: 'c' },
				],
				label: 'Choose…',
				align: 'left',
			},
		},
	},
	{
		id: 'el-toggle',
		label: 'Toggle',
		group: 'Elements',
		component: markRaw(ElToggle),
		icon: '⊙',
		accepts: 'none',
		defaults: { props: { modelValue: true, label: 'Notifications' } },
	},
	{
		id: 'el-tooltip',
		label: 'Tooltip',
		group: 'Elements',
		component: markRaw(ElTooltip),
		icon: '?',
		accepts: 'children',
		defaults: {
			props: { text: 'Tooltip text', placement: 'top' },
			children: [{ id: null, text: 'Hover me' }],
		},
	},
	{
		id: 'el-accordion',
		label: 'Accordion',
		group: 'Elements',
		component: markRaw(ElAccordion),
		icon: '☰',
		accepts: 'none',
		defaults: {
			props: {
				items: [
					{ title: 'Section A', content: 'Content for the first section.' },
					{ title: 'Section B', content: 'Content for the second section.' },
				],
				multiple: false,
			},
		},
	},
	{
		id: 'el-combobox',
		label: 'Combobox',
		group: 'Elements',
		component: markRaw(ElCombobox),
		icon: '◆',
		accepts: 'none',
		defaults: {
			props: {
				placeholder: 'Search…',
				options: [
					{ label: 'Apple', value: 'apple' },
					{ label: 'Banana', value: 'banana' },
					{ label: 'Cherry', value: 'cherry' },
				],
			},
		},
	},
	{
		id: 'el-popover',
		label: 'Popover',
		group: 'Elements',
		component: markRaw(ElPopover),
		icon: '◇',
		accepts: 'children',
		defaults: {
			props: { label: 'More', align: 'left' },
			children: [{ id: null, text: 'Popover content.' }],
		},
	},

	// ---------------- Forms ---------------------------------------------------
	{
		id: 'el-text-input',
		label: 'Text input',
		group: 'Forms',
		component: markRaw(ElTextInput),
		icon: 'T',
		accepts: 'none',
		defaults: { props: { label: 'Label', placeholder: 'Type here…' } },
	},
	{
		id: 'el-textarea-input',
		label: 'Textarea',
		group: 'Forms',
		component: markRaw(ElTextareaInput),
		icon: '¶',
		accepts: 'none',
		defaults: { props: { label: 'Label', placeholder: 'Tell us more…', rows: 3 } },
	},
	{
		id: 'el-number-input',
		label: 'Number input',
		group: 'Forms',
		component: markRaw(ElNumberInput),
		icon: '#',
		accepts: 'none',
		defaults: { props: { label: 'Quantity', modelValue: 0 } },
	},
	{
		id: 'el-select-input',
		label: 'Select input',
		group: 'Forms',
		component: markRaw(ElSelectInput),
		icon: '◐',
		accepts: 'none',
		defaults: {
			props: {
				label: 'Pick one',
				options: ['One', 'Two', 'Three'],
				modelValue: 'One',
			},
		},
	},
	{
		id: 'el-boolean-input',
		label: 'Boolean input',
		group: 'Forms',
		component: markRaw(ElBooleanInput),
		icon: '☑',
		accepts: 'none',
		defaults: { props: { label: 'Enabled', modelValue: true } },
	},
	{
		id: 'el-color-input',
		label: 'Color input',
		group: 'Forms',
		component: markRaw(ElColorInput),
		icon: '◉',
		accepts: 'none',
		defaults: { props: { label: 'Accent', modelValue: '#0ea5e9' } },
	},
	{
		id: 'el-list-input',
		label: 'List input',
		group: 'Forms',
		component: markRaw(ElListInput),
		icon: '≡',
		accepts: 'none',
		defaults: {
			props: {
				label: 'Items',
				modelValue: [
					{ label: 'Item 1', value: 'one' },
					{ label: 'Item 2', value: 'two' },
				],
			},
		},
	},

	// ---------------- HTML primitives ----------------------------------------
	{
		id: 'html-div',
		label: 'Container',
		group: 'HTML',
		component: 'div',
		icon: '▢',
		accepts: 'children',
		defaults: {
			props: { class: 'flex flex-col gap-3 rounded-2xl border border-skin-border bg-skin-background p-6' },
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
			props: { class: 'text-2xl font-bold tracking-tight text-skin-primary' },
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
			props: { class: 'text-sm leading-relaxed text-skin-secondary' },
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
			props: { class: 'inline-flex rounded-full bg-skin-primary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-skin-inverse' },
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

	// ---------------- Content ------------------------------------------------
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

export const componentRegistry = entries;
export const groupedRegistry = entries.reduce((acc, e) => {
	(acc[e.group] ||= []).push(e);
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
