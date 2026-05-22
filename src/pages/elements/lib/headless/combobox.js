import { ElementBase, defineElement, uid } from './base.js';
import {
	applyFloatingPosition,
	autoUpdateFloating,
} from './floating.js';

// <element-combobox value="">
//   <input slot="input" />
//   <button slot="toggle" type="button">...</button>
//   <ul slot="list">
//     <li data-value="apple">Apple</li>
//   </ul>
// </element-combobox>

const OBSERVED = [
	'value',
	'open',
	'align',
	'offset',
	'placement',
	'collision-padding',
	'floating-mode',
];

function textOf(option) {
	return option.textContent.trim();
}

function valueOf(option) {
	return option.dataset.value ?? option.getAttribute('value') ?? option.value ?? textOf(option);
}

function labelOf(option) {
	return option.dataset.label ?? option.getAttribute('label') ?? textOf(option);
}

function matchesOption(option, query) {
	if (!query) return true;
	const haystack = `${option.dataset.value || ''} ${option.dataset.label || ''} ${option.textContent}`.toLowerCase();
	return haystack.includes(query);
}

function dispatchCancelable(host, type, detail) {
	const event = new CustomEvent(type, {
		detail,
		bubbles: true,
		cancelable: true,
		composed: true,
	});
	host.dispatchEvent(event);
	return event;
}

export class ComboBase extends ElementBase {
	static get observedAttributes() { return OBSERVED; }

	constructor() {
		super();
		this._active = -1;
		this._open = false;
		this._options = [];
		this._unbindFloating = null;
		this._mutationObserver = null;
		this._wiredList = null;
		this._onDocDown = this._onDocDown.bind(this);
		this._onListPointerDown = this._onListPointerDown.bind(this);
		this._onListPointerMove = this._onListPointerMove.bind(this);
	}

	get _freeText() { return false; }
	get _inputRole() { return 'combobox'; }
	get _valueMode() { return 'option'; }
	get _activeOnFilter() { return true; }

	_positionOpts() {
		return {
			align: this.getAttribute('align') || 'left',
			offset: Number(this.getAttribute('offset') || 4),
			placement: this.getAttribute('placement') || 'bottom',
			padding: Number(this.getAttribute('collision-padding') || 8),
			mode: this.getAttribute('floating-mode') || 'viewport',
		};
	}

	connectedCallback() {
		this._input = this.querySelector('[slot="input"], [data-input]');
		this._toggle = this.querySelector('[slot="toggle"], [data-toggle]');
		this._list = this._resolveList();
		if (!this._input) return;

		this._input.setAttribute('role', this._inputRole);
		this._input.setAttribute('aria-autocomplete', 'list');
		this._input.setAttribute('aria-expanded', 'false');

		if (this._toggle) {
			this._toggle.setAttribute('aria-haspopup', 'listbox');
			this._toggle.setAttribute('aria-expanded', 'false');
			this.on(this._toggle, 'click', () => this._toggleList());
		}

		if (this._list) this._wireList();

		this.on(this._input, 'input', () => this._handleInput());
		this.on(this._input, 'focus', () => this._filter(this._input.value, { open: true }));
		this.on(this._input, 'keydown', (e) => this._onKey(e));
		if (this.hasAttribute('value')) this._syncInputFromValue();
		if (this.hasAttribute('open')) this._setOpen(true);
	}

	disconnectedCallback() {
		this._setOpen(false);
		this._mutationObserver?.disconnect();
		this._mutationObserver = null;
		this._wiredList?.removeEventListener('mousedown', this._onListPointerDown);
		this._wiredList?.removeEventListener('mousemove', this._onListPointerMove);
		this._wiredList = null;
		super.disconnectedCallback();
		document.removeEventListener('mousedown', this._onDocDown);
	}

	_resolveList() {
		const inner = this.querySelector('[slot="list"], [data-list]');
		if (inner) return inner;
		const id = this.dataset.menuId || this.dataset.listId;
		return id ? document.getElementById(id) : null;
	}

	_ensureList() {
		if (!this._list || !this._list.isConnected) {
			this._list = this._resolveList();
			if (this._list) this._wireList();
		}
		return this._list;
	}

