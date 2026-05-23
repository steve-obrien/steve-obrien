import { ElementBase, defineElement, isBrowser } from './base.js';

const STYLE_ID = 'element-toggle-styles';

function ensureToggleStyles() {
	if (!isBrowser || document.getElementById(STYLE_ID)) return;
	const style = document.createElement('style');
	style.id = STYLE_ID;
	style.textContent = `
element-toggle {
	position: relative;
	display: inline-flex;
	flex-shrink: 0;
	box-sizing: border-box;
	height: 1.5rem;
	width: 2.75rem;
	cursor: pointer;
	border: 0;
	padding: 0;
	border-radius: 9999px;
	background: var(--input);
	transition: background-color 150ms ease;
	vertical-align: middle;
}
element-toggle:focus-visible {
	outline: 2px solid var(--ring);
	outline-offset: 2px;
}
element-toggle[aria-checked="true"] {
	background: var(--primary);
}
element-toggle[aria-disabled="true"] {
	opacity: 0.5;
	cursor: not-allowed;
}
element-toggle::after {
	content: '';
	position: absolute;
	top: 50%;
	left: 2px;
	width: 1.25rem;
	height: 1.25rem;
	border-radius: 9999px;
	background: var(--card);
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
	transform: translateY(-50%);
	transition: transform 150ms ease;
	pointer-events: none;
}
element-toggle[aria-checked="true"]::after {
	transform: translate(1.25rem, -50%);
}
`;
	document.head.appendChild(style);
}

ensureToggleStyles();

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
