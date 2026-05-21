import { ElementBase, defineElement, uid } from './base.js';

// <element-combobox value="">
//   <input slot="input" />
//   <ul slot="list">
//     <li data-value="apple">Apple</li>
//   </ul>
// </element-combobox>
export class ElementCombobox extends ElementBase {
	static get observedAttributes() { return ['value', 'open']; }

	constructor() {
		super();
		this._active = -1;
		this._onDocDown = this._onDocDown.bind(this);
	}

	connectedCallback() {
		this._input = this.querySelector('[slot="input"], [data-input]');
		this._list = this._resolveList();
		if (!this._input) return;
		// List may be missing at upgrade time (Vue Teleport mounts after) —
		// _setOpen / _filter will re-resolve before reading it.

		this._input.setAttribute('role', 'combobox');
		this._input.setAttribute('aria-autocomplete', 'list');
		this._input.setAttribute('aria-expanded', 'false');
		if (this._list) this._wireList();

		this.on(this._input, 'input', () => this._filter(this._input.value));
		this.on(this._input, 'focus', () => this._setOpen(true));
		this.on(this._input, 'keydown', (e) => this._onKey(e));
	}

	// Resolve the listbox. Slotted descendant first; otherwise looked up by id
	// via `data-menu-id` on the host (used by the teleported Vue wrapper).
	_resolveList() {
		const inner = this.querySelector('[slot="list"], [data-list]');
		if (inner) return inner;
		const id = this.dataset.menuId;
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
		const id = uid('cmb');
		this._list.id = this._list.id || `${id}-list`;
		this._list.setAttribute('role', 'listbox');
		this._list.hidden = true;
		this._input.setAttribute('aria-controls', this._list.id);

		this._options = Array.from(this._list.children);
		this._options.forEach((opt, i) => {
			opt.setAttribute('role', 'option');
			opt.id = opt.id || `${id}-opt-${i}`;
			this.on(opt, 'mousedown', (e) => {
				e.preventDefault();
				this._commit(opt);
			});
			this.on(opt, 'mouseenter', () => this._setActive(i));
		});
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		document.removeEventListener('mousedown', this._onDocDown);
	}

	_onDocDown(e) {
		if (this.contains(e.target)) return;
		if (this._list && this._list.contains(e.target)) return;
		this._setOpen(false);
	}

	_setOpen(open) {
		if (!this._ensureList()) return;
		this._list.hidden = !open;
		this._input.setAttribute('aria-expanded', String(open));
		this.setBoolAttr('open', open);
		if (open) document.addEventListener('mousedown', this._onDocDown);
		else document.removeEventListener('mousedown', this._onDocDown);
	}

	_filter(query) {
		if (!this._ensureList()) return;
		const q = query.trim().toLowerCase();
		let firstVisible = -1;
		this._options.forEach((opt, i) => {
			const match = !q || opt.textContent.toLowerCase().includes(q);
			opt.hidden = !match;
			if (match && firstVisible === -1) firstVisible = i;
		});
		this._setOpen(true);
		this._setActive(firstVisible);
	}

	_setActive(i) {
		this._active = i;
		this._options.forEach((opt, idx) => {
			const active = idx === i;
			opt.toggleAttribute('data-active', active);
			opt.setAttribute('aria-selected', String(active));
		});
		if (i >= 0) this._input.setAttribute('aria-activedescendant', this._options[i].id);
		else this._input.removeAttribute('aria-activedescendant');
	}

	_visible() {
		return this._options
			.map((opt, i) => ({ opt, i }))
			.filter(({ opt }) => !opt.hidden);
	}

	_onKey(e) {
		const vis = this._visible();
		if (!vis.length && !['Escape', 'Tab'].includes(e.key)) return;
		const currentIdx = vis.findIndex(({ i }) => i === this._active);
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			const next = vis[(currentIdx + 1) % vis.length];
			this._setActive(next.i);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			const next = vis[(currentIdx - 1 + vis.length) % vis.length];
			this._setActive(next.i);
		} else if (e.key === 'Enter') {
			if (this._active >= 0) {
				e.preventDefault();
				this._commit(this._options[this._active]);
			}
		} else if (e.key === 'Escape') {
			e.preventDefault();
			this._setOpen(false);
		}
	}

	_commit(opt) {
		const value = opt.dataset.value ?? opt.textContent.trim();
		this._input.value = opt.textContent.trim();
		this.setAttribute('value', value);
		this._setOpen(false);
		this.emit('el:change', { value });
	}

	get value() { return this.getAttribute('value'); }
	set value(v) { this.setAttribute('value', v); }
}

defineElement('element-combobox', ElementCombobox);
