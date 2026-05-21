import { ElementBase, defineElement } from './base.js';

// <element-toggle checked></element-toggle>
export class ElementToggle extends ElementBase {
	static get observedAttributes() { return ['checked', 'disabled']; }

	connectedCallback() {
		this.setAttribute('role', 'switch');
		this.tabIndex = this.hasAttribute('disabled') ? -1 : 0;
		this._sync();
		this.on(this, 'click', () => this.toggle());
		this.on(this, 'keydown', (e) => {
			if (e.key === ' ' || e.key === 'Enter') {
				e.preventDefault();
				this.toggle();
			}
		});
	}

	attributeChangedCallback() { this._sync(); }

	_sync() {
		this.setAttribute('aria-checked', String(this.checked));
		if (this.hasAttribute('disabled')) this.setAttribute('aria-disabled', 'true');
		else this.removeAttribute('aria-disabled');
	}

	get checked() { return this.boolAttr('checked'); }
	set checked(value) { this.setBoolAttr('checked', !!value); }

	toggle() {
		if (this.hasAttribute('disabled')) return;
		this.checked = !this.checked;
		this.emit('el:change', { checked: this.checked });
	}
}

defineElement('element-toggle', ElementToggle);
