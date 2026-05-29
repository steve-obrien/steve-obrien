import { ElementBase, createRoving, defineElement } from './base.js';

const itemSelector = [
	'[role="menuitem"]',
	'[role="menuitemcheckbox"]',
	'[role="menuitemradio"]',
].join(',');

function isDisabled(el) {
	return el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true';
}

export class ElementMenu extends ElementBase {
	static get observedAttributes() { return ['orientation']; }

	static __doc = {
		name: 'element-menu',
		description: 'A roving-focus action menu for command lists, static menus, and menu panels.',
		slots: [{ name: '(default)', description: 'Menu items with role="menuitem", role="menuitemcheckbox", or role="menuitemradio".' }],
		attributes: [
			{ name: 'orientation', type: "'vertical' | 'horizontal'", description: 'Arrow-key direction. Defaults to vertical.' },
		],
		events: [
			{ name: 'el:select', payload: '{ value, item }', description: 'Fired when an item is selected.' },
			{ name: 'el:change', payload: '{ value, checked, item }', description: 'Fired when a checkbox or radio menu item changes.' },
		],
		keyboard: [
			{ keys: '↑ / ↓', action: 'Move active item.' },
			{ keys: 'Home / End', action: 'Jump to first / last item.' },
			{ keys: 'Enter / Space', action: 'Select active item.' },
		],
	};

	constructor() {
		super();
		this._roving = null;
		this._onKey = this._onKey.bind(this);
		this._onClick = this._onClick.bind(this);
	}

	connectedCallback() {
		this.setAttribute('role', this.getAttribute('role') || 'menu');
		this._refresh();
		this.on(this, 'keydown', this._onKey);
		this.on(this, 'click', this._onClick);
	}

	attributeChangedCallback() {
		this._refresh();
	}

	_refresh() {
		const items = this.items;
		const orientation = this.getAttribute('orientation') || 'vertical';
		this.setAttribute('aria-orientation', orientation);
		items.forEach((item, index) => { item.tabIndex = index === 0 ? 0 : -1; });
		this._roving = createRoving({ items, orientation, loop: true });
	}

	get items() {
		return Array.from(this.querySelectorAll(itemSelector))
			.filter((item) => item.closest('element-menu') === this)
			.filter((item) => !isDisabled(item));
	}

	_select(item, event) {
		const role = item.getAttribute('role');
		const value = item.dataset.value ?? item.textContent.trim();

		if (item.getAttribute('aria-haspopup') === 'menu') {
			item.setAttribute('aria-expanded', 'true');
			this.emit('el:submenu', { value, item, event });
			return;
		}

		if (role === 'menuitemcheckbox') {
			const checked = item.getAttribute('aria-checked') !== 'true';
			item.setAttribute('aria-checked', String(checked));
			this.emit('el:change', { value, checked, item, event });
		}

		if (role === 'menuitemradio') {
			for (const radio of this.querySelectorAll('[role="menuitemradio"]')) {
				radio.setAttribute('aria-checked', String(radio === item));
			}
			this.emit('el:change', { value, checked: true, item, event });
		}

		this.emit('el:select', { value, item, event });
	}

	_onClick(event) {
		const item = event.target.closest(itemSelector);
		if (!item || !this.contains(item)) return;
		if (isDisabled(item)) {
			event.preventDefault();
			event.stopPropagation();
			return;
		}
		this._select(item, event);
	}

	_onKey(event) {
		this._roving?.onKey(event);
		if (event.key !== 'Enter' && event.key !== ' ') return;
		const item = document.activeElement?.closest?.(itemSelector);
		if (!item || !this.contains(item) || isDisabled(item)) return;
		event.preventDefault();
		this._select(item, event);
	}
}

defineElement('element-menu', ElementMenu);
