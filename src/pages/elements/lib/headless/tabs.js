import { ElementBase, defineElement, uid, createRoving } from './base.js';

// <element-tabs value="overview">
//   <div role="tablist">
//     <button data-tab="overview">Overview</button>
//   </div>
//   <div data-panel="overview">…</div>
// </element-tabs>
export class ElementTabs extends ElementBase {
	static get observedAttributes() { return ['value']; }

	connectedCallback() {
		this._tablist = this.querySelector('[role="tablist"], [data-tablist]');
		this._tabs = Array.from(this.querySelectorAll('[data-tab]'));
		this._panels = Array.from(this.querySelectorAll('[data-panel]'));
		if (!this._tabs.length) return;

		const id = uid('tabs');
		this._tablist?.setAttribute('role', 'tablist');
		this._tabs.forEach((tab, i) => {
			tab.setAttribute('role', 'tab');
			tab.id = tab.id || `${id}-tab-${i}`;
			const key = tab.dataset.tab;
			const panel = this._panels.find((p) => p.dataset.panel === key);
			if (panel) {
				panel.setAttribute('role', 'tabpanel');
				panel.id = panel.id || `${id}-panel-${i}`;
				panel.setAttribute('aria-labelledby', tab.id);
				tab.setAttribute('aria-controls', panel.id);
			}
			this.on(tab, 'click', () => { this.value = key; });
		});

		this._roving = createRoving({
			items: this._tabs,
			orientation: 'horizontal',
			onSelect: (_, el) => { this.value = el.dataset.tab; },
		});
		this._tablist?.addEventListener('keydown', this._roving.onKey);

		this.value = this.getAttribute('value') || this._tabs[0].dataset.tab;
	}

	get value() { return this.getAttribute('value'); }
	set value(next) {
		// Always run the DOM sync — even when `next` equals the current attribute
		// (which happens on initial render when `<element-tabs value="…">` ships
		// with the value pre-set), otherwise panels stay visible until the first
		// tab click. Only the change event is gated on an actual change.
		const prev = this.getAttribute('value');
		if (prev !== next) this.setAttribute('value', next);
		this._tabs.forEach((tab) => {
			const active = tab.dataset.tab === next;
			tab.setAttribute('aria-selected', String(active));
			tab.tabIndex = active ? 0 : -1;
			tab.toggleAttribute('data-active', active);
		});
		this._panels.forEach((panel) => {
			panel.hidden = panel.dataset.panel !== next;
		});
		if (prev !== next) this.emit('el:change', { value: next });
	}
}

defineElement('element-tabs', ElementTabs);
