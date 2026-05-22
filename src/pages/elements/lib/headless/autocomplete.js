import { defineElement } from './base.js';
import { ComboBase } from './combobox.js';

export class ElementAutocomplete extends ComboBase {
	static __doc = {
		name: 'element-autocomplete',
		description: 'Free-text autocomplete. Suggestions are optional; typed values are valid and Enter commits the current text.',
		slots: [
			{ name: 'input', description: 'The text input. Gets role="combobox" and aria-controls wired automatically.' },
			{ name: 'list', description: 'Optional suggestions. The list may be updated by a framework or server lookup.' },
		],
		attributes: [
			{ name: 'value', type: 'string', description: 'Current text value.' },
			{ name: 'open', type: 'boolean', description: 'Reflects whether suggestions are visible.' },
			{ name: 'placement', type: 'string', description: 'Preferred floating placement before collision handling.' },
			{ name: 'floating-mode', type: "'viewport' | 'anchor'", description: 'viewport keeps suggestions inside the browser; anchor keeps them attached to the input while scrolling.' },
			{ name: 'data-menu-id', type: 'string', description: 'Id of an external or teleported suggestion list.' },
		],
		events: [
			{ name: 'el:input', payload: '{ value }', description: 'Fired whenever the text value changes.' },
			{ name: 'el:query', payload: '{ query }', description: 'Fired whenever the user types. Useful for server lookups.' },
			{ name: 'el:select', payload: '{ value, label, option }', description: 'Fired when a suggestion is selected.' },
			{ name: 'el:custom', payload: '{ value, label }', description: 'Cancelable event fired when Enter commits free text.' },
			{ name: 'el:change', payload: '{ value, option, custom }', description: 'Fired when text or a suggestion is committed.' },
		],
	};

	get _freeText() { return true; }
	get _valueMode() { return 'text'; }
	get _activeOnFilter() { return false; }
}

defineElement('element-autocomplete', ElementAutocomplete);
