import { ElementBase, defineElement, uid } from './base.js';

// <element-accordion multiple>
//   <element-accordion-item>
//     <button slot="header">Title</button>
//     <div slot="content">…</div>
//   </element-accordion-item>
// </element-accordion>
export class ElementAccordionItem extends ElementBase {
	static get observedAttributes() { return ['open']; }

	connectedCallback() {
		this._header = this.querySelector('[slot="header"], [data-header]');
		this._content = this.querySelector('[slot="content"], [data-content]');
		if (!this._header || !this._content) return;

		const id = uid('acc');
		this._header.id = this._header.id || `${id}-h`;
		this._content.id = this._content.id || `${id}-c`;
		this._header.setAttribute('aria-controls', this._content.id);
		this._content.setAttribute('role', 'region');
		this._content.setAttribute('aria-labelledby', this._header.id);
		this._sync();

		this.on(this._header, 'click', () => this.toggle());
		this.on(this._header, 'keydown', (e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				this.toggle();
			}
		});
	}

	attributeChangedCallback() { this._sync(); }

	_sync() {
		if (!this._header || !this._content) return;
		const open = this.boolAttr('open');
		this._header.setAttribute('aria-expanded', String(open));
		this._content.hidden = !open;
	}

	toggle() {
		const parent = this.closest('element-accordion');
		const multi = parent?.hasAttribute('multiple');
		const next = !this.boolAttr('open');
		if (next && parent && !multi) {
			parent.querySelectorAll('element-accordion-item[open]').forEach((it) => {
				if (it !== this) it.removeAttribute('open');
			});
		}
		this.setBoolAttr('open', next);
		this.emit('el:change', { open: next });
	}
}

export class ElementAccordion extends ElementBase {
	connectedCallback() {
		this.setAttribute('role', 'group');
	}
}

defineElement('element-accordion-item', ElementAccordionItem);
defineElement('element-accordion', ElementAccordion);
