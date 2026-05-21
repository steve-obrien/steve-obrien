import { ElementBase, defineElement, uid } from './base.js';

// <element-accordion multiple>
//   <element-accordion-item>
//     <button slot="header">Title</button>
//     <div slot="content">…</div>
//   </element-accordion-item>
// </element-accordion>
export class ElementAccordionItem extends ElementBase {
	static get observedAttributes() { return ['open']; }

	static __doc = {
		name: 'element-accordion-item',
		description: 'A single collapsible section. Lives inside an <element-accordion> host.',
		slots: [
			{ name: 'header', description: 'The clickable header. Carries aria-expanded.' },
			{ name: 'content', description: 'The collapsible region. Hidden when closed.' },
		],
		attributes: [
			{ name: 'open', type: 'boolean', description: 'Reflects the open state of the item.' },
		],
		events: [
			{ name: 'el:change', payload: '{ open }', description: 'Fired when the item is opened or closed.' },
		],
		keyboard: [
			{ keys: 'Enter / Space', action: 'Toggle the section (when header is focused).' },
		],
		example: `<element-accordion-item open>
  <button slot="header">Section A</button>
  <div slot="content">Lorem ipsum…</div>
</element-accordion-item>`,
	};

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
	static __doc = {
		name: 'element-accordion',
		description: 'Disclosure-panel group containing one or more <element-accordion-item> children.',
		slots: [
			{ name: '(default)', description: 'A list of <element-accordion-item> children.' },
		],
		attributes: [
			{ name: 'multiple', type: 'boolean', description: 'Allow multiple items to be open at once. Otherwise opening one closes the others.' },
		],
		events: [],
		keyboard: [],
		example: `<element-accordion multiple>
  <element-accordion-item open>
    <button slot="header">Section A</button>
    <div slot="content">Lorem ipsum…</div>
  </element-accordion-item>
  <element-accordion-item>
    <button slot="header">Section B</button>
    <div slot="content">Dolor sit amet…</div>
  </element-accordion-item>
</element-accordion>`,
	};

	connectedCallback() {
		this.setAttribute('role', 'group');
	}
}

defineElement('element-accordion-item', ElementAccordionItem);
defineElement('element-accordion', ElementAccordion);
