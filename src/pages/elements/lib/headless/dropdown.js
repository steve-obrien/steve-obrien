import { ElementBase, defineElement, uid, createRoving } from './base.js';

// <element-dropdown>
//   <button slot="trigger">…</button>
//   <div slot="menu">
//     <button role="menuitem">…</button>
//   </div>
// </element-dropdown>
export class ElementDropdown extends ElementBase {
	static get observedAttributes() { return ['open']; }

	constructor() {
		super();
		this._open = false;
		this._roving = null;
		this._onDocClick = this._onDocClick.bind(this);
		this._onKey = this._onKey.bind(this);
	}

	connectedCallback() {
		this._trigger = this.querySelector('[slot="trigger"], [data-trigger]');
		this._menu = this._resolveMenu();
		if (!this._trigger) return;
		// The menu may not exist yet (Vue Teleport mounts after upgrade) — we
		// also re-resolve on every open.

		const id = uid('dd');
		if (this._menu) {
			this._menu.id = this._menu.id || `${id}-menu`;
			this._menu.setAttribute('role', 'menu');
			this._menu.hidden = true;
			this._trigger.setAttribute('aria-controls', this._menu.id);
		}
		this._trigger.setAttribute('aria-haspopup', 'menu');
		this._trigger.setAttribute('aria-expanded', 'false');

		this.on(this._trigger, 'click', () => this.toggle());
		this.on(this._trigger, 'keydown', (e) => {
			if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				this.open = true;
			}
		});

		if (this.hasAttribute('open')) this.open = true;
	}

	// Find the menu element. Either a slotted descendant, or — for teleported
	// popups — looked up by id via `data-menu-id` on the host. Resolving on
	// each open also lets framework wrappers swap the menu node out at runtime.
	_resolveMenu() {
		const inner = this.querySelector('[slot="menu"], [data-menu]');
		if (inner) return inner;
		const id = this.dataset.menuId;
		return id ? document.getElementById(id) : null;
	}

	get open() { return this._open; }
	set open(value) {
		const next = !!value;
		if (next === this._open) return;
		// Re-resolve menu (teleport may have mounted it after connectedCallback).
		if (!this._menu || !this._menu.isConnected) {
			this._menu = this._resolveMenu();
			if (this._menu) {
				const id = uid('dd');
				this._menu.id = this._menu.id || `${id}-menu`;
				this._menu.setAttribute('role', 'menu');
				this._trigger?.setAttribute('aria-controls', this._menu.id);
			}
		}
		this._open = next;
		this.setBoolAttr('open', next);
		this._trigger?.setAttribute('aria-expanded', String(next));
		if (this._menu) this._menu.hidden = !next;

		if (next) {
			const items = Array.from(this._menu.querySelectorAll('[role="menuitem"]:not([disabled])'));
			this._roving = createRoving({ items, orientation: 'vertical', loop: true });
			items.forEach((el, i) => { el.tabIndex = i === 0 ? 0 : -1; });
			// Defer focus past the click event chain — without this, some browsers
			// re-focus the trigger button after the click handler returns, leaving
			// keyboard navigation stuck on the trigger.
			requestAnimationFrame(() => items[0]?.focus());
			this._menu.addEventListener('keydown', this._onKey);
			document.addEventListener('mousedown', this._onDocClick);
			items.forEach((el) => el.addEventListener('click', (ev) => this._select(el, ev)));
		} else {
			this._menu?.removeEventListener('keydown', this._onKey);
			document.removeEventListener('mousedown', this._onDocClick);
			this._trigger?.focus();
		}
		this.emit(next ? 'el:open' : 'el:close');
	}

	toggle() { this.open = !this.open; }

	_select(el, ev) {
		this.emit('el:select', { value: el.dataset.value ?? el.textContent.trim(), event: ev });
		this.open = false;
	}

	_onKey(e) {
		this._roving?.onKey(e);
		if (e.key === 'Escape') {
			e.preventDefault();
			this.open = false;
		} else if (e.key === 'Tab') {
			this.open = false;
		}
	}

	_onDocClick(e) {
		// Clicks inside the host OR the (possibly teleported) menu keep it open.
		if (this.contains(e.target)) return;
		if (this._menu && this._menu.contains(e.target)) return;
		this.open = false;
	}
}

defineElement('element-dropdown', ElementDropdown);
