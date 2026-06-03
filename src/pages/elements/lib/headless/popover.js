import { ElementBase, defineElement } from './base.js';
import {
	bindPopoverToggle,
	bindFloatingReflow,
	closePopoverPanel,
	isPopoverOpen,
	openPopoverPanel,
	positionPopoverPanel,
	preparePopoverPanel,
	readFloatingPositionOptions,
	syncFloatingScrollLock,
	unbindFloatingReflow,
} from './popover-panel.js';

const TRIGGER_SELECTOR = [
	'button',
	'a[href]',
	'input:not([type="hidden"])',
	'select',
	'textarea',
	'[role="button"]',
	'[role="link"]',
	'[tabindex]:not([tabindex="-1"])',
].join(',');

function isNativeTrigger(element) {
	return ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(element?.tagName);
}

function resolveTriggerElement(root) {
	if (!root) return null;
	if (root.matches(TRIGGER_SELECTOR)) return root;
	return root.querySelector(TRIGGER_SELECTOR) || root.firstElementChild || root;
}

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
		return ['open', 'align', 'offset', 'placement', 'collision-padding', 'floating-mode', 'flip', 'lock-scroll', 'trigger', 'hover-close-delay', 'data-trigger-id'];
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
			{ name: 'floating-mode', type: "'viewport' | 'anchor'", description: 'viewport keeps the panel inside the browser; anchor keeps it attached to the trigger while scrolling.' },
			{ name: 'flip', type: 'boolean', description: 'Allow the panel to flip to the opposite side when it would collide with the viewport.' },
			{ name: 'lock-scroll', type: 'boolean', description: 'Lock document scrolling while the panel is open.' },
			{ name: 'trigger', type: "'click' | 'hover'", description: 'How the trigger opens the panel. Default is click.' },
			{ name: 'hover-close-delay', type: 'number', description: 'Delay before closing a hover-triggered panel after pointer/focus leaves.' },
			{ name: 'data-trigger-id', type: 'string', description: 'Id of an external trigger element.' },
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
		this._triggerOff = null;
		this._panelHoverOff = null;
		this._scrollLocked = false;
		this._dismissOff = null;
		this._dismissBindFrame = 0;
		this._hoverCloseTimer = 0;
	}

	_positionOpts() {
		return readFloatingPositionOptions(this, { offset: 8, flip: true });
	}

	_bindReflow() {
		bindFloatingReflow(this, this._panel, this._trigger, this._positionOpts());
	}

	_unbindReflow() {
		unbindFloatingReflow(this);
	}

	_bindDismiss() {
		this._unbindDismiss();
		this._dismissBindFrame = requestAnimationFrame(() => {
			const onPointerDown = (event) => {
				const target = event.target;
				if (this._panel?.contains(target) || this._trigger?.contains(target)) return;
				this._syncOpen(false, false);
			};
			const onKeydown = (event) => {
				if (event.key !== 'Escape') return;
				event.preventDefault();
				this._syncOpen(false, false);
			};
			document.addEventListener('pointerdown', onPointerDown, true);
			document.addEventListener('keydown', onKeydown, true);
			this._dismissOff = () => {
				document.removeEventListener('pointerdown', onPointerDown, true);
				document.removeEventListener('keydown', onKeydown, true);
			};
		});
	}

	_unbindDismiss() {
		if (this._dismissBindFrame) {
			cancelAnimationFrame(this._dismissBindFrame);
			this._dismissBindFrame = 0;
		}
		this._dismissOff?.();
		this._dismissOff = null;
	}

	_triggerMode() {
		return this.getAttribute('trigger') || 'click';
	}

	_hoverCloseDelay() {
		return Math.max(0, Number(this.getAttribute('hover-close-delay') || 140));
	}

	_clearHoverClose() {
		if (!this._hoverCloseTimer) return;
		clearTimeout(this._hoverCloseTimer);
		this._hoverCloseTimer = 0;
	}

	_openFromHover() {
		this._clearHoverClose();
		this._syncOpen(true, false);
	}

	_closeFromHoverSoon() {
		this._clearHoverClose();
		this._hoverCloseTimer = setTimeout(() => {
			this._hoverCloseTimer = 0;
			this._syncOpen(false, false);
		}, this._hoverCloseDelay());
	}

	_bindPanelHover() {
		this._unbindPanelHover();
		if (this._triggerMode() !== 'hover' || !this._panel) return;
		const offPointerEnter = this.on(this._panel, 'pointerenter', () => this._clearHoverClose());
		const offPointerLeave = this.on(this._panel, 'pointerleave', () => this._closeFromHoverSoon());
		const offMouseEnter = this.on(this._panel, 'mouseenter', () => this._clearHoverClose());
		const offMouseLeave = this.on(this._panel, 'mouseleave', () => this._closeFromHoverSoon());
		const offFocusIn = this.on(this._panel, 'focusin', () => this._clearHoverClose());
		const offFocusOut = this.on(this._panel, 'focusout', () => this._closeFromHoverSoon());
		this._panelHoverOff = () => {
			offPointerEnter?.();
			offPointerLeave?.();
			offMouseEnter?.();
			offMouseLeave?.();
			offFocusIn?.();
			offFocusOut?.();
		};
	}

	_unbindPanelHover() {
		this._panelHoverOff?.();
		this._panelHoverOff = null;
	}

	_syncScrollLock(next) {
		syncFloatingScrollLock(this, this._panel, next);
	}

	connectedCallback() {
		this._trigger = this._resolveTrigger();
		this._panel = this._resolvePanel();
		if (!this._trigger) return;

		if (this._panel) this._preparePanel();
		this._prepareTrigger();

		if (this.hasAttribute('open')) this.open = true;
	}

	_prepareTrigger() {
		this._triggerOff?.();
		this._triggerOff = null;
		this._unbindPanelHover();
		if (!this._trigger) return;
		this._trigger.setAttribute('aria-haspopup', 'dialog');
		this._trigger.setAttribute('aria-expanded', String(this._open));
		if (!isNativeTrigger(this._trigger) && !this._trigger.hasAttribute('role')) {
			this._trigger.setAttribute('role', 'button');
		}
		if (!isNativeTrigger(this._trigger) && !this._trigger.hasAttribute('tabindex')) {
			this._trigger.setAttribute('tabindex', '0');
		}
		if (this._triggerMode() === 'hover') {
			const offPointerEnter = this.on(this._trigger, 'pointerenter', () => this._openFromHover());
			const offPointerLeave = this.on(this._trigger, 'pointerleave', () => this._closeFromHoverSoon());
			const offMouseEnter = this.on(this._trigger, 'mouseenter', () => this._openFromHover());
			const offMouseLeave = this.on(this._trigger, 'mouseleave', () => this._closeFromHoverSoon());
			const offFocusIn = this.on(this._trigger, 'focusin', () => this._openFromHover());
			const offFocusOut = this.on(this._trigger, 'focusout', () => this._closeFromHoverSoon());
			this._bindPanelHover();
			this._triggerOff = () => {
				offPointerEnter?.();
				offPointerLeave?.();
				offMouseEnter?.();
				offMouseLeave?.();
				offFocusIn?.();
				offFocusOut?.();
			};
			return;
		}

		const offClick = this.on(this._trigger, 'click', () => this.toggle());
		const offKeydown = this.on(this._trigger, 'keydown', (event) => {
			if (event.key !== 'Enter' && event.key !== ' ') return;
			event.preventDefault();
			this.toggle();
		});
		this._triggerOff = () => {
			offClick?.();
			offKeydown?.();
		};
	}

	_resolveTrigger() {
		const id = this.dataset.triggerId;
		if (id) return resolveTriggerElement(document.getElementById(id));
		const root = this.querySelector('[slot="trigger"], [data-trigger]');
		return resolveTriggerElement(root);
	}

	_preparePanel() {
		if (!this._panel.classList.contains('el-popover-panel')) {
			this._panel.classList.add('el-popover-panel');
		}
		preparePopoverPanel(this._panel, this._trigger);
		this._panel.setAttribute('popover', 'manual');
		this._unbindToggle?.();
		this._unbindToggle = bindPopoverToggle(this._panel, (open) => this._syncOpen(open, true));
		this._bindPanelHover();
	}

	_resolvePanel() {
		const inner = this.querySelector('[slot="panel"], [data-panel]');
		if (inner) return inner;
		const id = this.dataset.panelId;
		return id ? document.getElementById(id) : null;
	}

	_ensurePanel() {
		if (!this._trigger || !this._trigger.isConnected) {
			this._trigger = this._resolveTrigger();
			if (this._trigger) this._prepareTrigger();
		}
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
			this._syncScrollLock(true);
			this._bindDismiss();
		} else {
			this._unbindReflow();
			this._unbindDismiss();
			this._syncScrollLock(false);
			if (!fromPopover) closePopoverPanel(this._panel);
		}

		this._open = next;
		this.setBoolAttr('open', next);
		this._trigger?.setAttribute('aria-expanded', String(next));
		this.emit(next ? 'el:open' : 'el:close');
	}

	attributeChangedCallback(name) {
		if (name === 'data-trigger-id' || name === 'trigger') {
			this._trigger = this._resolveTrigger();
			if (this._trigger) this._prepareTrigger();
		}
		if (!this._open || !this._panel || !this._trigger) return;
		if (name === 'lock-scroll') {
			this._syncScrollLock(true);
		}
		if (name === 'align' || name === 'offset' || name === 'placement' || name === 'collision-padding' || name === 'floating-mode' || name === 'flip') {
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
		this._syncOpen(!this._open, false);
	}

	disconnectedCallback() {
		this._unbindToggle?.();
		this._unbindToggle = null;
		this._unbindReflow();
		this._triggerOff?.();
		this._triggerOff = null;
		this._unbindPanelHover();
		this._clearHoverClose();
		this._unbindDismiss();
		this._syncScrollLock(false);
		super.disconnectedCallback();
	}
}

defineElement('element-popover', ElementPopover);
