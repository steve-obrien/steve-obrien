import { ElementBase, defineElement } from './base.js';
import {
	attachPopoverReflow,
	bindPopoverToggle,
	closePopoverPanel,
	isPopoverOpen,
	openPopoverPanel,
	positionPopoverPanel,
	preparePopoverPanel,
} from './popover-panel.js';

// <element-popover>
//   <button slot="trigger">Open</button>
//   <div slot="panel">…</div>
// </element-popover>
//
// Built on the native HTML Popover API (`popover="auto"`). The browser handles
// top-layer promotion, light-dismiss, and Esc — we just wire the trigger and
// surface our usual el:open / el:close events.
export class ElementPopover extends ElementBase {
	static get observedAttributes() {
		return ['open', 'align', 'offset', 'placement', 'collision-padding'];
	}

	static __doc = {
		name: 'element-popover',
		description: 'Floating panel anchored to a trigger. Built on the native HTML Popover API — top layer, light-dismiss and Esc are handled by the browser.',
		slots: [
			{ name: 'trigger', description: 'Element that toggles the panel when clicked.' },
			{ name: 'panel', description: 'Panel content. Gets popover="auto" applied automatically.' },
		],
		attributes: [
			{ name: 'open', type: 'boolean', description: 'Reflects open state.' },
			{ name: 'placement', type: "'top' | 'right' | 'bottom' | 'left' | '<side>-<align>'", description: 'Preferred placement before collision handling (default bottom).' },
			{ name: 'align', type: "'left' | 'right' | 'center'", description: 'Horizontal alignment under the trigger (default left).' },
			{ name: 'offset', type: 'number', description: 'Gap in pixels between trigger and panel (default 8).' },
			{ name: 'collision-padding', type: 'number', description: 'Viewport padding used when flipping or shifting the panel (default 8).' },
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
		this._unbindToggle = null;
		this._reflowOff = null;
	}

	_positionOpts() {
		return {
			align: this.getAttribute('align') || 'left',
			offset: Number(this.getAttribute('offset') || 8),
			placement: this.getAttribute('placement') || 'bottom',
			padding: Number(this.getAttribute('collision-padding') || 8),
		};
	}

	_bindReflow() {
		this._reflowOff?.();
		this._reflowOff = attachPopoverReflow(this._panel, this._trigger, this._positionOpts());
	}

	_unbindReflow() {
		this._reflowOff?.();
		this._reflowOff = null;
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
		if (!this._panel.classList.contains('el-popover-panel')) {
			this._panel.classList.add('el-popover-panel');
		}
		preparePopoverPanel(this._panel, this._trigger);
		this._unbindToggle?.();
		this._unbindToggle = bindPopoverToggle(this._panel, (open) => this._syncOpen(open, true));
	}

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

	_placePanel() {
		positionPopoverPanel(this._panel, this._trigger, this._positionOpts());
	}

	_syncOpen(next, fromPopover = false) {
		if (!this._ensurePanel()) return;
		if (next && this._open) {
			this._placePanel();
			return;
		}
		if (!next && !this._open) return;

		if (next) {
			if (!fromPopover) {
				openPopoverPanel(this._panel, this._trigger, this._positionOpts());
			} else {
				this._placePanel();
			}
			this._bindReflow();
		} else {
			this._unbindReflow();
			if (!fromPopover) closePopoverPanel(this._panel);
		}

		this._open = next;
		this.setBoolAttr('open', next);
		this._trigger?.setAttribute('aria-expanded', String(next));
		this.emit(next ? 'el:open' : 'el:close');
	}

	attributeChangedCallback(name) {
		if (!this._open || !this._panel || !this._trigger) return;
		if (name === 'align' || name === 'offset' || name === 'placement' || name === 'collision-padding') {
			positionPopoverPanel(this._panel, this._trigger, this._positionOpts());
		}
	}

	get open() { return this._open; }
	set open(value) {
		const next = !!value;
		if (next === this._open) return;
		if (!this._ensurePanel()) return;
		this._syncOpen(next, false);
	}

	toggle() {
		if (!this._ensurePanel()) return;
		this._syncOpen(!isPopoverOpen(this._panel), false);
	}

	disconnectedCallback() {
		this._unbindToggle?.();
		this._unbindToggle = null;
		this._unbindReflow();
		super.disconnectedCallback();
	}
}

defineElement('element-popover', ElementPopover);
