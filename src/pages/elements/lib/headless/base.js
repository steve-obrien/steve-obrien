// Elements — headless web component primitives
//
// The headless layer is pure DOM + JS. It carries the behavioural contract
// (state, ARIA wiring, keyboard handling, event emission) so the same logic
// can be consumed as a plain custom element or wrapped by any framework.

const isBrowser = typeof window !== 'undefined' && typeof customElements !== 'undefined';

let uidCounter = 0;
export function uid(prefix = 'el') {
	uidCounter += 1;
	return `${prefix}-${uidCounter.toString(36)}`;
}

export function defineElement(name, ctor) {
	if (!isBrowser) return;
	if (!customElements.get(name)) {
		customElements.define(name, ctor);
	}
}

export class ElementBase extends (isBrowser ? HTMLElement : class {}) {
	constructor() {
		super();
		this._listeners = new Map();
	}

	emit(type, detail) {
		this.dispatchEvent(
			new CustomEvent(type, { detail, bubbles: true, composed: true }),
		);
	}

	on(target, type, handler, opts) {
		target.addEventListener(type, handler, opts);
		const key = Symbol();
		this._listeners.set(key, () => target.removeEventListener(type, handler, opts));
		return () => {
			const off = this._listeners.get(key);
			if (off) {
				off();
				this._listeners.delete(key);
			}
		};
	}

	disconnectedCallback() {
		for (const off of this._listeners.values()) off();
		this._listeners.clear();
	}

	boolAttr(name) {
		return this.hasAttribute(name) && this.getAttribute(name) !== 'false';
	}

	setBoolAttr(name, value) {
		if (value) this.setAttribute(name, '');
		else this.removeAttribute(name);
	}
}

// Tiny focus-trap used by dialog & combobox panel.
export function focusTrap(container) {
	const sel = [
		'a[href]', 'button:not([disabled])', 'input:not([disabled])',
		'select:not([disabled])', 'textarea:not([disabled])',
		'[tabindex]:not([tabindex="-1"])',
	].join(',');
	const onKey = (e) => {
		if (e.key !== 'Tab') return;
		const nodes = container.querySelectorAll(sel);
		if (!nodes.length) return;
		const first = nodes[0];
		const last = nodes[nodes.length - 1];
		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault();
			first.focus();
		}
	};
	container.addEventListener('keydown', onKey);
	return () => container.removeEventListener('keydown', onKey);
}

// Simple roving-tabindex helper for lists (tabs, menus, accordion).
export function createRoving({ items, orientation = 'horizontal', loop = true, onSelect } = {}) {
	let index = 0;
	const horiz = orientation === 'horizontal';
	const nextKey = horiz ? 'ArrowRight' : 'ArrowDown';
	const prevKey = horiz ? 'ArrowLeft' : 'ArrowUp';

	const setActive = (i) => {
		if (!items.length) return;
		if (loop) i = (i + items.length) % items.length;
		else i = Math.max(0, Math.min(items.length - 1, i));
		index = i;
		items.forEach((el, idx) => {
			el.tabIndex = idx === i ? 0 : -1;
		});
		items[i]?.focus();
		onSelect?.(i, items[i]);
	};

	const onKey = (e) => {
		if (e.key === nextKey) {
			e.preventDefault();
			setActive(index + 1);
		} else if (e.key === prevKey) {
			e.preventDefault();
			setActive(index - 1);
		} else if (e.key === 'Home') {
			e.preventDefault();
			setActive(0);
		} else if (e.key === 'End') {
			e.preventDefault();
			setActive(items.length - 1);
		}
	};

	return { setActive, onKey, get index() { return index; } };
}

export { isBrowser };
