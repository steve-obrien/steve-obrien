import { ElementBase, defineElement, isBrowser } from './base.js';

const STYLE_ID = 'element-checkbox-styles';

function ensureStyles() {
	if (!isBrowser || document.getElementById(STYLE_ID)) return;
	const style = document.createElement('style');
	style.id = STYLE_ID;
	style.textContent = `
element-checkbox {
	display: inline-grid;
	place-items: center;
	width: 1.25rem;
	height: 1.25rem;
	border: 1px solid var(--border);
	border-radius: 0.375rem;
	background: var(--background);
	color: var(--primary);
	cursor: pointer;
	vertical-align: middle;
}
element-checkbox::after {
	content: '';
	width: 0.55rem;
	height: 0.32rem;
	border-left: 2px solid currentColor;
	border-bottom: 2px solid currentColor;
	transform: rotate(-45deg) translate(1px, -1px);
	opacity: 0;
}
element-checkbox[aria-checked="true"] {
	border-color: var(--primary-skin);
	background: var(--primary-skin);
}
element-checkbox[aria-checked="true"]::after {
	opacity: 1;
}
element-checkbox:focus-visible {
	outline: 2px solid var(--ring);
	outline-offset: 2px;
}
element-checkbox[aria-disabled="true"] {
	opacity: 0.5;
	cursor: not-allowed;
}
`;
	document.head.appendChild(style);
}

ensureStyles();

export class ElementCheckbox extends ElementBase {
	static get observedAttributes() { return ['checked', 'disabled']; }

	static __doc = {
		name: 'element-checkbox',
		description: 'Accessible checkbox with checked state, keyboard support, and el:change.',
		attributes: [
			{ name: 'checked', type: 'boolean', description: 'Checked state.' },
			{ name: 'disabled', type: 'boolean', description: 'Disable interaction.' },
			{ name: 'aria-label', type: 'string', description: 'Accessible name when no visible label is provided.' },
		],
		events: [{ name: 'el:change', payload: '{ checked }', description: 'Fired when checked state changes.' }],
		keyboard: [{ keys: 'Space / Enter', action: 'Toggle checked state.' }],
	};

	connectedCallback() {
		this.setAttribute('role', 'checkbox');
		this.tabIndex = this.hasAttribute('disabled') ? -1 : 0;
		this._sync();
		this.on(this, 'click', () => this.toggle());
		this.on(this, 'keydown', (event) => {
			if (event.key !== ' ' && event.key !== 'Enter') return;
			event.preventDefault();
			this.toggle();
		});
	}

	attributeChangedCallback() { this._sync(); }

	get checked() { return this.boolAttr('checked'); }
	set checked(value) { this.setBoolAttr('checked', !!value); }

	_sync() {
		this.setAttribute('aria-checked', String(this.checked));
		if (this.hasAttribute('disabled')) this.setAttribute('aria-disabled', 'true');
		else this.removeAttribute('aria-disabled');
	}

	toggle() {
		if (this.hasAttribute('disabled')) return;
		this.checked = !this.checked;
		this.emit('el:change', { checked: this.checked });
	}
}

defineElement('element-checkbox', ElementCheckbox);
