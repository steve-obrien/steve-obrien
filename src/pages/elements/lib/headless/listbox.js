import { ElementBase, createRoving, defineElement } from './base.js';

function valueOf(option) {
	return option.dataset.value ?? option.textContent.trim();
}

export class ElementListbox extends ElementBase {
	static get observedAttributes() { return ['value', 'orientation']; }

	static __doc = {
		name: 'element-listbox',
		description: 'A selectable option list with roving focus, selected state, and keyboard navigation.',
		slots: [{ name: '(default)', description: 'Options. Add role="option" and data-value to each selectable item.' }],
		attributes: [
			{ name: 'value', type: 'string', description: 'Selected option value.' },
			{ name: 'orientation', type: "'vertical' | 'horizontal'", description: 'Arrow-key direction. Defaults to vertical.' },
		],
		events: [
			{ name: 'el:change', payload: '{ value, option }', description: 'Fired when selection changes.' },
			{ name: 'el:select', payload: '{ value, option }', description: 'Fired when an option is selected.' },
		],
		keyboard: [
			{ keys: '↑ / ↓', action: 'Move active option.' },
			{ keys: 'Home / End', action: 'Jump to first / last option.' },
			{ keys: 'Enter / Space', action: 'Select active option.' },
		],
	};

	constructor() {
		super();
		this._roving = null;
		this._onKey = this._onKey.bind(this);
		this._onClick = this._onClick.bind(this);
	}

	connectedCallback() {
		this.setAttribute('role', this.getAttribute('role') || 'listbox');
		this._refresh();
		this.on(this, 'keydown', this._onKey);
		this.on(this, 'click', this._onClick);
	}

	attributeChangedCallback() {
		this._refresh();
	}

	get value() { return this.getAttribute('value') || ''; }
	set value(value) {
		if (value == null || value === '') this.removeAttribute('value');
		else this.setAttribute('value', value);
	}

	get options() {
		return Array.from(this.querySelectorAll('[role="option"]'))
			.filter((option) => !option.hasAttribute('disabled') && option.getAttribute('aria-disabled') !== 'true');
	}

	_refresh() {
		const options = this.options;
		const orientation = this.getAttribute('orientation') || 'vertical';
		const focused = options.findIndex((option) => option === document.activeElement || option.contains(document.activeElement));
		const selected = options.findIndex((option) => valueOf(option) === this.value);
		const active = focused >= 0 ? focused : Math.max(0, selected);
		this.setAttribute('aria-orientation', orientation);
		options.forEach((option, index) => {
			option.tabIndex = index === active ? 0 : -1;
			option.setAttribute('aria-selected', String(valueOf(option) === this.value));
		});
		this._roving = createRoving({ items: options, orientation, loop: true });
		this._roving.setActive(active, { focus: false, select: false });
	}

	_select(option, event) {
		const value = valueOf(option);
		const changed = value !== this.value;
		this.value = value;
		this._refresh();
		this.emit('el:select', { value, option, event });
		if (changed) this.emit('el:change', { value, option, event });
	}

	_onClick(event) {
		const option = event.target.closest('[role="option"]');
		if (!option || !this.contains(option)) return;
		this._select(option, event);
	}

	_onKey(event) {
		this._roving?.onKey(event);
		if (event.key !== 'Enter' && event.key !== ' ') return;
		const option = document.activeElement?.closest?.('[role="option"]');
		if (!option || !this.contains(option)) return;
		event.preventDefault();
		this._select(option, event);
	}
}

defineElement('element-listbox', ElementListbox);