	_wireList() {
		if (!this._list || this._list.__elementComboOwner === this) return;
		const id = uid('cmb');
		this._wiredList?.removeEventListener('mousedown', this._onListPointerDown);
		this._wiredList?.removeEventListener('mousemove', this._onListPointerMove);
		this._list.__elementComboOwner = this;
		this._wiredList = this._list;
		this._list.id = this._list.id || `${id}-list`;
		this._list.setAttribute('role', 'listbox');
		this._list.hidden = !this._open;
		this._input.setAttribute('aria-controls', this._list.id);
		this._list.addEventListener('mousedown', this._onListPointerDown);
		this._list.addEventListener('mousemove', this._onListPointerMove);
		this._mutationObserver?.disconnect();
		this._mutationObserver = new MutationObserver(() => {
			this._refreshOptions();
			if (this._open || document.activeElement === this._input) {
				this._filter(this._input.value, { open: true, emitQuery: false });
				this._positionList();
			}
		});
		this._mutationObserver.observe(this._list, { childList: true, subtree: true, characterData: true });
		this._refreshOptions();
		this._syncInputFromValue();
	}

	_refreshOptions() {
		if (!this._list) return;
		const id = this._list.id || uid('cmb-list');
		this._options = Array.from(this._list.children).filter((option) => !option.hasAttribute('data-disabled'));
		this._options.forEach((option, index) => {
			option.setAttribute('role', 'option');
			option.id = option.id || `${id}-opt-${index}`;
		});
	}

	_handleInput() {
		const value = this._input.value;
		this.emit('el:input', { value });
		this._filter(value, { open: true });
		if (this._freeText) this.setAttribute('value', value);
	}

	_syncInputFromValue() {
		if (!this._input || !this.hasAttribute('value')) return;
		const value = this.getAttribute('value') || '';
		if (this._valueMode === 'text') {
			if (this._input.value !== value) this._input.value = value;
			return;
		}
		const selected = this._options.find((option) => valueOf(option) === value);
		const display = selected ? labelOf(selected) : value;
		if (this._input.value !== display) this._input.value = display;
	}

	_onDocDown(e) {
		if (this.contains(e.target)) return;
		if (this._list && this._list.contains(e.target)) return;
		this._setOpen(false);
	}

	_positionList() {
		if (!this._input || !this._list || this._list.hidden) return;
		const rect = this._input.getBoundingClientRect();
		this._list.style.width = `${Math.round(rect.width)}px`;
		applyFloatingPosition(this._input, this._list, this._positionOpts());
	}

	_bindFloating() {
		this._unbindFloating?.();
		this._unbindFloating = autoUpdateFloating(this._input, this._list, () => this._positionList());
	}

	_unbindFloating() {
		this._unbindFloating?.();
		this._unbindFloating = null;
	}

	_setOpen(open) {
		if (!this._ensureList()) return;
		if (open === this._open && this._list.hidden === !open) {
			if (open) this._positionList();
			return;
		}
		this._open = open;
		this._list.hidden = !open;
		this._input.setAttribute('aria-expanded', String(open));
		this._toggle?.setAttribute('aria-expanded', String(open));
		this.setBoolAttr('open', open);

		if (open) {
			this._positionList();
			this._bindFloating();
			document.addEventListener('mousedown', this._onDocDown);
		} else {
			this._unbindFloating();
			this._setActive(-1);
			document.removeEventListener('mousedown', this._onDocDown);
		}
	}

	_filter(value, { open = true, emitQuery = true } = {}) {
		if (!this._ensureList()) {
			if (emitQuery) this.emit('el:query', { query: value });
			return;
		}
		if (emitQuery) this.emit('el:query', { query: value });

		this._refreshOptions();
		const query = value.trim().toLowerCase();
		let firstVisible = -1;

		this._options.forEach((option, index) => {
			const match = matchesOption(option, query);
			option.hidden = !match;
			if (match && firstVisible === -1) firstVisible = index;
		});

		this._list.toggleAttribute('data-empty', firstVisible < 0);
		this._setOpen(open && firstVisible >= 0);
		this._setActive(this._activeOnFilter ? firstVisible : -1);
		this._positionList();
	}

	_setActive(index) {
		this._active = index;
		this._options.forEach((option, optionIndex) => {
			const active = optionIndex === index;
			option.toggleAttribute('data-active', active);
			option.setAttribute('aria-selected', String(active));
		});
		if (index >= 0 && this._options[index]) this._input.setAttribute('aria-activedescendant', this._options[index].id);
		else this._input.removeAttribute('aria-activedescendant');
	}

	_visible() {
		this._refreshOptions();
		return this._options
			.map((option, index) => ({ option, index }))
			.filter(({ option }) => !option.hidden);
	}

	_move(delta) {
		const visible = this._visible();
		if (!visible.length) return;
		const current = visible.findIndex(({ index }) => index === this._active);
		if (current === -1) {
			this._setActive(delta > 0 ? visible[0].index : visible[visible.length - 1].index);
			return;
		}
		const next = visible[(current + delta + visible.length) % visible.length];
		this._setActive(next.index);
	}

