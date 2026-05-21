import { ElementBase, defineElement, focusTrap, isBrowser } from './base.js';

// <element-drawer side="right">
//   <button slot="trigger">Menu</button>
//   <nav>…</nav>
//   <button data-close>Close</button>
// </element-drawer>
//
// Slide-out panel (mobile-nav style). Backdrop + panel live in shadow DOM;
// light-DOM content (except the trigger) is projected into the panel.
//
// - `open` attribute / property opens and closes programmatically.
// - `toggle()`, `show()`, `hide()` on the element instance.
// - Buttons with `data-close` dismiss the drawer.
// - Backdrop click dismisses unless the host has the `static` attribute.

let scrollLockCount = 0;
function lockBodyScroll() {
	if (!isBrowser) return;
	if (scrollLockCount++ === 0) document.body.style.overflow = 'hidden';
}
function unlockBodyScroll() {
	if (!isBrowser) return;
	if (--scrollLockCount <= 0) {
		scrollLockCount = 0;
		document.body.style.overflow = '';
	}
}

let TEMPLATE = null;
function getTemplate() {
	if (TEMPLATE || !isBrowser) return TEMPLATE;
	TEMPLATE = document.createElement('template');
	TEMPLATE.innerHTML = `
<style>
	:host { display: contents; }
	.overlay {
		position: fixed;
		inset: 0;
		z-index: 50;
		pointer-events: none;
		visibility: hidden;
	}
	.overlay[data-open] {
		pointer-events: auto;
		visibility: visible;
	}
	.backdrop {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(2px);
		opacity: 0;
		transition: opacity 300ms ease;
	}
	.overlay[data-open] .backdrop { opacity: 1; }
	.panel {
		position: absolute;
		top: 0;
		bottom: 0;
		width: min(100%, var(--el-drawer-width, 24rem));
		max-width: 100%;
		background: inherit;
		color: inherit;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
		outline: none;
		overflow: auto;
		-webkit-overflow-scrolling: touch;
		transition: transform 300ms ease-in-out;
	}
	:host([side="left"]) .panel {
		left: 0;
		transform: translateX(-100%);
	}
	:host([side="right"]) .panel {
		right: 0;
		transform: translateX(100%);
	}
	.overlay[data-open] .panel { transform: translateX(0); }
</style>
<slot name="trigger"></slot>
<div class="overlay" part="overlay" aria-hidden="true">
	<div class="backdrop" part="backdrop"></div>
	<div class="panel" part="panel" role="dialog" aria-modal="true" tabindex="-1">
		<slot></slot>
	</div>
</div>
`;
	return TEMPLATE;
}

export class ElementDrawer extends ElementBase {
	static get observedAttributes() { return ['open', 'side']; }

	static __doc = {
		name: 'element-drawer',
		description: 'Slide-out panel anchored to the left or right edge — the same interaction model as a mobile navigation menu. Open state is fully controllable via attribute, property, or methods.',
		slots: [
			{ name: 'trigger', description: 'Element that opens the drawer when clicked. Rendered outside the overlay.' },
			{ name: '(default)', description: 'Panel body. Projected into the sliding panel.' },
		],
		attributes: [
			{ name: 'open', type: 'boolean', description: 'Reflects open state. Set to show the drawer; remove or set false to hide.' },
			{ name: 'side', type: 'string', description: 'Edge the panel slides from: `left` or `right` (default `right`).' },
			{ name: 'static', type: 'boolean', description: 'Disables backdrop-click dismiss.' },
		],
		events: [
			{ name: 'el:open', description: 'Fired when the drawer opens.' },
			{ name: 'el:close', description: 'Fired when the drawer closes (Esc, backdrop, data-close, or programmatic).' },
		],
		keyboard: [
			{ keys: 'Esc', action: 'Closes the drawer.' },
			{ keys: 'Tab / Shift+Tab', action: 'Focus cycles within the panel while open.' },
			{ keys: 'Click backdrop', action: 'Dismisses the drawer (disable with `static`).' },
		],
		example: `<element-drawer side="right">
  <button slot="trigger">Menu</button>
  <nav><!-- panel content --></nav>
  <button data-close>Close</button>
</element-drawer>

<script type="module">
  import '@elements/headless/drawer.js';
</script>`,
	};

	constructor() {
		super();
		if (!isBrowser) return;
		this._open = false;
		this._releaseFocus = null;
		this._onKey = this._onKey.bind(this);
		this._onBackdrop = this._onBackdrop.bind(this);
		if (!this.shadowRoot) {
			const shadow = this.attachShadow({ mode: 'open' });
			shadow.appendChild(getTemplate().content.cloneNode(true));
		}
		this._overlay = this.shadowRoot.querySelector('.overlay');
		this._backdrop = this.shadowRoot.querySelector('.backdrop');
		this._panel = this.shadowRoot.querySelector('.panel');
	}

	connectedCallback() {
		if (!this.hasAttribute('side')) this.setAttribute('side', 'right');

		this._trigger = this.querySelector('[slot="trigger"]');
		if (this._trigger) {
			this._trigger.setAttribute('aria-haspopup', 'dialog');
			this._trigger.setAttribute('aria-expanded', 'false');
			this.on(this._trigger, 'click', () => { this.open = true; });
		}

		this.on(this, 'click', (e) => {
			const closer = e.target.closest?.('[data-close]');
			if (closer && this.contains(closer)) this.open = false;
		});

		this.on(this._backdrop, 'click', this._onBackdrop);

		if (this.boolAttr('open')) this.open = true;
	}

	_onBackdrop() {
		if (this.hasAttribute('static')) return;
		this.open = false;
	}

	_onKey(e) {
		if (e.key === 'Escape' && this._open) {
			e.preventDefault();
			this.open = false;
		}
	}

	_setOpen(next) {
		if (next === this._open) return;
		this._open = next;
		this.setBoolAttr('open', next);
		this._trigger?.setAttribute('aria-expanded', String(next));

		if (next) {
			this._overlay.dataset.open = '';
			this._overlay.setAttribute('aria-hidden', 'false');
			lockBodyScroll();
			document.addEventListener('keydown', this._onKey);
			this._releaseFocus = focusTrap(this._panel);
			requestAnimationFrame(() => this._panel.focus());
			this.emit('el:open');
		} else {
			delete this._overlay.dataset.open;
			this._overlay.setAttribute('aria-hidden', 'true');
			unlockBodyScroll();
			document.removeEventListener('keydown', this._onKey);
			this._releaseFocus?.();
			this._releaseFocus = null;
			this._trigger?.focus();
			this.emit('el:close');
		}
	}

	attributeChangedCallback(name, _old, value) {
		if (!this.isConnected) return;
		if (name === 'open') this._setOpen(value !== null);
		if (name === 'side' && value !== 'left' && value !== 'right') {
			this.setAttribute('side', 'right');
		}
	}

	get open() { return this._open; }
	set open(v) { this._setOpen(!!v); }

	show() { this.open = true; }
	hide() { this.open = false; }
	toggle() { this.open = !this._open; }
}

defineElement('element-drawer', ElementDrawer);
