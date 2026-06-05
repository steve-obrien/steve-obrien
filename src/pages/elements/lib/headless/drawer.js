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
	'data-[side=bottom]:bottom-0',
	'data-[side=bottom]:left-0',
	'data-[side=bottom]:right-0',
	'data-[side=bottom]:top-auto',
	'data-[side=bottom]:h-auto',
	'data-[side=bottom]:max-h-[85vh]',
	'data-[side=bottom]:w-full',
];
const DEFAULT_PANEL_MOTION_CLASSES = [
	'transition-transform', 'duration-300', 'ease-in-out',
	'data-[side=left]:-translate-x-full',
	'data-[side=right]:translate-x-full',
	'data-[side=bottom]:translate-y-full',
	'data-[state=open]:translate-x-0',
	'data-[state=open]:translate-y-0',
];
const DEFAULT_DRAG_HANDLE_CLASSES = [
	'touch-none', 'cursor-grab', 'active:cursor-grabbing',
];
const DRAG_RETURN_MS = 180;
const DRAG_EXIT_MS = 170;
const DRAG_PROJECT_MS = 220;
const DRAG_FLICK_VELOCITY = 0.45;

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
			'aria-labelledby',
			'aria-describedby',
		];
	}

	static __doc = {
		name: 'element-drawer',
		description: 'Light-DOM drawer primitive anchored to the left, right, or bottom edge. It owns open state, ARIA, focus trap, scroll lock, Esc/backdrop dismiss, and events while keeping panel/backdrop styling in editable Tailwind classes.',
		slots: [
			{ name: 'trigger', description: 'Element that opens the drawer when clicked. You can also use data-trigger.' },
			{ name: '(default)', description: 'Panel body. If no data-panel is provided, the drawer wraps this content in light-DOM overlay/backdrop/panel parts.' },
		],
		attributes: [
			{ name: 'open', type: 'boolean', description: 'Reflects open state. Set to show the drawer; remove or set false to hide.' },
			{ name: 'show', type: 'boolean', description: 'Alias for `open` (Headless UI naming).' },
			{ name: 'side', type: 'string', description: 'Edge the panel slides from: `left`, `right`, or `bottom` (default `right`).' },
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
			{ keys: 'Drag handle', action: 'Drag `[data-drag-handle]` toward the closing edge to dismiss the drawer.' },
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
		this._dragState = null;
		this._dragOffs = [];
		this._dragHandleOffs = [];
		this._dragHandleSetupQueued = false;
		this._dragResetTimer = null;
		this._onKey = this._onKey.bind(this);
		this._onBackdrop = this._onBackdrop.bind(this);
		this._onDragPointerDown = this._onDragPointerDown.bind(this);
		this._onDragPointerMove = this._onDragPointerMove.bind(this);
		this._onDragPointerUp = this._onDragPointerUp.bind(this);
		this._onDragMouseDown = this._onDragMouseDown.bind(this);
		this._onDragMouseMove = this._onDragMouseMove.bind(this);
		this._onDragMouseUp = this._onDragMouseUp.bind(this);
		this._onDragTouchStart = this._onDragTouchStart.bind(this);
		this._onDragTouchMove = this._onDragTouchMove.bind(this);
		this._onDragTouchEnd = this._onDragTouchEnd.bind(this);
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
		this._queueDragHandleSetup();

		if (wantsOpen(this)) this.open = true;
	}

	disconnectedCallback() {
		this._finishDrag(false);
		this._teardownDragHandle();
		if (this._dragResetTimer) window.clearTimeout(this._dragResetTimer);
		this._dragResetTimer = null;
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
		this._syncAria();
	}

	_setupDragHandle() {
		const handle = this.querySelector('[data-drag-handle]');
		if (handle === this._dragHandle && this._dragHandleOffs.length) return;
		this._teardownDragHandle();
		this._dragHandle = handle;
		if (!this._dragHandle) return;
		addDefaultClasses(this._dragHandle, DEFAULT_DRAG_HANDLE_CLASSES);
		if (!this._dragHandle.hasAttribute('aria-label')) this._dragHandle.setAttribute('aria-label', 'Drag to close');
		if (!this._dragHandle.hasAttribute('role')) this._dragHandle.setAttribute('role', 'button');
		this._dragHandleOffs = [
			this.on(this._dragHandle, 'pointerdown', this._onDragPointerDown),
			this.on(this._dragHandle, 'mousedown', this._onDragMouseDown),
			this.on(this._dragHandle, 'touchstart', this._onDragTouchStart, { passive: false }),
		];
	}

	_teardownDragHandle() {
		this._dragHandleOffs.forEach((off) => off());
		this._dragHandleOffs = [];
		this._dragHandle = null;
	}

	_queueDragHandleSetup() {
		if (this._dragHandleSetupQueued) return;
		this._dragHandleSetupQueued = true;
		queueMicrotask(() => {
			requestAnimationFrame(() => {
				this._dragHandleSetupQueued = false;
				if (this.isConnected) this._setupDragHandle();
			});
		});
	}

	_syncAria() {
		if (!this._panel) return;
		for (const name of ['aria-labelledby', 'aria-describedby']) {
			const value = this.getAttribute(name);
			if (value) this._panel.setAttribute(name, value);
			else this._panel.removeAttribute(name);
		}
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

	_onDragPointerDown(e) {
		this._startDrag(e, {
			pointerId: e.pointerId,
			capturePointer: true,
			moveType: 'pointermove',
			upType: 'pointerup',
			cancelType: 'pointercancel',
		});
	}

	_onDragMouseDown(e) {
		if (this._dragState) return;
		this._startDrag(e, {
			pointerId: null,
			capturePointer: false,
			moveType: 'mousemove',
			upType: 'mouseup',
			cancelType: null,
		});
	}

	_onDragTouchStart(e) {
		if (this._dragState) return;
		const touch = e.touches?.[0];
		if (!touch) return;
		this._startDrag({
			button: 0,
			clientX: touch.clientX,
			clientY: touch.clientY,
			preventDefault: () => e.preventDefault(),
		}, {
			pointerId: null,
			capturePointer: false,
			moveType: 'touchmove',
			upType: 'touchend',
			cancelType: 'touchcancel',
		});
	}

	_startDrag(e, options) {
		if (!this._open || this._transitioning || !this._panel) return;
		if (e.button != null && e.button !== 0) return;
		if (this._dragResetTimer) window.clearTimeout(this._dragResetTimer);
		this._dragResetTimer = null;

		const side = this.dataset.side || 'right';
		const axis = side === 'bottom' ? 'y' : 'x';
		const sign = side === 'left' ? -1 : 1;
		const rect = this._panel.getBoundingClientRect();
		const panelSize = axis === 'y' ? rect.height : rect.width;
		const now = performance.now();

		this._finishDrag(false);
		this._dragState = {
			axis,
			closeDelta: 0,
			capturePointer: options.capturePointer,
			panelSize,
			pointerId: options.pointerId,
			prevTransform: this._panel.style.transform,
			prevTransition: this._panel.style.transition,
			prevWillChange: this._panel.style.willChange,
			sign,
			startX: e.clientX,
			startY: e.clientY,
			lastCloseDelta: 0,
			lastTime: now,
			velocity: 0,
		};
		this._panel.style.transition = 'none';
		this._panel.style.willChange = 'transform';
		if (options.capturePointer) this._dragHandle?.setPointerCapture?.(options.pointerId);
		const moveHandler = options.moveType === 'pointermove'
			? this._onDragPointerMove
			: options.moveType === 'touchmove'
				? this._onDragTouchMove
				: this._onDragMouseMove;
		const upHandler = options.upType === 'pointerup'
			? this._onDragPointerUp
			: options.upType === 'touchend'
				? this._onDragTouchEnd
				: this._onDragMouseUp;
		this._dragOffs = [
			this.on(document, options.moveType, moveHandler, { passive: false }),
			this.on(document, options.upType, upHandler, { passive: false }),
		];
		if (options.cancelType) this._dragOffs.push(this.on(document, options.cancelType, upHandler, { passive: false }));
		e.preventDefault();
	}

	_onDragPointerMove(e) {
		const drag = this._dragState;
		if (!drag || e.pointerId !== drag.pointerId || !this._panel) return;
		this._updateDrag(e.clientX, e.clientY);
		e.preventDefault();
	}

	_onDragMouseMove(e) {
		if (!this._dragState || !this._panel) return;
		this._updateDrag(e.clientX, e.clientY);
		e.preventDefault();
	}

	_onDragTouchMove(e) {
		if (!this._dragState || !this._panel) return;
		const touch = e.touches?.[0] || e.changedTouches?.[0];
		if (!touch) return;
		this._updateDrag(touch.clientX, touch.clientY);
		e.preventDefault();
	}

	_updateDrag(clientX, clientY) {
		const drag = this._dragState;
		if (!drag || !this._panel) return;
		const rawDelta = drag.axis === 'y' ? clientY - drag.startY : clientX - drag.startX;
		const directionalDelta = rawDelta * drag.sign;
		const closeDelta = Math.min(drag.panelSize + 32, Math.max(0, directionalDelta));
		const renderedDelta = directionalDelta < 0
			? Math.max(-24, directionalDelta * 0.25)
			: closeDelta;
		const now = performance.now();
		const elapsed = Math.max(1, now - drag.lastTime);
		const sampleVelocity = (closeDelta - drag.lastCloseDelta) / elapsed;
		drag.closeDelta = closeDelta;
		drag.velocity = (drag.velocity * 0.65) + (sampleVelocity * 0.35);
		drag.lastCloseDelta = closeDelta;
		drag.lastTime = now;

		this._panel.style.transform = this._dragTransform(drag, renderedDelta);
	}

	_onDragPointerUp(e) {
		const drag = this._dragState;
		if (!drag || e.pointerId !== drag.pointerId) return;
		this._endDrag(e);
	}

	_onDragMouseUp(e) {
		if (!this._dragState) return;
		this._endDrag(e);
	}

	_onDragTouchEnd(e) {
		if (!this._dragState) return;
		this._endDrag(e);
	}

	_endDrag(e) {
		const drag = this._dragState;
		if (!drag) return;
		const threshold = Math.max(44, Math.min(112, drag.panelSize * 0.24));
		const projectedDelta = drag.closeDelta + (Math.max(0, drag.velocity) * DRAG_PROJECT_MS);
		const hasFlick = drag.closeDelta >= 12 && drag.velocity >= DRAG_FLICK_VELOCITY;
		this._finishDrag(drag.closeDelta >= threshold || projectedDelta >= threshold || hasFlick);
		e?.preventDefault?.();
	}

	_dragTransform(drag, delta) {
		if (drag.axis === 'y') return `translateY(${delta}px)`;
		return `translateX(${delta * drag.sign}px)`;
	}

	_finishDrag(shouldClose = false) {
		if (!this._dragState) return;
		const drag = this._dragState;
		this._dragOffs.forEach((off) => off());
		this._dragOffs = [];
		if (drag.capturePointer) this._dragHandle?.releasePointerCapture?.(drag.pointerId);
		if (this._panel) {
			if (shouldClose) {
				const exitDelta = Math.max(drag.closeDelta, drag.panelSize + 32);
				this._panel.style.transition = `transform ${DRAG_EXIT_MS}ms cubic-bezier(0.32, 0.72, 0, 1)`;
				this._panel.style.transform = this._dragTransform(drag, exitDelta);
				this._dragResetTimer = window.setTimeout(() => {
					this._dragResetTimer = null;
					this.open = false;
					requestAnimationFrame(() => {
						if (!this._panel) return;
						this._panel.style.transition = drag.prevTransition;
						this._panel.style.transform = drag.prevTransform;
						this._panel.style.willChange = drag.prevWillChange;
					});
				}, DRAG_EXIT_MS);
			} else {
				this._panel.style.transition = drag.prevTransition || `transform ${DRAG_RETURN_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`;
				this._panel.getBoundingClientRect();
				this._panel.style.transform = drag.prevTransform;
				window.setTimeout(() => {
					if (!this._panel || this._dragState) return;
					this._panel.style.transition = drag.prevTransition;
					this._panel.style.willChange = drag.prevWillChange;
				}, DRAG_RETURN_MS);
			}
		}
		this._dragState = null;
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
		const requested = this.getAttribute('side');
		const side = ['left', 'right', 'bottom'].includes(requested) ? requested : 'right';
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
		requestAnimationFrame(() => this._panel.focus({ preventScroll: true }));
		this.emit('el:open');
	}

	_finishClose() {
		this._unlockScroll();
		document.removeEventListener('keydown', this._onKey);
		this._releaseFocus?.();
		this._releaseFocus = null;
		this._trigger?.focus({ preventScroll: true });
		this.emit('el:close');
	}

	async _setOpen(next) {
		if (!this._panel || !this._overlay) return;
		if (next === this._open && !this._transitioning) return;

		const custom = hasCustomTransitions(this);
		const gen = ++this._transitionGen;
		this._syncMotionClasses();

		if (next) {
			this._setupDragHandle();
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
			if (!['left', 'right', 'bottom'].includes(value)) {
				this.setAttribute('side', 'right');
				return;
			}
			this._syncSide();
			this._queueDragHandleSetup();
		}
		if (['enter', 'enter-from', 'enter-to', 'leave', 'leave-from', 'leave-to'].includes(name)) {
			this._syncMotionClasses();
		}
		if (name === 'aria-labelledby' || name === 'aria-describedby') this._syncAria();
	}

	get open() { return this._open; }
	set open(v) { this._setOpen(!!v); }

	show() { this.open = true; }
	hide() { this.open = false; }
	toggle() { this.open = !this._open; }
}

defineElement('element-drawer', ElementDrawer);

// Tailwind scan: fixed inset-0 z-50 pointer-events-none data-[state=open]:pointer-events-auto absolute bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 duration-1000 ease-in ease-out ease-in-out opacity-100 scale-50 scale-100 data-[state=open]:opacity-100 top-0 bottom-0 w-[min(100%,var(--el-drawer-width,24rem))] max-w-full overflow-auto [-webkit-overflow-scrolling:touch] bg-inherit text-inherit shadow-2xl outline-none transition transition-transform data-[side=left]:left-0 data-[side=left]:-translate-x-full data-[side=right]:right-0 data-[side=right]:translate-x-full data-[side=bottom]:bottom-0 data-[side=bottom]:left-0 data-[side=bottom]:right-0 data-[side=bottom]:top-auto data-[side=bottom]:h-auto data-[side=bottom]:max-h-[85vh] data-[side=bottom]:w-full data-[side=bottom]:translate-y-full data-[state=open]:translate-x-0 data-[state=open]:translate-y-0 touch-none cursor-grab active:cursor-grabbing
