import { ElementBase, createRoving, defineElement } from './base.js';

function valueOf(radio) {
	return radio.dataset.value ?? radio.textContent.trim();
}

export class ElementRadioGroup extends ElementBase {
	static get observedAttributes() { return ['value', 'orientation']; }

	static __doc = {
		name: 'element-radio-group',
		description: 'A radio group with roving focus and single-value selection.',
		slots: [{ name: '(default)', description: 'Radio options with role="radio" and data-value.' }],
		attributes: [
			{ name: 'value', type: 'string', description: 'Selected value.' },
			{ name: 'orientation', type: "'vertical' | 'horizontal'", description: 'Arrow-key direction. Defaults to vertical.' },
		],
		events: [{ name: 'el:change', payload: '{ value, radio }', description: 'Fired when selected value changes.' }],
		keyboard: [
			{ keys: '↑ / ↓ or ← / →', action: 'Move selection depending on orientation.' },
			{ keys: 'Home / End', action: 'Jump to first / last option.' },
			{ keys: 'Space / Enter', action: 'Select focused option.' },
		],
	};

	constructor() {
		super();
		this._roving = null;
		this._refreshing = false;
		this._onKey = this._onKey.bind(this);
		this._onClick = this._onClick.bind(this);
	}

	connectedCallback() {
		this.setAttribute('role', this.getAttribute('role') || 'radiogroup');
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

	get radios() {
		return Array.from(this.querySelectorAll('[role="radio"]'))
			.filter((radio) => !radio.hasAttribute('disabled') && radio.getAttribute('aria-disabled') !== 'true');
	}

	_refresh() {
		const radios = this.radios;
		const orientation = this.getAttribute('orientation') || 'vertical';
		this.setAttribute('aria-orientation', orientation);
		let active = Math.max(0, radios.findIndex((radio) => valueOf(radio) === this.value));
		radios.forEach((radio, index) => {
			radio.tabIndex = index === active ? 0 : -1;
			radio.setAttribute('aria-checked', String(valueOf(radio) === this.value));
		});
		this._refreshing = true;
		this._roving = createRoving({
			items: radios,
			orientation,
			loop: true,
			onSelect: (_, radio) => this._select(radio),
		});
		this._roving.setActive(active, { focus: false, select: false });
		this._refreshing = false;
	}

	_select(radio, event) {
		const value = valueOf(radio);
		if (value === this.value) return;
		this.value = value;
		this._refresh();
		if (!this._refreshing) this.emit('el:change', { value, radio, event });
	}

	_onClick(event) {
		const radio = event.target.closest('[role="radio"]');
		if (!radio || !this.contains(radio)) return;
		this._select(radio, event);
	}

	_onKey(event) {
		this._roving?.onKey(event);
		if (event.key !== 'Enter' && event.key !== ' ') return;
		const radio = document.activeElement?.closest?.('[role="radio"]');
		if (!radio || !this.contains(radio)) return;
		event.preventDefault();
		this._select(radio, event);
	}
}

defineElement('element-radio-group', ElementRadioGroup);
