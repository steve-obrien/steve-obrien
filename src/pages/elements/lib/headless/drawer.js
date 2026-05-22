import { ElementBase, defineElement, focusTrap, isBrowser } from './base.js';
import {
	hasCustomTransitions,
	runEnter,
	runLeave,
} from './transitions.js';

// <element-drawer side="right">
//   <button slot="trigger">Menu</button>
//   <nav>…</nav>
//   <button data-close>Close</button>
// </element-drawer>
//
// For full visual control, provide your own light-DOM parts:
//
// <element-drawer>
//   <button data-trigger>Menu</button>
//   <div data-overlay>
//     <div data-backdrop></div>
//     <aside data-panel>…</aside>
//   </div>
// </element-drawer>
//
// The primitive owns behaviour: open state, ARIA, focus trap, Esc/backdrop
// dismiss, scroll lock, events, and transition class timing. Visual styling
// remains ordinary light DOM classes that Tailwind or any framework can edit.

const DEFAULT_OVERLAY_CLASSES = [
	'fixed', 'inset-0', 'z-50', 'pointer-events-none',
	'data-[state=open]:pointer-events-auto',
];
const DEFAULT_BACKDROP_CLASSES = [
	'absolute', 'inset-0', 'bg-black/40', 'opacity-0', 'backdrop-blur-[2px]',
	'transition-opacity', 'duration-300', 'ease-in-out',
	'data-[state=open]:opacity-100',
];
const DEFAULT_PANEL_CLASSES = [
	'absolute', 'top-0', 'bottom-0', 'w-[min(100%,var(--el-drawer-width,24rem))]',
	'max-w-full', 'overflow-auto', '[-webkit-overflow-scrolling:touch]',
	'bg-inherit', 'text-inherit', 'shadow-2xl', 'outline-none',
];
const DEFAULT_PANEL_POSITION_CLASSES = [
	'data-[side=left]:left-0',
	'data-[side=right]:right-0',
];
const DEFAULT_PANEL_MOTION_CLASSES = [
	'transition-transform', 'duration-300', 'ease-in-out',
	'data-[side=left]:-translate-x-full',
	'data-[side=right]:translate-x-full',
	'data-[state=open]:translate-x-0',
];

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

function wantsOpen(el) {
	return el.boolAttr('open') || el.boolAttr('show');
}

function addDefaultClasses(el, classes) {
	if (!el || el.hasAttribute('data-no-defaults')) return;
	el.classList.add(...classes);
}

function removeClasses(el, classes) {
	if (!el) return;
	el.classList.remove(...classes);
}

function nextFrame() {
	return new Promise((resolve) => {
		requestAnimationFrame(() => requestAnimationFrame(resolve));
	});
}

