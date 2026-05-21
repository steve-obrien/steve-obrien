import { ElementBase, defineElement } from './base.js';

// <element-toggle checked></element-toggle>
export class ElementToggle extends ElementBase {
	static get observedAttributes() { return ['checked', 'disabled']; }

	static __doc = {
		name: 'element-toggle',
		description: 'Accessible switch with role="switch", keyboard support, and aria-checked maintained as you toggle.',
		slots: [],
		attributes: [
			{ name: 'checked', type: 'boolean', description: 'Reflects on/off state.' },
			{ name: 'disabled', type: 'boolean', description: 'Disables the toggle.' },
			{ name: 'aria-label', type: 'string', description: 'Accessible name when no visible label is provided.' },
		],
		events: [
			{ name: 'el:change', payload: '{ checked }', description: 'Fired when the toggle is flipped.' },
		],
		keyboard: [
			{ keys: 'Space / Enter', action: 'Toggle the value.' },
			{ keys: 'Tab', action: 'Move focus through toggles in source order.' },
		],
		example: `<element-toggle checked aria-label="Notifications"></element-toggle>

<script type="module">
  import '@elements/headless';
  document.querySelector('element-toggle')
    .addEventListener('el:change', (e) => console.log(e.detail.checked));
<\/script>`,
	};

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