	_onKey(e) {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (!this._open) this._filter(this._input.value, { open: true });
			this._move(1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (!this._open) this._filter(this._input.value, { open: true });
			this._move(-1);
		} else if (e.key === 'Enter') {
			if (this._active >= 0) {
				e.preventDefault();
				this._commit(this._options[this._active]);
			} else if (this._freeText) {
				e.preventDefault();
				this._commitCustom(this._input.value);
			}
		} else if (e.key === 'Escape') {
			e.preventDefault();
			this._setOpen(false);
		}
	}

	_onListPointerDown(e) {
		const option = e.target.closest?.('[role="option"]');
		if (!option || !this._list.contains(option) || option.hidden) return;
		e.preventDefault();
		this._commit(option);
	}

	_onListPointerMove(e) {
		const option = e.target.closest?.('[role="option"]');
		if (!option || !this._list.contains(option) || option.hidden) return;
		const index = this._options.indexOf(option);
		if (index >= 0) this._setActive(index);
	}

	_toggleList() {
		if (!this._ensureList()) return;
		const wasOpen = this._open;
		this._input.focus();
		if (wasOpen) this._setOpen(false);
		else this._filter('', { open: true });
	}

	_commit(option) {
		if (!option) return;
		const value = valueOf(option);
		const detail = {
			value,
			label: labelOf(option),
			option,
			custom: false,
		};
		const inputValue = this._valueMode === 'text' ? detail.label : detail.label;
		const hostValue = this._valueMode === 'text' ? detail.label : value;

		this._input.value = inputValue;
		this.setAttribute('value', hostValue);
		this._setOpen(false);
		this.emit('el:select', detail);
		this.emit('el:change', detail);
	}

	_commitCustom(rawValue) {
		const value = rawValue.trim();
		if (!value) return;
		const detail = { value, label: value, option: null, custom: true };
		const event = dispatchCancelable(this, 'el:custom', detail);
		if (event.defaultPrevented) return;
		this._input.value = value;
		this.setAttribute('value', value);
		this._setOpen(false);
		this.emit('el:change', detail);
	}

	attributeChangedCallback(name, _old, value) {
		if (!this.isConnected || !this._input) return;
		if (name === 'value') this._syncInputFromValue();
		if (name === 'open') this._setOpen(value !== null);
		if (['align', 'offset', 'placement', 'collision-padding', 'floating-mode'].includes(name) && this._open) this._positionList();
	}

	get value() { return this.getAttribute('value') || ''; }
	set value(value) { this.setAttribute('value', value ?? ''); }
}

export class ElementCombobox extends ComboBase {
	static __doc = {
		name: 'element-combobox',
		description: 'Select-like combobox with a text input, optional toggle button, managed activedescendant, keyboard navigation, and floating list positioning.',
		slots: [
			{ name: 'input', description: 'The text input. Gets role="combobox" and aria-controls wired automatically.' },
			{ name: 'toggle', description: 'Optional button that opens the list like a select.' },
			{ name: 'list', description: 'The listbox container. Each option must carry data-value.' },
		],
		attributes: [
			{ name: 'value', type: 'string', description: 'Currently-selected value.' },
			{ name: 'open', type: 'boolean', description: 'Reflects whether the list is visible.' },
			{ name: 'placement', type: 'string', description: 'Preferred floating placement before collision handling.' },
			{ name: 'floating-mode', type: "'viewport' | 'anchor'", description: 'viewport keeps the list inside the browser; anchor keeps it attached to the input while scrolling.' },
			{ name: 'data-menu-id', type: 'string', description: 'Id of an external or teleported list element.' },
		],
		events: [
			{ name: 'el:input', payload: '{ value }', description: 'Fired whenever the text value changes.' },
			{ name: 'el:query', payload: '{ query }', description: 'Fired whenever the user types. Useful for server lookups.' },
			{ name: 'el:select', payload: '{ value, label, option }', description: 'Fired when an option is selected.' },
			{ name: 'el:change', payload: '{ value, option, custom }', description: 'Fired when an option is committed.' },
		],
		keyboard: [
			{ keys: '↑ / ↓', action: 'Move active option.' },
			{ keys: 'Enter', action: 'Commit active option.' },
			{ keys: 'Esc', action: 'Close the list.' },
			{ keys: 'Type', action: 'Filter the list and emit el:query.' },
		],
	};
}

defineElement('element-combobox', ElementCombobox);
