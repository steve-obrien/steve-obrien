import { ElementBase, defineElement, uid, createRoving } from './base.js';
import {
	attachPopoverReflow,
	bindPopoverToggle,
	closePopoverPanel,
	isPopoverOpen,
	openPopoverPanel,
	positionPopoverPanel,
	preparePopoverPanel,
} from './popover-panel.js';

// Popover API for the menu layer (same as element-popover); dropdown adds
// menu semantics, roving focus, and el:select.
import './popover.js';

// <element-dropdown>
//   <button slot="trigger">…</button>
//   <div slot="menu">
//     <button role="menuitem">…</button>
//   </div>
// </element-dropdown>
export class ElementDropdown extends ElementBase {
	static get observedAttributes() { return ['open', 'align', 'offset']; }

	static __doc = {
		name: 'element-dropdown',
		description: 'A menu that opens from a button. The menu panel uses the same native Popover API as element-popover (top layer, light-dismiss, Esc), plus menu keyboard navigation and el:select.',
		slots: [
			{ name: 'trigger', description: 'Button that opens the menu.' },
			{ name: 'menu', description: 'Menu panel (popover="auto"). Items inside must carry role="menuitem". data-value flows through el:select.' },
		],
		attributes: [
			{ name: 'open', type: 'boolean', description: 'Reflects open state (toggle by setting / removing).' },
			{ name: 'align', type: "'left' | 'right'", description: 'Horizontal alignment under the trigger (default left).' },
			{ name: 'offset', type: 'number', description: 'Gap in pixels between trigger and menu (default 4).' },
			{ name: 'data-menu-id', type: 'string', description: 'Id of an external (teleported) menu element. Used when the menu lives outside the host — e.g. portalled to <body>.' },
		],
		events: [
			{ name: 'el:open', description: 'Fired when the menu opens.' },
			{ name: 'el:close', description: 'Fired when the menu closes.' },
			{ name: 'el:select', payload: '{ value, event }', description: 'Fired when a menu item is chosen.' },
		],
		keyboard: [
			{ keys: 'Enter / Space / ↓', action: 'Open menu (when trigger is focused).' },
			{ keys: '↑ / ↓', action: 'Move active item.' },
			{ keys: 'Home / End', action: 'Jump to first / last item.' },
			{ keys: 'Enter', action: 'Select active item.' },
			{ keys: 'Esc / Tab', action: 'Close menu and return focus.' },
		],
		example: `<element-dropdown>
  <button slot="trigger">Account ▾</button>
  <div slot="menu">
    <button role="menuitem" data-value="profile">Profile</button>
    <button role="menuitem" data-value="billing">Billing</button>
    <button role="menuitem" data-value="signout">Sign out</button>
  </div>
</element-dropdown>

<script type="module">
  import '@elements/headless';
  document.querySelector('element-dropdown')
    .addEventListener('el:select', (e) => console.log(e.detail.value));
<\/script>`,
	};

	constructor() {
		super();
		this._open = false;
		this._roving = null;
		this._unbindToggle = null;
		this._reflowOff = null;
		this._onKey = this._onKey.bind(this);
		this._itemClickHandlers = [];
	}

	_positionOpts() {
		return {
			align: this.getAttribute('align') || 'left',
			offset: Number(this.getAttribute('offset') || 4),
		};
	}

	_bindReflow() {
		this._reflowOff?.();
		this._reflowOff = attachPopoverReflow(this._menu, this._trigger, this._positionOpts());
	}

	_unbindReflow() {
		this._reflowOff?.();
		this._reflowOff = null;
	}

	connectedCallback() {
		this._trigger = this.querySelector('[slot="trigger"], [data-trigger]');
		this._menu = this._resolveMenu();
		if (!this._trigger) return;

		if (this._menu) this._prepareMenu();

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

	_resolveMenu() {
		const inner = this.querySelector('[slot="menu"], [data-menu]');
		if (inner) return inner;
		const id = this.dataset.menuId;
		return id ? document.getElementById(id) : null;
	}

	_prepareMenu() {
		const id = uid('dd');
		this._menu.id = this._menu.id || `${id}-menu`;
		this._menu.setAttribute('role', 'menu');
		if (!this._menu.classList.contains('el-dropdown-menu')) {
			this._menu.classList.add('el-dropdown-menu');
		}
		preparePopoverPanel(this._menu, this._trigger);
		this._unbindToggle?.();
		this._unbindToggle = bindPopoverToggle(this._menu, (open) => this._syncOpen(open, true));
	}

	_ensureMenu() {
		if (!this._menu || !this._menu.isConnected) {
			this._menu = this._resolveMenu();
			if (this._menu) this._prepareMenu();
		}
		return this._menu;
	}

	_setupMenuInteractions() {
		const items = Array.from(this._menu.querySelectorAll('[role="menuitem"]:not([disabled])'));
		this._roving = createRoving({ items, orientation: 'vertical', loop: true });
		items.forEach((el, i) => { el.tabIndex = i === 0 ? 0 : -1; });
		requestAnimationFrame(() => items[0]?.focus());
		this._menu.addEventListener('keydown', this._onKey);
		this._itemClickHandlers = items.map((el) => {
			const handler = (ev) => this._select(el, ev);
			el.addEventListener('click', handler);
			return () => el.removeEventListener('click', handler);
		});
	}

	_teardownMenuInteractions() {
		this._menu?.removeEventListener('keydown', this._onKey);
		for (const off of this._itemClickHandlers) off();
		this._itemClickHandlers = [];
		this._roving = null;
		this._trigger?.focus();
	}

	_placeMenu() {
		positionPopoverPanel(this._menu, this._trigger, this._positionOpts());
		const r = this._trigger.getBoundingClientRect();
		this._menu.style.minWidth = `${r.width}px`;
	}

	_syncOpen(next, fromPopover = false) {
		if (!this._ensureMenu()) return;
		if (next && this._open) {
			this._placeMenu();
			return;
		}
		if (!next && !this._open) return;

		if (next) {
			if (!fromPopover) {
				openPopoverPanel(this._menu, this._trigger, this._positionOpts(), () => this._placeMenu());
			} else {
				this._placeMenu();
			}
			this._bindReflow();
			this._setupMenuInteractions();
		} else {
			this._unbindReflow();
			this._teardownMenuInteractions();
			if (!fromPopover) closePopoverPanel(this._menu);
		}

		this._open = next;
		this.setBoolAttr('open', next);
		this._trigger?.setAttribute('aria-expanded', String(next));
		this.emit(next ? 'el:open' : 'el:close');
	}

	get open() { return this._open; }
	set open(value) {
		const next = !!value;
		if (next === this._open) return;
		this._syncOpen(next, false);
	}

	toggle() {
		if (!this._ensureMenu()) return;
		this._syncOpen(!isPopoverOpen(this._menu), false);
	}

	_select(el, ev) {
		this.emit('el:select', { value: el.dataset.value ?? el.textContent.trim(), event: ev });
		this.open = false;
	}

	_onKey(e) {
		this._roving?.onKey(e);
		if (e.key === 'Escape' || e.key === 'Tab') {
			if (e.key === 'Escape') e.preventDefault();
			this.open = false;
		}
	}

	disconnectedCallback() {
		this._teardownMenuInteractions();
		this._unbindToggle?.();
		this._unbindToggle = null;
		this._unbindReflow();
		super.disconnectedCallback();
	}
}

defineElement('element-dropdown', ElementDropdown);