function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export class ElementDrawer extends ElementBase {
	static get observedAttributes() {
		return [
			'open',
			'show',
			'side',
			'enter',
			'enter-from',
			'enter-to',
			'leave',
			'leave-from',
			'leave-to',
		];
	}

	static __doc = {
		name: 'element-drawer',
		description: 'Light-DOM drawer primitive anchored to the left or right edge. It owns open state, ARIA, focus trap, scroll lock, Esc/backdrop dismiss, and events while keeping panel/backdrop styling in editable Tailwind classes.',
		slots: [
			{ name: 'trigger', description: 'Element that opens the drawer when clicked. You can also use data-trigger.' },
			{ name: '(default)', description: 'Panel body. If no data-panel is provided, the drawer wraps this content in light-DOM overlay/backdrop/panel parts.' },
		],
		attributes: [
			{ name: 'open', type: 'boolean', description: 'Reflects open state. Set to show the drawer; remove or set false to hide.' },
			{ name: 'show', type: 'boolean', description: 'Alias for `open` (Headless UI naming).' },
			{ name: 'side', type: 'string', description: 'Edge the panel slides from: `left` or `right` (default `right`).' },
			{ name: 'static', type: 'boolean', description: 'Disables backdrop-click dismiss.' },
			{ name: 'enter', type: 'string', description: 'Tailwind classes for the enter transition (active state).' },
			{ name: 'enter-from', type: 'string', description: 'Tailwind classes applied before the enter transition runs.' },
			{ name: 'enter-to', type: 'string', description: 'Tailwind classes applied for the enter transition end state.' },
			{ name: 'leave', type: 'string', description: 'Tailwind classes for the leave transition (active state).' },
			{ name: 'leave-from', type: 'string', description: 'Tailwind classes applied before the leave transition runs.' },
			{ name: 'leave-to', type: 'string', description: 'Tailwind classes applied for the leave transition end state.' },
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
		this._transitioning = false;
		this._transitionGen = 0;
		this._releaseFocus = null;
		this._scrollLocked = false;
		this._onKey = this._onKey.bind(this);
		this._onBackdrop = this._onBackdrop.bind(this);
	}

	connectedCallback() {
		this._setupParts();
		if (!this.hasAttribute('side')) this.setAttribute('side', 'right');
		this._syncSide();
		this._syncState(false);

		this._trigger = this.querySelector('[slot="trigger"], [data-trigger]');
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

		if (wantsOpen(this)) this.open = true;
	}

	disconnectedCallback() {
		this._unlockScroll();
		document.removeEventListener('keydown', this._onKey);
		this._releaseFocus?.();
		this._releaseFocus = null;
		super.disconnectedCallback();
	}

	_setupParts() {
		this._overlay = this.querySelector('[data-overlay]');
		this._backdrop = this.querySelector('[data-backdrop]');
		this._panel = this.querySelector('[data-panel]');

		if (!this._panel) this._createDefaultParts();
		else if (!this._overlay || !this._backdrop) this._completeCustomParts();

		addDefaultClasses(this._overlay, DEFAULT_OVERLAY_CLASSES);
		addDefaultClasses(this._backdrop, DEFAULT_BACKDROP_CLASSES);
		addDefaultClasses(this._panel, DEFAULT_PANEL_CLASSES);
		addDefaultClasses(this._panel, DEFAULT_PANEL_POSITION_CLASSES);
		this._syncMotionClasses();

		this._overlay.dataset.overlay = this._overlay.dataset.overlay ?? '';
		this._backdrop.dataset.backdrop = this._backdrop.dataset.backdrop ?? '';
		this._panel.dataset.panel = this._panel.dataset.panel ?? '';
		this._overlay.hidden = true;
		this._overlay.setAttribute('aria-hidden', 'true');
		this._panel.setAttribute('role', this._panel.getAttribute('role') || 'dialog');
		this._panel.setAttribute('aria-modal', 'true');
		this._panel.tabIndex = this._panel.tabIndex >= 0 ? this._panel.tabIndex : -1;
	}

	_createDefaultParts() {
		const trigger = this.querySelector('[slot="trigger"], [data-trigger]');
		const overlay = document.createElement('div');
		const backdrop = document.createElement('div');
		const panel = document.createElement('div');
		const bodyNodes = Array.from(this.childNodes).filter((node) => node !== trigger);

		overlay.dataset.overlay = '';
		backdrop.dataset.backdrop = '';
		panel.dataset.panel = '';
		panel.setAttribute('part', 'panel');
		backdrop.setAttribute('part', 'backdrop');
		overlay.setAttribute('part', 'overlay');

		for (const node of bodyNodes) panel.appendChild(node);
		overlay.append(backdrop, panel);
		this.appendChild(overlay);

		this._overlay = overlay;
		this._backdrop = backdrop;
		this._panel = panel;
	}

	_completeCustomParts() {
		const panelParent = this._panel.parentElement;
		const overlay = this._overlay || document.createElement('div');
		const backdrop = this._backdrop || document.createElement('div');

		overlay.dataset.overlay = '';
		backdrop.dataset.backdrop = '';
		if (!overlay.hasAttribute('part')) overlay.setAttribute('part', 'overlay');
		if (!backdrop.hasAttribute('part')) backdrop.setAttribute('part', 'backdrop');
		if (!this._panel.hasAttribute('part')) this._panel.setAttribute('part', 'panel');

		if (!this._overlay) {
			panelParent?.insertBefore(overlay, this._panel);
			overlay.appendChild(this._panel);
		}
		if (!this._backdrop) overlay.insertBefore(backdrop, overlay.firstChild);

		this._overlay = overlay;
		this._backdrop = backdrop;
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

	_reflectOpen(next) {
		this.setBoolAttr('open', next);
		if (this.hasAttribute('show')) this.setBoolAttr('show', next);
	}

	_lockScroll() {
		if (this._scrollLocked) return;
		lockBodyScroll();
		this._scrollLocked = true;
	}

	_unlockScroll() {
		if (!this._scrollLocked) return;
		unlockBodyScroll();
		this._scrollLocked = false;
	}

	_syncSide() {
		if (!this._overlay || !this._backdrop || !this._panel) return;
		const side = this.getAttribute('side') === 'left' ? 'left' : 'right';
		this.dataset.side = side;
		this._overlay.dataset.side = side;
		this._backdrop.dataset.side = side;
		this._panel.dataset.side = side;
	}

	_syncMotionClasses() {
		if (!this._panel || this._panel.hasAttribute('data-no-defaults')) return;
		if (hasCustomTransitions(this)) removeClasses(this._panel, DEFAULT_PANEL_MOTION_CLASSES);
		else addDefaultClasses(this._panel, DEFAULT_PANEL_MOTION_CLASSES);
	}

	_syncState(open) {
		const state = open ? 'open' : 'closed';
		this.dataset.state = state;
		this._overlay.dataset.state = state;
		this._backdrop.dataset.state = state;
		this._panel.dataset.state = state;
		this._overlay.setAttribute('aria-hidden', String(!open));
	}

	_finishOpen() {
		this._releaseFocus = focusTrap(this._panel);
		requestAnimationFrame(() => this._panel.focus());
		this.emit('el:open');
	}

	_finishClose() {
		this._unlockScroll();
		document.removeEventListener('keydown', this._onKey);
		this._releaseFocus?.();
		this._releaseFocus = null;
		this._trigger?.focus();
		this.emit('el:close');
	}

	async _setOpen(next) {
		if (!this._panel || !this._overlay) return;
		if (next === this._open && !this._transitioning) return;

		const custom = hasCustomTransitions(this);
		const gen = ++this._transitionGen;
		this._syncMotionClasses();

		if (next) {
			this._open = true;
			this._reflectOpen(true);
			this._trigger?.setAttribute('aria-expanded', 'true');
			this._lockScroll();
			document.addEventListener('keydown', this._onKey);

			this._overlay.hidden = false;
			if (custom) {
				this._transitioning = true;
				this._syncState(true);
				await runEnter(this, this._panel);
				if (gen !== this._transitionGen) return;
				this._transitioning = false;
			} else {
				await nextFrame();
				if (gen !== this._transitionGen) return;
				this._syncState(true);
			}

			if (!this._open) return;
			this._finishOpen();
		} else {
			this._open = false;
			this._reflectOpen(false);
			this._trigger?.setAttribute('aria-expanded', 'false');

			if (custom) {
				this._transitioning = true;
				this._syncState(false);
				await runLeave(this, this._panel);
				if (gen !== this._transitionGen) return;
				this._transitioning = false;
			} else {
				this._syncState(false);
				await delay(300);
				if (gen !== this._transitionGen) return;
			}

			this._overlay.hidden = true;
			this._finishClose();
		}
	}

	attributeChangedCallback(name, _old, value) {
		if (!this.isConnected || !this._panel) return;
		if (name === 'open' || name === 'show') this._setOpen(wantsOpen(this));
		if (name === 'side') {
			if (value !== 'left' && value !== 'right') {
				this.setAttribute('side', 'right');
				return;
			}
			this._syncSide();
		}
		if (['enter', 'enter-from', 'enter-to', 'leave', 'leave-from', 'leave-to'].includes(name)) {
			this._syncMotionClasses();
		}
	}

	get open() { return this._open; }
	set open(v) { this._setOpen(!!v); }

	show() { this.open = true; }
	hide() { this.open = false; }
	toggle() { this.open = !this._open; }
}

defineElement('element-drawer', ElementDrawer);

// Tailwind scan: fixed inset-0 z-50 pointer-events-none data-[state=open]:pointer-events-auto absolute bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 duration-1000 ease-in ease-out ease-in-out opacity-100 scale-50 scale-100 data-[state=open]:opacity-100 top-0 bottom-0 w-[min(100%,var(--el-drawer-width,24rem))] max-w-full overflow-auto [-webkit-overflow-scrolling:touch] bg-inherit text-inherit shadow-2xl outline-none transition transition-transform data-[side=left]:left-0 data-[side=left]:-translate-x-full data-[side=right]:right-0 data-[side=right]:translate-x-full data-[state=open]:translate-x-0
