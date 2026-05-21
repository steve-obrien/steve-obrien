import { ElementBase, defineElement, uid } from './base.js';

// <element-popover>
//   <button slot="trigger">Open</button>
//   <div slot="panel">…</div>
// </element-popover>
//
// Built on the native HTML Popover API (`popover="auto"`). The browser handles
// top-layer promotion, light-dismiss, and Esc — we just wire the trigger and
// surface our usual el:open / el:close events.
export class ElementPopover extends ElementBase {
	static get observedAttributes() { return ['open']; }

	static __doc = {
		name: 'element-popover',
		description: 'Floating panel anchored to a trigger. Built on the native HTML Popover API — top layer, light-dismiss and Esc are handled by the browser.',
		slots: [
			{ name: 'trigger', description: 'Element that toggles the panel when clicked.' },
			{ name: 'panel', description: 'Panel content. Gets popover="auto" applied automatically.' },
		],
		attributes: [
			{ name: 'open', type: 'boolean', description: 'Reflects open state.' },
			{ name: 'data-panel-id', type: 'string', description: 'Id of an external (teleported) panel element.' },
		],
		events: [
			{ name: 'el:open', description: 'Fired when the panel opens.' },
			{ name: 'el:close', description: 'Fired when the panel closes.' },
		],
		keyboard: [
			{ keys: 'Click trigger', action: 'Toggles the panel.' },
			{ keys: 'Click outside', action: 'Light-dismiss via the native popover API.' },
			{ keys: 'Esc', action: 'Closes the panel.' },
		],
		example: `<element-popover>
  <button slot="trigger">More</button>
  <div slot="panel">
    <p>Anything you like — text, buttons, even forms.</p>
  </div>
</element-popover>`,
	};

	constructor() {
		super();
		this._open = false;
		this._onToggle = this._onToggle.bind(this);
	}

	connectedCallback() {
		this._trigger = this.querySelector('[slot="trigger"], [data-trigger]');
		this._panel = this._resolvePanel();
		if (!this._trigger) return;

		if (this._panel) this._preparePanel();

		this._trigger.setAttribute('aria-haspopup', 'dialog');
		this._trigger.setAttribute('aria-expanded', 'false');
		this.on(this._trigger, 'click', () => this.toggle());

		if (this.hasAttribute('open')) this.open = true;
	}

	_preparePanel() {
		const id = uid('pop');
		this._panel.id = this._panel.id || `${id}-panel`;
		if (!this._panel.hasAttribute('popover')) {
			this._panel.setAttribute('popover', 'auto');
		}
		this._trigger.setAttribute('aria-controls', this._panel.id);
		this._panel.addEventListener('toggle', this._onToggle);
	}

	// Slot child first; teleported panels referenced by `data-panel-id`.
	_resolvePanel() {
		const inner = this.querySelector('[slot="panel"], [data-panel]');
		if (inner) return inner;
		const id = this.dataset.panelId;
		return id ? document.getElementById(id) : null;
	}

	_ensurePanel() {
		if (!this._panel || !this._panel.isConnected) {
			this._panel = this._resolvePanel();
			if (this._panel) this._preparePanel();
		}
		return this._panel;
	}

	_onToggle(e) {
		const next = e.newState === 'open';
		if (next === this._open) return;
		this._open = next;
		this.setBoolAttr('open', next);
		this._trigger?.setAttribute('aria-expanded', String(next));
		this.emit(next ? 'el:open' : 'el:close');
	}

	get open() { return this._open; }
	set open(value) {
		const next = !!value;
		if (next === this._open) return;
		if (!this._ensurePanel()) return;
		if (next) this._panel.showPopover?.();
		else this._panel.hidePopover?.();
	}

	toggle() {
		if (!this._ensurePanel()) return;
		if (this._panel.matches(':popover-open')) this._panel.hidePopover();
		else this._panel.showPopover();
	}

	disconnectedCallback() {
		this._panel?.removeEventListener('toggle', this._onToggle);
		super.disconnectedCallback();
	}
}

defineElement('element-popover', ElementPopover);
